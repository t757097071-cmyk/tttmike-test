interface AmbientController {
  stop: () => void;
}

interface OscillatorPack {
  oscillator: OscillatorNode;
  gain: GainNode;
}

interface ScheduledSource {
  stop: (when?: number) => void;
}

interface CompositionProfile {
  root: number;
  scale: number[];
  melody: number[];
  bass: number[];
  rhythm: number[];
  tempo: number;
  wave: OscillatorType;
  accentWave: OscillatorType;
  filter: number;
  delay: number;
  padGain: number;
  melodyGain: number;
  bellGain: number;
}

interface AudioWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

const AudioContextClass =
  typeof window !== "undefined"
    ? window.AudioContext || (window as AudioWindow).webkitAudioContext
    : undefined;

let sharedContext: AudioContext | null = null;

const getAudioContext = async (): Promise<AudioContext | null> => {
  if (!AudioContextClass) {
    return null;
  }

  sharedContext = sharedContext ?? new AudioContextClass();

  if (sharedContext.state === "suspended") {
    await sharedContext.resume();
  }

  return sharedContext;
};

export const playWoodfishFallback = async (): Promise<void> => {
  const context = await getAudioContext();
  if (!context) {
    return;
  }

  const now = context.currentTime;
  const master = context.createGain();
  const lowpass = context.createBiquadFilter();
  const knockFilter = context.createBiquadFilter();
  const cavityOne = context.createBiquadFilter();
  const cavityTwo = context.createBiquadFilter();
  const noiseGain = context.createGain();
  const cavityGain = context.createGain();
  const cavityOsc = context.createOscillator();
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.08), context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < data.length; index += 1) {
    const envelope = 1 - index / data.length;
    data[index] = (Math.random() * 2 - 1) * envelope;
  }

  const noise = context.createBufferSource();
  noise.buffer = buffer;

  lowpass.type = "lowpass";
  lowpass.frequency.setValueAtTime(1800, now);

  knockFilter.type = "bandpass";
  knockFilter.frequency.setValueAtTime(760, now);
  knockFilter.Q.setValueAtTime(9, now);

  cavityOne.type = "peaking";
  cavityOne.frequency.setValueAtTime(238, now);
  cavityOne.Q.setValueAtTime(12, now);
  cavityOne.gain.setValueAtTime(11, now);

  cavityTwo.type = "peaking";
  cavityTwo.frequency.setValueAtTime(462, now);
  cavityTwo.Q.setValueAtTime(10, now);
  cavityTwo.gain.setValueAtTime(7, now);

  cavityOsc.type = "triangle";
  cavityOsc.frequency.setValueAtTime(218, now);
  cavityOsc.frequency.exponentialRampToValueAtTime(132, now + 0.16);

  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.9, now + 0.004);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

  cavityGain.gain.setValueAtTime(0.0001, now);
  cavityGain.gain.exponentialRampToValueAtTime(0.28, now + 0.008);
  cavityGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

  master.gain.setValueAtTime(0.92, now);

  noise.connect(lowpass);
  lowpass.connect(knockFilter);
  knockFilter.connect(cavityOne);
  cavityOne.connect(cavityTwo);
  cavityTwo.connect(noiseGain);
  noiseGain.connect(master);

  cavityOsc.connect(cavityGain);
  cavityGain.connect(master);
  master.connect(context.destination);

  noise.start(now);
  cavityOsc.start(now);
  noise.stop(now + 0.1);
  cavityOsc.stop(now + 0.34);
};

export const playDrawShakeSound = async (): Promise<void> => {
  const context = await getAudioContext();
  if (!context) {
    return;
  }

  const now = context.currentTime;
  for (let index = 0; index < 6; index += 1) {
    const time = now + index * 0.14;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(420 + index * 18, time);
    osc.frequency.exponentialRampToValueAtTime(220, time + 0.08);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.11, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(time);
    osc.stop(time + 0.12);
  }
};

export const playDrawRevealSound = async (): Promise<void> => {
  const context = await getAudioContext();
  if (!context) {
    return;
  }

  const now = context.currentTime;
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((frequency, index) => {
    const time = now + index * 0.16;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.12, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.9);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(time);
    osc.stop(time + 1);
  });
};

export const playWishPowerRitualSound = async (): Promise<void> => {
  const context = await getAudioContext();
  if (!context) {
    return;
  }

  const now = context.currentTime;
  [392, 523.25, 659.25, 783.99].forEach((frequency, index) => {
    const time = now + index * 0.12;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = index === 0 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(frequency, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.1, time + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.75);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(time);
    osc.stop(time + 0.82);
  });
};

const parseDurationSeconds = (duration: string): number => {
  const [minutesText, secondsText] = duration.split(":");
  const minutes = Number.parseInt(minutesText ?? "0", 10);
  const seconds = Number.parseInt(secondsText ?? "0", 10);
  return Math.max(30, (Number.isFinite(minutes) ? minutes : 0) * 60 + (Number.isFinite(seconds) ? seconds : 0));
};

const createOscillator = (
  context: AudioContext,
  frequency: number,
  type: OscillatorType,
  gainValue: number,
): OscillatorPack => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = gainValue;
  oscillator.connect(gain);
  return { oscillator, gain };
};

const compositionProfiles: Record<string, CompositionProfile> = {
  "松风入阁": {
    root: 146.83,
    scale: [0, 2, 5, 7, 9, 12],
    melody: [0, 5, 7, 9, 7, 5, 2, 0, -5, 0, 2, 5],
    bass: [0, -5, 0, -7],
    rhythm: [1.2, 0.8, 1.6, 1, 1.4, 0.9],
    tempo: 1.08,
    wave: "sine",
    accentWave: "triangle",
    filter: 1450,
    delay: 0.52,
    padGain: 0.032,
    melodyGain: 0.05,
    bellGain: 0.026,
  },
  "月下心灯": {
    root: 130.81,
    scale: [0, 3, 5, 7, 10, 12],
    melody: [7, 10, 12, 10, 7, 5, 3, 5, 7, 3, 0],
    bass: [0, -7, -5, -7],
    rhythm: [1.5, 1.2, 1.8, 1.1],
    tempo: 1.18,
    wave: "sine",
    accentWave: "sine",
    filter: 1250,
    delay: 0.62,
    padGain: 0.036,
    melodyGain: 0.044,
    bellGain: 0.034,
  },
  "莲台清音": {
    root: 164.81,
    scale: [0, 2, 4, 7, 9, 12],
    melody: [0, 4, 7, 12, 9, 7, 4, 2, 4, 7, 9],
    bass: [0, -5, -8, -5],
    rhythm: [0.9, 0.9, 1.4, 1.8, 1],
    tempo: 1.04,
    wave: "triangle",
    accentWave: "sine",
    filter: 1680,
    delay: 0.44,
    padGain: 0.028,
    melodyGain: 0.052,
    bellGain: 0.03,
  },
  "雨落青瓦": {
    root: 123.47,
    scale: [0, 2, 3, 7, 9, 12],
    melody: [12, 9, 7, 3, 2, 0, 2, 3, 7, 3, 2],
    bass: [0, -5, -3, -7],
    rhythm: [0.7, 0.7, 1.1, 0.8, 1.6],
    tempo: 0.98,
    wave: "sine",
    accentWave: "triangle",
    filter: 1120,
    delay: 0.36,
    padGain: 0.03,
    melodyGain: 0.04,
    bellGain: 0.018,
  },
  "晨钟初响": {
    root: 174.61,
    scale: [0, 2, 5, 7, 9, 12],
    melody: [0, 7, 12, 14, 12, 9, 7, 5, 7, 12],
    bass: [0, -5, 0, -7],
    rhythm: [1.1, 1.1, 1.1, 1.8],
    tempo: 0.92,
    wave: "triangle",
    accentWave: "sine",
    filter: 1780,
    delay: 0.5,
    padGain: 0.026,
    melodyGain: 0.058,
    bellGain: 0.044,
  },
  "静水微澜": {
    root: 110,
    scale: [0, 2, 5, 7, 10, 12],
    melody: [0, 2, 5, 2, 0, -2, 0, 5, 7, 5, 2],
    bass: [0, -7, -5, -7],
    rhythm: [1.8, 1.2, 1.6, 1.2],
    tempo: 1.26,
    wave: "sine",
    accentWave: "sine",
    filter: 1020,
    delay: 0.68,
    padGain: 0.042,
    melodyGain: 0.035,
    bellGain: 0.018,
  },
  "香雾微起": {
    root: 138.59,
    scale: [0, 3, 5, 7, 10, 12],
    melody: [0, 3, 7, 10, 7, 3, 5, 7, 10, 12],
    bass: [0, -5, -7, -10],
    rhythm: [1.4, 1.4, 0.9, 1.7, 1.2],
    tempo: 1.14,
    wave: "sine",
    accentWave: "triangle",
    filter: 1360,
    delay: 0.58,
    padGain: 0.038,
    melodyGain: 0.04,
    bellGain: 0.026,
  },
  "夜灯微明": {
    root: 116.54,
    scale: [0, 3, 5, 8, 10, 12],
    melody: [10, 8, 5, 3, 0, 3, 5, 8, 5, 3, 0],
    bass: [0, -5, -8, -5],
    rhythm: [1.8, 1.8, 1.2, 2],
    tempo: 1.34,
    wave: "sine",
    accentWave: "sine",
    filter: 980,
    delay: 0.72,
    padGain: 0.044,
    melodyGain: 0.032,
    bellGain: 0.018,
  },
  "清风过竹": {
    root: 196,
    scale: [0, 2, 4, 7, 9, 12],
    melody: [0, 2, 4, 7, 4, 2, 0, 7, 9, 12, 9],
    bass: [0, -5, 0, -7],
    rhythm: [0.8, 0.8, 1.1, 0.8, 1.5],
    tempo: 0.88,
    wave: "triangle",
    accentWave: "sine",
    filter: 1900,
    delay: 0.34,
    padGain: 0.024,
    melodyGain: 0.056,
    bellGain: 0.026,
  },
  "古寺晚钟": {
    root: 98,
    scale: [0, 2, 5, 7, 10, 12],
    melody: [0, 7, 10, 12, 10, 7, 5, 2, 0],
    bass: [0, -12, -7, -5],
    rhythm: [2, 1.4, 1.8, 2.2],
    tempo: 1.32,
    wave: "sine",
    accentWave: "sine",
    filter: 920,
    delay: 0.82,
    padGain: 0.046,
    melodyGain: 0.036,
    bellGain: 0.052,
  },
  "心境清明": {
    root: 174.61,
    scale: [0, 2, 4, 7, 9, 12],
    melody: [0, 4, 7, 9, 12, 9, 7, 4, 2, 4, 7, 12],
    bass: [0, -5, -7, -5],
    rhythm: [0.75, 0.75, 1, 0.75, 1.2],
    tempo: 0.86,
    wave: "triangle",
    accentWave: "sine",
    filter: 1850,
    delay: 0.42,
    padGain: 0.024,
    melodyGain: 0.055,
    bellGain: 0.03,
  },
  "归心": {
    root: 130.81,
    scale: [0, 2, 5, 7, 10, 12],
    melody: [7, 5, 2, 0, -5, 0, 2, 5, 7, 5, 0],
    bass: [0, -7, -5, -7],
    rhythm: [1.6, 1.2, 1.6, 1.2, 2],
    tempo: 1.22,
    wave: "sine",
    accentWave: "triangle",
    filter: 1200,
    delay: 0.6,
    padGain: 0.04,
    melodyGain: 0.038,
    bellGain: 0.022,
  },
};

const defaultProfile = compositionProfiles["松风入阁"];

const frequencyFromStep = (root: number, step: number, octaveOffset = 0): number =>
  root * 2 ** ((step + octaveOffset * 12) / 12);

const scheduleTone = (
  context: AudioContext,
  sources: ScheduledSource[],
  destination: AudioNode,
  frequency: number,
  start: number,
  length: number,
  gainValue: number,
  type: OscillatorType,
  filterFrequency: number,
) => {
  const osc = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  filter.type = "lowpass";
  filter.frequency.value = filterFrequency;
  filter.Q.value = 0.7;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + Math.max(0.28, length));
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  osc.start(start);
  osc.stop(start + length + 0.08);
  sources.push(osc);
};

export const startAmbientFallback = async (
  title: string,
  duration: string,
  onEnded: () => void,
): Promise<AmbientController | null> => {
  const context = await getAudioContext();
  if (!context) {
    return null;
  }

  const seed = Array.from(title).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const profile = compositionProfiles[title] ?? defaultProfile;
  const now = context.currentTime;
  const master = context.createGain();
  const filter = context.createBiquadFilter();
  const delay = context.createDelay();
  const delayGain = context.createGain();
  const lfo = context.createOscillator();
  const lfoGain = context.createGain();
  const sources: ScheduledSource[] = [];

  const baseFrequency = profile.root;
  const upperFrequency = frequencyFromStep(profile.root, profile.scale[2] ?? 5);
  const highFrequency = frequencyFromStep(profile.root, profile.scale[4] ?? 9, 1);

  const low = createOscillator(context, baseFrequency, "sine", profile.padGain);
  const upper = createOscillator(context, upperFrequency, "triangle", profile.padGain * 0.46);
  const shimmer = createOscillator(context, highFrequency, "sine", profile.padGain * 0.2);

  filter.type = "lowpass";
  filter.frequency.value = profile.filter;
  filter.Q.value = 0.8;
  delay.delayTime.value = profile.delay;
  delayGain.gain.value = 0.16;

  lfo.type = "sine";
  lfo.frequency.value = 0.07 + (seed % 5) * 0.01;
  lfoGain.gain.value = 0.018;
  lfo.connect(lfoGain);
  lfoGain.connect(master.gain);

  master.gain.setValueAtTime(0.0001, now);
  master.gain.linearRampToValueAtTime(0.55, now + 1.4);

  [low, upper, shimmer].forEach((pack) => pack.gain.connect(filter));
  filter.connect(master);
  filter.connect(delay);
  delay.connect(delayGain);
  delayGain.connect(master);
  master.connect(context.destination);

  [low, upper, shimmer].forEach((pack) => {
    pack.oscillator.start(now);
    sources.push(pack.oscillator);
  });
  lfo.start(now);
  sources.push(lfo);

  const totalSeconds = parseDurationSeconds(duration);
  let cursor = now + 0.8;
  let index = 0;
  while (cursor < now + totalSeconds - 1) {
    const step = profile.melody[index % profile.melody.length] ?? 0;
    const rhythm = profile.rhythm[index % profile.rhythm.length] ?? 1.2;
    const length = rhythm * profile.tempo * 1.05;
    const frequency = frequencyFromStep(profile.root, step);
    scheduleTone(
      context,
      sources,
      filter,
      frequency,
      cursor,
      length,
      index % 5 === 0 ? profile.melodyGain * 1.15 : profile.melodyGain,
      profile.wave,
      profile.filter + 320,
    );

    if (index % 2 === 0) {
      const harmonyStep = step - 12 + (profile.scale[2] ?? 5);
      scheduleTone(
        context,
        sources,
        filter,
        frequencyFromStep(profile.root, harmonyStep),
        cursor + 0.04,
        length * 1.15,
        profile.melodyGain * 0.28,
        "sine",
        profile.filter,
      );
    }

    if (index % 4 === 0) {
      const bassStep = profile.bass[Math.floor(index / 4) % profile.bass.length] ?? 0;
      scheduleTone(
        context,
        sources,
        filter,
        frequencyFromStep(profile.root, bassStep),
        cursor,
        rhythm * profile.tempo * 3,
        profile.padGain * 0.7,
        "sine",
        780,
      );
    }

    if (index % 6 === seed % 4) {
      scheduleTone(
        context,
        sources,
        filter,
        frequency * 2.01,
        cursor + length * 0.42,
        2.1,
        profile.bellGain,
        profile.accentWave,
        2400,
      );
    }

    cursor += rhythm * profile.tempo;
    index += 1;
  }

  const timeout = window.setTimeout(() => {
    controller.stop();
    onEnded();
  }, parseDurationSeconds(duration) * 1000);

  let stopped = false;
  const controller: AmbientController = {
    stop: () => {
      if (stopped) {
        return;
      }

      stopped = true;
      window.clearTimeout(timeout);
      const stopAt = context.currentTime + 0.35;
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setValueAtTime(master.gain.value, context.currentTime);
      master.gain.linearRampToValueAtTime(0.0001, stopAt);
      sources.forEach((source) => {
        try {
          source.stop(stopAt + 0.02);
        } catch {
          // Already stopped scheduled notes can be ignored.
        }
      });
    },
  };

  return controller;
};
