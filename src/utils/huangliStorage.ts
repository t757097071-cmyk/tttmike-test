import type { StudyPlanRecord } from "../types/huangli";

const STUDY_PLAN_KEY = "todayStudyPlanRecords";

const isStudyPlanRecord = (value: unknown): value is StudyPlanRecord => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<StudyPlanRecord>;
  return (
    typeof record.id === "string" &&
    typeof record.date === "string" &&
    Array.isArray(record.planItems) &&
    record.planItems.every((item) => typeof item === "string") &&
    typeof record.createdAt === "string"
  );
};

export const getStudyPlanRecords = (): StudyPlanRecord[] => {
  try {
    const raw = window.localStorage.getItem(STUDY_PLAN_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter(isStudyPlanRecord) : [];
  } catch {
    return [];
  }
};

export const addStudyPlanRecord = (record: StudyPlanRecord): StudyPlanRecord[] => {
  const nextRecords = [record, ...getStudyPlanRecords()].slice(0, 30);
  window.localStorage.setItem(STUDY_PLAN_KEY, JSON.stringify(nextRecords));
  return nextRecords;
};
