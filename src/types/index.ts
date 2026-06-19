export type WishTypeId = "study" | "career" | "health" | "peace";

export interface WishType {
  id: WishTypeId;
  title: string;
  icon: string;
  description: string;
  blessing: string;
}

export interface WishRecord {
  id: string;
  type: WishTypeId;
  content: string;
  nickname?: string;
  createdAt: string;
  meritSnapshot: number;
  cost?: number;
}

export interface RechargeRecord {
  id: string;
  packageName: string;
  price: number;
  wishPower: number;
  createdAt: string;
  status: "success";
}

export interface LampRecord {
  id: string;
  lampId?: string;
  lampName: string;
  wishType: WishTypeId;
  cost: number;
  nickname?: string;
  wishContent: string;
  createdAt: string;
}

export interface BlessStats {
  totalBlessCount: number;
  todayMerit: number;
  lastBlessDate: string;
  lastBlessTime: string;
  streakDays: number;
  blessHistory: string[];
}

export interface BlessingState extends BlessStats {
  selectedWishType: WishTypeId;
  wishPowerBalance: number;
  dailyFreeWishDate: string;
  dailyFreeDrawDate: string;
  wishRecords: WishRecord[];
  rechargeRecords: RechargeRecord[];
  lampRecords: LampRecord[];
}

export interface FloatingMerit {
  id: string;
  x: number;
  y: number;
}

export interface RechargePackage {
  id: string;
  packageName: string;
  price: number;
  wishPower: number;
  description: string;
  badge?: string;
  highlightText?: string;
}

export interface LampOption {
  id: string;
  lampName: string;
  wishType: WishTypeId;
  cost: number;
  description: string;
  badge?: string;
  premiumNote?: string;
}
