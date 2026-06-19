export interface JingxinAudio {
  id: string;
  title: string;
  description: string;
  duration: string;
  tag: string;
  src: string;
}

export interface JingxinGuide {
  id: string;
  title: string;
  suitableState: string;
  durationMinutes: number;
  difficulty: "入门" | "进阶";
  steps: string[];
}

export interface JingxinRecord {
  id: string;
  guideTitle: string;
  durationMinutes: number;
  completedAt: string;
  checkedIn: boolean;
}

export interface JingxinStats {
  totalSessions: number;
  totalMinutes: number;
  todaySessions: number;
  streakDays: number;
  lastJingxinAt: string;
  lastCheckInDate: string;
}

export interface JingxinCheckIn {
  id: string;
  date: string;
  durationMinutes: number;
  createdAt: string;
}

export interface JingxinSessionDraft {
  guideTitle: string;
  durationMinutes: number;
}
