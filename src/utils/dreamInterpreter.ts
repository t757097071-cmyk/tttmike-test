import type {
  DreamCategory,
  DreamInput,
  DreamInterpretation,
  DreamKeywordItem,
} from "../types/dream";
import { dreamDictionary } from "./dreamDictionary";

interface DreamMatch {
  item: DreamKeywordItem;
  matchedTerm: string;
  score: number;
}

interface Modifier {
  tone: string;
  advice: string;
  detail: string;
}

interface DetailTemplate {
  title: string;
  body: string;
}

const negativeMoods: DreamInput["wakeMood"][] = ["害怕", "迷茫", "难过", "紧张"];
const positiveMoods: DreamInput["wakeMood"][] = ["轻松", "平静", "惊喜"];

const moodModifiers: Record<DreamInput["wakeMood"], Modifier> = {
  害怕: {
    tone: "梦醒时的害怕感，说明这个画面更触到了安全感和不确定感。",
    advice: "先让身体安下来，做三次缓慢呼吸，再去处理现实中的事情。",
    detail: "适合用安抚而不是压制的方式面对它：梦境不等于现实，它更像一段情绪画面。",
  },
  迷茫: {
    tone: "迷茫感会让梦里的路、空间和选择被放大。",
    advice: "今天不要急着做全盘决定，先把目标拆成一个可以完成的小步骤。",
    detail: "此梦更像在提醒你找回方向感：先确认眼前最重要的一件事。",
  },
  轻松: {
    tone: "梦醒后较轻松，说明这场梦带有释放和松动的意味。",
    advice: "趁状态回升，开始一个被你拖延的小行动。",
    detail: "它不像警讯，更像心绪整理后的回暖，可以把这份轻盈留给今天。",
  },
  难过: {
    tone: "难过感常与牵挂、遗憾或未表达的情绪相连。",
    advice: "允许自己承认在意，不必急着表现得没事。",
    detail: "此梦更适合被温柔地看见：它可能是在替你表达一些白天没说出口的话。",
  },
  紧张: {
    tone: "紧张感会让任务、时间、考试和追赶类画面更强烈。",
    advice: "今天先处理最有截止感的一件事，别让事项在脑中反复追赶你。",
    detail: "它可能和时间压力、表现压力有关，适合用清单和限时训练恢复掌控。",
  },
  平静: {
    tone: "平静地醒来，说明你对梦境的承载力较好。",
    advice: "适合把梦当作一次自我观察，安静复盘近期状态。",
    detail: "梦境未必在催促你，它更像在整理记忆与感受。",
  },
  惊喜: {
    tone: "惊喜感常代表新的期待、关系松动或机会意识。",
    advice: "可以把梦里的积极意象转成今天一个具体行动。",
    detail: "它提醒你保持开放，但仍要以踏实行动承接期待。",
  },
  说不清: {
    tone: "说不清的感受也值得记录，说明梦里有些片段还在整理中。",
    advice: "先记下最清楚的三个画面，过一天再看它们对应了什么心事。",
    detail: "此梦适合中性理解，不必急于给它贴上好坏标签。",
  },
};

const stateModifiers: Record<DreamInput["recentState"], Modifier> = {
  学习压力: {
    tone: "从近期状态看，梦更偏向学业目标、分数期待、进度压力和自我要求。",
    advice: "今天先复盘一个模块，做一组限时训练，晚上早点收心。",
    detail: "学业上不要贪多，先把错题原因写清楚，比盲目刷题更有用。",
  },
  工作压力: {
    tone: "从近期状态看，梦可能反映任务推进、评价感、沟通负担和边界压力。",
    advice: "先列优先级，再处理一项最需要反馈或确认的事项。",
    detail: "适合把边界说清楚，把任务拆开，不把所有责任默默吞下。",
  },
  情绪焦虑: {
    tone: "从近期状态看，梦更像情绪在提醒你需要缓冲和确定感。",
    advice: "减少信息刺激，先做一件确定的小事，再继续推进。",
    detail: "焦虑不能替你完成事情，稳定的呼吸和小行动会帮你把心拉回来。",
  },
  睡眠不稳: {
    tone: "从近期状态看，梦可能与疲惫、信息过载和睡前状态有关。",
    advice: "今晚减少刷手机，固定入睡流程，给自己十分钟安静时间。",
    detail: "梦境不用过度解读，先把身体照顾好，很多画面会自然变淡。",
  },
  人际关系: {
    tone: "从近期状态看，梦可能放大了你对回应、边界和误解的在意。",
    advice: "先分清事实与猜测，不要反复推演他人的每个反应。",
    detail: "需要沟通时，用温和但清楚的句子说出自己的感受。",
  },
  家人牵挂: {
    tone: "从近期状态看，梦可能承载了关心、责任感和一点不易说出口的担心。",
    advice: "可以问候家人，也允许自己不用把所有事都扛在身上。",
    detail: "关心不等于自责，表达真实感受往往比独自担忧更安稳。",
  },
  财务担忧: {
    tone: "从近期状态看，梦可能投射了安全感、资源安排和现实事务。",
    advice: "今天适合记录支出、检查预算，避免冲动消费。",
    detail: "把数字摊开来看，焦虑会比在心里盘旋时更容易处理。",
  },
  没有明显压力: {
    tone: "从近期状态看，即使没有明显压力，梦也可能是在整理日常记忆和潜在期待。",
    advice: "把梦当作生活参考，今天稳稳完成一件小事即可。",
    detail: "传统解梦重在借象观心，不必把梦当成现实结果的预告。",
  },
};

const summaryTemplates = [
  "此梦以「{primary}」为主象，并由「{secondary}」补足氛围，更像近期心绪把压力、期待与现实事务编成画面。它不指向必然结果，适合你醒后温和整理，把注意力放回今日能做的一步。",
  "从梦象看，「{primary}」最醒目，「{secondary}」像旁边注脚，提醒你关注最近反复牵动的部分。此梦更像内心在提示节奏与安全感，适合少一点推演，多一点稳定行动。",
  "这场梦不宜简单说吉凶，它以「{primary}」为核心，把「{secondary}」带出的感受一起呈现。梦里起伏多半是压力与期待的投影，醒后先稳住心，再处理现实中的第一件事。",
  "梦中「{primary}」通常指向你正在处理的内在主题，「{secondary}」让这个主题更具体。它像一则梦境札记，提醒你今天不必急着要答案，可以先完成一个小而确定的行动。",
  "若把此梦看作一封心里的信，「{primary}」是正文，「{secondary}」是落款。它更像在说：你近期有些在意的事需要被看见，也需要被拆成现实里可执行的小步骤。",
  "此梦的重量落在「{primary}」，而「{secondary}」让它多了情绪层次。它不是坏兆，也不是定论，更适合作为自我提醒：先照顾当下状态，再让事情稳稳推进。",
  "梦境以「{primary}」开端，以「{secondary}」扩散，说明近期心里可能有一个尚未完全安放的主题。醒后不妨把它当作提醒，少责备自己，多做一点具体整理。",
  "「{primary}」在梦里被放大，往往说明你对某个结果、关系或选择较在意。「{secondary}」则提示处理方式。今天适合慢一点，把复杂心绪落到一个清楚行动上。",
  "这个梦像一页古籍签文，「{primary}」是签面，「{secondary}」是签底。它更像提醒你观照近期状态，不必把梦当现实预告，真正重要的是醒后如何安顿自己。",
  "梦里的「{primary}」带出主要象征，「{secondary}」带出辅助线索。它可能反映你在压力、期待与自我要求之间寻找平衡。今天适合回到秩序，先完成眼前一件事。",
  "此梦的画面虽然复杂，但核心可落在「{primary}」。旁边的「{secondary}」说明情绪并非单一，而是多个现实主题交织。醒后适合记录、复盘，再做轻量行动。",
  "梦以「{primary}」为最重符号，显示你近期可能在意某种评价、去向或安全感。「{secondary}」让梦更贴近日常事务。今天宜稳，不宜用焦虑催促自己。",
  "从传统解梦的借象观心来看，「{primary}」不是预告，而是心绪的形象。「{secondary}」提醒你看见细节。若能把梦里的紧张转成今日行动，心会更安。",
  "此梦像把白天未尽的念头收进夜里，「{primary}」最先浮现，「{secondary}」随后补充。它提醒你不必追着结果跑，先把今天能把握的部分做好。",
  "「{primary}」与「{secondary}」同现，说明这不是单一画面，而是一组心事的排列。它更像提醒你整理近期压力、关系或计划，别让它们只在心里盘旋。",
  "梦境中「{primary}」的权重较高，常与近期最牵动你的事项有关。「{secondary}」则提供情绪方向。醒后适合把担心写下来，再圈出能立刻做的一步。",
  "这场梦带着「{primary}」的主题，也带着「{secondary}」的余味。它可能是身体和心绪在夜里做整理。今天不必过度解释，先让生活节奏回到平稳。",
  "梦里的「{primary}」像一盏灯，把你近期在意的地方照亮；「{secondary}」像灯影，提示还有一些感受未被说清。醒后可以温和复盘，不急着下结论。",
  "此梦呈现的是一组提醒，而非固定答案。「{primary}」代表主线，「{secondary}」代表支线。它适合你今天从小处修正节奏，把心里的事落到纸面上。",
  "如果用一句话概括，此梦是在借「{primary}」说心事，又借「{secondary}」提醒行动。它不必被理解成预兆，更像一次自我观察后的温柔提示。",
];

const emotionTemplates = [
  "{primaryHint} {moodTone} {stateTone}",
  "你梦中的主象提示：{primaryHint} {stateTone} {moodTone}",
  "{stateTone} 这也让「{primary}」的象征更明显：{primaryHint} {moodTone}",
  "从情绪角度看，{primaryHint} {moodTone} {stateTone}",
  "梦醒后的感受很重要。{moodTone} 再结合主象来看，{primaryHint}",
  "此梦不是在吓你，而是在提示情绪需要出口。{primaryHint} {stateTone}",
  "若梦里画面反复出现，可能说明这件事在心里还没有完全放下。{moodTone}",
  "梦境的情绪底色来自「{primary}」。{primaryHint} {stateTone}",
  "你可以把这场梦理解为一次情绪投影。{moodTone} {primaryHint}",
  "这类梦常在压力或期待较高时出现。{stateTone} {moodTone}",
  "梦里最重的不是画面本身，而是它带来的感受。{moodTone}",
  "从近期状态看，情绪可能比事情本身更需要被安顿。{stateTone}",
  "此梦可能在提醒你：不要急着否定自己的感受。{primaryHint}",
  "若醒后仍有余味，可以先承认它，再把注意力带回现实。{moodTone}",
  "梦境把白天没完全处理的感受换成图像。{primaryHint} {stateTone}",
  "它更像心绪整理，不是现实定论。{moodTone} {primaryHint}",
  "你近期的状态会影响梦的颜色。{stateTone} 因此梦里「{primary}」会显得更突出。",
  "这场梦提醒你看见自己的敏感处。{primaryHint} {moodTone}",
  "情绪并非障碍，它是在提供线索。{stateTone} {moodTone}",
  "如果梦醒后心里还紧，可以先不解释梦，先照顾感受。{moodTone}",
];

const actionTemplates = [
  "{primaryAction} {stateAdvice} {moodAdvice}",
  "今日先不急着追问结果。{stateAdvice} {primaryAction} {moodAdvice}",
  "{moodAdvice} 随后把注意力放回现实：{primaryAction} {stateAdvice}",
  "先把梦里的感受写下来，再做现实中的一件小事。{primaryAction}",
  "今天宜稳不宜急。{stateAdvice} {moodAdvice}",
  "把目标放小一点，把动作做实一点。{primaryAction}",
  "如果心绪仍乱，先整理桌面或清单，再推进任务。{stateAdvice}",
  "不要用反复担心替代行动。{moodAdvice} {primaryAction}",
  "今天适合完成一件能带来确定感的小事。{stateAdvice}",
  "遇到焦虑时，先停十秒，再决定下一步。{moodAdvice}",
  "把最牵动你的事写成三个待办，先做第一个。{primaryAction}",
  "少开新局，多做收束。{stateAdvice} {primaryAction}",
  "今天适合复盘，不适合冲动承诺。{moodAdvice}",
  "先照顾身体，再处理复杂关系或任务。{stateAdvice}",
  "从一个轻量动作开始，让心回到可掌控的地方。{primaryAction}",
  "如果需要沟通，先写草稿，再开口。{moodAdvice}",
  "给自己一个明确时间段，只处理一件事。{stateAdvice}",
  "把担心从脑中移到纸上，它会更容易被处理。{primaryAction}",
  "今天可以慢一点，但不要完全停住。{moodAdvice}",
  "用一件小事给自己找回秩序感。{stateAdvice} {primaryAction}",
];

const quoteTemplates = [
  ["心有所牵，梦有所映；稳住一念，事自分明。", "此签提醒你先安顿心绪，再处理现实事务。梦中波澜不必被放大，醒后能稳住一念，许多事会慢慢清楚。"],
  ["梦中多波澜，醒后宜安定。", "梦境起伏多半是在释放压力。今天适合少做情绪判断，多做能让自己安稳下来的小行动。"],
  ["路虽未明，步可先稳。", "方向暂时不清时，不必急着看完整条路。先把眼前一步走稳，心里的不安会降低。"],
  ["今日少问结果，多做当下。", "此签重在提醒行动。结果尚未到来时，把注意力放在可执行之事，会比反复推演更有力量。"],
  ["心不追影，梦自成灯。", "梦里的影像只是提醒，不必被它牵着走。你能看见它，就已经多了一分清明。"],
  ["所惧非兆，所见为心。", "害怕的梦并不等于现实会变坏，它更可能是内心在表达压力。醒后先安抚自己，再处理事情。"],
  ["一念归定，万象归位。", "当心绪安定，梦里的复杂象征会慢慢回到它原本的位置。今天宜整理、复盘、少急躁。"],
  ["梦来照影，醒后修心。", "此签适合把梦当作自我观察。它不是定论，而是提醒你照看身体、情绪与行动。"],
  ["水静见月，心定见路。", "若近期心绪浮动，先让自己慢下来。心静一点，方向就会多一点。"],
  ["愿你醒来有光，行处有路。", "这句签语偏向鼓励：不论梦境如何，真正重要的是醒后如何稳稳向前。"],
  ["有失有得，皆可回身整理。", "梦里的得失常关乎安全感。今天适合清点现实事务，也清点自己的感受。"],
  ["云开不在一时，步稳便是好兆。", "不要急着逼自己立刻明朗。能稳定推进，已经是今日很好的提醒。"],
  ["梦不定命，心可定行。", "此签提醒你梦境不是命令。你能选择今天怎么行动，这比解释梦本身更重要。"],
  ["灯照一寸，路明一寸。", "无需一次看清全部。今天只要照亮眼前一步，事情就会更有秩序。"],
  ["风过心湖，静后见底。", "情绪起伏时先别急着判断。等心静一点，你会更知道自己真正担心什么。"],
  ["惊梦非凶，醒念可修。", "梦醒后的不安可以被照顾。先安住，再调整现实安排，就能减少反复担忧。"],
  ["旧事入梦，新日可整。", "梦可能带来旧情绪，但新的一天适合重新整理节奏。你不必停在昨夜画面里。"],
  ["一事一做，一步一安。", "此签适合任务繁多时使用。把事情拆开来做，心会跟着慢慢落地。"],
  ["梦有千象，心守一方。", "画面再多，也可以回到一个核心：今天你最需要照顾的是什么。"],
  ["念起不追，念落不留。", "对梦境保持观察即可，不必追着每个细节解释。让念头自然来去。"],
  ["晨来整衣，夜梦成尘。", "醒来后照顾现实生活，梦里的紧张会慢慢淡去。今天适合收拾与行动。"],
  ["愿从心起，事由手成。", "愿望需要行动承接。梦给你提醒，真正改变来自今天手上的事。"],
  ["月在云中，光未曾失。", "即使暂时迷茫，内在的方向感并没有消失。慢一点，你仍能找到路。"],
  ["所念有声，所行有迹。", "梦把心念变成声音，行动把愿望留下痕迹。今天宜做一件实际的小事。"],
  ["不以梦惊心，以心照梦影。", "不要被梦吓住，反过来用清明的心去看它。你会看见自己的真实牵挂。"],
  ["静处观梦，动处修身。", "安静时观察梦，行动时修正生活。两者相合，心绪会更稳定。"],
  ["梦中有问，醒后有答。", "答案未必立刻出现，但醒后行动会让它慢慢清楚。先从一件小事开始。"],
  ["心若安住，万象不扰。", "此签提醒你先稳住自身。外在画面再多，也不必让它扰乱今天。"],
  ["一夜纷纷，晨起清清。", "夜里梦多，醒后可以清简。今天少安排一点，多完成一点。"],
  ["梦照旧痕，心开新路。", "梦也许触到旧感受，但它也提醒你可以选择新的处理方式。"],
  ["不问吉凶，先问所需。", "与其追问梦好不好，不如问自己现在需要什么支持。这个问题更有用。"],
  ["心有微光，梦不成惧。", "当你能温柔看见自己，梦里的不安就不会继续扩大。"],
  ["象由心起，事在人为。", "传统解梦重在借象观心。现实仍需理性判断和长期行动。"],
  ["今日一稳，明日一明。", "今天稳定一点，明天就可能清楚一点。慢慢来也是进展。"],
  ["莫逐梦影，且护心灯。", "别让梦影牵着你跑。先护住自己的节奏和睡眠。"],
  ["梦里千回，醒来一行。", "梦里绕了很多路，醒来只需做一行清楚的事。"],
  ["情有所归，事有所序。", "让情绪有安放之处，让事情有先后顺序，心就会安下来。"],
  ["云雾会散，步履可依。", "迷雾不会一直在。你可以先依靠脚下可做的事。"],
  ["醒后不急，心中自明。", "梦醒后先不要急着解释。给自己一点时间，心会慢慢给出答案。"],
  ["愿你见梦不惧，见心不逃。", "此签愿你能看见梦，也能看见自己。温柔面对，便已有力量。"],
];

const detailSectionTemplates: DetailTemplate[] = [
  { title: "梦境象征解析", body: "{symbolAnalysis}" },
  { title: "近期心理状态提醒", body: "{stateAdjustment} {emotionHint}" },
  { title: "学业或事业建议", body: "{studyOrWorkAdvice}" },
  { title: "人际关系提醒", body: "{relationshipAdvice}" },
  { title: "今日行动建议", body: "{actionAdvice} {luckySuggestion}" },
  { title: "睡前安稳建议", body: "{sleepAdvice}" },
  { title: "主象与辅象关系", body: "主象「{primary}」更像梦的中心，辅象「{secondary}」让它落到具体处境。两者合看，比单独解释更贴近你的近期状态。" },
  { title: "情绪出口", body: "梦里的强烈画面可能是情绪寻找出口。与其压住它，不如用记录、呼吸和小行动让它慢慢落地。" },
  { title: "现实映照", body: "此梦更适合看作现实压力的映照，不宜当作结果预告。它提醒你检查计划、关系和作息中的可调整之处。" },
  { title: "今日取舍", body: "今天可以少做一点新承诺，多做一点收束。把最牵动你的事情排在前面，其他先放缓。" },
  { title: "身体信号", body: "若近期疲惫或睡眠不稳，梦会更容易变得密集。先照看身体，梦里的紧张也会随之变淡。" },
  { title: "关系边界", body: "若梦里出现他人，可先看见自己的感受，再判断是否需要沟通。不要用梦替别人下结论。" },
  { title: "学习节奏", body: "若此梦关联学习，今天宜复盘、限时训练和整理错题；不宜用长时间刷题掩盖焦虑。" },
  { title: "工作节奏", body: "若此梦关联工作，今天宜明确优先级、确认边界和及时反馈；不宜默默承受所有压力。" },
  { title: "安全感线索", body: "若梦中有丢失、追赶或黑夜，它更像安全感提醒。先找回现实中的掌控点。" },
  { title: "转折提示", body: "若梦中有门、桥、路或车，它可能代表过渡阶段。先选择一个可执行方向，不急着一锤定音。" },
  { title: "自我照看", body: "梦提醒你把注意力收回自己：吃饭、睡眠、桌面、清单，这些小秩序会让心更稳。" },
  { title: "传统解梦视角", body: "借象观心，不以梦定命。梦象可以作为提醒，但现实仍要依靠判断、行动和长期努力。" },
  { title: "明日留白", body: "睡前给明天留一个清楚开头：写下第一件事，醒来后直接做，减少反复犹豫。" },
  { title: "心愿提醒", body: "若这场梦牵动心愿，可以把愿望写下，也要为它配一个现实动作，让愿不止停在心里。" },
];

const fallbackTemplates = [
  "梦境细节较散，像是大脑在整理近期信息。它不必被理解成明确预兆，更适合当作一次心绪记录。",
  "这场梦没有特别突出的固定意象，可能是睡眠中记忆、情绪和日常片段自然交织而成。",
  "梦里画面较分散时，重点不在找唯一答案，而在观察醒来后的感受和近期状态。",
  "此梦更像心里未完全归档的片段。它提醒你温和看见自己，而不是急着判断吉凶。",
  "若梦境难以归类，可以先把最清楚的三处画面写下，过一天再看它们与现实的关系。",
  "散乱的梦常见于信息过载或睡眠较浅时。今天适合减少刺激，让心绪回到简单秩序。",
  "这类梦更像夜间整理，不代表现实会出现对应事件。你可以把它当成一次自我观察。",
  "梦没有清晰主象时，醒后的情绪反而更值得参考。它会告诉你近期更需要哪种照顾。",
  "不必勉强解释每个细节。先照顾身体、睡眠和今日待办，梦里的雾会慢慢散。",
  "梦境零散并不说明没有意义，它可能只是用碎片提醒你：最近需要一点安静和整理。",
];

const categoryTheme: Record<DreamCategory, string> = {
  学业考试类: "考前压力型梦境",
  工作事业类: "现实事务焦虑型梦境",
  家庭亲人类: "关系牵挂型梦境",
  人际关系类: "关系映照型梦境",
  情绪行为类: "情绪释放型梦境",
  水象类: "情绪流动型梦境",
  火象类: "转折变化型梦境",
  土地山路类: "方向迷茫型梦境",
  动物类: "安全感提醒型梦境",
  身体健康类: "自我修复型梦境",
  建筑空间类: "自我修复型梦境",
  交通出行类: "方向迷茫型梦境",
  财物物品类: "安全感提醒型梦境",
  自然天象类: "心绪整理型梦境",
  灵性传统类: "转折变化型梦境",
  颜色数字类: "心绪整理型梦境",
  丢失获得类: "安全感提醒型梦境",
  学业祈福强相关类: "考前压力型梦境",
};

const normalize = (text: string) => text.trim().toLowerCase();

const hashText = (text: string): number =>
  Array.from(text).reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 17), 0);

const pick = <T,>(items: T[], seed: number): T => items[Math.abs(seed) % items.length] ?? items[0];

const fill = (template: string, replacements: Record<string, string>) =>
  Object.entries(replacements).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template,
  );

const trimToLength = (text: string, max = 118) => {
  if (Array.from(text).length <= max) {
    return text;
  }
  return `${Array.from(text).slice(0, max - 1).join("")}。`;
};

const matchDreamKeywords = (dreamText: string): DreamMatch[] => {
  const normalizedText = normalize(dreamText);
  const strongestByKeyword = new Map<string, DreamMatch>();

  dreamDictionary.forEach((item) => {
    const terms = [item.keyword, ...item.aliases]
      .map((term) => normalize(term))
      .filter((term) => term.length > 0);
    const matchedTerm = terms.find((term) => normalizedText.includes(term));

    if (!matchedTerm) {
      return;
    }

    const exactBonus = matchedTerm === normalize(item.keyword) ? 1.2 : 0.7;
    const lengthBonus = Math.min(matchedTerm.length / 8, 1.5);
    const score = item.weight + exactBonus + lengthBonus;
    const existing = strongestByKeyword.get(item.keyword);

    if (!existing || score > existing.score) {
      strongestByKeyword.set(item.keyword, { item, matchedTerm, score });
    }
  });

  return Array.from(strongestByKeyword.values())
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);
};

const hasAny = (matches: DreamMatch[], words: string[]) =>
  matches.some((match) => words.includes(match.item.keyword));

const hasCategory = (matches: DreamMatch[], categories: DreamCategory[]) =>
  matches.some((match) => categories.includes(match.item.category));

const buildTheme = (matches: DreamMatch[]): string => {
  if (
    hasAny(matches, ["考试", "考场", "高考", "中考", "考研", "考公"]) &&
    hasAny(matches, ["写不完", "不会做题", "老师", "试卷", "迟到"])
  ) {
    return "考前压力型梦境";
  }
  if (hasAny(matches, ["水", "河", "海", "洪水", "暴雨"]) && hasAny(matches, ["迷路", "黑夜"])) {
    return "方向迷茫型梦境";
  }
  if (hasAny(matches, ["家人", "父亲", "母亲", "回家", "老家"]) && hasAny(matches, ["争吵", "失散", "寻找家人"])) {
    return "关系牵挂型梦境";
  }
  if (hasAny(matches, ["钱", "钱包", "手机", "银行卡"]) && hasAny(matches, ["丢东西", "丢了", "被偷", "找不到"])) {
    return "现实事务焦虑型梦境";
  }
  if (hasAny(matches, ["追赶", "逃跑", "躲藏"]) && hasAny(matches, ["蛇", "狗", "陌生人", "黑夜"])) {
    return "安全感提醒型梦境";
  }
  if (hasAny(matches, ["火灾", "着火", "爆炸", "洪水", "溺水"])) {
    return "情绪释放型梦境";
  }
  if (hasCategory(matches, ["灵性传统类"]) && hasCategory(matches, ["家庭亲人类", "情绪行为类"])) {
    return "转折变化型梦境";
  }
  return matches[0] ? categoryTheme[matches[0].item.category] : "心绪整理型梦境";
};

const getMoodHint = (item: DreamKeywordItem, mood: DreamInput["wakeMood"]) => {
  if (negativeMoods.includes(mood)) {
    return item.negativeHint;
  }
  if (positiveMoods.includes(mood)) {
    return item.positiveHint;
  }
  return item.emotionHint;
};

const buildStudyOrWorkAdvice = (input: DreamInput, matches: DreamMatch[]) => {
  if (input.recentState === "学习压力" || hasCategory(matches, ["学业考试类", "学业祈福强相关类"])) {
    return "学习上适合先复盘一个模块，再做一组限时训练，最后整理三条易错原因。不要用焦虑替代学习，也不要熬夜硬撑。";
  }
  if (input.recentState === "工作压力" || hasCategory(matches, ["工作事业类"])) {
    return "工作上适合先明确优先级，把需要确认的事项一次说清。遇到反馈时先记录要点，再决定下一步，不必马上自我否定。";
  }
  return "今天适合选择一件可完成的小任务，用行动替代反复推演。若没有紧急任务，可以做一次轻量复盘，让节奏重新归位。";
};

const buildRelationshipAdvice = (input: DreamInput, matches: DreamMatch[]) => {
  if (input.recentState === "家人牵挂" || hasCategory(matches, ["家庭亲人类"])) {
    return "家庭关系上，可以表达关心，也要减少自责。若有牵挂，不妨发一句问候，把担心化成温和行动。";
  }
  if (input.recentState === "人际关系" || hasCategory(matches, ["人际关系类"])) {
    return "人际关系上，先分清事实和猜测。需要沟通时，表达自己的真实感受即可，不要过度解读他人的每个反应。";
  }
  return "若梦里出现他人，他们更像关系感受的投影。今天不必用梦替别人下结论，先照顾自己的边界和感受。";
};

const buildLuckySuggestion = (primary: DreamKeywordItem | null, input: DreamInput) => {
  if (input.recentState === "学习压力") return "今日宜复盘错题、早睡收心。";
  if (input.recentState === "工作压力") return "今日宜整理优先级、清楚沟通。";
  if (input.recentState === "情绪焦虑") return "今日宜静心呼吸、少刷信息。";
  if (input.recentState === "睡眠不稳") return "今日宜早睡、睡前远离手机。";
  if (input.recentState === "人际关系") return "今日宜温和表达、保留边界。";
  if (input.recentState === "家人牵挂") return "今日宜问候家人、减少自责。";
  if (input.recentState === "财务担忧") return "今日宜记录支出、稳住安排。";
  return primary?.luckySuggestion ?? "今日宜整理、静心、稳步行动。";
};

const buildDetailAnalysis = (replacements: Record<string, string>, seed: number) => {
  const required = detailSectionTemplates.slice(0, 6);
  const extraPool = detailSectionTemplates.slice(6);
  const extra = pick(extraPool, seed);
  return [...required, extra].map((section) => `${section.title}：${fill(section.body, replacements)}`);
};

const buildFallbackInterpretation = (input: DreamInput, seed: number): DreamInterpretation => {
  const mood = moodModifiers[input.wakeMood];
  const state = stateModifiers[input.recentState];
  const quote = pick(quoteTemplates, seed);
  const fallback = pick(fallbackTemplates, seed >>> 2);
  const luckySuggestion = buildLuckySuggestion(null, input);
  const summary = trimToLength(`${fallback} ${state.tone} ${mood.tone} 今天更适合从一件确定的小事开始，让心绪慢慢归位。`);
  const actionAdvice = `${state.advice} ${mood.advice}`;
  const symbolAnalysis = "梦境细节较散，可以理解为近期信息、感受与睡眠状态在夜间自然整理。重点不是找唯一答案，而是观察醒来后的情绪和现实中最牵动你的事。";
  const stateAdjustment = `${state.tone} ${state.detail}`;
  const emotionHint = `${mood.tone} ${mood.detail}`;
  const studyOrWorkAdvice = buildStudyOrWorkAdvice(input, []);
  const relationshipAdvice = buildRelationshipAdvice(input, []);
  const sleepAdvice = "睡前减少信息刺激，把明天第一件事写下来，再做三次缓慢呼吸。若近期睡眠持续不稳，优先照顾作息。";
  const replacements = {
    symbolAnalysis,
    stateAdjustment,
    emotionHint,
    studyOrWorkAdvice,
    relationshipAdvice,
    actionAdvice,
    luckySuggestion,
    sleepAdvice,
    primary: "心绪",
    secondary: "梦境氛围",
  };

  return {
    theme: "心绪整理型梦境",
    matchedKeywords: ["心绪", "提醒"],
    summary,
    symbolAnalysis,
    emotionHint,
    stateAdjustment,
    actionAdvice,
    studyOrWorkAdvice,
    relationshipAdvice,
    sleepAdvice,
    dreamQuote: quote[0],
    quoteExplanation: quote[1],
    luckySuggestion,
    detailAnalysis: buildDetailAnalysis(replacements, seed),
    createdAt: new Date().toISOString(),
  };
};

export const generateDreamInterpretation = (input: DreamInput): DreamInterpretation => {
  const normalizedText = input.dreamText.trim();
  const todayKey = new Date().toISOString().slice(0, 10);
  const seed = hashText(`${normalizedText}-${input.recentState}-${input.wakeMood}-${todayKey}-${Date.now()}`);
  const matches = matchDreamKeywords(normalizedText);

  if (matches.length === 0) {
    return buildFallbackInterpretation(input, seed);
  }

  const primary = matches[0].item;
  const secondaryText = matches.length > 1 ? matches.slice(1).map((match) => match.item.keyword).join("、") : "梦中的氛围";
  const theme = buildTheme(matches);
  const mood = moodModifiers[input.wakeMood];
  const state = stateModifiers[input.recentState];
  const quote = pick(quoteTemplates, seed >>> 3);
  const summary = trimToLength(
    fill(pick(summaryTemplates, seed), {
      primary: primary.keyword,
      secondary: secondaryText,
    }),
  );
  const symbolAnalysis = matches
    .map((match) => `「${match.item.keyword}」${match.item.symbolMeaning}${getMoodHint(match.item, input.wakeMood)}`)
    .join(" ");
  const emotionHint = fill(pick(emotionTemplates, seed >>> 4), {
    primary: primary.keyword,
    primaryHint: primary.emotionHint,
    moodTone: mood.tone,
    stateTone: state.tone,
  });
  const stateAdjustment = `${state.tone} ${state.detail}`;
  const actionAdvice = fill(pick(actionTemplates, seed >>> 5), {
    primaryAction: primary.actionAdvice,
    stateAdvice: state.advice,
    moodAdvice: mood.advice,
  });
  const studyOrWorkAdvice = buildStudyOrWorkAdvice(input, matches);
  const relationshipAdvice = buildRelationshipAdvice(input, matches);
  const sleepAdvice = input.recentState === "睡眠不稳"
    ? "今晚请把睡眠放在前面：提前半小时放下手机，降低灯光，给身体一个固定的入睡信号。"
    : "睡前减少刷手机，把明天第一件事写下来，再做三次缓慢呼吸，让梦里的余波慢慢退下。";
  const luckySuggestion = buildLuckySuggestion(primary, input);
  const replacements = {
    symbolAnalysis,
    stateAdjustment,
    emotionHint,
    studyOrWorkAdvice,
    relationshipAdvice,
    actionAdvice,
    luckySuggestion,
    sleepAdvice,
    primary: primary.keyword,
    secondary: secondaryText,
  };

  return {
    theme,
    matchedKeywords: matches.map((match) => match.item.keyword),
    summary,
    symbolAnalysis,
    emotionHint,
    stateAdjustment,
    actionAdvice,
    studyOrWorkAdvice,
    relationshipAdvice,
    sleepAdvice,
    dreamQuote: quote[0],
    quoteExplanation: quote[1],
    luckySuggestion,
    detailAnalysis: buildDetailAnalysis(replacements, seed),
    createdAt: new Date().toISOString(),
  };
};

export const generateDreamInterpretationByApi = async (
  input: DreamInput,
): Promise<DreamInterpretation> => {
  // 后续可把 dreamText、recentState、wakeMood 发给后端 /api/dream-interpret，
  // 由后端调用 AI 模型返回与 DreamInterpretation 同结构的 JSON。
  return generateDreamInterpretation(input);
};
