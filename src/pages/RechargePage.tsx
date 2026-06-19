import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { PaymentConfirmModal } from "../components/PaymentConfirmModal";
import { RechargePackageCard } from "../components/RechargePackageCard";
import { UserStatsCard } from "../components/UserStatsCard";
import {
  completeMockPayment,
  createRechargeOrder,
  getRechargeOrder,
  getRechargeOrders,
} from "../api/commercial";
import type { ApiRechargeOrder, PaymentChannel } from "../api/commercial";
import { rechargePackages } from "../data/rechargePackages";
import type { BlessingState, RechargePackage } from "../types";
import { formatDateTime } from "../utils/date";

interface RechargePageProps {
  state: BlessingState;
  isAuthenticated: boolean;
  onRequireLogin: () => void;
  onCommercialPaymentSuccess: () => Promise<void>;
}

export function RechargePage({
  state,
  isAuthenticated,
  onRequireLogin,
  onCommercialPaymentSuccess,
}: RechargePageProps) {
  const [selectedPackage, setSelectedPackage] = useState<RechargePackage>(rechargePackages[0]);
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannel>("wechat");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [activeOrder, setActiveOrder] = useState<ApiRechargeOrder | null>(null);
  const [orders, setOrders] = useState<ApiRechargeOrder[]>([]);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const recentRecords = useMemo(
    () => state.rechargeRecords.slice(0, 10),
    [state.rechargeRecords],
  );

  const visibleOrders = useMemo(
    () =>
      orders.length > 0
        ? orders.slice(0, 10)
        : recentRecords.map((record) => ({
            id: record.id,
            orderNo: record.id,
            packageId: "",
            packageName: record.packageName,
            priceCents: Math.round(record.price * 100),
            wishPower: record.wishPower,
            paymentChannel: "wechat" as const,
            status: "paid" as const,
            cashierUrl: "",
            paidAt: record.createdAt,
            createdAt: record.createdAt,
          })),
    [orders, recentRecords],
  );

  const loadOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setOrders([]);
      setActiveOrder(null);
      return;
    }

    setIsLoadingOrders(true);
    try {
      const result = await getRechargeOrders();
      setOrders(result.orders);
      setActiveOrder(
        (current) =>
          current ??
          result.orders.find((order) => order.status === "pending") ??
          result.orders[0] ??
          null,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "读取订单失败");
    } finally {
      setIsLoadingOrders(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!activeOrder || activeOrder.status !== "pending") {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      void getRechargeOrder(activeOrder.id)
        .then((result) => {
          setActiveOrder(result.order);
          setOrders((current) =>
            current.map((order) => (order.id === result.order.id ? result.order : order)),
          );
          if (result.order.status === "paid") {
            void onCommercialPaymentSuccess();
          }
        })
        .catch(() => {
          window.clearInterval(intervalId);
        });
    }, 2500);

    return () => window.clearInterval(intervalId);
  }, [activeOrder, onCommercialPaymentSuccess]);

  const handleCreateOrder = async () => {
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }

    setIsConfirmOpen(false);
    setIsCreatingOrder(true);
    setMessage("");
    try {
      const result = await createRechargeOrder({
        packageId: selectedPackage.id,
        paymentChannel,
      });
      setActiveOrder(result.order);
      setOrders((current) => [result.order, ...current.filter((order) => order.id !== result.order.id)]);
      setMessage("测试额度订单已创建。当前内测不会发起真实支付，可直接模拟入账。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "创建订单失败");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleMockPay = async () => {
    if (!activeOrder) {
      return;
    }

    setIsPaying(true);
    setMessage("");
    try {
      const result = await completeMockPayment(activeOrder);
      setActiveOrder(result.order);
      setOrders((current) =>
        current.map((order) => (order.id === result.order.id ? result.order : order)),
      );
      await onCommercialPaymentSuccess();
      setMessage(result.alreadySettled ? "订单此前已到账，本次模拟入账未重复加余额。" : "模拟入账成功，愿力已到账。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "模拟入账失败");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <section className="page-shell recharge-page">
      <div className="page-hero section-card">
        <span className="section-kicker">免费内测</span>
        <h1>领取愿力测试额度</h1>
        <p>选择愿力包后创建服务端测试订单，当前内测不会跳转支付，也不会真实扣费。</p>
      </div>

      <UserStatsCard
        wishPowerBalance={state.wishPowerBalance}
        totalBlessCount={state.totalBlessCount}
        todayMerit={state.todayMerit}
        streakDays={state.streakDays}
      />

      {!isAuthenticated && (
        <section className="section-card account-gate">
          <span className="section-kicker">账户保护</span>
          <h2>请先登录后领取</h2>
          <p>测试额度记录、愿力余额和体验权益会绑定到手机号账户，不再保存在浏览器本地。</p>
          <button type="button" onClick={onRequireLogin}>
            手机号登录
          </button>
        </section>
      )}

      <div className="recharge-intro section-card">
        <h2>愿力可用于何处</h2>
        <p>
          愿力可用于点亮心愿灯、开启长期祈愿、解锁完整签文、保存祈愿记录与参与站内祈福活动。
        </p>
      </div>

      <div className="section-heading">
        <span className="section-kicker">六档愿力</span>
        <h2>选择一份心灯愿力</h2>
      </div>

      <div className="recharge-grid">
        {rechargePackages.map((item) => (
          <RechargePackageCard
            key={item.id}
            rechargePackage={item}
            isSelected={selectedPackage.id === item.id}
            onSelect={setSelectedPackage}
          />
        ))}
      </div>

      <div className="payment-channel-row section-card">
        <span>模拟通道</span>
        <div>
          <button
            type="button"
            className={paymentChannel === "wechat" ? "is-active" : ""}
            onClick={() => setPaymentChannel("wechat")}
          >
            微信模拟通道
          </button>
          <button
            type="button"
            className={paymentChannel === "alipay" ? "is-active" : ""}
            onClick={() => setPaymentChannel("alipay")}
          >
            支付宝模拟通道
          </button>
        </div>
      </div>

      <div className="recharge-confirm section-card">
        <div>
          <span>已选择：{selectedPackage.packageName}</span>
          <strong>内测免费领取</strong>
          <small>到账愿力：{selectedPackage.wishPower}</small>
        </div>
        <button
          type="button"
          disabled={isCreatingOrder || !isAuthenticated}
          onClick={() => setIsConfirmOpen(true)}
        >
          {isCreatingOrder ? "创建订单中..." : "领取测试额度"}
        </button>
      </div>

      {activeOrder && (
        <section className="section-card order-status-panel">
          <span className="section-kicker">测试订单</span>
          <h2>{activeOrder.status === "paid" ? "已到账" : "等待模拟入账"}</h2>
          <p>
            订单号：{activeOrder.orderNo}。测试档位 ¥{(activeOrder.priceCents / 100).toFixed(2)}，
            到账 {activeOrder.wishPower} 愿力。
          </p>
          <div className="mock-cashier">
            <strong>{activeOrder.paymentChannel === "wechat" ? "微信" : "支付宝"}模拟通道</strong>
            <span>当前是免费内测入口，只记录体验订单并模拟愿力到账。</span>
          </div>
          <button type="button" disabled={isPaying || activeOrder.status === "paid"} onClick={handleMockPay}>
            {isPaying ? "入账处理中..." : "模拟入账完成"}
          </button>
        </section>
      )}

      {message && <p className="success-message">{message}</p>}

      <section className="section-shell">
        <div className="section-heading">
          <span className="section-kicker">服务端记录</span>
          <h2>测试额度记录</h2>
        </div>
        {visibleOrders.length > 0 ? (
          <div className="records-list">
            {visibleOrders.map((order) => (
              <article className="record-card" key={order.id}>
                <span>{order.packageName}</span>
                <h3>测试档 ¥{(order.priceCents / 100).toFixed(2)} · {order.wishPower} 愿力</h3>
                <p>{formatDateTime(order.paidAt ?? order.createdAt)}</p>
                <small>状态：{order.status === "paid" ? "已到账" : "等待模拟入账"}</small>
              </article>
            ))}
          </div>
        ) : isLoadingOrders ? (
          <EmptyState message="正在读取服务端测试订单记录。" />
        ) : (
          <EmptyState message="暂无测试额度记录。登录并模拟入账后会显示在这里。" />
        )}
      </section>

      <p className="compliance-note">
        愿力为站内虚拟权益，仅用于本网站传统文化体验与情绪陪伴功能，不可提现、不可转赠，不承诺现实结果。
      </p>

      {isConfirmOpen && (
        <PaymentConfirmModal
          rechargePackage={selectedPackage}
          onConfirm={handleCreateOrder}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}
    </section>
  );
}
