import type { DreamRecord } from "../../types/dream";
import { DreamKeywordTags } from "./DreamKeywordTags";

interface DreamRecordsProps {
  records: DreamRecord[];
  onView: (record: DreamRecord) => void;
  onClear: () => void;
}

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export function DreamRecords({ records, onView, onClear }: DreamRecordsProps) {
  return (
    <section className="dream-section">
      <div className="dream-section-heading dream-record-heading">
        <div>
          <span className="section-kicker">梦境留册</span>
          <h2>梦境记录</h2>
        </div>
        {records.length > 0 && (
          <button type="button" className="dream-secondary-button" onClick={onClear}>
            清空梦境记录
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <div className="dream-empty section-card">
          暂无梦境记录。写下一段梦，给今日心绪留一盏灯。
        </div>
      ) : (
        <div className="dream-record-grid">
          {records.slice(0, 10).map((record) => (
            <article className="dream-record-card" key={record.id}>
              <span>{formatDateTime(record.createdAt)}</span>
              <h3>{record.theme}</h3>
              <p>{record.summary.slice(0, 76)}...</p>
              <DreamKeywordTags keywords={record.matchedKeywords} />
              <button type="button" onClick={() => onView(record)}>
                查看详情
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
