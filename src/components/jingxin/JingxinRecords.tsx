import type { JingxinRecord } from "../../types/jingxin";
import { formatDateTime } from "../../utils/date";

interface JingxinRecordsProps {
  records: JingxinRecord[];
  onClear: () => void;
}

export function JingxinRecords({ records, onClear }: JingxinRecordsProps) {
  return (
    <section className="jingxin-section">
      <div className="jingxin-section-heading records-heading">
        <div>
          <span>静心记录</span>
          <h2>十段最近安住时光</h2>
        </div>
        <button type="button" disabled={records.length === 0} onClick={onClear}>
          清空静心记录
        </button>
      </div>
      {records.length === 0 ? (
        <div className="jingxin-empty">还没有静心记录，给自己一点时间，先静下来。</div>
      ) : (
        <div className="jingxin-record-grid">
          {records.slice(0, 10).map((record) => (
            <article className="jingxin-record-card" key={record.id}>
              <span>{record.checkedIn ? "已打卡" : "未打卡"}</span>
              <h3>{record.guideTitle}</h3>
              <p>{record.durationMinutes} 分钟</p>
              <small>{formatDateTime(record.completedAt)}</small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
