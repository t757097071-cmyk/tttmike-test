import LightRays from "../LightRays";

interface DreamHeroProps {
  onStart: () => void;
}

export function DreamHero({ onStart }: DreamHeroProps) {
  return (
    <section className="dream-hero section-card">
      <div className="dream-light-layer" aria-hidden="true">
        <LightRays
          raysOrigin="top-right"
          raysColor="#d8b66a"
          raysSpeed={0.42}
          lightSpread={1.55}
          rayLength={1.35}
          followMouse
          mouseInfluence={0.08}
          noiseAmount={0.055}
          distortion={0.04}
          pulsating
          fadeDistance={1.35}
          saturation={0.86}
          className="dream-light-rays"
        />
      </div>

      <div className="dream-hero-copy">
        <span className="section-kicker">锦愿阁 · 梦境札记</span>
        <h1>周公解梦</h1>
        <p>梦有所起，心有所映；写下梦境，照见今日心绪。</p>
        <div className="dream-audience-row" aria-label="适合人群">
          <span>睡醒还记得梦的人</span>
          <span>最近心事较重的人</span>
          <span>想借梦观心的人</span>
        </div>
        <button type="button" onClick={onStart}>
          解一场梦
        </button>
      </div>

      <div className="dream-visual" aria-hidden="true">
        <span className="dream-moon" />
        <span className="dream-orbit dream-orbit-a" />
        <span className="dream-orbit dream-orbit-b" />
        <span className="dream-cloud dream-cloud-a" />
        <span className="dream-cloud dream-cloud-b" />
        <span className="dream-incense dream-incense-a" />
        <span className="dream-incense dream-incense-b" />
        <div className="dream-paper">
          <i>梦</i>
          <strong>照见心绪</strong>
        </div>
        <div className="dream-symbol-card">
          <span>今夜梦象</span>
          <strong>借象观心</strong>
        </div>
      </div>
    </section>
  );
}
