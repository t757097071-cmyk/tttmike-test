import { useMemo, useRef, useState } from "react";
import type { FloatingMerit, WishType } from "../types";
import { getDateKey } from "../utils/date";
import { playWoodfishFallback } from "../utils/sound";

interface WoodenFishProps {
  todayMerit: number;
  totalBlessCount: number;
  streakDays: number;
  currentWishType: WishType;
  onBless: () => void;
}

const WOODFISH_AUDIO_SRC = "/src/assets/woodfish.mp3";

export function WoodenFish({
  todayMerit,
  totalBlessCount,
  streakDays,
  currentWishType,
  onBless,
}: WoodenFishProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [floatingMerits, setFloatingMerits] = useState<FloatingMerit[]>([]);
  const [isPressing, setIsPressing] = useState(false);
  const platformMerit = useMemo(() => getDailyPlatformMerit(), []);

  const audioElement = useMemo(() => {
    if (typeof Audio === "undefined") {
      return null;
    }

    const audio = new Audio(WOODFISH_AUDIO_SRC);
    audio.preload = "auto";
    audio.addEventListener("error", () => {
      console.info("木鱼音频缺失，将使用内置木鱼音。可把 woodfish.mp3 放到 src/assets/woodfish.mp3。");
    });
    audioRef.current = audio;
    return audio;
  }, []);

  const playSound = () => {
    if (!audioElement) {
      void playWoodfishFallback();
      return;
    }

    audioElement.currentTime = 0;
    audioElement.play().catch(() => {
      void playWoodfishFallback();
    });
  };

  const handleBless = () => {
    const id = crypto.randomUUID();
    setFloatingMerits((current) => [
      ...current,
      { id, x: Math.random() * 42 - 21, y: Math.random() * 16 },
    ]);
    setIsPressing(true);
    window.setTimeout(() => setIsPressing(false), 150);
    window.setTimeout(
      () => setFloatingMerits((current) => current.filter((item) => item.id !== id)),
      1000,
    );
    playSound();
    onBless();
  };

  return (
    <section className="wooden-fish-panel section-shell" id="wooden-fish">
      <div className="wooden-fish-copy">
        <span className="section-kicker">木鱼祈福</span>
        <h2>敲一声，心愿往前一步</h2>
        <p>{currentWishType.blessing}</p>
        <div className="fish-stats">
          <div>
            <span>今日功德</span>
            <strong>{todayMerit}</strong>
          </div>
          <div>
            <span>今日全站功德</span>
            <strong>{platformMerit.toLocaleString("zh-CN")}</strong>
          </div>
          <div>
            <span>连续祈福天数</span>
            <strong>{streakDays}</strong>
          </div>
          <div>
            <span>当前祈福类型</span>
            <strong>{currentWishType.title}</strong>
          </div>
        </div>
      </div>
      <div className="fish-stage">
        <div className="floating-layer" aria-hidden="true">
          {floatingMerits.map((item) => (
            <span
              className="floating-merit"
              key={item.id}
              style={{ transform: `translate(${item.x}px, ${item.y}px)` }}
            >
              功德 +1
            </span>
          ))}
        </div>
        <button
          type="button"
          className={`wooden-fish ${isPressing ? "is-pressing" : ""}`}
          onClick={handleBless}
          onTouchStart={() => setIsPressing(true)}
          onTouchEnd={() => setIsPressing(false)}
          aria-label="点击木鱼祈福"
        >
          <span className="fish-top" />
          <span className="fish-body">
            <span className="fish-eye" />
            <span className="fish-mark" />
          </span>
          <span className="fish-base" />
        </button>
        <span className="tap-hint">轻点木鱼 · 功德 +1</span>
      </div>
    </section>
  );
}

function getDailyPlatformMerit() {
  const seed = getDateKey()
    .split("")
    .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 1000003, 7);
  const baseline = 126800;
  const dailySwing = (seed * 7919) % 68000;
  return baseline + dailySwing;
}
