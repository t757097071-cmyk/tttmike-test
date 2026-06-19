interface StatsPanelProps {
  totalBlessCount: number;
  wishRecordCount: number;
  streakDays: number;
}

export function StatsPanel({
  totalBlessCount,
  wishRecordCount,
  streakDays,
}: StatsPanelProps) {
  const simulatedDailyPeople = 328 + Math.min(totalBlessCount, 999);
  const simulatedTotalBless = 18642 + totalBlessCount;
  const simulatedWishes = 5219 + wishRecordCount;
  const simulatedBestStreak = Math.max(21, streakDays);

  return (
    <section className="stats-panel section-shell" aria-labelledby="stats-title">
      <div className="section-heading">
        <span className="section-kicker">祈福排行榜</span>
        <h2 id="stats-title">愿力正在汇聚</h2>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <span>今日祈福人数</span>
          <strong>{simulatedDailyPeople.toLocaleString()}</strong>
        </div>
        <div className="stat-card">
          <span>累计祈福次数</span>
          <strong>{simulatedTotalBless.toLocaleString()}</strong>
        </div>
        <div className="stat-card">
          <span>累计点亮心愿</span>
          <strong>{simulatedWishes.toLocaleString()}</strong>
        </div>
        <div className="stat-card">
          <span>最高连续祈福天数</span>
          <strong>{simulatedBestStreak}</strong>
        </div>
      </div>
    </section>
  );
}
