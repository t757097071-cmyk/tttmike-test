import { useMemo, useState } from "react";
import { DateSwitcher } from "../components/huangli/DateSwitcher";
import { DailyQuoteCard } from "../components/huangli/DailyQuoteCard";
import { FourAdviceCards } from "../components/huangli/FourAdviceCards";
import { HuangliHero } from "../components/huangli/HuangliHero";
import { HuangliOverviewCard } from "../components/huangli/HuangliOverviewCard";
import { HuangliShareCard } from "../components/huangli/HuangliShareCard";
import { LuckyDirectionGrid } from "../components/huangli/LuckyDirectionGrid";
import { PrayerAdvicePanel } from "../components/huangli/PrayerAdvicePanel";
import { StudyAdvicePanel } from "../components/huangli/StudyAdvicePanel";
import { TimeSlotGrid } from "../components/huangli/TimeSlotGrid";
import { YiJiPanel } from "../components/huangli/YiJiPanel";
import { getDateKey } from "../utils/date";
import { generateHuangliData, huangliQuotePool } from "../utils/huangliMock";

export function HuangliPage() {
  const [selectedDate, setSelectedDate] = useState(getDateKey());
  const [toast, setToast] = useState("");
  const data = useMemo(() => generateHuangliData(selectedDate), [selectedDate]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  return (
    <section className="huangli-page page-shell">
      <HuangliHero />
      <DateSwitcher selectedDate={selectedDate} onChangeDate={setSelectedDate} />
      <HuangliOverviewCard data={data} />
      <YiJiPanel key={`yiji-${selectedDate}`} yi={data.yi} ji={data.ji} />
      <FourAdviceCards key={`four-${selectedDate}`} items={data.fourAdvice} />
      <LuckyDirectionGrid key={`direction-${selectedDate}`} items={data.directions} />
      <TimeSlotGrid key={`time-${selectedDate}`} items={data.timeSlots} />
      <div className="huangli-two-column">
        <StudyAdvicePanel
          key={`study-${selectedDate}`}
          date={selectedDate}
          advice={data.studyAdvice}
          onToast={showToast}
        />
        <PrayerAdvicePanel key={`prayer-${selectedDate}`} advice={data.prayerAdvice} />
      </div>
      <DailyQuoteCard
        key={`quote-${selectedDate}`}
        quotes={huangliQuotePool}
        initialQuote={data.dailyQuote}
        onToast={showToast}
      />
      <HuangliShareCard key={`share-${selectedDate}`} data={data} onToast={showToast} />
      <p className="compliance-note">
        今日黄历内容仅作传统文化体验、生活参考与情绪陪伴使用，不承诺现实结果。学习、事业、健康、出行等事项仍需结合实际情况理性判断。
      </p>
      {toast && <div className="seal-toast">{toast}</div>}
    </section>
  );
}
