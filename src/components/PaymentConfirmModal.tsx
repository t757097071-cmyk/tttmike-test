import type { RechargePackage } from "../types";

interface PaymentConfirmModalProps {
  rechargePackage: RechargePackage;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PaymentConfirmModal({
  rechargePackage,
  onConfirm,
  onCancel,
}: PaymentConfirmModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="payment-title">
        <span className="section-kicker">免费内测</span>
        <h2 id="payment-title">确认领取测试额度</h2>
        <p>
          您将领取「{rechargePackage.packageName}」，到账 {rechargePackage.wishPower} 愿力。
          当前内测不会发起真实支付，也不会收取费用。
        </p>
        <div className="modal-actions">
          <button type="button" onClick={onConfirm}>
            确认领取
          </button>
          <button type="button" className="secondary-button" onClick={onCancel}>
            再想想
          </button>
        </div>
      </section>
    </div>
  );
}
