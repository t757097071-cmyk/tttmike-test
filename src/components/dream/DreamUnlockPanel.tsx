interface DreamUnlockPanelProps {
  wishPowerBalance: number;
  isDetailUnlocked: boolean;
  isQuoteUnlocked: boolean;
  onUnlockDetail: () => void;
  onUnlockQuote: () => void;
}

export function DreamUnlockPanel({
  wishPowerBalance,
  isDetailUnlocked,
  isQuoteUnlocked,
  onUnlockDetail,
  onUnlockQuote,
}: DreamUnlockPanelProps) {
  return (
    <div className="dream-unlock-panel">
      <div>
        <span>当前愿力</span>
        <strong>{wishPowerBalance}</strong>
      </div>
      <article>
        <h4>深度解梦</h4>
        <p>展开象征解析、近期状态修正、学业事业建议、关系提醒与睡前安稳建议。</p>
        <button type="button" onClick={onUnlockDetail} disabled={isDetailUnlocked}>
          {isDetailUnlocked ? "已解锁" : "解锁详细解梦 · 38 愿力"}
        </button>
      </article>
      <article>
        <h4>梦境签文</h4>
        <p>抽取签文、解签说明与今日小建议，把梦境提醒落成一句可带走的话。</p>
        <button type="button" onClick={onUnlockQuote} disabled={isQuoteUnlocked}>
          {isQuoteUnlocked ? "已抽取" : "抽取梦境签文 · 18 愿力"}
        </button>
      </article>
    </div>
  );
}
