import type { DirectionItem } from "../../types/huangli";

interface LuckyDirectionGridProps {
  items: DirectionItem[];
}

export function LuckyDirectionGrid({ items }: LuckyDirectionGridProps) {
  return (
    <section className="section-shell">
      <div className="section-heading">
        <span className="section-kicker">方位有序</span>
        <h2>今日吉位</h2>
      </div>
      <div className="direction-grid">
        {items.map((item) => (
          <article className="direction-card section-card" key={item.name}>
            <span>{item.name}</span>
            <strong>{item.direction}</strong>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
