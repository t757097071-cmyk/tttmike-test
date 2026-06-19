import type {
  DirectionItem,
  FourAdviceItem,
  HuangliData,
  HuangliQuote,
  PrayerAdvice,
  StudyAdvice,
  TimeSlot,
} from "../types/huangli";

const yiPool = [
  "祈福", "读书", "静心", "整理书桌", "制定计划", "复盘错题", "拜访师长", "求学问道", "修身养性", "收纳整理",
  "早睡早起", "温习旧课", "写作整理", "沟通请教", "运动舒展", "点亮心愿灯", "完成计划", "整理资料", "安排行程",
];

const jiPool = [
  "急躁", "争执", "熬夜", "拖延", "冲动消费", "心神不定", "三心二意", "临时抱佛脚", "情绪内耗",
  "久坐不动", "过度刷手机", "空想不行动", "粗心大意", "言语冒进", "计划过满", "半途而废", "边学边玩", "反复自责",
];

const directions = ["正东", "正南", "正西", "正北", "东南", "东北", "西南", "西北"];
const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const zodiacSigns = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
const dayOfficers = ["青龙", "明堂", "天刑", "朱雀", "金匮", "天德", "白虎", "玉堂", "天牢", "玄武", "司命", "勾陈"];
const fiveElements = ["木火通明", "火土相承", "土金含秀", "金水相涵", "水木初发", "木土相持", "火金相制", "水土相济"];
const solarTerms = ["小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"] as const;
const solarTermInfo = [0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758];
const stars = ["角宿", "亢宿", "氐宿", "房宿", "心宿", "尾宿", "箕宿", "斗宿", "牛宿", "女宿", "虚宿", "危宿"];
const jianchuOrder = ["建日", "除日", "满日", "平日", "定日", "执日", "破日", "危日", "成日", "收日", "开日", "闭日"];
const goodGodPool = ["天德", "月恩", "青龙", "明堂", "福生", "天仓", "六合", "不将", "金堂", "母仓", "时德", "月空", "守日", "天马", "玉堂", "王日", "三合", "阴德"];
const badGodPool = ["土府", "五虚", "厌对", "招摇", "天刑", "月破", "朱雀", "归忌", "劫煞", "五离", "白虎", "河魁", "血支", "游祸", "天牢", "死气", "玄武", "九空"];
const taishenPool = ["厨灶栖外正东", "仓库床外正南", "房床碓外正东", "门厕外正东", "占大门外东北", "碓磨栖外东北", "厨灶床外东北", "仓库碓外东北"];
const pengzuPool = ["甲不开仓，辰不哭泣", "乙不栽植，巳不远行", "丙不修灶，午不苫盖", "丁不剃头，未不服药", "戊不受田，申不安床", "己不破券，酉不宴客", "庚不经络，戌不吃犬", "辛不合酱，亥不嫁娶", "壬不汲水，子不问卜", "癸不词讼，丑不冠带"];

export const huangliQuotePool: HuangliQuote[] = [
  { text: "凡事缓一步，心便定一分。", explanation: "慢不是退，慢是把心放回正处。" },
  { text: "当下认真，便是今日最好的吉。", explanation: "吉日不只在日历里，也在你愿意开始的那一刻。" },
  { text: "吉在心念端正，也在行动踏实。", explanation: "心正则路稳，手勤则事成。" },
  { text: "愿你今日所学，皆有回应。", explanation: "把一页看懂，把一题做透，便有回响。" },
  { text: "焦虑不能替你完成题目，行动可以。", explanation: "把担心换成十分钟行动，局面就会松动。" },
  { text: "所求之事，先从今日一步开始。", explanation: "远愿不必远等，先把眼前一步走稳。" },
  { text: "心中有定，手中有法，脚下有路。", explanation: "定心、定法、定步，今日自会清明。" },
  { text: "慢慢来，稳稳做，今日自有今日功。", explanation: "不催自己开花，只把根扎深。" },
  { text: "看清要做的事，然后安静地做完。", explanation: "少一分摇摆，多一分成事。" },
  { text: "今日少想结果，多做过程。", explanation: "过程扎实，结果才有可托之处。" },
  { text: "心不散，题自明。", explanation: "先收心，再下笔，难处会慢慢显出线索。" },
  { text: "一日一进，久而有成。", explanation: "微进也是进，积久便见山河。" },
];

const timeNames = [
  ["子时", "23:00 到 00:59"], ["丑时", "01:00 到 02:59"], ["寅时", "03:00 到 04:59"], ["卯时", "05:00 到 06:59"],
  ["辰时", "07:00 到 08:59"], ["巳时", "09:00 到 10:59"], ["午时", "11:00 到 12:59"], ["未时", "13:00 到 14:59"],
  ["申时", "15:00 到 16:59"], ["酉时", "17:00 到 18:59"], ["戌时", "19:00 到 20:59"], ["亥时", "21:00 到 22:59"],
] as const;

const timeStatuses: TimeSlot["status"][] = ["吉", "平", "宜静", "宜学", "宜行", "宜休"];
const timeAdvice = ["适合收心整理，把杂念慢慢放下。", "宜安静休息，不急作决定。", "可做轻量计划，先理清次序。", "适合晨读温习，开启清明心气。", "宜处理重点任务，稳中求进。", "适合沟通请教，把疑问说清。", "宜短暂休整，别让节奏过满。", "适合复盘资料，补齐遗漏处。", "宜行动推进，把计划落到纸面。", "适合收尾整理，少开新局。", "宜静心祈愿，回看今日所得。", "适合早睡养神，为明日留力。"];

const studyAdvicePool: StudyAdvice[] = [
  { keyword: "复盘", subjects: ["数学", "物理"], tasks: ["整理错题", "归纳模型", "限时训练"], warning: "不要一边焦虑一边假装努力。", action: "先选一类错题，连续做 30 分钟复盘。" },
  { keyword: "背诵", subjects: ["语文", "英语"], tasks: ["晨读短文", "默写词句", "整理素材"], warning: "不要只看不写，记忆需要落笔。", action: "选 20 个重点词句，读写结合两轮。" },
  { keyword: "归纳", subjects: ["化学", "生物"], tasks: ["画知识框架", "对比概念", "错因归类"], warning: "不要把笔记抄成装饰。", action: "把一个章节压缩成一页结构图。" },
  { keyword: "专注", subjects: ["数学", "英语"], tasks: ["番茄钟训练", "关闭手机", "单点突破"], warning: "不要边学边刷消息。", action: "设一个 35 分钟专注段，只做一类题。" },
  { keyword: "预习", subjects: ["语文", "历史"], tasks: ["通读新课", "标出疑问", "查清背景"], warning: "不要把不懂的地方轻轻放过。", action: "先列 3 个问题，带着问题读一遍。" },
  { keyword: "稳题", subjects: ["数学", "化学"], tasks: ["基础题回炉", "步骤规范", "检查单位"], warning: "不要为了难题丢掉基础分。", action: "做 20 分钟基础题，把过程写完整。" },
];

const prayerAdvicePool: PrayerAdvice[] = [
  { type: "学业祈福", reason: "今日宜读书、复盘、求学问道，适合为学习目标立愿。", lampName: "学业顺遂灯", cost: 88 },
  { type: "事业祈福", reason: "今日宜制定计划、沟通请教，适合为目标推进蓄力。", lampName: "事业进阶灯", cost: 168 },
  { type: "健康祈福", reason: "今日宜早睡早起、运动舒展，适合照看身心节律。", lampName: "健康安稳灯", cost: 128 },
  { type: "平安祈福", reason: "今日宜静心、安排行程，适合为出入平安留愿。", lampName: "平安守护灯", cost: 108 },
];

const directionDescriptions: Record<string, string> = {
  财神位: "适合处理账目、计划预算。",
  喜神位: "适合沟通、约见、表达善意。",
  福神位: "适合祈福、探望亲友。",
  文昌位: "适合读书、写作、整理学习计划。",
  贵人方位: "适合请教、汇报、寻求支持。",
  桃花位: "适合修整仪容、温和交流。",
  平安方位: "适合出行前静心、检查行程。",
};

const dateToParts = (date: string) => {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  return { year, month, day };
};

const dateToLocalMidnight = (date: string): Date => new Date(`${date}T00:00:00`);

export const hashDate = (date: string): number => {
  const { year, month, day } = dateToParts(date);
  let value = year * 10000 + month * 100 + day;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return value >>> 0;
};

const pick = <T,>(pool: readonly T[], seed: number, offset = 0): T =>
  pool[(seed + offset * 7) % pool.length] ?? pool[0];

const mixSeed = (seed: number, index: number): number => {
  let value = (seed + index * 0x9e3779b9) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d) >>> 0;
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b) >>> 0;
  value ^= value >>> 16;
  return value >>> 0;
};

const pickMany = <T,>(pool: readonly T[], seed: number, count: number): T[] =>
  pool
    .map((item, index) => ({ item, score: mixSeed(seed, index) }))
    .sort((left, right) => left.score - right.score)
    .slice(0, Math.min(count, pool.length))
    .map(({ item }) => item);

const getWeekday = (date: string): string =>
  new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(dateToLocalMidnight(date));

const chineseDay = (day: number): string => {
  const ones = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  if (day <= 10) return `初${ones[day]}`;
  if (day < 20) return `十${ones[day - 10]}`;
  if (day === 20) return "二十";
  if (day < 30) return `廿${ones[day - 20]}`;
  return day === 30 ? "三十" : `三十${ones[day - 30]}`;
};

const formatLunarDate = (date: string): string => {
  try {
    const parts = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).formatToParts(dateToLocalMidnight(date));
    const yearName = parts.find((part) => (part.type as string) === "yearName")?.value ?? "";
    const month = parts.find((part) => part.type === "month")?.value ?? "";
    const day = Number(parts.find((part) => part.type === "day")?.value ?? 1);
    return `${yearName}年${month}${chineseDay(day)}`;
  } catch {
    const { month, day } = dateToParts(date);
    return `农历${month}月${chineseDay(day)}`;
  }
};

const daysBetween = (start: string, end: string): number =>
  Math.floor((dateToLocalMidnight(end).getTime() - dateToLocalMidnight(start).getTime()) / 86400000);

const getGanzhiIndex = (date: string): number => {
  // 1900-01-31 为甲辰日，此基准常用于传统农历算法顺推六十甲子日。
  const offset = daysBetween("1900-01-31", date);
  return (offset + 40 + 600000) % 60;
};

const getGanzhi = (date: string): string => {
  const index = getGanzhiIndex(date);
  return `${stems[index % 10]}${branches[index % 12]}日`;
};

const getZodiac = (year: number): string => zodiacSigns[(year - 4) % 12] ?? "龙";

const getSolarTermDate = (year: number, index: number): Date =>
  new Date(31556925974.7 * (year - 1900) + solarTermInfo[index] * 60000 + Date.UTC(1900, 0, 6, 2, 5));

const getActiveSolarTerm = (date: string): { name: string; index: number } => {
  const target = dateToLocalMidnight(date).getTime();
  const { year } = dateToParts(date);
  const terms = [year - 1, year]
    .flatMap((termYear) =>
      solarTerms.map((name, index) => ({
        name,
        index,
        time: getSolarTermDate(termYear, index).getTime(),
      })),
    )
    .filter((term) => term.time <= target)
    .sort((left, right) => right.time - left.time);
  return terms[0] ? { name: terms[0].name, index: terms[0].index } : { name: "小寒", index: 0 };
};

const getMonthBranchIndex = (solarTermIndex: number): number =>
  (Math.floor(solarTermIndex / 2) + 1) % 12;

const getJianchu = (date: string, solarTermIndex: number): string => {
  const dayBranchIndex = getGanzhiIndex(date) % 12;
  const monthBranchIndex = getMonthBranchIndex(solarTermIndex);
  return jianchuOrder[(dayBranchIndex - monthBranchIndex + 12) % 12] ?? "平日";
};

const getChongsha = (date: string): string => {
  const index = getGanzhiIndex(date);
  const animal = zodiacSigns[(index + 6) % 12] ?? "龙";
  const badDirection = directions[(index * 3 + 1) % directions.length] ?? "正东";
  return `冲${animal}煞${badDirection}`;
};

export const generateStudyPlan = (date: string): string[] => {
  const seed = hashDate(date);
  const plans = [
    ["上午：复盘昨日错题 30 分钟", "下午：完成一组限时训练", "晚上：整理 3 条易错原因", "睡前：写下明日第一件事"],
    ["上午：晨读重点段落 20 分钟", "下午：归纳一个章节框架", "晚上：完成 15 道基础题", "睡前：回看今日最稳的一步"],
    ["上午：整理本周薄弱点", "下午：请教一个卡住的问题", "晚上：限时完成一套小卷", "睡前：列出明日优先任务"],
    ["上午：背诵 20 个关键词", "下午：复盘两道典型题", "晚上：整理学习桌与资料", "睡前：写下今日收获一句"],
    ["上午：预习新课并标疑问", "下午：完成一组基础巩固", "晚上：错题重做 25 分钟", "睡前：给明日留一个清晰开头"],
    ["上午：整理公式和概念卡片", "下午：限时训练一组题", "晚上：回看错因并写改法", "睡前：收心早睡，留足精神"],
  ];
  return plans[seed % plans.length] ?? plans[0];
};

export const getCurrentTimeSlotName = (date = new Date()): string => {
  const hour = date.getHours();
  if (hour === 23 || hour === 0) return "子时";
  if (hour < 3) return "丑时";
  if (hour < 5) return "寅时";
  if (hour < 7) return "卯时";
  if (hour < 9) return "辰时";
  if (hour < 11) return "巳时";
  if (hour < 13) return "午时";
  if (hour < 15) return "未时";
  if (hour < 17) return "申时";
  if (hour < 19) return "酉时";
  if (hour < 21) return "戌时";
  return "亥时";
};

export const generateHuangliData = (date: string): HuangliData => {
  const seed = hashDate(date);
  const { year } = dateToParts(date);
  const solarTerm = getActiveSolarTerm(date);
  const directionNames = ["财神位", "喜神位", "福神位", "文昌位", "贵人方位", "桃花位", "平安方位"];
  const directionItems: DirectionItem[] = directionNames.map((name, index) => ({
    name,
    direction: directions[((seed >>> (index + 1)) + index * 3) % directions.length] ?? "正东",
    description: directionDescriptions[name],
  }));
  const timeSlots: TimeSlot[] = timeNames.map(([name, timeRange], index) => ({
    name,
    timeRange,
    status: timeStatuses[((seed >>> 2) + index * 2) % timeStatuses.length] ?? "平",
    advice: timeAdvice[((seed >>> 4) + index * 3) % timeAdvice.length] ?? timeAdvice[0],
  }));
  const fourTitles = [
    ["study", "学业", "点学业灯"],
    ["career", "事业", "点事业灯"],
    ["health", "健康", "点健康灯"],
    ["peace", "平安", "点平安灯"],
  ] as const;
  const fourAdvice: FourAdviceItem[] = fourTitles.map(([type, title, buttonText], index) => ({
    type,
    title,
    stars: (((seed >>> (index + 2)) + index) % 5) + 1,
    suggestion: ["稳住节奏，把要事放在前面。", "先定目标，再安排行动。", "身心同养，留一点余地。", "出入从容，事前多检查。"][index],
    suitable: ["复盘错题与整理资料", "沟通计划与推进重点", "舒展运动与早睡养神", "安排行程与静心祈愿"][index],
    avoid: ["临时抱佛脚", "言语冒进", "久坐不动", "急躁出行"][index],
    buttonText,
  }));

  return {
    date,
    lunarDate: formatLunarDate(date),
    weekday: getWeekday(date),
    ganzhi: getGanzhi(date),
    zodiac: getZodiac(year),
    solarTerm: solarTerm.name,
    dayOfficer: pick(dayOfficers, getGanzhiIndex(date), 1),
    fiveElements: pick(fiveElements, seed, 2),
    chongsha: getChongsha(date),
    taishen: pick(taishenPool, seed, 3),
    pengzu: pick(pengzuPool, getGanzhiIndex(date), 4),
    star: pick(stars, getGanzhiIndex(date), 5),
    jianchu: getJianchu(date, solarTerm.index),
    goodGods: pickMany(goodGodPool, seed, 3),
    badGods: pickMany(badGodPool, seed ^ 0x9e3779b9, 2),
    yi: pickMany(yiPool, seed, 10),
    ji: pickMany(jiPool, seed ^ 0x85ebca6b, 10),
    directions: directionItems,
    timeSlots,
    fourAdvice,
    studyAdvice: studyAdvicePool[seed % studyAdvicePool.length] ?? studyAdvicePool[0],
    prayerAdvice: prayerAdvicePool[(seed >>> 3) % prayerAdvicePool.length] ?? prayerAdvicePool[0],
    dailyQuote: huangliQuotePool[(seed >>> 5) % huangliQuotePool.length] ?? huangliQuotePool[0],
  };
};

export const getShiftedDate = (date: string, offset: number): string => {
  const nextDate = dateToLocalMidnight(date);
  nextDate.setDate(nextDate.getDate() + offset);
  const year = nextDate.getFullYear();
  const month = `${nextDate.getMonth() + 1}`.padStart(2, "0");
  const day = `${nextDate.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};
