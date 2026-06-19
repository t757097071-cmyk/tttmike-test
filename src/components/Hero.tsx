import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

interface FloatingLantern {
  id: number;
  x: string;
  y: string;
  size: string;
  delay: string;
  duration: string;
  drift: string;
  opacity: string;
}

type LanternStyle = CSSProperties & {
  "--x": string;
  "--y": string;
  "--scale-start": string;
  "--scale-mid": string;
  "--scale-far": string;
  "--scale-end": string;
  "--delay": string;
  "--duration": string;
  "--drift": string;
  "--opacity-start": string;
  "--opacity-mid": string;
  "--opacity-far": string;
};

const floatingLanterns: FloatingLantern[] = [
  { id: 1, x: "6%", y: "86%", size: "0.58", delay: "-4s", duration: "24s", drift: "24px", opacity: "0.28" },
  { id: 2, x: "16%", y: "72%", size: "0.42", delay: "-12s", duration: "28s", drift: "-18px", opacity: "0.2" },
  { id: 3, x: "28%", y: "92%", size: "0.72", delay: "-7s", duration: "30s", drift: "32px", opacity: "0.24" },
  { id: 4, x: "41%", y: "76%", size: "0.36", delay: "-18s", duration: "26s", drift: "-22px", opacity: "0.18" },
  { id: 5, x: "55%", y: "88%", size: "0.52", delay: "-10s", duration: "32s", drift: "20px", opacity: "0.22" },
  { id: 6, x: "68%", y: "70%", size: "0.45", delay: "-2s", duration: "25s", drift: "-26px", opacity: "0.2" },
  { id: 7, x: "78%", y: "94%", size: "0.66", delay: "-15s", duration: "34s", drift: "30px", opacity: "0.25" },
  { id: 8, x: "90%", y: "80%", size: "0.5", delay: "-20s", duration: "29s", drift: "-20px", opacity: "0.22" },
  { id: 9, x: "12%", y: "108%", size: "0.34", delay: "-1s", duration: "22s", drift: "16px", opacity: "0.18" },
  { id: 10, x: "84%", y: "112%", size: "0.38", delay: "-8s", duration: "27s", drift: "-16px", opacity: "0.18" },
];

export function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let frameId = 0;

    const updateScrollLift = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const hero = heroRef.current;
        if (!hero) {
          return;
        }

        const rect = hero.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height * 0.82, 1)));
        hero.style.setProperty("--scroll-lift", `${progress * -150}px`);
        hero.style.setProperty("--scroll-haze", `${0.18 + progress * 0.24}`);
      });
    };

    updateScrollLift();
    window.addEventListener("scroll", updateScrollLift, { passive: true });
    window.addEventListener("resize", updateScrollLift);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", updateScrollLift);
      window.removeEventListener("resize", updateScrollLift);
    };
  }, []);

  return (
    <section className="hero section-shell" id="home" ref={heroRef}>
      <div className="hero-ambient" aria-hidden="true">
        <div className="mist mist-left" />
        <div className="mist mist-right" />
        {floatingLanterns.map((lantern) => {
          const size = Number(lantern.size);
          const opacity = Number(lantern.opacity);

          return (
            <span
              className="sky-lantern"
              key={lantern.id}
              style={
                {
                  "--x": lantern.x,
                  "--y": lantern.y,
                  "--scale-start": `${size * 1.18}`,
                  "--scale-mid": `${size * 0.9}`,
                  "--scale-far": `${size * 0.62}`,
                  "--scale-end": `${size * 0.38}`,
                  "--delay": lantern.delay,
                  "--duration": lantern.duration,
                  "--drift": lantern.drift,
                  "--opacity-start": `${opacity + 0.2}`,
                  "--opacity-mid": `${opacity + 0.12}`,
                  "--opacity-far": `${opacity * 0.78}`,
                } as LanternStyle
              }
            >
              <span className="sky-lantern-core" />
            </span>
          );
        })}
      </div>
      <div className="hero-copy">
        <span className="eyebrow">锦愿阁 · 静心祈愿</span>
        <h1>一愿诸事顺遂，二愿心境明朗</h1>
        <p>愿学有所成，业有所进，身有所安，行有所护。点一声木鱼，许一盏心愿，把努力交给今天，把答案留给时间。</p>
        <div className="hero-actions">
          <a href="#wooden-fish" className="primary-link">
            开始祈福
          </a>
          <a href="#wish-form" className="ghost-link">
            写下心愿
          </a>
        </div>
      </div>
      <div className="hero-visual" aria-hidden="true">
        <div className="moon-gate">
          <div className="cloud cloud-left" />
          <div className="cloud cloud-right" />
          <div className="lantern-string" />
          <div className="lantern">
            <div className="lantern-cap" />
            <div className="lantern-body">
              <span>愿</span>
              <i />
            </div>
            <div className="lantern-tail" />
          </div>
        </div>
      </div>
    </section>
  );
}
