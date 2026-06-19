import { useState } from "react";
import type { StudyAdvice, StudyPlanRecord } from "../../types/huangli";
import { addStudyPlanRecord } from "../../utils/huangliStorage";
import { generateStudyPlan } from "../../utils/huangliMock";

interface StudyAdvicePanelProps {
  date: string;
  advice: StudyAdvice;
  onToast: (message: string) => void;
}

export function StudyAdvicePanel({ date, advice, onToast }: StudyAdvicePanelProps) {
  const [planItems, setPlanItems] = useState<string[]>([]);

  const generatePlan = () => {
    const items = generateStudyPlan(date);
    const record: StudyPlanRecord = {
      id: crypto.randomUUID(),
      date,
      planItems: items,
      createdAt: new Date().toISOString(),
    };
    addStudyPlanRecord(record);
    setPlanItems(items);
  };

  const copyPlan = async () => {
    if (planItems.length === 0) {
      return;
    }
    await navigator.clipboard.writeText(`锦愿阁今日学习计划（${date}）：\n${planItems.join("\n")}`);
    onToast("学习计划已复制");
  };

  return (
    <section className="study-panel section-card">
      <div>
        <span className="section-kicker">学业日课</span>
        <h2>今日学业提醒</h2>
      </div>
      <div className="study-advice-grid">
        <div>
          <span>今日学习关键词</span>
          <strong>{advice.keyword}</strong>
        </div>
        <div>
          <span>今日适合科目</span>
          <strong>{advice.subjects.join("、")}</strong>
        </div>
        <div>
          <span>今日适合任务</span>
          <strong>{advice.tasks.join("、")}</strong>
        </div>
        <div>
          <span>今日避坑提醒</span>
          <strong>{advice.warning}</strong>
        </div>
        <div>
          <span>今日行动建议</span>
          <strong>{advice.action}</strong>
        </div>
      </div>
      <div className="study-actions">
        <button type="button" onClick={generatePlan}>
          生成今日学习计划
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={copyPlan}
          disabled={planItems.length === 0}
        >
          复制学习计划
        </button>
      </div>
      {planItems.length > 0 && (
        <div className="study-plan-list">
          {planItems.map((item, index) => (
            <p style={{ animationDelay: `${index * 70}ms` }} key={item}>
              {item}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
