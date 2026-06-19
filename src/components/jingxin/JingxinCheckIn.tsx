interface JingxinCheckInProps {
  canCheckIn: boolean;
  checkedInToday: boolean;
  latestDuration: number;
  message: string;
  onCheckIn: () => void;
}

export function JingxinCheckIn({
  canCheckIn,
  checkedInToday,
  latestDuration,
  message,
  onCheckIn,
}: JingxinCheckInProps) {
  return (
    <section className="jingxin-section">
      <div className="checkin-panel">
        <div>
          <span className="jingxin-eyebrow">今日静心</span>
          <h2>{checkedInToday ? "今日心灯已亮" : "完成今日静心"}</h2>
          <p>
            {message ||
              (canCheckIn
                ? `刚刚已静心 ${latestDuration} 分钟，可以为今日盖一枚静心印。`
                : "完成一次安心计时后，可在这里为今日静心打卡。")}
          </p>
        </div>
        <button type="button" disabled={!canCheckIn || checkedInToday} onClick={onCheckIn}>
          {checkedInToday ? "今日已打卡" : "完成今日静心"}
        </button>
      </div>
    </section>
  );
}
