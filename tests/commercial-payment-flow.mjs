import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const port = 4300 + Math.floor(Math.random() * 500);
const baseUrl = `http://127.0.0.1:${port}`;
const testPhone = `139${String(Math.floor(Math.random() * 100_000_000)).padStart(8, "0")}`;
const serverPath = fileURLToPath(new URL("../server/mock-api-server.mjs", import.meta.url));

let server;
let cookie = "";

function startServer() {
  server = spawn(process.execPath, [serverPath], {
    env: { ...process.env, API_PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });

  server.stderr.on("data", (chunk) => {
    process.stderr.write(chunk);
  });
}

async function stopServer() {
  if (!server || server.killed) {
    return;
  }

  server.kill();
  await delay(300);
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        return;
      }
    } catch {
      await delay(150);
    }
  }
  throw new Error("API server did not become ready");
}

function rememberCookie(response) {
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    cookie = setCookie.split(";")[0];
  }
}

async function api(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...options.headers,
    },
  });
  rememberCookie(response);
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`${path} failed: ${JSON.stringify(body)}`);
  }
  return body;
}

async function apiRaw(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...options.headers,
    },
  });
  rememberCookie(response);
  return {
    status: response.status,
    body: await response.json(),
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

try {
  startServer();
  await waitForServer();

  await api("/api/auth/sms-code", {
    method: "POST",
    body: JSON.stringify({ phone: testPhone }),
  });

  const login = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ phone: testPhone, code: "123456" }),
  });
  assert(login.user.phoneMasked.endsWith(testPhone.slice(-4)), "Login did not return masked phone");

  const created = await api("/api/recharge/orders", {
    method: "POST",
    body: JSON.stringify({ packageId: "first-wish", paymentChannel: "wechat" }),
  });
  assert(created.order.status === "pending", "New order should be pending");

  const paid = await api("/api/payments/mock/notify", {
    method: "POST",
    body: JSON.stringify({
      orderId: created.order.id,
      amountCents: created.order.priceCents,
    }),
  });
  assert(paid.order.status === "paid", "Paid order did not become paid");

  const duplicate = await api("/api/payments/mock/notify", {
    method: "POST",
    body: JSON.stringify({
      orderId: created.order.id,
      amountCents: created.order.priceCents,
    }),
  });
  assert(duplicate.alreadySettled === true, "Duplicate callback should be idempotent");

  const wallet = await api("/api/wallet");
  assert(wallet.wallet.wishPowerBalance === 99, "Wallet balance should be exactly one recharge");
  assert(wallet.ledger.length === 1, "Duplicate callback should not create a second ledger row");

  await stopServer();
  startServer();
  await waitForServer();

  const persistedWallet = await api("/api/wallet");
  const persistedOrders = await api("/api/recharge/orders");
  assert(
    persistedWallet.wallet.wishPowerBalance === 99,
    "Wallet balance was not persisted after API restart",
  );
  assert(
    persistedOrders.orders.some((order) => order.id === created.order.id && order.status === "paid"),
    "Paid order was not persisted after API restart",
  );

  const lamp = await api("/api/lamp-records", {
    method: "POST",
    body: JSON.stringify({
      lampId: "study-light",
      lampName: "学业顺遂灯",
      nickname: "测试用户",
      wishContent: "愿点灯记录进入后台",
    }),
  });
  assert(lamp.record.cost === 88, "Lamp cost should be enforced by the server catalog");
  assert(lamp.wallet.wishPowerBalance === 11, "Lamp lighting should deduct wish power on the server");

  const lampRecords = await api("/api/lamp-records");
  assert(
    lampRecords.records.some((record) => record.id === lamp.record.id),
    "Lamp record should be readable from the server",
  );

  const deniedAdminStats = await apiRaw("/api/admin/stats");
  assert(deniedAdminStats.status === 401, "Admin stats should reject requests without a token");

  const adminStats = await api("/api/admin/stats", {
    headers: { "x-admin-token": "jinyuan-admin-dev" },
  });
  assert(adminStats.stats.overview.totalUsers >= 1, "Admin stats should include total users");
  assert(adminStats.stats.orders.paid >= 1, "Admin stats should include paid orders");
  assert(
    adminStats.stats.projects.lamps.some((item) => item.records >= 1),
    "Admin stats should include lamp records",
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        phone: login.user.phoneMasked,
        orderNo: created.order.orderNo,
        balance: lamp.wallet.wishPowerBalance,
        duplicateCallbackIdempotent: duplicate.alreadySettled,
        persistedAfterRestart: true,
        adminStatsSecured: deniedAdminStats.status === 401,
        lampSyncedToAdmin: true,
      },
      null,
      2,
    ),
  );
} finally {
  await stopServer();
}
