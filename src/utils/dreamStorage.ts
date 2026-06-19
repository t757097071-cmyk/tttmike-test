import type { DreamRecentState, DreamRecord, DreamWakeMood } from "../types/dream";

const DREAM_RECORDS_KEY = "dreamRecords";

const isDreamRecord = (value: unknown): value is DreamRecord => {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<DreamRecord>;
  return (
    typeof record.id === "string" &&
    typeof record.dreamText === "string" &&
    typeof record.theme === "string" &&
    typeof record.summary === "string" &&
    typeof record.createdAt === "string" &&
    Array.isArray(record.matchedKeywords)
  );
};

const normalizeDreamRecord = (record: DreamRecord): DreamRecord => {
  const state = record.recentState || ("没有明显压力" as DreamRecentState);
  const mood = record.wakeMood || ("说不清" as DreamWakeMood);

  return {
    ...record,
    recentState: state,
    wakeMood: mood,
    symbolAnalysis:
      record.symbolAnalysis ||
      "此记录生成于旧版解梦结构。可以重新输入同一梦境，获得更完整的象征解析。",
    stateAdjustment:
      record.stateAdjustment ||
      `结合近期状态「${state}」，此梦更适合作为情绪与生活节奏的提醒来看。`,
    studyOrWorkAdvice:
      record.studyOrWorkAdvice ||
      "今天适合选择一件可完成的小事，用行动替代反复推演。",
    relationshipAdvice:
      record.relationshipAdvice ||
      "关系层面不宜用梦替他人下结论，先看见自己的感受与边界。",
    sleepAdvice:
      record.sleepAdvice ||
      "睡前减少信息刺激，把明天第一件事写下来，再做三次缓慢呼吸。",
    luckySuggestion: record.luckySuggestion || "今日宜整理、静心、稳步行动。",
    detailAnalysis:
      record.detailAnalysis?.length > 0
        ? record.detailAnalysis
        : [
            "梦境象征解析：此记录生成于旧版结构，建议重新生成以获得完整解析。",
            "近期心理状态提醒：可以把梦境当作情绪陪伴与自我观察。",
            "学业或事业建议：先完成一件最具体的小事。",
            "人际关系提醒：温和表达，保留边界。",
            "睡前安稳建议：减少刷手机，给自己十分钟安静时间。",
          ],
  };
};

export const getDreamRecords = (): DreamRecord[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DREAM_RECORDS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter(isDreamRecord).map(normalizeDreamRecord) : [];
  } catch {
    return [];
  }
};

export const setDreamRecords = (records: DreamRecord[]): void => {
  window.localStorage.setItem(DREAM_RECORDS_KEY, JSON.stringify(records));
};

export const addDreamRecord = (record: DreamRecord): DreamRecord[] => {
  const nextRecords = [record, ...getDreamRecords()];
  setDreamRecords(nextRecords);
  return nextRecords;
};

export const updateDreamRecord = (record: DreamRecord): DreamRecord[] => {
  const nextRecords = getDreamRecords().map((item) => (item.id === record.id ? record : item));
  setDreamRecords(nextRecords);
  return nextRecords;
};

export const clearDreamRecords = (): void => {
  setDreamRecords([]);
};
