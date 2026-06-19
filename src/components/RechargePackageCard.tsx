import type { RechargePackage } from "../types";

interface RechargePackageCardProps {
  rechargePackage: RechargePackage;
  isSelected: boolean;
  onSelect: (rechargePackage: RechargePackage) => void;
}

export function RechargePackageCard({
  rechargePackage,
  isSelected,
  onSelect,
}: RechargePackageCardProps) {
  return (
    <button
      type="button"
      className={`recharge-package-card ${isSelected ? "is-selected" : ""}`}
      onClick={() => onSelect(rechargePackage)}
    >
      {rechargePackage.badge && <span className="package-badge">{rechargePackage.badge}</span>}
      <span className="package-name">{rechargePackage.packageName}</span>
      <strong>免费内测</strong>
      <span className="package-power">到账 {rechargePackage.wishPower} 愿力</span>
      <small>测试档位 ¥{rechargePackage.price} 仅用于后台统计，不会真实扣费</small>
      <p>{rechargePackage.description}</p>
      {rechargePackage.highlightText && (
        <small>{rechargePackage.highlightText}</small>
      )}
    </button>
  );
}
