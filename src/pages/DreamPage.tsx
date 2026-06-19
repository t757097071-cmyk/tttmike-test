import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DreamHero } from "../components/dream/DreamHero";
import { DreamInputForm } from "../components/dream/DreamInputForm";
import { DreamRecords } from "../components/dream/DreamRecords";
import { DreamResultCard } from "../components/dream/DreamResultCard";
import { DreamShareCard } from "../components/dream/DreamShareCard";
import type { DreamInput, DreamRecord } from "../types/dream";
import { generateDreamInterpretation } from "../utils/dreamInterpreter";
import {
  addDreamRecord,
  clearDreamRecords,
  getDreamRecords,
  updateDreamRecord,
} from "../utils/dreamStorage";
import { playWishPowerRitualSound } from "../utils/sound";

interface DreamPageProps {
  wishPowerBalance: number;
  onSpendWishPower: (cost: number) => number;
}

const DETAIL_COST = 38;
const QUOTE_COST = 18;

export function DreamPage({ wishPowerBalance, onSpendWishPower }: DreamPageProps) {
  const navigate = useNavigate();
  const [records, setRecords] = useState<DreamRecord[]>(() => getDreamRecords());
  const [currentRecord, setCurrentRecord] = useState<DreamRecord | null>(records[0] ?? null);
  const [toast, setToast] = useState("");
  const [isInsufficientOpen, setIsInsufficientOpen] = useState(false);
  const [ritualText, setRitualText] = useState("");

  useEffect(() => {
    if (!toast) {
      return undefined;
    }
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const refreshRecord = (record: DreamRecord) => {
    updateDreamRecord(record);
    setCurrentRecord(record);
    setRecords(getDreamRecords());
  };

  const handleInterpret = (input: DreamInput) => {
    const interpretation = generateDreamInterpretation(input);
    const record: DreamRecord = {
      id: crypto.randomUUID(),
      dreamText: input.dreamText,
      recentState: input.recentState,
      wakeMood: input.wakeMood,
      matchedKeywords: interpretation.matchedKeywords,
      theme: interpretation.theme,
      summary: interpretation.summary,
      symbolAnalysis: interpretation.symbolAnalysis,
      emotionHint: interpretation.emotionHint,
      stateAdjustment: interpretation.stateAdjustment,
      actionAdvice: interpretation.actionAdvice,
      studyOrWorkAdvice: interpretation.studyOrWorkAdvice,
      relationshipAdvice: interpretation.relationshipAdvice,
      sleepAdvice: interpretation.sleepAdvice,
      dreamQuote: interpretation.dreamQuote,
      quoteExplanation: interpretation.quoteExplanation,
      luckySuggestion: interpretation.luckySuggestion,
      detailAnalysis: interpretation.detailAnalysis,
      isDetailUnlocked: false,
      isQuoteUnlocked: false,
      createdAt: interpretation.createdAt,
    };

    addDreamRecord(record);
    setRecords(getDreamRecords());
    setCurrentRecord(record);
    setToast("梦境已成签，愿你醒后心安。");
    window.setTimeout(() => {
      document.getElementById("dream-result")?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const spendWithRitual = (cost: number, action: () => DreamRecord | null, label: string) => {
    if (!currentRecord) {
      return;
    }
    if (wishPowerBalance < cost) {
      setIsInsufficientOpen(true);
      return;
    }

    setRitualText(label);
    void playWishPowerRitualSound();
    window.setTimeout(() => {
      onSpendWishPower(cost);
      const nextRecord = action();
      if (nextRecord) {
        refreshRecord(nextRecord);
      }
      setRitualText("");
    }, 820);
  };

  const handleUnlockDetail = () => {
    if (!currentRecord || currentRecord.isDetailUnlocked) {
      return;
    }
    spendWithRitual(
      DETAIL_COST,
      () => {
        if (!currentRecord) {
          return null;
        }
        setToast(`已消耗 ${DETAIL_COST} 愿力，详细解梦已展开。`);
        return { ...currentRecord, isDetailUnlocked: true };
      },
      "愿力入梦，签页将开",
    );
  };

  const handleUnlockQuote = () => {
    if (!currentRecord || currentRecord.isQuoteUnlocked) {
      return;
    }
    spendWithRitual(
      QUOTE_COST,
      () => {
        if (!currentRecord) {
          return null;
        }
        setToast(`已消耗 ${QUOTE_COST} 愿力，梦境签文已抽取。`);
        return { ...currentRecord, isQuoteUnlocked: true };
      },
      "朱砂落印，签文将显",
    );
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast("朱砂印已落，分享文案已复制。");
    } catch {
      setToast("复制未成功，请稍后再试。");
    }
  };

  const handleViewRecord = (record: DreamRecord) => {
    setCurrentRecord(record);
    window.setTimeout(() => {
      document.getElementById("dream-result")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleClear = () => {
    if (window.confirm("确认清空所有梦境记录吗？此操作无法恢复。")) {
      clearDreamRecords();
      setRecords([]);
      setCurrentRecord(null);
      setToast("梦境记录已清空。");
    }
  };

  return (
    <div className="dream-page page-shell">
      <DreamHero
        onStart={() => document.getElementById("dream-form")?.scrollIntoView({ behavior: "smooth" })}
      />
      <DreamInputForm onSubmit={handleInterpret} />
      {currentRecord && (
        <DreamResultCard
          record={currentRecord}
          wishPowerBalance={wishPowerBalance}
          onUnlockDetail={handleUnlockDetail}
          onUnlockQuote={handleUnlockQuote}
        />
      )}
      <DreamShareCard record={currentRecord} onCopy={handleCopy} />
      <DreamRecords records={records} onView={handleViewRecord} onClear={handleClear} />

      <p className="dream-compliance">
        周公解梦内容仅作传统文化体验、情绪陪伴与自我反思参考，不承诺现实结果，不替代医学、心理咨询、法律、投资、升学等专业建议。如长期存在明显失眠、焦虑或噩梦困扰，请及时寻求专业帮助。
      </p>

      {isInsufficientOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="dream-power-title">
            <span className="section-kicker">愿力不足</span>
            <h2 id="dream-power-title">愿力不足</h2>
            <p>当前愿力不足，可前往领取测试额度后继续解读。未使用愿力会保留，可继续累积使用。</p>
            <div className="modal-actions">
              <button type="button" onClick={() => navigate("/recharge")}>
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

      {ritualText && (
        <div className="dream-ritual-layer" aria-live="polite">
          <div>
            <span />
            <strong>{ritualText}</strong>
          </div>
        </div>
      )}

      {toast && <div className="dream-toast">{toast}</div>}
    </div>
  );
}
