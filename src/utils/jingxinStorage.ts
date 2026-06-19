import type { JingxinCheckIn, JingxinRecord, JingxinStats } from "../types/jingxin";
import { getDateKey, isYesterday } from "./date";

const STATS_KEY = "jingxinStats";
const RECORDS_KEY = "jingxinRecords";
const CHECK_INS_KEY = "jingxinCheckIns";

const defaultStats: JingxinStats = {
  totalSessions: 0,
  totalMinutes: 0,
  todaySessions: 0,
  streakDays: 0,
  lastJingxinAt: "",
  lastCheckInDate: "",
};

const numberOrDefault = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const isRecord = (value: unknown): value is JingxinRecord => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<JingxinRecord>;
  return (
    typeof record.id === "string" &&
    typeof record.guideTitle === "string" &&
    typeof record.durationMinutes === "number" &&
    typeof record.completedAt === "string" &&
    typeof record.checkedIn === "boolean"
  );
};

const isCheckIn = (value: unknown): value is JingxinCheckIn => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const checkIn = value as Partial<JingxinCheckIn>;
  return (
    typeof checkIn.id === "string" &&
    typeof checkIn.date === "string" &&
    typeof checkIn.durationMinutes === "number" &&
    typeof checkIn.createdAt === "string"
  );
};

const readJson = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = <T>(key: string, value: T): void => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const getJingxinStats = (): JingxinStats => {
  const parsed = readJson<Partial<JingxinStats>>(STATS_KEY, defaultStats);
  const lastJingxinAt = typeof parsed.lastJingxinAt === "string" ? parsed.lastJingxinAt : "";
  const lastJingxinDate = lastJingxinAt ? getDateKey(new Date(lastJingxinAt)) : "";
  const todaySessions =
    lastJingxinDate === getDateKey() ? numberOrDefault(parsed.todaySessions, 0) : 0;

  return {
    totalSessions: numberOrDefault(parsed.totalSessions, 0),
    totalMinutes: numberOrDefault(parsed.totalMinutes, 0),
    todaySessions,
    streakDays: numberOrDefault(parsed.streakDays, 0),
    lastJingxinAt,
    lastCheckInDate:
      typeof parsed.lastCheckInDate === "string" ? parsed.lastCheckInDate : "",
  };
};

export const setJingxinStats = (stats: JingxinStats): void => {
  writeJson(STATS_KEY, stats);
};

export const getJingxinRecords = (): JingxinRecord[] => {
  const records = readJson<unknown[]>(RECORDS_KEY, []);
  return Array.isArray(records) ? records.filter(isRecord) : [];
};

export const setJingxinRecords = (records: JingxinRecord[]): void => {
  writeJson(RECORDS_KEY, records);
};

export const getJingxinCheckIns = (): JingxinCheckIn[] => {
  const checkIns = readJson<unknown[]>(CHECK_INS_KEY, []);
  return Array.isArray(checkIns) ? checkIns.filter(isCheckIn) : [];
};

export const addJingxinRecord = (record: JingxinRecord): JingxinStats => {
  const records = [record, ...getJingxinRecords()];
  setJingxinRecords(records);

  const current = getJingxinStats();
  const todayKey = getDateKey(new Date(record.completedAt));
  const previousDate = current.lastCheckInDate;
  const isSamePracticeDay = previousDate === todayKey;
  const nextStreak = isSamePracticeDay
    ? Math.max(current.streakDays, 1)
    : isYesterday(previousDate, todayKey)
      ? current.streakDays + 1
      : 1;

  const nextStats: JingxinStats = {
    totalSessions: current.totalSessions + 1,
    totalMinutes: current.totalMinutes + record.durationMinutes,
    todaySessions: current.todaySessions + 1,
    streakDays: nextStreak,
    lastJingxinAt: record.completedAt,
    lastCheckInDate: todayKey,
  };

  setJingxinStats(nextStats);
  return nextStats;
};

export const addJingxinCheckIn = (durationMinutes: number): {
  checkIn: JingxinCheckIn;
  records: JingxinRecord[];
} => {
  const checkIn: JingxinCheckIn = {
    id: crypto.randomUUID(),
    date: getDateKey(),
    durationMinutes,
    createdAt: new Date().toISOString(),
  };

  writeJson(CHECK_INS_KEY, [checkIn, ...getJingxinCheckIns()]);
  const records = getJingxinRecords();
  const nextRecords =
    records.length > 0
      ? [{ ...records[0], checkedIn: true }, ...records.slice(1)]
      : records;
  setJingxinRecords(nextRecords);

  return { checkIn, records: nextRecords };
};

export const hasCheckedInToday = (): boolean =>
  getJingxinCheckIns().some((item) => item.date === getDateKey());

export const clearJingxinData = (): void => {
  setJingxinStats(defaultStats);
  setJingxinRecords([]);
  writeJson(CHECK_INS_KEY, []);
};
