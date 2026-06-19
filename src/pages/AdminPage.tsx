import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { getAdminStats } from "../api/commercial";
import type { AdminMetricGroup, AdminRecentOrder, AdminRecentUser, AdminStats } from "../api/commercial";

type AdminSection = "dashboard" | "orders" | "users" | "projects" | "security";

const adminTokenKey = "jinyuan-admin-token";

const navItems: { id: AdminSection; label: string; desc: string }[] = [
  { id: "dashboard", label: "数据看板", desc: "内测与核心指标" },
  { id: "orders", label: "订单审核", desc: "测试订单与档位统计" },
  { id: "users", label: "用户列表", desc: "用户与余额" },
  { id: "projects", label: "项目参与", desc: "祈愿点灯统计" },
  { id: "security", label: "登录安全", desc: "审计与配置" },
];

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  minimumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("zh-CN");

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatDateTime(value: string | null) {
  if (!value) return "未完成";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    paid: "已入账",
    pending: "待入账",
    failed: "失败",
    closed: "已关闭",
    refunded: "已退款",
    active: "正常",
  };
  return labels[status] ?? status;
}

function statusTone(status: string) {
  if (status === "paid" || status === "active") return "good";
  if (status === "pending") return "warn";
  return "muted";
}

export function AdminPage() {
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem(adminTokenKey) ?? "");
  const [tokenInput, setTokenInput] = useState(adminToken);
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadStats = useCallback(
    async (token = adminToken) => {
      if (!token.trim()) {
        setError("请输入管理员口令。");
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        const result = await getAdminStats(token.trim());
        sessionStorage.setItem(adminTokenKey, token.trim());
        setAdminToken(token.trim());
        setTokenInput(token.trim());
        setStats(result.stats);
      } catch (requestError) {
        setStats(null);
        setError(requestError instanceof Error ? requestError.message : "后台数据读取失败。");
      } finally {
        setIsLoading(false);
      }
    },
    [adminToken],
  );

  useEffect(() => {
    if (adminToken) {
      void loadStats(adminToken);
    }
  }, [adminToken, loadStats]);

  const primaryMetrics = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: "今日测试金额",
        value: formatCurrency(stats.overview.todayIncomeYuan),
        tone: "gold",
        meta: `今日模拟入账 ${formatNumber(stats.orders.todayPaid)} 单`,
      },
      {
        label: "累计测试金额",
        value: formatCurrency(stats.overview.totalIncomeYuan),
        tone: "green",
        meta: `客单价 ${formatCurrency(stats.orders.averagePaidOrderYuan)}`,
      },
      {
        label: "累计用户",
        value: formatNumber(stats.overview.totalUsers),
        tone: "neutral",
        meta: `今日新增 ${formatNumber(stats.overview.todayNewUsers)}`,
      },
      {
        label: "入账用户",
        value: formatNumber(stats.overview.paidUsers),
        tone: "red",
        meta: `转化记录 ${formatNumber(stats.orders.paid)} 单`,
      },
    ];
  }, [stats]);

  const submitToken = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadStats(tokenInput);
  };

  const clearToken = () => {
    sessionStorage.removeItem(adminTokenKey);
    setAdminToken("");
    setTokenInput("");
    setStats(null);
    setError("");
  };

  return (
    <main className="admin-console">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">锦</span>
          <div>
            <strong>锦愿阁</strong>
            <small>管理后台</small>
          </div>
        </div>

        <nav className="admin-nav" aria-label="后台导航">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeSection === item.id ? "is-active" : ""}
              onClick={() => setActiveSection(item.id)}
            >
              <span>{item.label}</span>
              <small>{item.desc}</small>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <span>只读后台</span>
          <strong>{stats ? "已连接" : "待验证"}</strong>
        </div>
      </aside>

      <section className="admin-workspace">
        <header className="admin-topbar">
          <div>
            <span className="admin-kicker">数据看板</span>
            <h1>后台运营总览</h1>
          </div>
          <div className="admin-actions">
            {stats && <span>更新于 {formatDateTime(stats.generatedAt)}</span>}
            <button type="button" onClick={() => void loadStats()} disabled={isLoading || !adminToken}>
              {isLoading ? "刷新中" : "刷新"}
            </button>
            {adminToken && (
              <button type="button" className="admin-secondary-button" onClick={clearToken}>
                退出
              </button>
            )}
          </div>
        </header>

        {!stats ? (
          <section className="admin-login-panel">
            <div>
              <span className="admin-kicker">管理员验证</span>
              <h2>输入后台口令</h2>
              <p>本地开发默认口令为 jinyuan-admin-dev；正式上线请在服务端配置 ADMIN_TOKEN。</p>
            </div>
            <form onSubmit={submitToken}>
              <label>
                管理员口令
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(event) => setTokenInput(event.target.value)}
                  placeholder="请输入 ADMIN_TOKEN"
                  autoComplete="current-password"
                />
              </label>
              <button type="submit" disabled={isLoading}>
                {isLoading ? "验证中" : "进入后台"}
              </button>
              {error && <p className="admin-error">{error}</p>}
            </form>
          </section>
        ) : (
          <>
            {error && <p className="admin-error">{error}</p>}
            {activeSection === "dashboard" && (
              <AdminDashboard stats={stats} primaryMetrics={primaryMetrics} />
            )}
            {activeSection === "orders" && <AdminOrders stats={stats} />}
            {activeSection === "users" && <AdminUsers users={stats.users.recent} />}
            {activeSection === "projects" && <AdminProjects stats={stats} />}
            {activeSection === "security" && <AdminSecurity stats={stats} />}
          </>
        )}
      </section>
    </main>
  );
}

function AdminDashboard({
  stats,
  primaryMetrics,
}: {
  stats: AdminStats;
  primaryMetrics: { label: string; value: string; tone: string; meta: string }[];
}) {
  return (
    <div className="admin-section-stack">
      <div className="admin-primary-grid">
        {primaryMetrics.map((metric) => (
          <article key={metric.label} className={`admin-primary-card tone-${metric.tone}`}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.meta}</small>
          </article>
        ))}
      </div>

      <div className="admin-card-grid">
        <MetricCard label="今日活跃" value={stats.overview.todayActiveUsers} />
        <MetricCard label="历史记录" value={stats.overview.businessRecords} />
        <MetricCard label="已入账订单" value={stats.orders.paid} tone="good" />
        <MetricCard label="待入账订单" value={stats.orders.pending} tone="warn" />
        <MetricCard label="愿力余额池" value={stats.overview.totalWishPowerInWallets} />
        <MetricCard label="模拟入账" value={stats.audit.paymentTransactions} />
      </div>

      <div className="admin-two-column">
        <MetricGroupPanel title="测试档位统计" groups={stats.orders.packages} valueLabel="测试金额" />
        <RecentOrdersTable orders={stats.orders.recent.slice(0, 6)} />
      </div>
    </div>
  );
}

function AdminOrders({ stats }: { stats: AdminStats }) {
  return (
    <div className="admin-section-stack">
      <div className="admin-card-grid">
        <MetricCard label="累计订单" value={stats.orders.total} />
        <MetricCard label="已入账" value={stats.orders.paid} tone="good" />
        <MetricCard label="待入账" value={stats.orders.pending} tone="warn" />
        <MetricCard label="失败/关闭" value={stats.orders.failed} />
      </div>
      <div className="admin-two-column">
        <MetricGroupPanel title="测试档位表现" groups={stats.orders.packages} valueLabel="测试金额" />
        <RecentOrdersTable orders={stats.orders.recent} />
      </div>
    </div>
  );
}

function AdminUsers({ users }: { users: AdminRecentUser[] }) {
  return (
    <section className="admin-panel">
      <PanelTitle title="最近用户" subtitle="按注册时间倒序" />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>用户</th>
              <th>状态</th>
              <th>愿力余额</th>
              <th>已入账订单</th>
              <th>注册时间</th>
              <th>最近登录</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.phoneMasked}</td>
                <td>
                  <span className={`admin-status tone-${statusTone(user.status)}`}>
                    {statusLabel(user.status)}
                  </span>
                </td>
                <td>{formatNumber(user.wishPowerBalance)}</td>
                <td>{formatNumber(user.paidOrders)}</td>
                <td>{formatDateTime(user.createdAt)}</td>
                <td>{formatDateTime(user.lastLoginAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AdminProjects({ stats }: { stats: AdminStats }) {
  const drawGroup: AdminMetricGroup[] = [
    {
      key: "draw",
      label: "抽签",
      records: stats.projects.draws.records,
      participants: stats.projects.draws.participants,
      wishPowerSpent: stats.projects.draws.wishPowerSpent,
    },
  ];

  return (
    <div className="admin-two-column">
      <MetricGroupPanel title="祈愿项目" groups={stats.projects.wishes} />
      <MetricGroupPanel title="点灯项目" groups={stats.projects.lamps} />
      <MetricGroupPanel title="抽签项目" groups={drawGroup} />
      <MetricGroupPanel title="功能消费" groups={stats.projects.featureConsumptions} />
    </div>
  );
}

function AdminSecurity({ stats }: { stats: AdminStats }) {
  return (
    <div className="admin-card-grid">
      <MetricCard label="有效会话" value={stats.audit.activeSessions} />
      <MetricCard label="钱包流水" value={stats.audit.walletLedgerEntries} />
      <MetricCard label="模拟入账" value={stats.audit.paymentTransactions} />
      <MetricCard label="数据源" value={stats.audit.dataStore} />
    </div>
  );
}

function MetricCard({ label, value, tone = "neutral" }: { label: string; value: number | string; tone?: string }) {
  return (
    <article className={`admin-metric-card tone-${tone}`}>
      <span>{label}</span>
      <strong>{typeof value === "number" ? formatNumber(value) : value}</strong>
    </article>
  );
}

function PanelTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="admin-panel-title">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function MetricGroupPanel({
  title,
  groups,
  valueLabel = "愿力",
}: {
  title: string;
  groups: AdminMetricGroup[];
  valueLabel?: string;
}) {
  const maxRecords = Math.max(1, ...groups.map((item) => item.records));

  return (
    <section className="admin-panel">
      <PanelTitle title={title} subtitle="参与人数与记录数" />
      <div className="admin-rank-list">
        {groups.length === 0 ? (
          <p className="admin-empty">暂无记录</p>
        ) : (
          groups.map((item) => (
            <article key={item.key} className="admin-rank-item">
              <div>
                <strong>{item.label}</strong>
                <span>
                  {formatNumber(item.participants)} 人 · {formatNumber(item.records)} 次
                </span>
              </div>
              <div className="admin-rank-meter" aria-hidden="true">
                <span style={{ width: `${Math.max(8, (item.records / maxRecords) * 100)}%` }} />
              </div>
              <small>
                {valueLabel.includes("金额")
                  ? formatCurrency(item.revenueYuan ?? 0)
                  : `${formatNumber(item.wishPowerSpent)} ${valueLabel}`}
              </small>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function RecentOrdersTable({ orders }: { orders: AdminRecentOrder[] }) {
  return (
    <section className="admin-panel">
      <PanelTitle title="最近订单" subtitle="按创建时间倒序" />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>订单</th>
              <th>用户</th>
              <th>档位</th>
              <th>测试金额</th>
              <th>状态</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.orderNo}</td>
                <td>{order.phoneMasked}</td>
                <td>{order.packageName}</td>
                <td>{formatCurrency(order.priceYuan)}</td>
                <td>
                  <span className={`admin-status tone-${statusTone(order.status)}`}>
                    {statusLabel(order.status)}
                  </span>
                </td>
                <td>{formatDateTime(order.paidAt ?? order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
