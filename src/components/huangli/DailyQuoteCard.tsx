import { useState } from "react";
import type { HuangliQuote } from "../../types/huangli";

interface DailyQuoteCardProps {
  quotes: HuangliQuote[];
  initialQuote: HuangliQuote;
  onToast: (message: string) => void;
}

export function DailyQuoteCard({ quotes, initialQuote, onToast }: DailyQuoteCardProps) {
  const [quoteIndex, setQuoteIndex] = useState(() =>
    Math.max(0, quotes.findIndex((item) => item.text === initialQuote.text)),
  );
  const quote = quotes[quoteIndex] ?? initialQuote;

  const changeQuote = () => {
    setQuoteIndex((current) => (current + 1) % quotes.length);
  };

  const copyQuote = async () => {
    await navigator.clipboard.writeText(`${quote.text}\n${quote.explanation}`);
    onToast("签语已复制");
  };

  const shareQuote = async () => {
    await navigator.clipboard.writeText(`锦愿阁今日签语：${quote.text}`);
    onToast("分享文案已复制");
  };

  return (
    <section className="huangli-quote-card section-card">
      <span className="section-kicker">今日签语</span>
      <h2 key={quote.text}>{quote.text}</h2>
      <p>{quote.explanation}</p>
      <div className="quote-actions">
        <button type="button" onClick={changeQuote}>
          换一句
        </button>
        <button type="button" className="secondary-button" onClick={copyQuote}>
          复制签语
        </button>
        <button type="button" className="secondary-button" onClick={shareQuote}>
          分享今日签语
        </button>
      </div>
    </section>
  );
}
