import type {
  BlessStats,
  BlessingState,
  LampRecord,
  RechargeRecord,
  WishRecord,
  WishTypeId,
} from "../types";
import { getDateKey } from "./date";

const STORAGE_KEY = "jinyuan-ge-blessing-state";

const defaultStats: BlessStats = {
  totalBlessCount: 0,
  todayMerit: 0,
  lastBlessDate: "",
  lastBlessTime: "",
  streakDays: 0,
  blessHistory: [],
};

const defaultState: BlessingState = {
  ...defaultStats,
  selectedWishType: "study",
  wishPowerBalance: 0,
  dailyFreeWishDate: "",
  dailyFreeDrawDate: "",
  wishRecords: [],
  rechargeRecords: [],
  lampRecords: [],
};

interface StoredBlessingState {
  totalBlessCount?: unknown;
  todayMerit?: unknown;
  lastBlessDate?: unknown;
  lastBlessTime?: unknown;
  streakDays?: unknown;
  selectedWishType?: unknown;
  wishPowerBalance?: unknown;
  dailyFreeWishDate?: unknown;
  dailyFreeDrawDate?: unknown;
  wishRecords?: unknown;
  rechargeRecords?: unknown;
  lampRecords?: unknown;
  blessHistory?: unknown;
}

const wishTypeIds: WishTypeId[] = ["study", "career", "health", "peace"];

const isWishTypeId = (value: unknown): value is WishTypeId =>
  typeof value === "string" && wishTypeIds.includes(value as WishTypeId);

const numberOrDefault = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const stringOrUndefined = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value : undefined;

const isWishRecord = (value: unknown): value is WishRecord => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<WishRecord>;
  return (
    typeof record.id === "string" &&
    isWishTypeId(record.type) &&
    typeof record.content === "string" &&
    typeof record.createdAt === "string" &&
    typeof record.meritSnapshot === "number" &&
    (record.cost === undefined || typeof record.cost === "number") &&
    (record.nickname === undefined || typeof record.nickname === "string")
  );
};

const isRechargeRecord = (value: unknown): value is RechargeRecord => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<RechargeRecord>;
  return (
    typeof record.id === "string" &&
    typeof record.packageName === "string" &&
    typeof record.price === "number" &&
    typeof record.wishPower === "number" &&
    typeof record.createdAt === "string" &&
    record.status === "success"
  );
};

const isLampRecord = (value: unknown): value is LampRecord => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<LampRecord>;
  return (
    typeof record.id === "string" &&
    typeof record.lampName === "string" &&
    isWishTypeId(record.wishType) &&
    typeof record.cost === "number" &&
    typeof record.wishContent === "string" &&
    typeof record.createdAt === "string" &&
    (record.nickname === undefined || typeof record.nickname === "string")
  );
};

const normalizeState = (parsed: StoredBlessingState): BlessingState => {
  const lastBlessDate =
    typeof parsed.lastBlessDate === "string" ? parsed.lastBlessDate : "";
  const todayMerit =
    lastBlessDate === getDateKey() ? numberOrDefault(parsed.todayMerit, 0) : 0;

  return {
    totalBlessCount: numberOrDefault(parsed.totalBlessCount, 0),
    todayMerit,
    lastBlessDate,
    lastBlessTime:
      typeof parsed.lastBlessTime === "string" ? parsed.lastBlessTime : "",
    streakDays: numberOrDefault(parsed.streakDays, 0),
    selectedWishType: isWishTypeId(parsed.selectedWishType)
      ? parsed.selectedWishType
      : "study",
    wishPowerBalance: numberOrDefault(parsed.wishPowerBalance, 0),
    dailyFreeWishDate:
      typeof parsed.dailyFreeWishDate === "string" ? parsed.dailyFreeWishDate : "",
    dailyFreeDrawDate:
      typeof parsed.dailyFreeDrawDate === "string" ? parsed.dailyFreeDrawDate : "",
    wishRecords: Array.isArray(parsed.wishRecords)
      ? parsed.wishRecords.filter(isWishRecord)
      : [],
    rechargeRecords: Array.isArray(parsed.rechargeRecords)
      ? parsed.rechargeRecords.filter(isRechargeRecord)
      : [],
    lampRecords: Array.isArray(parsed.lampRecords)
      ? parsed.lampRecords.filter(isLampRecord)
      : [],
    blessHistory: Array.isArray(parsed.blessHistory)
      ? parsed.blessHistory.filter((item): item is string => typeof item === "string")
      : [],
  };
};

export const loadBlessingState = (): BlessingState => {
  if (typeof window === "undefined") {
    return defaultState;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultState;
  }

  try {
    return normalizeState(JSON.parse(raw) as StoredBlessingState);
  } catch {
    return defaultState;
  }
};

export const saveBlessingState = (state: BlessingState): void => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const updateState = (updater: (state: BlessingState) => BlessingState): BlessingState => {
  const nextState = updater(loadBlessingState());
  saveBlessingState(nextState);
  return nextState;
};

export const getWishPowerBalance = (): number => loadBlessingState().wishPowerBalance;

export const setWishPowerBalance = (value: number): BlessingState =>
  updateState((state) => ({ ...state, wishPowerBalance: Math.max(0, value) }));

export const getRechargeRecords = (): RechargeRecord[] =>
  loadBlessingState().rechargeRecords;

export const addRechargeRecord = (record: RechargeRecord): BlessingState =>
  updateState((state) => ({
    ...state,
    rechargeRecords: [record, ...state.rechargeRecords],
  }));

export const getLampRecords = (): LampRecord[] => loadBlessingState().lampRecords;

export const addLampRecord = (record: LampRecord): BlessingState =>
  updateState((state) => ({
    ...state,
    lampRecords: [record, ...state.lampRecords],
    wishPowerBalance: Math.max(0, state.wishPowerBalance - record.cost),
  }));

export const getWishRecords = (): WishRecord[] => loadBlessingState().wishRecords;

export const addWishRecord = (record: WishRecord): BlessingState =>
  updateState((state) => ({
    ...state,
    selectedWishType: record.type,
    wishPowerBalance: Math.max(0, state.wishPowerBalance - (record.cost ?? 0)),
    wishRecords: [record, ...state.wishRecords],
  }));

export const getBlessStats = (): BlessStats => {
  const state = loadBlessingState();
  return {
    totalBlessCount: state.totalBlessCount,
    todayMerit: state.todayMerit,
    lastBlessDate: state.lastBlessDate,
    lastBlessTime: state.lastBlessTime,
    streakDays: state.streakDays,
    blessHistory: state.blessHistory,
  };
};

export const updateBlessStats = (stats: BlessStats): BlessingState =>
  updateState((state) => ({ ...state, ...stats }));

export const clearWishRecords = (state: BlessingState): BlessingState => ({
  ...state,
  wishRecords: [],
});

export const clearAllLocalData = (): BlessingState => {
  const cleared: BlessingState = {
    ...defaultState,
    selectedWishType: loadBlessingState().selectedWishType,
  };
  saveBlessingState(cleared);
  return cleared;
};

export const sanitizeNickname = (value: string): string | undefined =>
  stringOrUndefined(value.trim());
