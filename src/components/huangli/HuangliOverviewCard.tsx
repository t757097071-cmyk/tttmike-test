import type { HuangliData } from "../../types/huangli";

interface HuangliOverviewCardProps {
  data: HuangliData;
}

export function HuangliOverviewCard({ data }: HuangliOverviewCardProps) {
  const fields = [
    ["今日值神", data.dayOfficer],
    ["今日五行", data.fiveElements],
    ["今日冲煞", data.chongsha],
    ["胎神方位", data.taishen],
    ["彭祖百忌", data.pengzu],
    ["今日星宿", data.star],
    ["今日建除", data.jianchu],
    ["今日吉神", data.goodGods.join("、")],
    ["今日凶神", data.badGods.join("、")],
  ];

  return (
    <section className="huangli-overview huangli-flip section-card" key={data.date}>
      <div className="huangli-date-block">
        <span>公历</span>
        <strong>{data.date}</strong>
        <p>
          {data.weekday} · {data.lunarDate}
        </p>
        <div className="huangli-badges">
          <b>{data.ganzhi}</b>
          <b>生肖 {data.zodiac}</b>
          <b>{data.solarTerm}</b>
        </div>
      </div>
      <div className="huangli-field-grid">
        {fields.map(([label, value]) => (
          <div className="huangli-field" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
