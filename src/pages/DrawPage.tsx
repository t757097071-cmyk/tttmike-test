import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dailyQuotes } from "../data/wishTypes";
import { getDateKey } from "../utils/date";
import { playDrawRevealSound, playDrawShakeSound, playWishPowerRitualSound } from "../utils/sound";

const DRAW_KEY = "jinyuan-ge-draw-lot";
const DRAW_COST = 66;
const DRAW_DELAY_MS = 2300;

interface DrawResult {
  date: string;
  quote: string;
  level: string;
  advice: string;
}

const levels = ["上上签", "上吉签", "安和签", "渐明签", "清定签", "守成签"];
const advices = [
  "今日宜收心定念，把眼前一件事做透。",
  "先稳住节奏，再谈远行；慢处自有回响。",
  "有疑处不急判，有难处不退步。",
  "愿你把焦虑放轻，把行动放实。",
  "凡事缓一步，心定之后再落笔。",
  "所求不必急问结果，先把今日一步走稳。",
  "眼前事若清，远处路自明。",
  "少一些反复自责，多一些踏实开始。",
];

const hashDate = (date: string): number =>
  date.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

const createDrawResult = (seed: number): DrawResult => ({
  date: getDateKey(),
  quote: dailyQuotes[seed % dailyQuotes.length] ?? dailyQuotes[0],
  level: levels[(seed * 3 + 2) % levels.length] ?? levels[0],
  advice: advices[(seed * 5 + 4) % advices.length] ?? advices[0],
});

const createRandomDrawResult = (): DrawResult => {
  const randomSeed =
    crypto.getRandomValues(new Uint32Array(1))[0] + Date.now() + hashDate(getDateKey());
  return createDrawResult(randomSeed);
};

const drawTodayLot = (): DrawResult => {
  const today = getDateKey();

  try {
    const raw = window.localStorage.getItem(DRAW_KEY);
    const stored = raw ? (JSON.parse(raw) as Partial<DrawResult>) : undefined;
    if (
      stored?.date === today &&
      typeof stored.quote === "string" &&
      typeof stored.level === "string" &&
      typeof stored.advice === "string"
    ) {
      return stored as DrawResult;
    }
  } catch {
    // Ignore broken local cache and draw a fresh lot.
  }

  const result = createDrawResult(hashDate(today));
  window.localStorage.setItem(DRAW_KEY, JSON.stringify(result));
  return result;
};

interface DrawPageProps {
  wishPowerBalance: number;
  hasDailyFreeDraw: boolean;
  onDrawLot: (cost: number) => number;
}

export function DrawPage({
  wishPowerBalance,
  hasDailyFreeDraw,
  onDrawLot,
}: DrawPageProps) {
  const navigate = useNavigate();
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<DrawResult>(() => drawTodayLot());
  const [message, setMessage] = useState("");
  const [isInsufficientOpen, setIsInsufficientOpen] = useState(false);
  const initialResult = useMemo(drawTodayLot, []);
  const timeoutRef = useRef<number | null>(null);

  const drawCost = hasDailyFreeDraw ? 0 : DRAW_COST;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleDraw = () => {
    if (isDrawing) {
      return;
    }

    if (drawCost > 0 && wishPowerBalance < drawCost) {
      setIsInsufficientOpen(true);
      return;
    }

    setIsDrawing(true);
    setIsRevealed(false);
    setMessage(drawCost === 0 ? "静心摇签中，请稍候片刻。" : "愿力入签筒，签意正在成形。");
    void playDrawShakeSound();
    if (drawCost > 0) {
      void playWishPowerRitualSound();
    }

    timeoutRef.current = window.setTimeout(() => {
      const nextResult = hasDailyFreeDraw ? initialResult : createRandomDrawResult();
      const nextBalance = onDrawLot(drawCost);
      window.localStorage.setItem(DRAW_KEY, JSON.stringify(nextResult));
      setResult(nextResult);
      setIsRevealed(true);
      setIsDrawing(false);
      void playDrawRevealSound();
      setMessage(
        drawCost === 0
          ? `今日首次抽签免费，当前愿力仍为 ${nextBalance}。`
          : `已加抽一签，本次消耗 ${drawCost} 愿力，当前剩余 ${nextBalance} 愿力。`,
      );
    }, DRAW_DELAY_MS);
  };

  const goRecharge = () => {
    setIsInsufficientOpen(false);
    navigate("/recharge");
  };

  return (
    <section className="page-shell draw-page">
      <div className="page-hero section-card">
        <span className="section-kicker">锦愿签筒</span>
        <h1>抽签</h1>
        <p>每日一签，取其提醒，不问吉凶。愿你心中有数，脚下有路。</p>
      </div>

      <div className={`draw-stage section-card ${isDrawing ? "is-drawing" : ""}`}>
        <div className="draw-ritual-stage" aria-hidden="true">
          <div className="draw-tube">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className={`draw-stick ${isRevealed ? "is-revealed" : ""}`}>
            <span>{isRevealed ? result.level : isDrawing ? "摇签" : "签"}</span>
          </div>
        </div>
        <div className="draw-copy">
          <span className="section-kicker">今日签意</span>
          <h2>{isRevealed ? result.quote : isDrawing ? "签筒轻摇，片刻后得今日一签" : "静心片刻，抽取今日一签"}</h2>
          <p>
            {isRevealed
              ? result.advice
              : "签文是片刻提醒，不是现实承诺；真正的答案，仍在你的行动里。"}
          </p>
          <div className="draw-cost-note">
            <strong>{hasDailyFreeDraw ? "今日首次免费" : "加抽一签 · 66 愿力"}</strong>
            <span>
              当前愿力 {wishPowerBalance}。每日第一签免费，之后加抽每签消耗 66 愿力。
            </span>
          </div>
          <button type="button" disabled={isDrawing} onClick={handleDraw}>
            {isDrawing ? "摇签中..." : hasDailyFreeDraw ? "抽取今日签" : "加抽一签"}
          </button>
          {message && <p className="form-message">{message}</p>}
        </div>
      </div>

      <p className="compliance-note">
        抽签仅作传统文化体验与情绪陪伴使用，不承诺现实结果，不替代医疗、法律、投资、升学等专业建议。
      </p>

      {isInsufficientOpen && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="draw-power-title"
          >
            <span className="section-kicker">愿力不足</span>
            <h2 id="draw-power-title">愿力不足</h2>
            <p>
              当前愿力不足以加抽一签，可前往领取测试额度后继续抽签。账户中已有愿力会保留，可继续累积使用。
            </p>
            <div className="modal-actions">
              <button type="button" onClick={goRecharge}>
                领取愿力
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setIsInsufficientOpen(false)}
              >
                稍后再说
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
