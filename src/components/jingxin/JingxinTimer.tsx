import { useEffect, useMemo, useRef, useState } from "react";
import type { JingxinRecord, JingxinSessionDraft } from "../../types/jingxin";
import { BreathCircle } from "./BreathCircle";

const quickMinutes = [3, 5, 8, 10, 15, 20, 30];

interface JingxinTimerProps {
  draft: JingxinSessionDraft;
  onDraftChange: (draft: JingxinSessionDraft) => void;
  onComplete: (record: JingxinRecord) => void;
}

type TimerStatus = "idle" | "running" | "paused" | "finished";

const formatRemain = (seconds: number): string => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const restSeconds = safeSeconds % 60;
  return `${`${minutes}`.padStart(2, "0")}:${`${restSeconds}`.padStart(2, "0")}`;
};

const getBreathPhase = (seconds: number): string => {
  const step = seconds % 12;
  if (step < 4) {
    return "吸气";
  }
  if (step < 6) {
    return "停留";
  }
  return "呼气";
};

export function JingxinTimer({ draft, onDraftChange, onComplete }: JingxinTimerProps) {
  const totalSeconds = draft.durationMinutes * 60;
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [customMinutes, setCustomMinutes] = useState(`${draft.durationMinutes}`);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const savedRef = useRef(false);

  useEffect(() => {
    if (status === "idle") {
      setRemainingSeconds(totalSeconds);
      setCustomMinutes(`${draft.durationMinutes}`);
      savedRef.current = false;
    }
  }, [draft.durationMinutes, status, totalSeconds]);

  useEffect(() => {
    if (status !== "running") {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (remainingSeconds === 0 && status === "running") {
      setStatus("finished");
      saveRecord();
    }
  }, [remainingSeconds, status]);

  const progress = useMemo(() => {
    if (totalSeconds <= 0) {
      return 0;
    }
    return (remainingSeconds / totalSeconds) * 100;
  }, [remainingSeconds, totalSeconds]);

  const phase = getBreathPhase(totalSeconds - remainingSeconds);

  const saveRecord = () => {
    if (savedRef.current) {
      return;
    }

    savedRef.current = true;
    const practicedSeconds = Math.max(60, totalSeconds - remainingSeconds || totalSeconds);
    const durationMinutes = Math.max(1, Math.round(practicedSeconds / 60));
    onComplete({
      id: crypto.randomUUID(),
      guideTitle: draft.guideTitle,
      durationMinutes,
      completedAt: new Date().toISOString(),
      checkedIn: false,
    });
  };

  const applyMinutes = (minutes: number) => {
    const safeMinutes = Math.max(1, Math.min(180, Math.round(minutes)));
    onDraftChange({ ...draft, durationMinutes: safeMinutes });
    setStatus("idle");
    setRemainingSeconds(safeMinutes * 60);
  };

  const applyCustomMinutes = () => {
    const parsed = Number.parseInt(customMinutes, 10);
    if (Number.isFinite(parsed)) {
      applyMinutes(parsed);
    }
  };

  const handleStart = () => {
    if (remainingSeconds <= 0 || status === "finished") {
      setRemainingSeconds(totalSeconds);
      savedRef.current = false;
    }
    setStatus("running");
  };

  const handleEnd = () => {
    if (status === "idle" || status === "finished") {
      return;
    }

    const shouldSave = window.confirm("是否保存本次静心记录？");
    if (shouldSave) {
      saveRecord();
      setStatus("finished");
    } else {
      setStatus("idle");
      setRemainingSeconds(totalSeconds);
      savedRef.current = false;
    }
    setIsFocusMode(false);
  };

  const resetTimer = () => {
    setStatus("idle");
    setRemainingSeconds(totalSeconds);
    savedRef.current = false;
  };

  if (isFocusMode) {
    return (
      <section className="focus-chamber" aria-label="专注阁模式">
        <div className="focus-mist" />
        <button
          type="button"
          className="focus-exit"
          onClick={() => setIsFocusMode(false)}
        >
          退出专注阁
        </button>
        <BreathCircle phase={phase} isRunning={status === "running"} progress={progress} />
        <strong>{formatRemain(remainingSeconds)}</strong>
        <p>{draft.guideTitle}</p>
        <span>{status === "paused" ? "已暂停" : phase}</span>
        <div className="focus-actions">
          {status === "running" ? (
            <button type="button" onClick={() => setStatus("paused")}>
              暂停
            </button>
          ) : (
            <button type="button" onClick={handleStart}>
              {status === "paused" ? "继续" : "开始"}
            </button>
          )}
          <button type="button" className="jingxin-secondary" onClick={handleEnd}>
            结束
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="jingxin-section" id="jingxin-timer">
      <div className="jingxin-section-heading">
        <span>安心计时</span>
        <h2>给自己一点时间，让心慢慢安定</h2>
      </div>
      <div className="timer-panel">
        <div className="timer-controls">
          <label>
            当前静心主题
            <input
              type="text"
              value={draft.guideTitle}
              maxLength={24}
              onChange={(event) =>
                onDraftChange({ ...draft, guideTitle: event.target.value || "自由静心" })
              }
            />
          </label>
          <div className="quick-time-grid">
            {quickMinutes.map((minute) => (
              <button
                type="button"
                className={draft.durationMinutes === minute ? "is-active" : ""}
                key={minute}
                onClick={() => applyMinutes(minute)}
              >
                {minute} 分钟
              </button>
            ))}
          </div>
          <label>
            自定义分钟
            <div className="custom-time-row">
              <input
                type="number"
                min={1}
                max={180}
                value={customMinutes}
                onChange={(event) => setCustomMinutes(event.target.value)}
              />
              <button type="button" onClick={applyCustomMinutes}>
                设定
              </button>
            </div>
          </label>
          <p className="timer-state">
            {status === "paused"
              ? "已暂停"
              : status === "finished"
                ? "本次静心已完成"
                : `呼吸节奏：${phase}`}
          </p>
        </div>
        <div className="timer-display">
          <BreathCircle phase={phase} isRunning={status === "running"} progress={progress} />
          <strong>{formatRemain(remainingSeconds)}</strong>
          <p>{draft.guideTitle}</p>
          <div className="timer-actions">
            {status === "running" ? (
              <button type="button" onClick={() => setStatus("paused")}>
                暂停
              </button>
            ) : (
              <button type="button" onClick={handleStart}>
                {status === "paused" ? "继续" : "开始"}
              </button>
            )}
            <button type="button" className="jingxin-secondary" onClick={handleEnd}>
              结束
            </button>
            <button type="button" className="jingxin-ghost" onClick={resetTimer}>
              重置
            </button>
            <button
              type="button"
              className="jingxin-ghost"
              onClick={() => setIsFocusMode(true)}
            >
              进入专注阁
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
