import type { LampOption } from "../types";

interface LampCardProps {
  lamp: LampOption;
  isSelected: boolean;
  onSelect: (lamp: LampOption) => void;
}

export function LampCard({ lamp, isSelected, onSelect }: LampCardProps) {
  return (
    <button
      type="button"
      className={`lamp-card ${lamp.id === "long-wish-light" ? "is-premium" : ""} ${
        isSelected ? "is-selected" : ""
      }`}
      onClick={() => onSelect(lamp)}
    >
      {lamp.badge && <span className="lamp-badge">{lamp.badge}</span>}
      <span className="lamp-glow" aria-hidden="true" />
      <span className="lamp-name">{lamp.lampName}</span>
      <strong>{lamp.cost} 愿力</strong>
      <p>{lamp.description}</p>
      {lamp.premiumNote && <small>{lamp.premiumNote}</small>}
    </button>
  );
}
