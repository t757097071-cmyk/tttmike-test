interface JingxinHeroProps {
  mantra: string;
  onChangeMantra: () => void;
  onStart: () => void;
  onListen: () => void;
}

export function JingxinHero({
  mantra,
  onChangeMantra,
  onStart,
  onListen,
}: JingxinHeroProps) {
  return (
    <section className="jingxin-hero">
      <div className="jingxin-hero-copy">
        <span className="jingxin-eyebrow">锦愿阁 · 夜色雅室</span>
        <h1>静心阁</h1>
        <p>一呼一吸之间，把心安放回当下。</p>
        <div className="mind-note-card">
          <span>今日心语</span>
          <strong>{mantra}</strong>
        </div>
        <div className="jingxin-actions">
          <button type="button" onClick={onStart}>
            开始静心
          </button>
          <button type="button" className="jingxin-secondary" onClick={onListen}>
            听一段清音
          </button>
          <button type="button" className="jingxin-ghost" onClick={onChangeMantra}>
            换一句
          </button>
        </div>
      </div>
      <div className="moon-lamp-stage" aria-hidden="true">
        <div className="meditation-candle-scene">
          <div className="candle-aura" />
          <div className="candle-moon" />
          <div className="candle-window-lines" />
          <div className="candle-smoke smoke-one" />
          <div className="candle-smoke smoke-two" />
          <div className="candle-smoke smoke-three" />
          <div className="candle-wrap">
            <div className="flame-glow" />
            <div className="flame">
              <span className="flame-core" />
            </div>
            <div className="wick" />
            <div className="candle-body">
              <span className="wax-top" />
              <span className="wax-drip drip-one" />
              <span className="wax-drip drip-two" />
              <span className="wax-shine" />
            </div>
            <div className="candle-base">
              <span />
            </div>
          </div>
          <div className="ember ember-one" />
          <div className="ember ember-two" />
          <div className="ember ember-three" />
        </div>
      </div>
    </section>
  );
}
