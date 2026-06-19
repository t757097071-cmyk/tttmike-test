import type { JingxinGuide } from "../../types/jingxin";

interface JingxinGuideCardProps {
  guide: JingxinGuide;
  onUse: (guide: JingxinGuide) => void;
}

export function JingxinGuideCard({ guide, onUse }: JingxinGuideCardProps) {
  return (
    <article className="jingxin-guide-card">
      <span className="guide-seal">{guide.difficulty}</span>
      <h3>{guide.title}</h3>
      <dl>
        <div>
          <dt>适合状态</dt>
          <dd>{guide.suitableState}</dd>
        </div>
        <div>
          <dt>建议时长</dt>
          <dd>{guide.durationMinutes} 分钟</dd>
        </div>
      </dl>
      <ol>
        {guide.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <button type="button" onClick={() => onUse(guide)}>
        依此静心
      </button>
    </article>
  );
}
