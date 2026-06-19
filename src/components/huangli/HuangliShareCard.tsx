import { useState } from "react";
import type { HuangliData } from "../../types/huangli";

interface HuangliShareCardProps {
  data: HuangliData;
  onToast: (message: string) => void;
}

export function HuangliShareCard({ data, onToast }: HuangliShareCardProps) {
  const [isGenerated, setIsGenerated] = useState(false);
  const yi = data.yi.slice(0, 3).join("、");
  const ji = data.ji.slice(0, 3).join("、");
  const copy = `锦愿阁今日黄历（${data.date}）：\n宜：${yi}\n忌：${ji}\n今日签语：${data.dailyQuote.text}`;

  const copyShare = async () => {
    await navigator.clipboard.writeText(copy);
    onToast("黄历文案已复制");
  };

  return (
    <section className="share-panel section-card">
      <div className="section-heading">
        <span className="section-kicker">留作一页</span>
        <h2>分享今日黄历</h2>
      </div>
      {isGenerated && (
        <div className="share-preview">
          <span>锦愿阁</span>
          <h3>今日黄历</h3>
          <p>{data.date}</p>
          <strong>宜：{yi}</strong>
          <strong>忌：{ji}</strong>
          <em>{data.dailyQuote.text}</em>
          <div>二维码占位区</div>
        </div>
      )}
      <div className="share-actions">
        <button type="button" onClick={() => setIsGenerated(true)}>
          生成分享卡片
        </button>
        <button type="button" className="secondary-button" onClick={copyShare}>
          复制文案
        </button>
      </div>
    </section>
  );
}
