interface YiJiPanelProps {
  yi: string[];
  ji: string[];
}

const uniqueLimit = (items: string[], limit: number): string[] => Array.from(new Set(items)).slice(0, limit);

export function YiJiPanel({ yi, ji }: YiJiPanelProps) {
  return (
    <section className="section-shell">
      <div className="section-heading">
        <span className="section-kicker">趋吉避躁</span>
        <h2>今日宜忌</h2>
      </div>
      <div className="yiji-layout">
        <YiJiCard title="今日宜" items={uniqueLimit(yi, 10)} tone="good" />
        <YiJiCard title="今日忌" items={uniqueLimit(ji, 10)} tone="avoid" />
      </div>
    </section>
  );
}

interface YiJiCardProps {
  title: string;
  items: string[];
  tone: "good" | "avoid";
}

function YiJiCard({ title, items, tone }: YiJiCardProps) {
  return (
    <article className={`yiji-card section-card ${tone}`} key={`${title}-${items.join("-")}`}>
      <h3>{title}</h3>
      <div>
        {items.map((item, index) => (
          <span
            className="yiji-tag"
            style={{ animationDelay: `${index * 45}ms` }}
            key={`${item}-${index}`}
          >
            {item}
          </span>
        ))}
      </div>
    </article>
  );
}
