import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  addWalletLedger,
  encryptPhoneForDemo,
  generateOrderNo,
  getUserBySession,
  getWallet,
  hashPhone,
  isValidMainlandPhone,
  normalizePhone,
  publicUser,
  randomId,
  readDb,
  rechargePackages,
  safeEqual,
  writeDb,
} from "./commercial-store.mjs";

const env = globalThis.process?.env ?? {};
const port = Number(env.PORT ?? env.API_PORT ?? 4000);
const host = env.HOST ?? (env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(rootDir, "dist");
const cookieName = "jinyuan_sid";
const sessionDays = 30;
const devAdminToken = "jinyuan-admin-dev";
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};
const lampCatalog = new Map(
  [
    ["study-light", { wishType: "study", cost: 88 }],
    ["peace-guard", { wishType: "peace", cost: 108 }],
    ["health-light", { wishType: "health", cost: 128 }],
    ["career-light", { wishType: "career", cost: 168 }],
    ["exam-light", { wishType: "study", cost: 198 }],
    ["long-wish-light", { wishType: "peace", cost: 388 }],
  ],
);

function json(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end(JSON.stringify(body));
}

function text(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function isInside(parent, child) {
  const relative = normalize(child).slice(resolve(parent).length);
  return relative === "" || relative.startsWith(sep);
}

function getStaticPath(pathname) {
  let decodedPath = pathname;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const requestedPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const candidatePath = resolve(distDir, `.${requestedPath}`);
  if (!isInside(distDir, candidatePath)) {
    return null;
  }
  return candidatePath;
}

function streamStaticFile(res, filePath, cacheControl) {
  const extension = extname(filePath).toLowerCase();
  const stream = createReadStream(filePath);
  res.writeHead(200, {
    "Content-Type": mimeTypes[extension] ?? "application/octet-stream",
    "Cache-Control": cacheControl,
  });
  stream.pipe(res);
  stream.on("error", () => {
    if (!res.headersSent) {
      text(res, 500, "Static file read failed.");
    } else {
      res.destroy();
    }
  });
}

function serveStaticApp(req, res, pathname) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return text(res, 405, "Method not allowed.");
  }

  if (!existsSync(distDir)) {
    return text(res, 503, "Frontend build not found. Run `pnpm run build` first.");
  }

  const requestedFilePath = getStaticPath(pathname);
  if (!requestedFilePath) {
    return text(res, 400, "Invalid static path.");
  }

  if (existsSync(requestedFilePath) && statSync(requestedFilePath).isFile()) {
    const cacheControl = requestedFilePath.includes(`${sep}assets${sep}`)
      ? "public, max-age=31536000, immutable"
      : "no-cache";
    if (req.method === "HEAD") {
      res.writeHead(200, {
        "Content-Type": mimeTypes[extname(requestedFilePath).toLowerCase()] ?? "application/octet-stream",
        "Cache-Control": cacheControl,
      });
      res.end();
      return undefined;
    }
    return streamStaticFile(res, requestedFilePath, cacheControl);
  }

  const indexPath = join(distDir, "index.html");
  if (existsSync(indexPath)) {
    if (req.method === "HEAD") {
      res.writeHead(200, {
        "Content-Type": mimeTypes[".html"],
        "Cache-Control": "no-cache",
      });
      res.end();
      return undefined;
    }
    return streamStaticFile(res, indexPath, "no-cache");
  }

  return text(res, 404, "Frontend entry not found.");
}

function parseCookies(req) {
  return Object.fromEntries(
    String(req.headers.cookie ?? "")
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf("=");
        return [item.slice(0, index), decodeURIComponent(item.slice(index + 1))];
      }),
  );
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("INVALID_JSON");
    error.status = 400;
    throw error;
  }
}

function requireUser(req, res, db) {
  const sessionId = parseCookies(req)[cookieName];
  const user = getUserBySession(db, sessionId);
  if (!user) {
    json(res, 401, { error: "UNAUTHENTICATED", message: "请先使用手机号登录。" });
    return null;
  }
  return user;
}

function getAdminToken() {
  return env.ADMIN_TOKEN || (env.NODE_ENV === "production" ? "" : devAdminToken);
}

function requireAdmin(req, res) {
  const token = getAdminToken();
  if (!token) {
    json(res, 503, {
      error: "ADMIN_NOT_CONFIGURED",
      message: "后台管理口令未配置，请在服务端设置 ADMIN_TOKEN。",
    });
    return false;
  }

  const providedToken = req.headers["x-admin-token"];
  if (!providedToken || !safeEqual(providedToken, token)) {
    json(res, 401, { error: "ADMIN_UNAUTHORIZED", message: "管理员口令不正确。" });
    return false;
  }

  return true;
}

function startOfTodayMs() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}

function isToday(dateValue) {
  return new Date(dateValue).getTime() >= startOfTodayMs();
}

function moneyYuan(cents) {
  return Math.round(Number(cents || 0)) / 100;
}

function sumBy(items, getValue) {
  return items.reduce((total, item) => total + Number(getValue(item) || 0), 0);
}

function groupRecords(items, getKey, makeLabel) {
  const groups = new Map();
  for (const item of items) {
    const key = getKey(item);
    if (!key) continue;
    const current = groups.get(key) ?? {
      key,
      label: makeLabel(item),
      records: 0,
      participants: new Set(),
      amount: 0,
    };
    current.records += 1;
    current.amount += Number(item.cost || 0);
    if (item.userId) {
      current.participants.add(item.userId);
    }
    groups.set(key, current);
  }

  return [...groups.values()]
    .map((item) => ({
      key: item.key,
      label: item.label,
      records: item.records,
      participants: item.participants.size,
      wishPowerSpent: item.amount,
    }))
    .sort((left, right) => right.records - left.records || left.label.localeCompare(right.label));
}

function getAdminStats(db) {
  const users = db.users.filter((user) => user.status !== "deleted");
  const paidOrders = db.rechargeOrders.filter((order) => order.status === "paid");
  const pendingOrders = db.rechargeOrders.filter((order) => order.status === "pending");
  const failedOrders = db.rechargeOrders.filter(
    (order) => order.status === "failed" || order.status === "closed",
  );
  const paidUserIds = new Set(paidOrders.map((order) => order.userId));
  const allBusinessRecords = [
    ...db.wishRecords,
    ...db.lampRecords,
    ...db.drawRecords,
    ...db.featureConsumptions,
  ];

  const recentOrders = db.rechargeOrders.slice(0, 12).map((order) => {
    const user = db.users.find((item) => item.id === order.userId);
    return {
      id: order.id,
      orderNo: order.orderNo,
      userId: order.userId,
      phoneMasked: user ? publicUser(user).phoneMasked : "未知用户",
      packageName: order.packageName,
      priceYuan: moneyYuan(order.priceCents),
      wishPower: order.wishPower,
      paymentChannel: order.paymentChannel,
      status: order.status,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
    };
  });

  const recentUsers = users
    .slice()
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 12)
    .map((user) => ({
      id: user.id,
      phoneMasked: publicUser(user).phoneMasked,
      status: user.status,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      wishPowerBalance: getWallet(db, user.id).wishPowerBalance,
      paidOrders: paidOrders.filter((order) => order.userId === user.id).length,
    }));

  return {
    generatedAt: new Date().toISOString(),
    overview: {
      todayIncomeYuan: moneyYuan(sumBy(paidOrders.filter((order) => isToday(order.paidAt)), (order) => order.priceCents)),
      totalIncomeYuan: moneyYuan(sumBy(paidOrders, (order) => order.priceCents)),
      totalUsers: users.length,
      todayActiveUsers: users.filter((user) => isToday(user.lastLoginAt)).length,
      todayNewUsers: users.filter((user) => isToday(user.createdAt)).length,
      paidUsers: paidUserIds.size,
      businessRecords: allBusinessRecords.length,
      totalWishPowerInWallets: sumBy(db.wallets, (wallet) => wallet.wishPowerBalance),
    },
    orders: {
      total: db.rechargeOrders.length,
      paid: paidOrders.length,
      pending: pendingOrders.length,
      failed: failedOrders.length,
      todayPaid: paidOrders.filter((order) => isToday(order.paidAt)).length,
      averagePaidOrderYuan:
        paidOrders.length > 0 ? moneyYuan(sumBy(paidOrders, (order) => order.priceCents) / paidOrders.length) : 0,
      recent: recentOrders,
      packages: groupRecords(paidOrders, (order) => order.packageId, (order) => order.packageName).map(
        (item) => ({
          ...item,
          revenueYuan: moneyYuan(
            sumBy(
              paidOrders.filter((order) => order.packageId === item.key),
              (order) => order.priceCents,
            ),
          ),
        }),
      ),
    },
    users: {
      recent: recentUsers,
    },
    projects: {
      wishes: groupRecords(db.wishRecords, (record) => record.type, (record) => record.type),
      lamps: groupRecords(
        db.lampRecords,
        (record) => `${record.wishType}:${record.lampName}`,
        (record) => record.lampName,
      ),
      draws: {
        records: db.drawRecords.length,
        participants: new Set(db.drawRecords.map((record) => record.userId)).size,
        wishPowerSpent: sumBy(db.drawRecords, (record) => record.cost),
      },
      featureConsumptions: groupRecords(
        db.featureConsumptions,
        (record) => record.feature,
        (record) => record.feature,
      ),
    },
    audit: {
      paymentTransactions: db.paymentTransactions.length,
      walletLedgerEntries: db.walletLedger.length,
      activeSessions: db.sessions.filter((session) => new Date(session.expiresAt).getTime() > Date.now()).length,
      dataStore: "local-json",
    },
  };
}

function sanitizeShortText(value, maxLength) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function orderDto(order) {
  return {
    id: order.id,
    orderNo: order.orderNo,
    packageId: order.packageId,
    packageName: order.packageName,
    priceCents: order.priceCents,
    wishPower: order.wishPower,
    paymentChannel: order.paymentChannel,
    status: order.status,
    cashierUrl: order.cashierUrl,
    paidAt: order.paidAt,
    createdAt: order.createdAt,
  };
}

function assertPaymentChannel(channel) {
  if (channel !== "wechat" && channel !== "alipay") {
    const error = new Error("INVALID_PAYMENT_CHANNEL");
    error.status = 400;
    throw error;
  }
}

function settlePaidOrder(db, order, providerTradeNo, rawNotify) {
  const existingTx = db.paymentTransactions.find(
    (tx) => tx.orderId === order.id && tx.providerTradeNo === providerTradeNo,
  );
  if (existingTx || order.status === "paid") {
    return { alreadySettled: true };
  }

  if (order.status !== "pending") {
    const error = new Error("ORDER_NOT_PAYABLE");
    error.status = 409;
    throw error;
  }

  order.status = "paid";
  order.paidAt = new Date().toISOString();
  db.paymentTransactions.unshift({
    id: randomId("pay"),
    orderId: order.id,
    providerTradeNo,
    rawNotify,
    verifiedAt: new Date().toISOString(),
  });
  addWalletLedger(db, {
    userId: order.userId,
    type: "recharge",
    amount: order.wishPower,
    sourceType: "recharge_order",
    sourceId: order.id,
  });
  return { alreadySettled: false };
}

async function handle(req, res) {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  if (!url.pathname.startsWith("/api")) {
    return serveStaticApp(req, res, url.pathname);
  }

  const db = readDb();

  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      return json(res, 200, { ok: true, service: "jinyuan-commercial-api" });
    }

    if (req.method === "POST" && url.pathname === "/api/auth/sms-code") {
      const body = await readBody(req);
      const phone = normalizePhone(body.phone);
      if (!isValidMainlandPhone(phone)) {
        return json(res, 400, { error: "INVALID_PHONE", message: "请输入中国大陆 11 位手机号。" });
      }

      const phoneHash = hashPhone(phone);
      const now = Date.now();
      const recentCodes = db.smsCodes.filter(
        (code) => code.phoneHash === phoneHash && now - new Date(code.createdAt).getTime() < 60_000,
      );
      if (recentCodes.length >= 1) {
        return json(res, 429, { error: "SMS_RATE_LIMITED", message: "验证码发送太频繁，请稍后再试。" });
      }

      const code = env.SMS_DEV_CODE ?? "123456";
      db.smsCodes.unshift({
        id: randomId("sms"),
        phoneHash,
        code,
        attempts: 0,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(now + 5 * 60_000).toISOString(),
      });
      writeDb(db);
      return json(res, 200, {
        ok: true,
        message: "验证码已发送。开发环境默认验证码为 123456。",
        devCode: env.NODE_ENV === "production" ? undefined : code,
      });
    }

    if (req.method === "POST" && url.pathname === "/api/auth/login") {
      const body = await readBody(req);
      const phone = normalizePhone(body.phone);
      const code = String(body.code ?? "");
      if (!isValidMainlandPhone(phone)) {
        return json(res, 400, { error: "INVALID_PHONE", message: "手机号格式不正确。" });
      }

      const phoneHash = hashPhone(phone);
      const sms = db.smsCodes.find(
        (item) =>
          item.phoneHash === phoneHash &&
          new Date(item.expiresAt).getTime() > Date.now() &&
          item.attempts < 5,
      );
      if (!sms || !safeEqual(sms.code, code)) {
        if (sms) {
          sms.attempts += 1;
          writeDb(db);
        }
        return json(res, 401, { error: "INVALID_CODE", message: "验证码错误或已过期。" });
      }

      let user = db.users.find((item) => item.phoneHash === phoneHash);
      const now = new Date().toISOString();
      if (!user) {
        user = {
          id: randomId("user"),
          phoneHash,
          phoneEncrypted: encryptPhoneForDemo(phone),
          status: "active",
          createdAt: now,
          lastLoginAt: now,
        };
        db.users.push(user);
        getWallet(db, user.id);
      } else {
        user.lastLoginAt = now;
      }

      db.smsCodes = db.smsCodes.filter((item) => item.id !== sms.id);
      const sessionId = randomId("sid");
      db.sessions.unshift({
        id: sessionId,
        userId: user.id,
        createdAt: now,
        expiresAt: new Date(Date.now() + sessionDays * 24 * 60 * 60_000).toISOString(),
      });
      writeDb(db);
      return json(
        res,
        200,
        { user: publicUser(user) },
        {
          "Set-Cookie": `${cookieName}=${encodeURIComponent(
            sessionId,
          )}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${sessionDays * 24 * 60 * 60}`,
        },
      );
    }

    if (req.method === "POST" && url.pathname === "/api/auth/logout") {
      const sessionId = parseCookies(req)[cookieName];
      const nextDb = readDb();
      nextDb.sessions = nextDb.sessions.filter((item) => item.id !== sessionId);
      writeDb(nextDb);
      return json(res, 200, { ok: true }, { "Set-Cookie": `${cookieName}=; Path=/; Max-Age=0` });
    }

    if (req.method === "GET" && url.pathname === "/api/me") {
      const user = requireUser(req, res, db);
      if (!user) return;
      return json(res, 200, { user: publicUser(user) });
    }

    if (req.method === "GET" && url.pathname === "/api/wallet") {
      const user = requireUser(req, res, db);
      if (!user) return;
      const wallet = getWallet(db, user.id);
      writeDb(db);
      return json(res, 200, {
        wallet: {
          wishPowerBalance: wallet.wishPowerBalance,
          updatedAt: wallet.updatedAt,
        },
        ledger: db.walletLedger.filter((item) => item.userId === user.id).slice(0, 50),
      });
    }

    if (req.method === "GET" && url.pathname === "/api/admin/stats") {
      if (!requireAdmin(req, res)) return;
      return json(res, 200, { stats: getAdminStats(db) });
    }

    if (req.method === "GET" && url.pathname === "/api/recharge/packages") {
      return json(res, 200, { packages: rechargePackages.filter((item) => item.status === "active") });
    }

    if (req.method === "POST" && url.pathname === "/api/recharge/orders") {
      const user = requireUser(req, res, db);
      if (!user) return;
      const body = await readBody(req);
      assertPaymentChannel(body.paymentChannel);
      const pkg = rechargePackages.find(
        (item) => item.id === body.packageId && item.status === "active",
      );
      if (!pkg) {
        return json(res, 404, { error: "PACKAGE_NOT_FOUND", message: "充值包不存在或已下架。" });
      }

      const order = {
        id: randomId("order"),
        orderNo: generateOrderNo(),
        userId: user.id,
        packageId: pkg.id,
        packageName: pkg.name,
        priceCents: pkg.priceCents,
        wishPower: pkg.wishPower,
        paymentChannel: body.paymentChannel,
        status: "pending",
        cashierUrl: `/mock-cashier/${pkg.id}`,
        paidAt: null,
        createdAt: new Date().toISOString(),
      };
      db.rechargeOrders.unshift(order);
      writeDb(db);
      return json(res, 201, { order: orderDto(order) });
    }

    if (req.method === "GET" && url.pathname === "/api/recharge/orders") {
      const user = requireUser(req, res, db);
      if (!user) return;
      const orders = db.rechargeOrders
        .filter((order) => order.userId === user.id)
        .slice(0, 50)
        .map(orderDto);
      return json(res, 200, { orders });
    }

    const orderMatch = url.pathname.match(/^\/api\/recharge\/orders\/([^/]+)$/);
    if (req.method === "GET" && orderMatch) {
      const user = requireUser(req, res, db);
      if (!user) return;
      const order = db.rechargeOrders.find(
        (item) => item.id === orderMatch[1] && item.userId === user.id,
      );
      if (!order) {
        return json(res, 404, { error: "ORDER_NOT_FOUND", message: "订单不存在。" });
      }
      return json(res, 200, { order: orderDto(order) });
    }

    if (req.method === "POST" && url.pathname === "/api/payments/mock/notify") {
      const user = requireUser(req, res, db);
      if (!user) return;
      const body = await readBody(req);
      const order = db.rechargeOrders.find(
        (item) => item.id === body.orderId && item.userId === user.id,
      );
      if (!order) {
        return json(res, 404, { error: "ORDER_NOT_FOUND", message: "订单不存在。" });
      }
      if (Number(body.amountCents) !== order.priceCents) {
        return json(res, 400, { error: "AMOUNT_MISMATCH", message: "支付金额与订单金额不一致。" });
      }

      const result = settlePaidOrder(
        db,
        order,
        `MOCK_${order.orderNo}`,
        JSON.stringify({ orderId: order.id, amountCents: body.amountCents }),
      );
      writeDb(db);
      return json(res, 200, { ok: true, alreadySettled: result.alreadySettled, order: orderDto(order) });
    }

    if (
      req.method === "POST" &&
      (url.pathname === "/api/payments/wechat/notify" ||
        url.pathname === "/api/payments/alipay/notify")
    ) {
      const body = await readBody(req);
      if (!env.PAYMENT_NOTIFY_SECRET) {
        return json(res, 503, {
          error: "PAYMENT_NOT_CONFIGURED",
          message: "请先配置正式支付验签密钥。",
        });
      }

      if (!safeEqual(req.headers["x-payment-sandbox-secret"], env.PAYMENT_NOTIFY_SECRET)) {
        return json(res, 401, { error: "INVALID_SIGNATURE", message: "支付回调验签失败。" });
      }

      const order = db.rechargeOrders.find((item) => item.orderNo === body.orderNo);
      if (!order) {
        return json(res, 404, { error: "ORDER_NOT_FOUND", message: "订单不存在。" });
      }
      if (Number(body.amountCents) !== order.priceCents) {
        return json(res, 400, { error: "AMOUNT_MISMATCH", message: "支付金额与订单金额不一致。" });
      }

      const provider = url.pathname.includes("wechat") ? "WECHAT" : "ALIPAY";
      const result = settlePaidOrder(
        db,
        order,
        String(body.providerTradeNo ?? `${provider}_${order.orderNo}`),
        JSON.stringify(body),
      );
      writeDb(db);
      return json(res, 200, { ok: true, alreadySettled: result.alreadySettled });
    }

    if (req.method === "GET" && url.pathname === "/api/wish-records") {
      const user = requireUser(req, res, db);
      if (!user) return;
      return json(res, 200, { records: db.wishRecords.filter((item) => item.userId === user.id) });
    }

    if (req.method === "GET" && url.pathname === "/api/lamp-records") {
      const user = requireUser(req, res, db);
      if (!user) return;
      return json(res, 200, { records: db.lampRecords.filter((item) => item.userId === user.id) });
    }

    if (req.method === "POST" && url.pathname === "/api/lamp-records") {
      const user = requireUser(req, res, db);
      if (!user) return;

      const body = await readBody(req);
      const lampId = sanitizeShortText(body.lampId, 64);
      const lamp = lampCatalog.get(lampId);
      if (!lamp) {
        return json(res, 400, { error: "INVALID_LAMP", message: "点灯项目不存在或已下架。" });
      }

      const wishContent = sanitizeShortText(body.wishContent, 50);
      if (!wishContent) {
        return json(res, 400, { error: "INVALID_WISH_CONTENT", message: "请先写下点灯心愿。" });
      }

      const now = new Date().toISOString();
      const record = {
        id: randomId("lamp"),
        userId: user.id,
        lampId,
        lampName: sanitizeShortText(body.lampName, 32) || lampId,
        wishType: lamp.wishType,
        cost: lamp.cost,
        nickname: sanitizeShortText(body.nickname, 16),
        wishContent,
        createdAt: now,
      };

      try {
        addWalletLedger(db, {
          userId: user.id,
          type: "consume",
          amount: -lamp.cost,
          sourceType: "lamp_record",
          sourceId: record.id,
        });
      } catch (error) {
        if (error.message === "INSUFFICIENT_BALANCE") {
          return json(res, 409, { error: "INSUFFICIENT_BALANCE", message: "愿力不足，请先充值后再点灯。" });
        }
        throw error;
      }

      db.lampRecords.unshift(record);
      const wallet = getWallet(db, user.id);
      writeDb(db);
      return json(res, 201, {
        record,
        wallet: {
          wishPowerBalance: wallet.wishPowerBalance,
          updatedAt: wallet.updatedAt,
        },
      });
    }

    if (req.method === "GET" && url.pathname === "/api/draw-records") {
      const user = requireUser(req, res, db);
      if (!user) return;
      return json(res, 200, { records: db.drawRecords.filter((item) => item.userId === user.id) });
    }

    return json(res, 404, { error: "NOT_FOUND", message: "API path not found." });
  } catch (error) {
    const status = error.status ?? 500;
    return json(res, status, {
      error: error.message ?? "SERVER_ERROR",
      message: status >= 500 ? "服务暂时不可用。" : error.message,
    });
  }
}

createServer(handle).listen(port, host, () => {
  console.log(`Jinyuan app running at http://${host}:${port}`);
});
