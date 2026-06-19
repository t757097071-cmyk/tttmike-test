interface JingxinShareCardProps {
  todayMinutes: number;
  streakDays: number;
  mantra: string;
  onCopy: (text: string) => void;
}

export function JingxinShareCard({
  todayMinutes,
  streakDays,
  mantra,
  onCopy,
}: JingxinShareCardProps) {
  const shareText = `我在锦愿阁静心阁安静了 ${todayMinutes} 分钟。\n${mantra}\n愿你今日也有一刻清明。`;

  return (
    <section className="jingxin-section">
      <div className="jingxin-section-heading">
        <span>分享今日心境</span>
        <h2>把一刻清明，轻轻递出去</h2>
      </div>
      <div className="jingxin-share-layout">
        <article className="jingxin-share-preview">
          <span>锦愿阁</span>
          <h3>静心阁</h3>
          <strong>今日静心 {todayMinutes} 分钟</strong>
          <p>连续静心 {streakDays} 天</p>
          <blockquote>{mantra}</blockquote>
          <div className="qr-placeholder">二维码</div>
        </article>
        <div className="share-copy-panel">
          <p>{shareText}</p>
          <div>
            <button type="button">生成分享卡片</button>
            <button type="button" className="jingxin-secondary" onClick={() => onCopy(shareText)}>
              复制文案
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
