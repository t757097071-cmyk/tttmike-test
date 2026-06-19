export interface DirectionItem {
  name: string;
  direction: string;
  description: string;
}

export interface TimeSlot {
  name: string;
  timeRange: string;
  status: "吉" | "平" | "宜静" | "宜学" | "宜行" | "宜休";
  advice: string;
}

export interface FourAdviceItem {
  type: "study" | "career" | "health" | "peace";
  title: string;
  stars: number;
  suggestion: string;
  suitable: string;
  avoid: string;
  buttonText: string;
}

export interface StudyAdvice {
  keyword: string;
  subjects: string[];
  tasks: string[];
  warning: string;
  action: string;
}

export interface PrayerAdvice {
  type: "学业祈福" | "事业祈福" | "健康祈福" | "平安祈福";
  reason: string;
  lampName: string;
  cost: number;
}

export interface HuangliQuote {
  text: string;
  explanation: string;
}

export interface HuangliData {
  date: string;
  lunarDate: string;
  weekday: string;
  ganzhi: string;
  zodiac: string;
  solarTerm: string;
  dayOfficer: string;
  fiveElements: string;
  chongsha: string;
  taishen: string;
  pengzu: string;
  star: string;
  jianchu: string;
  goodGods: string[];
  badGods: string[];
  yi: string[];
  ji: string[];
  directions: DirectionItem[];
  timeSlots: TimeSlot[];
  fourAdvice: FourAdviceItem[];
  studyAdvice: StudyAdvice;
  prayerAdvice: PrayerAdvice;
  dailyQuote: HuangliQuote;
}

export interface StudyPlanRecord {
  id: string;
  date: string;
  planItems: string[];
  createdAt: string;
}
