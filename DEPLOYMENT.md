# 免费内测部署指南

本项目现在支持一个 Node 服务同时提供前端页面和 `/api` 接口，适合先做小范围免费内测。内测阶段不接真实支付，用户在“领愿力”页面领取的是测试额度。

## 本地完整测试

开发时仍然开两个服务：

```bash
pnpm install
pnpm run api
pnpm run dev
```

访问 Vite 提示的本地地址。开发代理会把 `/api` 转到 `http://127.0.0.1:4000`。

## 本地生产模式

生产模式只需要一个服务：

```bash
pnpm run build
ADMIN_TOKEN=your-admin-token NODE_ENV=production pnpm run start
```

Windows PowerShell 可用：

```powershell
$env:ADMIN_TOKEN="your-admin-token"
$env:NODE_ENV="production"
pnpm run build
pnpm run start
```

打开 `http://127.0.0.1:4000`。前端页面、刷新路由和 `/api` 都由同一个 Node 服务处理。

## 发给朋友快速内测

最快方式是本机跑生产模式，再用 Cloudflare Tunnel、cpolar 或 NATAPP 暴露 `4000` 端口。朋友访问公网链接即可。

注意：

- 电脑不能关机，终端不能关闭。
- 免费隧道链接可能会变化。
- 朋友访问慢时，让他们用手机流量和微信内置浏览器各试一次。

## Render 免费部署

手动创建 Web Service 时使用：

- Build Command: `corepack enable && pnpm install --frozen-lockfile && pnpm run build`
- Start Command: `pnpm run start`
- Environment:
  - `NODE_ENV=production`
  - `ADMIN_TOKEN=你自己设置的后台口令`

Render 会提供 `PORT`，服务端会自动读取。`render.yaml` 也提供了同样配置，可用于 Blueprint。

免费服务适合内测，但有这些限制：

- 长时间无人访问会休眠，首次打开可能较慢。
- 当前数据保存在 `.data/commercial-db.json`，免费实例重启或重部署后不适合当作长期数据库。
- 真正长期上线建议迁移到托管数据库，并准备隐私政策、用户协议和备案方案。

## 内测验收清单

- `/`、`/blessing`、`/draw`、`/huangli`、`/jingxin`、`/dream` 能打开。
- `/login` 可用手机号和验证码登录，开发默认验证码为 `123456`。
- `/recharge` 显示“免费内测/领取测试额度”，不会出现真实扣费流程。
- 领取测试额度后，愿力余额到账。
- `/lamps` 点灯后扣愿力并生成记录。
- `/profile` 可查看测试额度记录和点灯记录。
- `/admin` 输入 `ADMIN_TOKEN` 后可查看用户、测试订单和参与数据。
