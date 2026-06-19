import type { DreamRecord } from "../../types/dream";
import { DreamKeywordTags } from "./DreamKeywordTags";
import { DreamUnlockPanel } from "./DreamUnlockPanel";

interface DreamResultCardProps {
  record: DreamRecord;
  wishPowerBalance: number;
  onUnlockDetail: () => void;
  onUnlockQuote: () => void;
}

export function DreamResultCard({
  record,
  wishPowerBalance,
  onUnlockDetail,
  onUnlockQuote,
}: DreamResultCardProps) {
  return (
    <section className="dream-section" id="dream-result">
      <div className="dream-section-heading">
        <span className="section-kicker">梦境解读</span>
        <h2>此梦所映</h2>
      </div>

      <article className="dream-result-card section-card">
        <div className="dream-result-head">
          <span>梦境主题</span>
          <h3>{record.theme}</h3>
          <DreamKeywordTags keywords={record.matchedKeywords} />
        </div>

        <div className="dream-result-grid">
          <section>
            <h4>简版解梦</h4>
            <p>{record.summary}</p>
          </section>
          <section>
            <h4>情绪提醒</h4>
            <p>{record.emotionHint}</p>
          </section>
          <section>
            <h4>今日行动建议</h4>
            <p>{record.actionAdvice}</p>
          </section>
        </div>

        <DreamUnlockPanel
          wishPowerBalance={wishPowerBalance}
          isDetailUnlocked={record.isDetailUnlocked}
          isQuoteUnlocked={record.isQuoteUnlocked}
          onUnlockDetail={onUnlockDetail}
          onUnlockQuote={onUnlockQuote}
        />

        {record.isQuoteUnlocked ? (
          <section className="dream-quote-slip">
            <span>梦境签文</span>
            <blockquote>{record.dreamQuote}</blockquote>
            <p>{record.quoteExplanation}</p>
            <strong>{record.luckySuggestion}</strong>
          </section>
        ) : (
          <section className="dream-locked-slip">
            梦境签文、签文解释与今日小建议尚未抽取。可用 18 愿力为此梦留下一句今日提醒。
          </section>
        )}

        {record.isDetailUnlocked ? (
          <section className="dream-detail-panel">
            <h4>详细解梦</h4>
            <div className="dream-result-grid dream-paid-grid">
              <section>
                <h4>梦境象征解析</h4>
                <p>{record.symbolAnalysis}</p>
              </section>
              <section>
                <h4>近期状态修正</h4>
                <p>{record.stateAdjustment}</p>
              </section>
              <section>
                <h4>学习或工作建议</h4>
                <p>{record.studyOrWorkAdvice}</p>
              </section>
              <section>
                <h4>关系提醒</h4>
                <p>{record.relationshipAdvice}</p>
              </section>
              <section>
                <h4>睡前安稳建议</h4>
                <p>{record.sleepAdvice}</p>
              </section>
            </div>
            <div className="dream-detail-list">
              {record.detailAnalysis.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </section>
        ) : (
          <section className="dream-locked-slip">
            深度解梦包含象征解析、近期状态修正、学业/事业建议、关系提醒、睡前安稳建议与完整段落，可用 38 愿力解锁。
          </section>
        )}
      </article>
    </section>
  );
}
