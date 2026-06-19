import { Link } from "react-router-dom";
import type { PrayerAdvice } from "../../types/huangli";

interface PrayerAdvicePanelProps {
  advice: PrayerAdvice;
}

const lampTypeMap: Record<PrayerAdvice["type"], string> = {
  学业祈福: "study",
  事业祈福: "career",
  健康祈福: "health",
  平安祈福: "peace",
};

export function PrayerAdvicePanel({ advice }: PrayerAdvicePanelProps) {
  return (
    <section className="prayer-advice-panel section-card">
      <span className="section-kicker">今日祈福建议</span>
      <h2>今日推荐：{advice.type}</h2>
      <p>{advice.reason}</p>
      <div>
        <span>建议点亮</span>
        <strong>{advice.lampName}</strong>
        <small>消耗：{advice.cost} 愿力</small>
      </div>
      <Link to={`/lamps?type=${lampTypeMap[advice.type]}`}>去点灯</Link>
    </section>
  );
}
