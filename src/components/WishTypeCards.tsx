import type { WishType, WishTypeId } from "../types";

interface WishTypeCardsProps {
  selectedWishType: WishTypeId;
  wishTypes: WishType[];
  onSelect: (type: WishTypeId) => void;
}

export function WishTypeCards({
  selectedWishType,
  wishTypes,
  onSelect,
}: WishTypeCardsProps) {
  return (
    <section className="section-shell" id="wish-types">
      <div className="section-heading">
        <span className="section-kicker">四方祈愿</span>
        <h2>选择今日所愿</h2>
      </div>
      <div className="wish-grid">
        {wishTypes.map((wishType) => (
          <article
            className={`wish-type-card ${
              selectedWishType === wishType.id ? "is-selected" : ""
            }`}
            key={wishType.id}
          >
            <div className="wish-icon" aria-hidden="true">
              {wishType.icon}
            </div>
            <h3>{wishType.title}</h3>
            <p>{wishType.description}</p>
            <button type="button" onClick={() => onSelect(wishType.id)}>
              选择此愿
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
