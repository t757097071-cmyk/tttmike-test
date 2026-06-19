import type { TimeSlot } from "../../types/huangli";
import { getCurrentTimeSlotName } from "../../utils/huangliMock";

interface TimeSlotGridProps {
  items: TimeSlot[];
}

export function TimeSlotGrid({ items }: TimeSlotGridProps) {
  const currentName = getCurrentTimeSlotName();

  return (
    <section className="section-shell">
      <div className="section-heading">
        <span className="section-kicker">一日十二时</span>
        <h2>十二时辰</h2>
      </div>
      <div className="time-slot-grid">
        {items.map((item) => {
          const isCurrent = item.name === currentName;
          return (
            <article
              className={`time-slot-card section-card ${isCurrent ? "is-current" : ""}`}
              key={item.name}
            >
              {isCurrent && <b>当前时辰</b>}
              <span>{item.name}</span>
              <strong>{item.timeRange}</strong>
              <em>{item.status}</em>
              <p>{item.advice}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
