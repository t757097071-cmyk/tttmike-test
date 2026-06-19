import type { JingxinStats } from "../../types/jingxin";
import { formatDateTime } from "../../utils/date";

interface JingxinStatsPanelProps {
  stats: JingxinStats;
}

export function JingxinStatsPanel({ stats }: JingxinStatsPanelProps) {
  const lastTime = stats.lastJingxinAt ? formatDateTime(stats.lastJingxinAt) : "暂无记录";

  return (
    <section className="jingxin-section">
      <div className="jingxin-section-heading">
        <span>今日静心数据</span>
        <h2>心有留痕，日有微光</h2>
      </div>
      <div className="jingxin-stats-grid">
        <article>
          <span>今日静心次数</span>
          <strong>{stats.todaySessions}</strong>
        </article>
        <article>
          <span>累计静心分钟</span>
          <strong>{stats.totalMinutes}</strong>
        </article>
        <article>
          <span>累计静心次数</span>
          <strong>{stats.totalSessions}</strong>
        </article>
        <article>
          <span>连续静心天数</span>
          <strong>{stats.streakDays}</strong>
        </article>
        <article className="jingxin-last-card">
          <span>最近一次静心时间</span>
          <strong>{lastTime}</strong>
          {!stats.lastJingxinAt && (
            <p>今日还未静心，给自己 5 分钟，把心安下来。</p>
          )}
        </article>
      </div>
    </section>
  );
}
