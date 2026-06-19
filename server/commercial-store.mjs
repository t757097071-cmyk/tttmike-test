import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const dataDir = join(rootDir, ".data");
const dbPath = join(dataDir, "commercial-db.json");

export const rechargePackages = [
  {
    id: "first-wish",
    name: "初愿包",
    priceCents: 990,
    wishPower: 99,
    status: "active",
    sortOrder: 10,
  },
  {
    id: "small-blessing",
    name: "小福包",
    priceCents: 1990,
    wishPower: 219,
    status: "active",
    sortOrder: 20,
  },
  {
    id: "advance-wish",
    name: "进愿包",
    priceCents: 3990,
    wishPower: 469,
    status: "active",
    sortOrder: 30,
  },
  {
    id: "jinyuan",
    name: "锦愿包",
    priceCents: 6800,
    wishPower: 899,
    status: "active",
    sortOrder: 40,
  },
  {
    id: "long-light",
    name: "长明包",
    priceCents: 9900,
    wishPower: 1399,
    status: "active",
    sortOrder: 50,
  },
  {
    id: "complete",
    name: "圆满包",
    priceCents: 19900,
    wishPower: 2999,
    status: "active",
    sortOrder: 60,
  },
];

const defaultDb = {
  users: [],
  wallets: [],
  walletLedger: [],
  rechargeOrders: [],
  paymentTransactions: [],
  sessions: [],
  smsCodes: [],
  wishRecords: [],
  lampRecords: [],
  drawRecords: [],
  featureConsumptions: [],
};

export function readDb() {
  if (!existsSync(dbPath)) {
    return structuredClone(defaultDb);
  }

  try {
    return { ...structuredClone(defaultDb), ...JSON.parse(readFileSync(dbPath, "utf8")) };
  } catch {
    return structuredClone(defaultDb);
  }
}

export function writeDb(db) {
  mkdirSync(dataDir, { recursive: true });
  const processId = globalThis.process?.pid ?? Date.now();
  const tempPath = `${dbPath}.${processId}.tmp`;
  writeFileSync(tempPath, `${JSON.stringify(db, null, 2)}\n`, "utf8");
  renameSync(tempPath, dbPath);
}

export function hashPhone(phone) {
  return createHash("sha256").update(normalizePhone(phone)).digest("hex");
}

export function encryptPhoneForDemo(phone) {
  return Buffer.from(normalizePhone(phone), "utf8").toString("base64");
}

export function maskPhone(phone) {
  const normalized = normalizePhone(phone);
  return `${normalized.slice(0, 3)}****${normalized.slice(-4)}`;
}

export function normalizePhone(phone) {
  return String(phone ?? "").replace(/\D/g, "");
}

export function isValidMainlandPhone(phone) {
  return /^1[3-9]\d{9}$/.test(normalizePhone(phone));
}

export function randomId(prefix) {
  return `${prefix}_${randomBytes(12).toString("hex")}`;
}

export function generateOrderNo() {
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  return `JY${stamp}${randomBytes(4).toString("hex").toUpperCase()}`;
}

export function safeEqual(a, b) {
  const left = Buffer.from(String(a ?? ""));
  const right = Buffer.from(String(b ?? ""));
  return left.length === right.length && timingSafeEqual(left, right);
}

export function getUserBySession(db, sessionId) {
  if (!sessionId) {
    return null;
  }

  const now = Date.now();
  const session = db.sessions.find(
    (item) => item.id === sessionId && new Date(item.expiresAt).getTime() > now,
  );
  if (!session) {
    return null;
  }

  return db.users.find((user) => user.id === session.userId && user.status === "active") ?? null;
}

export function publicUser(user) {
  return {
    id: user.id,
    phoneMasked: maskPhone(Buffer.from(user.phoneEncrypted, "base64").toString("utf8")),
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

export function getWallet(db, userId) {
  let wallet = db.wallets.find((item) => item.userId === userId);
  if (!wallet) {
    wallet = {
      userId,
      wishPowerBalance: 0,
      updatedAt: new Date().toISOString(),
    };
    db.wallets.push(wallet);
  }
  return wallet;
}

export function addWalletLedger(db, entry) {
  const wallet = getWallet(db, entry.userId);
  const nextBalance = wallet.wishPowerBalance + entry.amount;
  if (nextBalance < 0) {
    throw new Error("INSUFFICIENT_BALANCE");
  }

  wallet.wishPowerBalance = nextBalance;
  wallet.updatedAt = new Date().toISOString();
  const ledgerEntry = {
    id: randomId("ledger"),
    userId: entry.userId,
    type: entry.type,
    amount: entry.amount,
    balanceAfter: nextBalance,
    sourceType: entry.sourceType,
    sourceId: entry.sourceId,
    createdAt: new Date().toISOString(),
  };
  db.walletLedger.unshift(ledgerEntry);
  return ledgerEntry;
}
