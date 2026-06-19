import { useNavigate } from "react-router-dom";
import ChromaGrid from "./ChromaGrid";
import type { ChromaGridItem } from "./ChromaGrid";

const entries: ChromaGridItem[] = [
  {
    title: "祈福",
    subtitle: "敲一声木鱼，写一份心愿。愿所行有定，所念有归。",
    handle: "木鱼与心愿笺",
    location: "进入祈福仪式",
    url: "/blessing",
    symbol: "福",
    motif: "wooden-fish",
    borderColor: "#b35a32",
    gradient:
      "radial-gradient(circle at 78% 24%, rgba(214, 158, 78, 0.32), transparent 10rem), linear-gradient(145deg, #fff3dd, #efd6ad 72%, #d8a769)",
  },
  {
    title: "心愿灯",
    subtitle: "为更郑重的愿望点一盏灯，让心事有光，也有留痕。",
    handle: "长明灯册",
    location: "点亮一盏心灯",
    url: "/lamps",
    symbol: "灯",
    motif: "wish-lamp",
    borderColor: "#c46a28",
    gradient:
      "radial-gradient(circle at 72% 18%, rgba(255, 192, 83, 0.4), transparent 10rem), linear-gradient(145deg, #fff0d2, #e9bf7a 74%, #b85830)",
  },
  {
    title: "抽签",
    subtitle: "静心抽一支签，看一句提醒，把答案留给行动。",
    handle: "今日一签",
    location: "抽取今日提醒",
    url: "/draw",
    symbol: "签",
    motif: "fortune-stick",
    borderColor: "#a66532",
    gradient:
      "radial-gradient(circle at 72% 20%, rgba(196, 126, 54, 0.28), transparent 10rem), linear-gradient(145deg, #fff4dd, #e2c091 72%, #9c5a32)",
  },
  {
    title: "今日黄历",
    subtitle: "观今日宜忌，安排行程、学习与心绪。",
    handle: "日课宜忌",
    location: "查看今日",
    url: "/huangli",
    symbol: "历",
    motif: "calendar",
    borderColor: "#b98335",
    gradient:
      "radial-gradient(circle at 74% 18%, rgba(222, 176, 95, 0.36), transparent 10rem), linear-gradient(145deg, #fff6e6, #e7c98d 72%, #b7823a)",
  },
  {
    title: "静心阁",
    subtitle: "听清音，观呼吸，让心慢下来。",
    handle: "月下清音",
    location: "入阁静心",
    url: "/jingxin",
    symbol: "静",
    motif: "meditation",
    borderColor: "#a55238",
    gradient:
      "radial-gradient(circle at 74% 20%, rgba(189, 112, 70, 0.28), transparent 10rem), linear-gradient(145deg, #fff2dd, #dec094 72%, #9d4b36)",
  },
  {
    title: "周公解梦",
    subtitle: "写下梦境，解读心绪，得到今日提醒。",
    handle: "梦境签纸",
    location: "解一场梦",
    url: "/dream",
    symbol: "梦",
    motif: "dream",
    borderColor: "#9f4b33",
    gradient:
      "radial-gradient(circle at 70% 18%, rgba(201, 164, 92, 0.34), transparent 10rem), linear-gradient(145deg, #fff5e3, #e5c692 72%, #9f4b33)",
  },
];

export function FeatureEntryCards() {
  const navigate = useNavigate();

  return (
    <section className="feature-entry-section section-shell">
      <div className="section-heading">
        <span className="section-kicker">六处入阁</span>
        <h2>今日所愿，从这里开始</h2>
      </div>
      <div className="feature-entry-chroma">
        <ChromaGrid
          items={entries}
          columns={3}
          rows={2}
          radius={330}
          damping={0.42}
          fadeOut={0.55}
          onItemClick={(item) => {
            if (item.url) {
              navigate(item.url);
            }
          }}
        />
      </div>
    </section>
  );
}
