import { Link } from "react-router-dom";
import type { FourAdviceItem } from "../../types/huangli";

interface FourAdviceCardsProps {
  items: FourAdviceItem[];
}

export function FourAdviceCards({ items }: FourAdviceCardsProps) {
  return (
    <section className="section-shell">
      <div className="section-heading">
        <span className="section-kicker">四象参看</span>
        <h2>今日四象建议</h2>
      </div>
      <div className="four-advice-grid">
        {items.map((item) => (
          <article className="four-advice-card section-card" key={item.type}>
            <span>{item.title}</span>
            <strong>
              {"★".repeat(item.stars)}
              {"☆".repeat(5 - item.stars)}
            </strong>
            <p>{item.suggestion}</p>
            <small>宜：{item.suitable}</small>
            <small>避：{item.avoid}</small>
            <Link to={`/lamps?type=${item.type}`}>{item.buttonText}</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
