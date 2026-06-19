interface UserStatsCardProps {
  wishPowerBalance: number;
  totalBlessCount: number;
  todayMerit: number;
  streakDays: number;
}

export function UserStatsCard({
  wishPowerBalance,
  totalBlessCount,
  todayMerit,
  streakDays,
}: UserStatsCardProps) {
  const stats = [
    { label: "当前愿力余额", value: wishPowerBalance },
    { label: "累计祈福次数", value: totalBlessCount },
    { label: "今日功德", value: todayMerit },
    { label: "连续祈福天数", value: streakDays },
  ];

  return (
    <div className="user-stats-grid">
      {stats.map((item) => (
        <article className="stat-card" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value.toLocaleString()}</strong>
        </article>
      ))}
    </div>
  );
}
