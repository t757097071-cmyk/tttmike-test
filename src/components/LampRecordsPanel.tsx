import type { LampRecord } from "../types";
import { formatDateTime } from "../utils/date";

interface LampRecordsPanelProps {
  records: LampRecord[];
}

export function LampRecordsPanel({ records }: LampRecordsPanelProps) {
  const isPremiumRecord = (record: LampRecord) =>
    record.lampName === "长明心愿灯" || record.cost >= 388;

  return (
    <section className="lamp-records-section section-shell" id="lamp-records">
      <div className="section-heading">
        <div>
          <span className="section-kicker">长明灯册</span>
          <h2>我的心愿灯记录</h2>
        </div>
      </div>
      {records.length > 0 ? (
        <div className="lamp-records-grid">
          {records.slice(0, 6).map((record) => (
            <article
              className={`lamp-record-card ${
                isPremiumRecord(record) ? "is-premium-record" : ""
              }`}
              key={record.id}
            >
              {isPremiumRecord(record) && <strong className="premium-record-seal">尊享长明</strong>}
              <div className="lamp-record-flame" aria-hidden="true" />
              <span>{isPremiumRecord(record) ? "长明心愿灯 · 尊席留光" : record.lampName}</span>
              <h3>{record.wishContent}</h3>
              <p>
                {record.nickname ? `${record.nickname} · ` : ""}
                {formatDateTime(record.createdAt)}
              </p>
              {isPremiumRecord(record) && (
                <em>此愿入长明灯册，愿灯不息，所念有归。</em>
              )}
              <small>{isPremiumRecord(record) ? "长明尊享愿力" : "心灯愿力"} · {record.cost}</small>
            </article>
          ))}
        </div>
      ) : (
        <div className="section-card lamp-empty-state">
          <span>尚未点亮心愿灯</span>
          <p>高阶心灯会在此处留痕。每一盏灯都为一个更郑重的愿望而燃，愿你心中有定，脚下有路。</p>
        </div>
      )}
    </section>
  );
}
