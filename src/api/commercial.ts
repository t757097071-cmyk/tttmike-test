export type PaymentChannel = "wechat" | "alipay";
export type RechargeOrderStatus = "pending" | "paid" | "closed" | "failed" | "refunded";

export interface ApiUser {
  id: string;
  phoneMasked: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface ApiWallet {
  wishPowerBalance: number;
  updatedAt: string;
}

export interface ApiRechargePackage {
  id: string;
  name: string;
  priceCents: number;
  wishPower: number;
  status: string;
  sortOrder: number;
}

export interface ApiRechargeOrder {
  id: string;
  orderNo: string;
  packageId: string;
  packageName: string;
  priceCents: number;
  wishPower: number;
  paymentChannel: PaymentChannel;
  status: RechargeOrderStatus;
  cashierUrl: string;
  paidAt: string | null;
  createdAt: string;
}

export interface ApiLampRecord {
  id: string;
  userId?: string;
  lampId?: string;
  lampName: string;
  wishType: "study" | "career" | "health" | "peace";
  cost: number;
  nickname?: string;
  wishContent: string;
  createdAt: string;
}

export interface AdminMetricGroup {
  key: string;
  label: string;
  records: number;
  participants: number;
  wishPowerSpent: number;
  revenueYuan?: number;
}

export interface AdminRecentOrder {
  id: string;
  orderNo: string;
  userId: string;
  phoneMasked: string;
  packageName: string;
  priceYuan: number;
  wishPower: number;
  paymentChannel: PaymentChannel;
  status: RechargeOrderStatus;
  paidAt: string | null;
  createdAt: string;
}

export interface AdminRecentUser {
  id: string;
  phoneMasked: string;
  status: string;
  createdAt: string;
  lastLoginAt: string;
  wishPowerBalance: number;
  paidOrders: number;
}

export interface AdminStats {
  generatedAt: string;
  overview: {
    todayIncomeYuan: number;
    totalIncomeYuan: number;
    totalUsers: number;
    todayActiveUsers: number;
    todayNewUsers: number;
    paidUsers: number;
    businessRecords: number;
    totalWishPowerInWallets: number;
  };
  orders: {
    total: number;
    paid: number;
    pending: number;
    failed: number;
    todayPaid: number;
    averagePaidOrderYuan: number;
    recent: AdminRecentOrder[];
    packages: AdminMetricGroup[];
  };
  users: {
    recent: AdminRecentUser[];
  };
  projects: {
    wishes: AdminMetricGroup[];
    lamps: AdminMetricGroup[];
    draws: {
      records: number;
      participants: number;
      wishPowerSpent: number;
    };
    featureConsumptions: AdminMetricGroup[];
  };
  audit: {
    paymentTransactions: number;
    walletLedgerEntries: number;
    activeSessions: number;
    dataStore: string;
  };
}

interface ApiErrorBody {
  error?: string;
  message?: string;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T & ApiErrorBody) : ({} as T & ApiErrorBody);

  if (!response.ok) {
    throw new Error(data.message ?? data.error ?? "请求失败");
  }

  return data as T;
}

export const sendSmsCode = (phone: string) =>
  apiRequest<{ ok: boolean; message: string; devCode?: string }>("/api/auth/sms-code", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });

export const loginWithSmsCode = (phone: string, code: string) =>
  apiRequest<{ user: ApiUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  });

export const logout = () =>
  apiRequest<{ ok: boolean }>("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });

export const getMe = () => apiRequest<{ user: ApiUser }>("/api/me");

export const getWallet = () =>
  apiRequest<{ wallet: ApiWallet; ledger: unknown[] }>("/api/wallet");

export const getLampRecords = () =>
  apiRequest<{ records: ApiLampRecord[] }>("/api/lamp-records");

export const getRechargeOrders = () =>
  apiRequest<{ orders: ApiRechargeOrder[] }>("/api/recharge/orders");

export const createRechargeOrder = (payload: {
  packageId: string;
  paymentChannel: PaymentChannel;
}) =>
  apiRequest<{ order: ApiRechargeOrder }>("/api/recharge/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getRechargeOrder = (orderId: string) =>
  apiRequest<{ order: ApiRechargeOrder }>(`/api/recharge/orders/${orderId}`);

export const createLampRecord = (payload: {
  lampId: string;
  lampName: string;
  nickname?: string;
  wishContent: string;
}) =>
  apiRequest<{ record: ApiLampRecord; wallet: ApiWallet }>("/api/lamp-records", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const completeMockPayment = (order: ApiRechargeOrder) =>
  apiRequest<{ ok: boolean; alreadySettled: boolean; order: ApiRechargeOrder }>(
    "/api/payments/mock/notify",
    {
      method: "POST",
      body: JSON.stringify({ orderId: order.id, amountCents: order.priceCents }),
    },
  );

export const getAdminStats = (adminToken: string) =>
  apiRequest<{ stats: AdminStats }>("/api/admin/stats", {
    headers: {
      "x-admin-token": adminToken,
    },
  });
