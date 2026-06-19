import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { EmptyState } from "../components/EmptyState";
import type { ApiUser } from "../api/commercial";
import type { BlessingState, WishType } from "../types";
import { formatDateTime } from "../utils/date";

interface ProfilePageProps {
  state: BlessingState;
  wishTypes: WishType[];
  user: ApiUser | null;
  isAuthenticated: boolean;
  onRequireLogin: () => void;
  onRefreshAccount: () => Promise<void>;
}

export function ProfilePage({
  state,
  wishTypes,
  user,
  isAuthenticated,
  onRequireLogin,
  onRefreshAccount,
}: ProfilePageProps) {
  const getWishTypeTitle = (typeId: string) =>
    wishTypes.find((item) => item.id === typeId)?.title ?? "祈愿";

  const isPremiumLampRecord = (record: { lampName: string; cost: number }) =>
    record.lampName === "长明心愿灯" || record.cost >= 388;

  if (!isAuthenticated) {
    return (
      <section className="page-shell profile-page">
        <div className="page-hero section-card">
          <span className="section-kicker">我的账户</span>
          <h1>请先登录</h1>
          <p>愿力余额、测试额度记录和体验权益会绑定到手机号账户。</p>
        </div>
        <section className="section-card account-gate">
          <span className="section-kicker">手机号账户</span>
          <h2>登录后查看个人数据</h2>
          <p>当前版本已把关键账户数据迁移到服务端，不再使用浏览器本地记录作为资金依据。</p>
          <button type="button" onClick={onRequireLogin}>
            手机号登录
          </button>
        </section>
      </section>
    );
  }

  return (
    <section className="page-shell profile-page">
      <div className="page-hero section-card">
        <span className="section-kicker">我的账户</span>
        <h1>我的锦愿阁</h1>
        <p>
          {user ? `当前账户：${user.phoneMasked}` : "账户已登录"}。余额、订单和体验权益以服务端数据为准。
        </p>
      </div>

      <div className="profile-grid">
        <article className="profile-panel section-card">
          <span className="section-kicker">我的愿力</span>
          <strong>{state.wishPowerBalance.toLocaleString()}</strong>
          <p>愿力存放在服务端钱包中，每次领取测试额度或消费都会生成钱包流水。</p>
          <Link to="/recharge" className="primary-link">
            领取愿力
          </Link>
        </article>

        <article className="profile-panel section-card">
          <span className="section-kicker">我的功德</span>
          <div className="profile-metrics">
            <div>
              <small>今日功德</small>
              <strong>{state.todayMerit}</strong>
            </div>
            <div>
              <small>总祈福次数</small>
              <strong>{state.totalBlessCount}</strong>
            </div>
            <div>
              <small>连续祈福天数</small>
              <strong>{state.streakDays}</strong>
            </div>
          </div>
        </article>
      </div>

      <ProfileList title="我的心愿笺记录">
        {state.wishRecords.slice(0, 10).length > 0 ? (
          <div className="records-list">
            {state.wishRecords.slice(0, 10).map((record) => (
              <article className="record-card" key={record.id}>
                <span>{getWishTypeTitle(record.type)}</span>
                <h3>{record.content}</h3>
                <p>{formatDateTime(record.createdAt)}</p>
                <small>
                  {(record.cost ?? 66) === 0
                    ? "今日免费心愿笺"
                    : `心愿笺消耗：${record.cost ?? 66} 愿力`}
                </small>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="暂无心愿记录。" />
        )}
      </ProfileList>

      <ProfileList title="我的点灯记录">
        {state.lampRecords.slice(0, 10).length > 0 ? (
          <div className="lamp-records-grid">
            {state.lampRecords.slice(0, 10).map((record) => (
              <article
                className={`lamp-record-card ${
                  isPremiumLampRecord(record) ? "is-premium-record" : ""
                }`}
                key={record.id}
              >
                {isPremiumLampRecord(record) && (
                  <strong className="premium-record-seal">尊享长明</strong>
                )}
                <div className="lamp-record-flame" aria-hidden="true" />
                <span>{record.lampName}</span>
                <h3>{record.wishContent}</h3>
                <p>
                  {record.nickname ? `${record.nickname} · ` : ""}
                  {formatDateTime(record.createdAt)}
                </p>
                <small>消耗愿力：{record.cost}</small>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="暂无点灯记录。" />
        )}
      </ProfileList>

      <ProfileList title="我的测试额度记录">
        {state.rechargeRecords.slice(0, 10).length > 0 ? (
          <div className="records-list">
            {state.rechargeRecords.slice(0, 10).map((record) => (
              <article className="record-card" key={record.id}>
                <span>{record.packageName}</span>
                <h3>测试档 ¥{record.price} · {record.wishPower} 愿力</h3>
                <p>{formatDateTime(record.createdAt)}</p>
                <small>状态：已到账</small>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="暂无测试额度记录。" />
        )}
      </ProfileList>

      <section className="section-card data-panel">
        <span className="section-kicker">数据管理</span>
        <h2>刷新服务端账户数据</h2>
        <p>从后端重新读取钱包余额和订单记录。正式后台可在这里扩展发票、退款和隐私数据导出。</p>
        <button type="button" onClick={() => void onRefreshAccount()}>
          刷新账户数据
        </button>
      </section>
    </section>
  );
}

interface ProfileListProps {
  title: string;
  children: ReactNode;
}

function ProfileList({ title, children }: ProfileListProps) {
  return (
    <section className="section-shell">
      <div className="section-heading">
        <span className="section-kicker">最近 10 条</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}
