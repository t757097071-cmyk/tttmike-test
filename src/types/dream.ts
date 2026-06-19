export type DreamRecentState =
  | "学习压力"
  | "工作压力"
  | "情绪焦虑"
  | "睡眠不稳"
  | "人际关系"
  | "家人牵挂"
  | "财务担忧"
  | "没有明显压力";

export type DreamWakeMood =
  | "害怕"
  | "迷茫"
  | "轻松"
  | "难过"
  | "紧张"
  | "平静"
  | "惊喜"
  | "说不清";

export type DreamCategory =
  | "学业考试类"
  | "工作事业类"
  | "家庭亲人类"
  | "人际关系类"
  | "情绪行为类"
  | "水象类"
  | "火象类"
  | "土地山路类"
  | "动物类"
  | "身体健康类"
  | "建筑空间类"
  | "交通出行类"
  | "财物物品类"
  | "自然天象类"
  | "灵性传统类"
  | "颜色数字类"
  | "丢失获得类"
  | "学业祈福强相关类";

export interface DreamKeywordItem {
  id: string;
  keyword: string;
  aliases: string[];
  category: DreamCategory;
  weight: number;
  symbolMeaning: string;
  emotionHint: string;
  actionAdvice: string;
  luckySuggestion: string;
  negativeHint: string;
  positiveHint: string;
}

export interface DreamInput {
  dreamText: string;
  recentState: DreamRecentState;
  wakeMood: DreamWakeMood;
}

export interface DreamInterpretation {
  theme: string;
  matchedKeywords: string[];
  summary: string;
  symbolAnalysis: string;
  emotionHint: string;
  stateAdjustment: string;
  actionAdvice: string;
  studyOrWorkAdvice: string;
  relationshipAdvice: string;
  sleepAdvice: string;
  dreamQuote: string;
  quoteExplanation: string;
  luckySuggestion: string;
  detailAnalysis: string[];
  createdAt: string;
}

export interface DreamRecord extends DreamInterpretation {
  id: string;
  dreamText: string;
  recentState: DreamRecentState;
  wakeMood: DreamWakeMood;
  isDetailUnlocked: boolean;
  isQuoteUnlocked: boolean;
}
