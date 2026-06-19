import { useEffect, useMemo, useRef, useState } from "react";
import { JingxinAudioCard } from "../components/jingxin/JingxinAudioCard";
import { JingxinCheckIn } from "../components/jingxin/JingxinCheckIn";
import { JingxinGuideCard } from "../components/jingxin/JingxinGuideCard";
import { JingxinHero } from "../components/jingxin/JingxinHero";
import { JingxinRecords } from "../components/jingxin/JingxinRecords";
import { JingxinShareCard } from "../components/jingxin/JingxinShareCard";
import { JingxinStatsPanel } from "../components/jingxin/JingxinStatsPanel";
import { JingxinTimer } from "../components/jingxin/JingxinTimer";
import type {
  JingxinAudio,
  JingxinGuide,
  JingxinRecord,
  JingxinSessionDraft,
  JingxinStats,
} from "../types/jingxin";
import { getDateKey } from "../utils/date";
import {
  addJingxinCheckIn,
  addJingxinRecord,
  clearJingxinData,
  getJingxinRecords,
  getJingxinStats,
  hasCheckedInToday,
} from "../utils/jingxinStorage";
import { startAmbientFallback } from "../utils/sound";

const mantras = [
  "心安，则路明。",
  "一念清明，万事从容。",
  "慢下来，才听得见自己。",
  "呼吸未乱，心便有依。",
  "心若有灯，夜也不深。",
  "不争片刻，便得片刻安宁。",
  "把今日的浮躁，交给一盏心灯。",
  "山月不语，照见本心。",
  "松风入阁，杂念自远。",
  "一呼一吸，皆是归处。",
  "先安顿心，再安顿事。",
  "愿你今日心定、眼明、步稳。",
  "把念头放下，把自己接住。",
  "清静是心不被外物牵乱。",
  "安静一会儿，答案会浮上来。",
  "心中有定，脚下有路。",
  "万般事急，先稳一念。",
  "灯火微明，足以照见当下。",
  "不必赶路，先把心带回来。",
  "今日能静一刻，便是今日的福气。",
  "风过松间，心归当下。",
  "念头来去，不必追随。",
  "心灯一点，照见方寸。",
  "人能安住，事便有序。",
];

const audioItems: JingxinAudio[] = [
  ["jingxin-01", "松风入阁", "松风轻过，杂念渐远。", "3:20", "舒缓"],
  ["jingxin-02", "月下心灯", "灯影微明，心绪安定。", "2:58", "安神"],
  ["jingxin-03", "莲台清音", "一念清明，万缘澄定。", "3:12", "入静"],
  ["jingxin-04", "雨落青瓦", "雨声入耳，缓解焦躁。", "4:06", "放松"],
  ["jingxin-05", "晨钟初响", "晨光初起，收摄心神。", "2:48", "晨起"],
  ["jingxin-06", "静水微澜", "水纹缓动，心境渐平。", "3:31", "观心"],
  ["jingxin-07", "香雾微起", "气息绵长，身心安住。", "3:39", "静坐"],
  ["jingxin-08", "夜灯微明", "睡前静听，安然入梦。", "4:12", "助眠"],
  ["jingxin-09", "清风过竹", "竹影摇曳，心神清朗。", "3:05", "清醒"],
  ["jingxin-10", "古寺晚钟", "钟声悠远，念头自歇。", "3:55", "止念"],
  ["jingxin-11", "心境清明", "轻柔静谧，适合学习前。", "3:15", "专注"],
  ["jingxin-12", "归心", "一呼一吸，回到当下。", "2:57", "归静"],
].map(([id, title, description, duration, tag]) => ({
  id,
  title,
  description,
  duration,
  tag,
  src: `/src/assets/audio/${id}.mp3`,
}));

const guides: JingxinGuide[] = [
  {
    id: "five-minute-return",
    title: "五分钟回神",
    suitableState: "刚打开网站、学习前",
    durationMinutes: 5,
    difficulty: "入门",
    steps: [
      "坐稳，双脚或双腿自然放松。",
      "闭眼，做三次缓慢呼吸。",
      "吸气时感受空气进入身体。",
      "呼气时放下肩颈和眉心。",
      "结束后给自己一个今日小目标。",
    ],
  },
  {
    id: "ten-minute-settle",
    title: "十分钟安住",
    suitableState: "心浮气躁、注意力分散",
    durationMinutes: 10,
    difficulty: "入门",
    steps: [
      "端坐，背部自然挺直。",
      "深呼吸三次，吸气 4 秒，呼气 6 秒。",
      "将注意力放在鼻尖呼吸。",
      "念头升起时不评判，轻轻放下。",
      "结束时双手合掌，回到当下。",
    ],
  },
  {
    id: "twenty-minute-mindfulness",
    title: "二十分钟正念",
    suitableState: "进阶练习、长期专注训练",
    durationMinutes: 20,
    difficulty: "进阶",
    steps: [
      "三次吐纳，收摄心神。",
      "观呼吸，注意力锁定鼻尖出入气。",
      "扫描身体，从头顶到脚底依次放松。",
      "观念头来去，不追逐、不排斥。",
      "结束前缓缓睁眼，回到当下。",
    ],
  },
  {
    id: "study-calm",
    title: "学业静心法",
    suitableState: "考试前、学习焦虑时",
    durationMinutes: 8,
    difficulty: "入门",
    steps: [
      "坐正，双肩自然下沉。",
      "吸气时默念“定”，呼气时默念“静”。",
      "观照当下紧张情绪，不抗拒。",
      "给自己一个清晰的学习目标。",
      "结束后再开始学习。",
    ],
  },
  {
    id: "sleep-calm",
    title: "睡前安神法",
    suitableState: "睡眠不稳、压力较大",
    durationMinutes: 12,
    difficulty: "入门",
    steps: [
      "选择安静环境，放松肩颈。",
      "缓慢呼吸，放松下颌与眼周。",
      "默数呼吸，从 1 到 10 循环。",
      "心乱时回到呼吸。",
      "结束后减少手机使用，准备休息。",
    ],
  },
  {
    id: "morning-clear",
    title: "晨起清心法",
    suitableState: "晨起、开始工作或学习前",
    durationMinutes: 6,
    difficulty: "入门",
    steps: [
      "坐直，感受身体苏醒。",
      "做 5 次缓慢深呼吸。",
      "观今日心念，缓缓安住。",
      "设定今日愿望：清明、专注、平和。",
      "合掌片刻，开始新的一天。",
    ],
  },
  {
    id: "emotion-settle",
    title: "情绪平复法",
    suitableState: "烦躁、委屈、压力大时",
    durationMinutes: 10,
    difficulty: "入门",
    steps: [
      "承认此刻情绪存在。",
      "把注意力放在身体紧绷处。",
      "每次呼气时放松一点。",
      "在心里说：我看见了，但我不被它带走。",
      "结束后写下一句真实感受。",
    ],
  },
  {
    id: "focus-start",
    title: "专注入题法",
    suitableState: "开始做题、写作、复盘前",
    durationMinutes: 3,
    difficulty: "入门",
    steps: [
      "关闭无关页面和消息提醒。",
      "做三次缓慢呼吸。",
      "明确接下来只做一件事。",
      "在纸上写下第一步。",
      "计时结束后立刻开始行动。",
    ],
  },
];

const checkInMessages = [
  "今日已静心，愿你心定事顺。",
  "你把心带回来了。",
  "一日一静，浮躁自退。",
  "能安住片刻，已是很好的开始。",
  "心慢下来，事就清楚了。",
  "今日心灯已亮，愿你从容向前。",
];

const randomItem = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)] ?? items[0];

export function JingxinPage() {
  const [mantra, setMantra] = useState(() => randomItem(mantras));
  const [stats, setStats] = useState<JingxinStats>(() => getJingxinStats());
  const [records, setRecords] = useState<JingxinRecord[]>(() => getJingxinRecords());
  const [checkedInToday, setCheckedInToday] = useState(() => hasCheckedInToday());
  const [latestDuration, setLatestDuration] = useState(0);
  const [checkInMessage, setCheckInMessage] = useState("");
  const [toast, setToast] = useState("");
  const [playingId, setPlayingId] = useState("");
  const [draft, setDraft] = useState<JingxinSessionDraft>({
    guideTitle: "五分钟回神",
    durationMinutes: 5,
  });
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioStopRef = useRef<(() => void) | null>(null);

  const todayMinutes = useMemo(() => {
    const today = getDateKey();
    return records
      .filter((record) => getDateKey(new Date(record.completedAt)) === today)
      .reduce((sum, record) => sum + record.durationMinutes, 0);
  }, [records]);

  useEffect(() => {
    return () => {
      audioElementRef.current?.pause();
      audioStopRef.current?.();
    };
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  const changeMantra = () => {
    const available = mantras.filter((item) => item !== mantra);
    setMantra(randomItem(available.length ? available : mantras));
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("已盖朱砂印，文案已复制");
    } catch {
      showToast("复制未成功，请稍后再试");
    }
  };

  const stopCurrentAudio = () => {
    audioElementRef.current?.pause();
    audioElementRef.current = null;
    audioStopRef.current?.();
    audioStopRef.current = null;
  };

  const toggleAudio = (audio: JingxinAudio) => {
    if (playingId === audio.id) {
      stopCurrentAudio();
      setPlayingId("");
      return;
    }

    stopCurrentAudio();
    const nextAudio = new Audio(audio.src);
    audioElementRef.current = nextAudio;
    let didUseFallback = false;

    const useFallback = () => {
      if (didUseFallback) {
        return;
      }

      didUseFallback = true;
      nextAudio.pause();
      console.warn(`静心清音文件缺失或暂不可播：${audio.src}，已切换内置清音。`);
      startAmbientFallback(audio.title, audio.duration, () => {
        setPlayingId((current) => (current === audio.id ? "" : current));
        audioStopRef.current = null;
      })
        .then((controller) => {
          if (!controller) {
            setPlayingId("");
            return;
          }
          audioStopRef.current = controller.stop;
          setPlayingId(audio.id);
        })
        .catch(() => setPlayingId(""));
    };

    nextAudio.addEventListener("ended", () => setPlayingId(""));
    nextAudio.addEventListener("error", useFallback);
    nextAudio
      .play()
      .then(() => setPlayingId(audio.id))
      .catch(useFallback);
  };

  const useGuide = (guide: JingxinGuide) => {
    setDraft({ guideTitle: guide.title, durationMinutes: guide.durationMinutes });
    document.getElementById("jingxin-timer")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleComplete = (record: JingxinRecord) => {
    const nextStats = addJingxinRecord(record);
    const nextRecords = getJingxinRecords();
    setStats(nextStats);
    setRecords(nextRecords);
    setLatestDuration(record.durationMinutes);
    showToast("静心已保存");
  };

  const handleCheckIn = () => {
    if (!latestDuration || checkedInToday) {
      return;
    }

    const { records: nextRecords } = addJingxinCheckIn(latestDuration);
    setRecords(nextRecords);
    setCheckedInToday(true);
    setCheckInMessage(randomItem(checkInMessages));
    showToast("今日心灯已亮");
  };

  const handleClearRecords = () => {
    const confirmed = window.confirm("确认清空静心记录吗？此操作无法恢复。");
    if (!confirmed) {
      return;
    }

    clearJingxinData();
    setStats(getJingxinStats());
    setRecords([]);
    setCheckedInToday(false);
    setLatestDuration(0);
    setCheckInMessage("");
    showToast("静心记录已清空");
  };

  return (
    <div className="jingxin-page">
      <div className="jingxin-bg-stars" aria-hidden="true" />
      <JingxinHero
        mantra={mantra}
        onChangeMantra={changeMantra}
        onStart={() =>
          document.getElementById("jingxin-timer")?.scrollIntoView({ behavior: "smooth" })
        }
        onListen={() =>
          document.getElementById("jingxin-audio")?.scrollIntoView({ behavior: "smooth" })
        }
      />
      <JingxinStatsPanel stats={stats} />

      <section className="jingxin-section" id="jingxin-audio">
        <div className="jingxin-section-heading">
          <div>
            <span>阁中清音</span>
            <h2>听一段清音，让杂念慢慢沉下去</h2>
          </div>
        </div>
        <div className="jingxin-audio-grid">
          {audioItems.map((audio) => (
            <JingxinAudioCard
              key={audio.id}
              audio={audio}
              isPlaying={playingId === audio.id}
              onToggle={toggleAudio}
            />
          ))}
        </div>
      </section>

      <section className="jingxin-section">
        <div className="jingxin-section-heading">
          <div>
            <span>静心小笺</span>
            <h2>选择一种方式开始</h2>
            <p>时间长短不重要，重要的是让心回到当下。</p>
          </div>
        </div>
        <div className="jingxin-guide-grid">
          {guides.map((guide) => (
            <JingxinGuideCard key={guide.id} guide={guide} onUse={useGuide} />
          ))}
        </div>
      </section>

      <JingxinTimer draft={draft} onDraftChange={setDraft} onComplete={handleComplete} />
      <JingxinCheckIn
        canCheckIn={latestDuration > 0}
        checkedInToday={checkedInToday}
        latestDuration={latestDuration}
        message={checkInMessage}
        onCheckIn={handleCheckIn}
      />
      <JingxinRecords records={records} onClear={handleClearRecords} />
      <JingxinShareCard
        todayMinutes={todayMinutes}
        streakDays={stats.streakDays}
        mantra={mantra}
        onCopy={copyText}
      />
      <p className="jingxin-compliance">
        静心阁内容仅作放松、专注与情绪陪伴用途，不替代医学、心理治疗等专业服务。如长期存在明显失眠、焦虑等情况，请及时寻求专业帮助。
      </p>
      {toast && <div className="jingxin-toast">{toast}</div>}
    </div>
  );
}
