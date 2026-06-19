interface DailyQuoteProps {
  quote: string;
}

export function DailyQuote({ quote }: DailyQuoteProps) {
  return (
    <section className="daily-quote section-card" aria-labelledby="daily-quote-title">
      <span className="section-kicker">今日签文</span>
      <h2 id="daily-quote-title">{quote}</h2>
    </section>
  );
}
