import type { CSSProperties } from "react";

interface BreathCircleProps {
  phase: string;
  isRunning: boolean;
  progress?: number;
  compact?: boolean;
}

export function BreathCircle({
  phase,
  isRunning,
  progress = 100,
  compact = false,
}: BreathCircleProps) {
  const style = {
    "--timer-progress": `${Math.max(0, Math.min(100, progress))}%`,
  } as CSSProperties;

  return (
    <div
      className={`breath-circle ${isRunning ? "is-breathing" : ""} ${
        compact ? "is-compact" : ""
      }`}
      style={style}
      aria-label={`呼吸提示：${phase}`}
    >
      <div className="breath-orbit" />
      <div className="breath-inner">
        <span>{phase}</span>
      </div>
    </div>
  );
}
