import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { DailyQuote } from "./components/DailyQuote";
import { FeatureEntryCards } from "./components/FeatureEntryCards";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { LampCard } from "./components/LampCard";
import { LampRecordsPanel } from "./components/LampRecordsPanel";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { StatsPanel } from "./components/StatsPanel";
import { WishForm } from "./components/WishForm";
import { WishRecords } from "./components/WishRecords";
import { WishTypeCards } from "./components/WishTypeCards";
import { WoodenFish } from "./components/WoodenFish";
import { lampOptions } from "./data/lampOptions";
import { dailyQuotes, wishTypes } from "./data/wishTypes";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminPage } from "./pages/AdminPage";
import { DrawPage } from "./pages/DrawPage";
import { DreamPage } from "./pages/DreamPage";
import { HuangliPage } from "./pages/HuangliPage";
import { JingxinPage } from "./pages/JingxinPage";
import { LoginPage } from "./pages/LoginPage";
import { RechargePage } from "./pages/RechargePage";
import { createLampRecord, getLampRecords, getMe, getRechargeOrders, getWallet } from "./api/commercial";
import type { ApiUser } from "./api/commercial";
import type {
  BlessingState,
  LampOption,
  LampRecord,
  WishRecord,
  WishTypeId,
} from "./types";
import { getDateKey, isYesterday } from "./utils/date";
import { playWishPowerRitualSound } from "./utils/sound";
import {
  clearWishRecords,
  loadBlessingState,
  saveBlessingState,
  sanitizeNickname,
} from "./utils/storage";

const getRandomQuote = () =>
  dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)] ?? dailyQuotes[0];

const DAILY_QUOTE_KEY = "jinyuan-ge-daily-quote";

const inferLampId = (record: LampRecord) =>
  record.lampId ??
  lampOptions.find(
    (lamp) =>
      lamp.cost === record.cost &&
      lamp.wishType === record.wishType &&
      (lamp.lampName === record.lampName || !record.lampName),
  )?.id ??
  lampOptions.find((lamp) => lamp.cost === record.cost && lamp.wishType === record.wishType)?.id;

const getDailyQuote = () => {
  const todayKey = getDateKey();
  const fallbackQuote = getRandomQuote();

  try {
    const raw = window.localStorage.getItem(DAILY_QUOTE_KEY);
    const stored = raw
      ? (JSON.parse(raw) as { date?: unknown; quote?: unknown })
      : undefined;

    if (stored?.date === todayKey && typeof stored.quote === "string") {
      return stored.quote;
    }

    const previousQuote = typeof stored?.quote === "string" ? stored.quote : "";
    const availableQuotes = dailyQuotes.filter((item) => item !== previousQuote);
    const nextPool = availableQuotes.length > 0 ? availableQuotes : dailyQuotes;
    const quote = nextPool[Math.floor(Math.random() * nextPool.length)] ?? fallbackQuote;
    window.localStorage.setItem(
      DAILY_QUOTE_KEY,
      JSON.stringify({ date: todayKey, quote }),
    );
    return quote;
  } catch {
    return fallbackQuote;
  }
};

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<BlessingState>(() => loadBlessingState());
  const [quote] = useState(getDailyQuote);
  const [apiUser, setApiUser] = useState<ApiUser | null>(null);
  const [isCommercialReady, setIsCommercialReady] = useState(false);

  useEffect(() => {
    saveBlessingState(state);
  }, [state]);

  const syncCommercialAccount = useCallback(async () => {
    try {
      const localLampRecords = loadBlessingState().lampRecords;
      const [{ user }, { wallet }, { orders }, { records: lampRecords }] = await Promise.all([
        getMe(),
        getWallet(),
        getRechargeOrders(),
        getLampRecords(),
      ]);
      let syncedWallet = wallet;
      let syncedLampRecords = lampRecords;
      const serverLampRecordIds = new Set(lampRecords.map((record) => record.id));
      const unsyncedLampRecords = localLampRecords.filter(
        (record) => !record.id.startsWith("lamp_") && !serverLampRecordIds.has(record.id),
      );
      let migratedLampCount = 0;
      for (const record of unsyncedLampRecords.reverse()) {
        const lampId = inferLampId(record);
        if (!lampId) {
          continue;
        }
        try {
          await createLampRecord({
            lampId,
            lampName: record.lampName,
            nickname: record.nickname,
            wishContent: record.wishContent,
          });
          migratedLampCount += 1;
        } catch {
          break;
        }
      }

      if (migratedLampCount > 0) {
        const [{ wallet: nextWallet }, { records: nextLampRecords }] = await Promise.all([
          getWallet(),
          getLampRecords(),
        ]);
        syncedWallet = nextWallet;
        syncedLampRecords = nextLampRecords;
      }

      setApiUser(user);
      setState((current) => ({
        ...current,
        wishPowerBalance: syncedWallet.wishPowerBalance,
        lampRecords: syncedLampRecords.map((record) => ({
          id: record.id,
          lampId: record.lampId,
          lampName: record.lampName,
          wishType: record.wishType,
          cost: record.cost,
          nickname: record.nickname,
          wishContent: record.wishContent,
          createdAt: record.createdAt,
        })),
        rechargeRecords: orders
          .filter((order) => order.status === "paid")
          .map((order) => ({
            id: order.id,
            packageName: order.packageName,
            price: order.priceCents / 100,
            wishPower: order.wishPower,
            createdAt: order.paidAt ?? order.createdAt,
            status: "success" as const,
          })),
      }));
    } catch {
      setApiUser(null);
    } finally {
      setIsCommercialReady(true);
    }
  }, []);

  useEffect(() => {
    void syncCommercialAccount();
  }, [syncCommercialAccount]);

  const requireLogin = useCallback(
    (redirect = "/profile") => {
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
    },
    [navigate],
  );

  const currentWishType = useMemo(
    () => wishTypes.find((item) => item.id === state.selectedWishType) ?? wishTypes[0],
    [state.selectedWishType],
  );

  const handleSelectWishType = (type: WishTypeId) => {
    setState((current) => ({ ...current, selectedWishType: type }));
  };

  const handleBless = () => {
    setState((current) => {
      const todayKey = getDateKey();
      const sameDay = current.lastBlessDate === todayKey;
      const nextStreak = sameDay
        ? Math.max(current.streakDays, 1)
        : isYesterday(current.lastBlessDate, todayKey)
          ? current.streakDays + 1
          : 1;
      const now = new Date().toISOString();

      return {
        ...current,
        totalBlessCount: current.totalBlessCount + 1,
        todayMerit: sameDay ? current.todayMerit + 1 : 1,
        lastBlessDate: todayKey,
        lastBlessTime: now,
        streakDays: nextStreak,
        blessHistory: [now, ...current.blessHistory].slice(0, 50),
      };
    });
  };

  const handleSubmitWish = (record: WishRecord): number => {
    const cost = record.cost ?? 66;
    const nextBalance = Math.max(0, state.wishPowerBalance - cost);
    setState((current) => ({
      ...current,
      selectedWishType: record.type,
      wishPowerBalance: Math.max(0, current.wishPowerBalance - cost),
      dailyFreeWishDate: cost === 0 ? getDateKey() : current.dailyFreeWishDate,
      wishRecords: [record, ...current.wishRecords],
    }));
    return nextBalance;
  };

  const handleDrawLot = (cost: number): number => {
    const nextBalance = Math.max(0, state.wishPowerBalance - cost);
    setState((current) => ({
      ...current,
      wishPowerBalance: Math.max(0, current.wishPowerBalance - cost),
      dailyFreeDrawDate: cost === 0 ? getDateKey() : current.dailyFreeDrawDate,
    }));
    return nextBalance;
  };

  const handleSpendWishPower = (cost: number): number => {
    const nextBalance = Math.max(0, state.wishPowerBalance - cost);
    setState((current) => ({
      ...current,
      wishPowerBalance: Math.max(0, current.wishPowerBalance - cost),
    }));
    return nextBalance;
  };

  const handleClearRecords = () => {
    setState((current) => clearWishRecords(current));
  };

  const handleLightLamp = async (record: LampRecord): Promise<number> => {
    const result = await createLampRecord({
      lampId: record.lampId ?? "",
      lampName: record.lampName,
      nickname: record.nickname,
      wishContent: record.wishContent,
    });
    const savedRecord: LampRecord = {
      id: result.record.id,
      lampId: result.record.lampId,
      lampName: result.record.lampName,
      wishType: result.record.wishType,
      cost: result.record.cost,
      nickname: result.record.nickname,
      wishContent: result.record.wishContent,
      createdAt: result.record.createdAt,
    };
    setState((current) => ({
      ...current,
      wishPowerBalance: result.wallet.wishPowerBalance,
      lampRecords: [savedRecord, ...current.lampRecords.filter((item) => item.id !== savedRecord.id)],
      selectedWishType: savedRecord.wishType,
    }));
    return result.wallet.wishPowerBalance;
  };

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className={isAdminRoute ? "app admin-app" : "app"}>
      {!isAdminRoute && <Header />}
      <main className={isAdminRoute ? "admin-main" : undefined}>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route
            path="/"
            element={
              <HomePage
                quote={quote}
              />
            }
          />
          <Route
            path="/blessing"
            element={
              <BlessingPage
                state={state}
                currentWishType={currentWishType}
                onBless={handleBless}
                onSelectWishType={handleSelectWishType}
                onSubmitWish={handleSubmitWish}
                onClearRecords={handleClearRecords}
              />
            }
          />
          <Route
            path="/lamps"
            element={
              <LampsPage
                state={state}
                isAuthenticated={Boolean(apiUser)}
                onRequireLogin={() => requireLogin("/lamps")}
                onLightLamp={handleLightLamp}
              />
            }
          />
          <Route
            path="/draw"
            element={
              <DrawPage
                wishPowerBalance={state.wishPowerBalance}
                hasDailyFreeDraw={state.dailyFreeDrawDate !== getDateKey()}
                onDrawLot={handleDrawLot}
              />
            }
          />
          <Route path="/huangli" element={<HuangliPage />} />
          <Route path="/jingxin" element={<JingxinPage />} />
          <Route
            path="/dream"
            element={
              <DreamPage
                wishPowerBalance={state.wishPowerBalance}
                onSpendWishPower={handleSpendWishPower}
              />
            }
          />
          <Route
            path="/login"
            element={
              <LoginPage
                onLoginSuccess={async (user) => {
                  setApiUser(user);
                  await syncCommercialAccount();
                }}
              />
            }
          />
          <Route
            path="/recharge"
            element={
              <RechargePage
                state={state}
                isAuthenticated={Boolean(apiUser)}
                onRequireLogin={() => requireLogin("/recharge")}
                onCommercialPaymentSuccess={syncCommercialAccount}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <ProfilePage
                state={state}
                wishTypes={wishTypes}
                user={apiUser}
                isAuthenticated={Boolean(apiUser) || !isCommercialReady}
                onRequireLogin={() => requireLogin("/profile")}
                onRefreshAccount={syncCommercialAccount}
              />
            }
          />
        </Routes>
      </main>
      {!isAdminRoute && <MobileBottomNav />}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

interface HomePageProps {
  quote: string;
}

function HomePage({ quote }: HomePageProps) {
  return (
    <>
      <Hero />
      <DailyQuote quote={quote} />
      <FeatureEntryCards />
    </>
  );
}

interface BlessingPageProps {
  state: BlessingState;
  currentWishType: (typeof wishTypes)[number];
  onBless: () => void;
  onSelectWishType: (type: WishTypeId) => void;
  onSubmitWish: (record: WishRecord) => number;
  onClearRecords: () => void;
}

function BlessingPage({
  state,
  currentWishType,
  onBless,
  onSelectWishType,
  onSubmitWish,
  onClearRecords,
}: BlessingPageProps) {
  return (
    <section className="page-shell">
      <div className="page-hero section-card">
        <span className="section-kicker">祈福</span>
        <h1>木鱼与心愿笺</h1>
        <p>一声木鱼，安放当下；一纸心愿，留给明日。愿你心有所定，行有所成。</p>
      </div>
      <WoodenFish
        todayMerit={state.todayMerit}
        totalBlessCount={state.totalBlessCount}
        streakDays={state.streakDays}
        currentWishType={currentWishType}
        onBless={onBless}
      />
      <WishTypeCards
        selectedWishType={state.selectedWishType}
        wishTypes={wishTypes}
        onSelect={onSelectWishType}
      />
      <WishForm
        wishTypes={wishTypes}
        selectedWishType={state.selectedWishType}
        todayMerit={state.todayMerit}
        wishPowerBalance={state.wishPowerBalance}
        hasDailyFreeWish={state.dailyFreeWishDate !== getDateKey()}
        recentRecords={state.wishRecords.slice(0, 5)}
        onSubmitWish={onSubmitWish}
      />
      <StatsPanel
        totalBlessCount={state.totalBlessCount}
        wishRecordCount={state.wishRecords.length}
        streakDays={state.streakDays}
      />
      <WishRecords records={state.wishRecords} wishTypes={wishTypes} onClear={onClearRecords} />
    </section>
  );
}

interface LampsPageProps {
  state: BlessingState;
  isAuthenticated: boolean;
  onRequireLogin: () => void;
  onLightLamp: (record: LampRecord) => Promise<number>;
}

function LampsPage({ state, isAuthenticated, onRequireLogin, onLightLamp }: LampsPageProps) {
  return (
    <section className="page-shell">
      <div className="page-hero section-card">
        <span className="section-kicker">心愿灯</span>
        <h1>点亮心愿灯</h1>
        <p>为更郑重的愿望点一盏灯。愿灯有光，心事有处安放。</p>
      </div>
      <LampLightingSection
        wishPowerBalance={state.wishPowerBalance}
        isAuthenticated={isAuthenticated}
        onRequireLogin={onRequireLogin}
        onLightLamp={onLightLamp}
      />
      <LampRecordsPanel records={state.lampRecords} />
    </section>
  );
}

interface LampLightingSectionProps {
  wishPowerBalance: number;
  isAuthenticated: boolean;
  onRequireLogin: () => void;
  onLightLamp: (record: LampRecord) => Promise<number>;
}

function LampLightingSection({
  wishPowerBalance,
  isAuthenticated,
  onRequireLogin,
  onLightLamp,
}: LampLightingSectionProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialLamp =
    lampOptions.find((lamp) => lamp.wishType === searchParams.get("type")) ?? lampOptions[0];
  const [selectedLamp, setSelectedLamp] = useState<LampOption>(initialLamp);
  const [nickname, setNickname] = useState("");
  const [wishContent, setWishContent] = useState("");
  const [message, setMessage] = useState("");
  const [isInsufficientOpen, setIsInsufficientOpen] = useState(false);
  const [isRitualizing, setIsRitualizing] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isRitualizing) {
      return;
    }

    const trimmedWish = wishContent.trim();

    if (!trimmedWish) {
      setMessage("请先写下这盏灯想守护的心愿。");
      return;
    }

    if (!isAuthenticated) {
      setMessage("请先登录后再点灯，后台才会记录这次参与。");
      onRequireLogin();
      return;
    }

    if (wishPowerBalance < selectedLamp.cost) {
      setIsInsufficientOpen(true);
      return;
    }

    const record: LampRecord = {
      id: crypto.randomUUID(),
      lampId: selectedLamp.id,
      lampName: selectedLamp.lampName,
      wishType: selectedLamp.wishType,
      cost: selectedLamp.cost,
      nickname: sanitizeNickname(nickname),
      wishContent: trimmedWish,
      createdAt: new Date().toISOString(),
    };

    setIsRitualizing(true);
    setMessage("愿力入灯，心灯正在点亮。");
    void playWishPowerRitualSound();
    window.setTimeout(() => {
      void onLightLamp(record)
        .then((nextBalance) => {
          setNickname("");
          setWishContent("");
          setMessage(
            `心愿灯已点亮，本次消耗 ${selectedLamp.cost} 愿力，当前剩余 ${nextBalance} 愿力。后台数据已同步。`,
          );
        })
        .catch((error) => {
          const nextMessage = error instanceof Error ? error.message : "点灯失败，请稍后再试。";
          setMessage(nextMessage);
          if (nextMessage.includes("愿力不足")) {
            setIsInsufficientOpen(true);
          }
        })
        .finally(() => {
          setIsRitualizing(false);
        });
    }, 1200);
  };

  const goRecharge = () => {
    setIsInsufficientOpen(false);
    navigate("/recharge");
  };

  return (
    <section className="lamp-section section-shell" id="lamp-lighting">
      <div className="section-heading">
        <div>
          <span className="section-kicker">心灯长明</span>
          <h2>点亮心愿灯</h2>
        </div>
        <strong className="balance-pill">当前愿力 {wishPowerBalance}</strong>
      </div>

      <div className="lamp-layout">
        <div className="lamp-grid">
          {lampOptions.map((lamp) => (
            <LampCard
              key={lamp.id}
              lamp={lamp}
              isSelected={selectedLamp.id === lamp.id}
              onSelect={setSelectedLamp}
            />
          ))}
        </div>

        <form
          className={`lamp-form section-card ${isRitualizing ? "is-ritualizing" : ""}`}
          onSubmit={handleSubmit}
        >
          {isRitualizing && (
            <div className="paid-ritual-layer" aria-hidden="true">
              <span>心灯渐明</span>
            </div>
          )}
          <span className="section-kicker">所选心灯</span>
          <h3>{selectedLamp.lampName}</h3>
          <p>{selectedLamp.description}</p>
          {selectedLamp.premiumNote && (
            <div className="premium-lamp-note">
              <strong>长明席位 · 388 愿力</strong>
              <span>{selectedLamp.premiumNote}</span>
            </div>
          )}
          <label>
            称呼（可选）
            <input
              type="text"
              value={nickname}
              maxLength={16}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="例如：锦愿阁访客"
            />
          </label>
          <label>
            心愿
            <textarea
              value={wishContent}
              maxLength={50}
              onChange={(event) => setWishContent(event.target.value)}
              placeholder="最多 50 字，写下此灯守护的心愿。"
            />
            <span className="field-count">{wishContent.length}/50</span>
          </label>
          <button type="submit" disabled={isRitualizing}>
            {isRitualizing ? "点灯中..." : "点亮此灯"}
          </button>
          {message && <p className="form-message">{message}</p>}
          <small className="compliance-note compact">
            祈愿是一种自我提醒与情绪寄托，现实结果仍需依靠行动、判断与长期努力。
          </small>
        </form>
      </div>

      {isInsufficientOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="power-title">
            <span className="section-kicker">愿力不足</span>
            <h2 id="power-title">愿力不足</h2>
            <p>
              当前愿力不足以点亮此灯，可前往领取测试额度后继续祈愿。账户中已有愿力会保留，可继续累积使用。
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

export default App;
