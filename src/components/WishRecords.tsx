import type { WishRecord, WishType } from "../types";
import { formatDateTime } from "../utils/date";

interface WishRecordsProps {
  records: WishRecord[];
  wishTypes: WishType[];
  onClear: () => void;
}

export function WishRecords({ records, wishTypes, onClear }: WishRecordsProps) {
  const handleClear = () => {
    if (window.confirm("确定要清空所有本地祈愿记录吗？此操作不可恢复。")) {
      onClear();
    }
  };

  return (
    <section className="records-section section-shell" id="records">
      <div className="records-heading">
        <div>
          <span className="section-kicker">本地保存</span>
          <h2>我的心愿笺记录</h2>
        </div>
        <button type="button" onClick={handleClear} disabled={records.length === 0}>
          清空记录
        </button>
      </div>
      {records.length > 0 ? (
        <div className="records-list">
          {records.map((record) => (
            <article className="record-card" key={record.id}>
              <span>{wishTypes.find((item) => item.id === record.type)?.title}</span>
              <h3>{record.content}</h3>
              <p>
                {record.nickname ? `${record.nickname} · ` : ""}
                {formatDateTime(record.createdAt)}
              </p>
              <small>
                {(record.cost ?? 66) === 0
                  ? "今日免费心愿笺"
                  : `心愿笺消耗：${record.cost ?? 66} 愿力`}
              </small>
            </article>
          ))}
        </div>
      ) : (
        <div className="section-card empty-records">暂无心愿笺记录，写下第一份郑重心愿吧。</div>
      )}
    </section>
  );
}
