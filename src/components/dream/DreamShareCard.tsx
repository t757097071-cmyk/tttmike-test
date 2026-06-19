import type { DreamRecord } from "../../types/dream";

interface DreamShareCardProps {
  record: DreamRecord | null;
  onCopy: (text: string) => void;
}

export function DreamShareCard({ record, onCopy }: DreamShareCardProps) {
  const quote = record?.isQuoteUnlocked ? record.dreamQuote : "抽取梦境签文后，此处会亮起今日签语。";
  const shareText = record
    ? `我在锦愿阁解了一场梦：\n梦境主题：${record.theme}\n梦境签文：${quote}\n今日建议：${record.actionAdvice}`
    : "";

  return (
    <section className="dream-section">
      <div className="dream-section-heading">
        <span className="section-kicker">签文可寄</span>
        <h2>分享梦境签文</h2>
      </div>

      <div className="dream-share-layout">
        <article className="dream-share-preview">
          <span>锦愿阁</span>
          <h3>周公解梦</h3>
          <strong>{record?.theme ?? "待解一场梦"}</strong>
          <blockquote>{quote}</blockquote>
          <p>{record?.luckySuggestion ?? "写下梦境后，将生成今日提醒。"}</p>
          <div className="dream-qr">二维码占位</div>
        </article>
        <div className="dream-share-actions section-card">
          <p>
            生成一张古籍签页式分享卡，把梦境的提醒留给今天。梦境签文需先抽取后分享。
          </p>
          <button type="button" disabled={!record || !record.isQuoteUnlocked}>
            生成分享卡片
          </button>
          <button
            type="button"
            className="dream-secondary-button"
            disabled={!record || !record.isQuoteUnlocked}
            onClick={() => onCopy(shareText)}
          >
            复制文案
          </button>
        </div>
      </div>
    </section>
  );
}
