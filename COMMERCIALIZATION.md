# 锦愿阁商业化接入说明

## 本次实现内容

- 新增本地商业化 API：`server/mock-api-server.mjs`
- 新增手机号验证码登录接口：`/api/auth/sms-code`、`/api/auth/login`
- 新增 HttpOnly Cookie 会话：`jinyuan_sid`
- 新增钱包接口：`/api/wallet`
- 新增充值订单接口：`/api/recharge/orders`
- 新增模拟支付回调：`/api/payments/mock/notify`
- 新增正式支付回调占位：`/api/payments/wechat/notify`、`/api/payments/alipay/notify`
- 新增 Prisma PostgreSQL 数据模型：`prisma/schema.prisma`
- 前端新增 `/login` 页面，并把 `/recharge`、`/profile` 接到服务端账户数据

## 本地运行

需要开两个终端：

```bash
npm run api
npm run dev
```

访问 Vite 地址后，先进入 `/login`。开发环境默认短信验证码是 `123456`。

充值流程：

1. 登录手机号。
2. 进入 `/recharge`。
3. 选择充值包和支付方式。
4. 点击“创建支付订单”。
5. 点击“模拟支付完成”。
6. 前端刷新服务端钱包，个人中心显示已到账记录。

模拟 API 会把数据写入 `.data/commercial-db.json`。该目录已加入 `.gitignore`。

## 正式后端迁移

当前 `server/mock-api-server.mjs` 是无依赖本地服务，用于跑通商业化主链路。正式上线建议迁移到 NestJS：

- `AuthModule`：短信验证码、登录、会话校验
- `UserModule`：用户资料、手机号脱敏展示
- `WalletModule`：余额、钱包流水、事务扣减
- `RechargeModule`：充值包、充值订单
- `PaymentModule`：微信支付/支付宝下单、回调验签、幂等结算
- `BlessingModule`：心愿笺、点灯、抽签等消费功能

Prisma schema 已放在 `prisma/schema.prisma`，正式迁移时执行：

```bash
pnpm add @nestjs/common @nestjs/core @nestjs/platform-express @prisma/client prisma ioredis
pnpm prisma migrate dev
```

## 支付接入要点

正式支付不能由前端直接改余额。正确链路是：

1. 前端创建充值订单。
2. 后端调用微信/支付宝下单。
3. 前端展示二维码、H5 链接或拉起 SDK。
4. 支付平台异步回调后端。
5. 后端验签、校验金额、校验订单状态。
6. 数据库事务内把订单改为 `paid`，给钱包加愿力，写入 `wallet_ledger`。
7. 前端轮询订单状态或刷新钱包。

幂等规则：

- `payment_transactions` 对 `order_id + provider_trade_no` 做唯一约束。
- `recharge_orders.status === paid` 时重复回调不能再次加余额。
- 金额不一致、订单不存在、验签失败都不能到账。

## 合规默认

- 手机号不用于明文查询，正式环境使用 `phone_hash` 做唯一索引。
- `phone_encrypted` 需要接入 KMS 或服务端密钥加密，当前本地服务仅用 base64 演示字段形态。
- 验证码正式环境应接短信服务商和 Redis，当前本地服务用文件内存储演示 5 分钟过期与 60 秒限流。
- 愿力是站内虚拟权益：不能提现、不可转赠、不承诺现实结果。
- 中国大陆上线前准备 ICP 备案、隐私政策、用户协议、短信签名模板、微信/支付宝商户号。

## Admin dashboard

- Admin page: `/admin`
- Admin API: `GET /api/admin/stats`
- Local development token: `jinyuan-admin-dev`
- Production requirement: set `ADMIN_TOKEN` on the server. If `NODE_ENV=production` and `ADMIN_TOKEN` is missing, the admin API returns `503 ADMIN_NOT_CONFIGURED`.
- The admin API is read-only. It summarizes users, paid users, income, orders, package revenue, wish records, lamp records, draw records, feature consumption records, wallet ledger entries, payment callback count, and active sessions.
- Requests must include `x-admin-token`. The browser admin page stores the token in `sessionStorage`, so closing the browser session clears it.
