import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { WishRecord, WishType, WishTypeId } from "../types";
import { formatDateTime } from "../utils/date";
import { playWishPowerRitualSound } from "../utils/sound";

const WISH_NOTE_COST = 66;

interface WishFormProps {
  wishTypes: WishType[];
  selectedWishType: WishTypeId;
  todayMerit: number;
  wishPowerBalance: number;
  hasDailyFreeWish: boolean;
  recentRecords: WishRecord[];
  onSubmitWish: (record: WishRecord) => number;
}

export function WishForm({
  wishTypes,
  selectedWishType,
  todayMerit,
  wishPowerBalance,
  hasDailyFreeWish,
  recentRecords,
  onSubmitWish,
}: WishFormProps) {
  const navigate = useNavigate();
  const [formType, setFormType] = useState<WishTypeId>(selectedWishType);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [isInsufficientOpen, setIsInsufficientOpen] = useState(false);
  const [isRitualizing, setIsRitualizing] = useState(false);

  useEffect(() => {
    setFormType(selectedWishType);
  }, [selectedWishType]);

  const completeSubmit = (record: WishRecord) => {
    const nextBalance = onSubmitWish(record);
    setContent("");
    setNickname("");
    setMessage(
      hasDailyFreeWish
        ? `今日首次心愿笺已免费点亮，当前愿力仍为 ${nextBalance}。`
        : `心愿笺已点亮，本次消耗 ${WISH_NOTE_COST} 愿力，当前剩余 ${nextBalance} 愿力。`,
    );
    setIsRitualizing(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isRitualizing) {
      return;
    }

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setMessage("请先写下你的今日心愿。");
      return;
    }

    const record: WishRecord = {
      id: crypto.randomUUID(),
      type: formType,
      content: trimmedContent,
      nickname: nickname.trim() || undefined,
      createdAt: new Date().toISOString(),
      meritSnapshot: todayMerit,
      cost: hasDailyFreeWish ? 0 : WISH_NOTE_COST,
    };

    if (!hasDailyFreeWish && wishPowerBalance < WISH_NOTE_COST) {
      setIsInsufficientOpen(true);
      return;
    }

    if (!hasDailyFreeWish) {
      setIsRitualizing(true);
      setMessage("愿力入笺，正在点亮心愿。");
      void playWishPowerRitualSound();
      window.setTimeout(() => completeSubmit(record), 1100);
      return;
    }

    completeSubmit(record);
  };

  const goRecharge = () => {
    setIsInsufficientOpen(false);
    navigate("/recharge");
  };

  return (
    <section className="wish-form-section section-shell" id="wish-form">
      <div className="section-heading">
        <div>
          <span className="section-kicker">点亮心愿笺</span>
          <h2>写下今日心愿</h2>
        </div>
        <strong className="balance-pill">
          {hasDailyFreeWish ? "今日首次免费" : "加写 66 愿力"} · 当前愿力 {wishPowerBalance}
        </strong>
      </div>
      <div className="wish-form-layout">
        <form
          className={`wish-form section-card ${isRitualizing ? "is-ritualizing" : ""}`}
          onSubmit={handleSubmit}
        >
          {isRitualizing && (
            <div className="paid-ritual-layer" aria-hidden="true">
              <span>愿力流转</span>
            </div>
          )}
          <div className="wish-cost-note">
            <strong>每日第一份心愿笺免费</strong>
            <span>当天继续加写心愿，每份消耗 66 愿力；学业、事业、健康、平安四类同价。</span>
          </div>
          <label>
            祈福类型
            <select
              value={formType}
              onChange={(event) => setFormType(event.target.value as WishTypeId)}
            >
              {wishTypes.map((wishType) => (
                <option value={wishType.id} key={wishType.id}>
                  {wishType.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            姓名或昵称（可选）
            <input
              type="text"
              value={nickname}
              maxLength={16}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="例如：一位努力的人"
            />
          </label>
          <label>
            心愿内容
            <textarea
              value={content}
              maxLength={50}
              onChange={(event) => setContent(event.target.value)}
              placeholder="最多 50 字，把今天想守住的愿望写下来。"
            />
            <span className="field-count">{content.length}/50</span>
          </label>
          <button type="submit" disabled={isRitualizing}>
            {isRitualizing ? "点亮中..." : "点亮心愿笺"}
          </button>
          {message && <p className="form-message">{message}</p>}
        </form>
        <div className="recent-records section-card">
          <h3>最近 5 条心愿笺记录</h3>
          {recentRecords.length > 0 ? (
            <ul>
              {recentRecords.map((record) => (
                <li key={record.id}>
                  <strong>{wishTypes.find((item) => item.id === record.type)?.title}</strong>
                  <span>{record.content}</span>
                  <small>
                    {formatDateTime(record.createdAt)} ·{" "}
                    {(record.cost ?? WISH_NOTE_COST) === 0
                      ? "今日免费"
                      : `消耗 ${record.cost ?? WISH_NOTE_COST} 愿力`}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-note">还没有心愿被点亮。</p>
          )}
        </div>
      </div>
      {isInsufficientOpen && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wish-power-title"
          >
            <span className="section-kicker">愿力不足</span>
            <h2 id="wish-power-title">愿力不足</h2>
            <p>
              当前愿力不足以点亮心愿笺，可前往领取测试额度后继续祈愿。账户中已有愿力会保留，可继续累积使用。
            </p>
            <div className="modal-actions">
              <button type="button" onClick={goRecharge}>
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
    </section>
  );
}
