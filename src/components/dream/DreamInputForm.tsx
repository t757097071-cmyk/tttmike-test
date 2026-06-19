import { useState } from "react";
import type { FormEvent } from "react";
import type { DreamInput, DreamRecentState, DreamWakeMood } from "../../types/dream";

const recentStateOptions: DreamRecentState[] = [
  "学习压力",
  "工作压力",
  "情绪焦虑",
  "睡眠不稳",
  "人际关系",
  "家人牵挂",
  "财务担忧",
  "没有明显压力",
];

const wakeMoodOptions: DreamWakeMood[] = [
  "害怕",
  "迷茫",
  "轻松",
  "难过",
  "紧张",
  "平静",
  "惊喜",
  "说不清",
];

interface DreamInputFormProps {
  onSubmit: (input: DreamInput) => void;
}

export function DreamInputForm({ onSubmit }: DreamInputFormProps) {
  const [dreamText, setDreamText] = useState("");
  const [recentState, setRecentState] = useState<DreamRecentState>("学习压力");
  const [wakeMood, setWakeMood] = useState<DreamWakeMood>("迷茫");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = dreamText.trim();

    if (!trimmed) {
      setError("请先写下梦境内容。");
      return;
    }

    if (trimmed.length < 5) {
      setError("请稍微多写一点梦境细节，这样解读会更完整。");
      return;
    }

    setError("");
    onSubmit({ dreamText: trimmed, recentState, wakeMood });
  };

  return (
    <section className="dream-section dream-form-section" id="dream-form">
      <div className="dream-section-heading">
        <span className="section-kicker">入梦留痕</span>
        <h2>写下梦境</h2>
      </div>

      <form className="dream-form section-card" onSubmit={handleSubmit}>
        <label>
          梦境内容
          <textarea
            value={dreamText}
            maxLength={300}
            onChange={(event) => setDreamText(event.target.value)}
            placeholder="例如：昨晚梦到自己在考试，题目很多却写不完，旁边还有很大的水声。"
          />
          <span className="field-count">{dreamText.length}/300</span>
        </label>

        <div className="dream-form-row">
          <label>
            最近状态
            <select
              value={recentState}
              onChange={(event) => setRecentState(event.target.value as DreamRecentState)}
            >
              {recentStateOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            梦醒感受
            <select
              value={wakeMood}
              onChange={(event) => setWakeMood(event.target.value as DreamWakeMood)}
            >
              {wakeMoodOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button type="submit">开始解梦</button>
        {error && <p className="dream-form-error">{error}</p>}
      </form>
    </section>
  );
}
