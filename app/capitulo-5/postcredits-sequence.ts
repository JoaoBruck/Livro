export const IMPACT_MS = 3200;
export const BROADCAST_MS = 5600;

type InterviewBeat = {
  speaker: "Repórter" | "Vicente" | null;
  text: string;
  duration: number;
  frame: number;
  speakingFrame?: number;
  description?: string;
};

// The public account repeats Vicente's private logic: care is a debt, and
// answering for what he did becomes an injury being done to him.
export const INTERVIEW: readonly InterviewBeat[] = [
  {
    speaker: "Repórter",
    text: "Senhor Vicente, Derick diz que foi o senhor quem trancou a porta do galpão. O senhor confirma?",
    duration: 9000, frame: 0,
  },
  {
    speaker: "Vicente",
    text: "O Derick precisa se recuperar. Eu conheço aquele menino desde pequeno. Não é justo ficarem fazendo ele passar por isso de novo.",
    duration: 11500, frame: 0, speakingFrame: 1,
  },
  {
    speaker: "Repórter",
    text: "Eu estou perguntando sobre a porta, senhor Vicente.",
    duration: 5000, frame: 0,
  },
  {
    speaker: "Vicente",
    text: "E eu estou tentando explicar. O Leroy vinha me procurar pra tudo. Foi o que ele fez naquela noite.",
    duration: 9500, frame: 0, speakingFrame: 1,
  },
  {
    speaker: "Vicente", text: "O Leroy…",
    duration: 2800, frame: 3,
  },
  {
    speaker: null, text: "", description: "Vicente leva a mão aos óculos. Depois cobre o rosto.",
    duration: 4400, frame: 4,
  },
  {
    speaker: "Vicente", text: "Era como um filho pra mim.",
    duration: 5700, frame: 6, speakingFrame: 7,
  },
  {
    speaker: "Repórter", text: "Por que o senhor não abriu?",
    duration: 4800, frame: 6,
  },
  {
    speaker: "Vicente",
    text: "Meu advogado vai falar sobre isso. Eu não tenho condição de continuar.",
    duration: 7500, frame: 6, speakingFrame: 7,
  },
  {
    speaker: "Vicente",
    text: "Passei a vida cuidando deles. Agora vocês olham pra mim desse jeito.",
    duration: 8500, frame: 6, speakingFrame: 7,
  },
  {
    speaker: null, text: "", description: "Vicente baixa as mãos e desvia os olhos da câmera. A transmissão termina.",
    duration: 4000, frame: 8,
  },
];

export const BEAT_STARTS = INTERVIEW.reduce<number[]>((starts, beat, index) => {
  starts.push(index === 0 ? BROADCAST_MS : starts[index - 1] + INTERVIEW[index - 1].duration);
  return starts;
}, []);
export const END_MS = BEAT_STARTS[BEAT_STARTS.length - 1] + INTERVIEW[INTERVIEW.length - 1].duration;

export function getInterviewMoment(elapsed: number, reducedMotion = false) {
  const phase = elapsed < 4000 ? "fall" : elapsed < 4400 ? "settle"
    : elapsed < BROADCAST_MS ? "boot" : elapsed < END_MS ? "interview" : "ended";
  let beatIndex = -1;
  for (let index = 0; index < BEAT_STARTS.length && BEAT_STARTS[index] <= elapsed; index++) beatIndex = index;
  const beat = INTERVIEW[beatIndex];
  const localTime = beatIndex < 0 ? 0 : elapsed - BEAT_STARTS[beatIndex];
  let frame = beat?.frame ?? 0;
  if (!reducedMotion && phase === "interview") {
    if (beatIndex === 5 && localTime >= 1600) frame = 5;
    // The same syllable cues drive the portrait and sound, even when muted.
    let syllable: SoundCue | undefined;
    for (let index = SOUND_CUES.length - 1; index >= 0; index--) {
      if (SOUND_CUES[index].at <= elapsed && SOUND_CUES[index].sound === "vicente") {
        syllable = SOUND_CUES[index]; break;
      }
    }
    if (beat?.speakingFrame !== undefined && syllable && elapsed - syllable.at < 100) {
      frame = beat.speakingFrame;
    }
  }
  return { phase, beatIndex, frame } as const;
}

export function nextInterviewPosition(elapsed: number) {
  return BEAT_STARTS.find((start, index) => start > elapsed + 1 && INTERVIEW[index].speaker) ?? END_MS;
}

/** One active-time clock drives both motion and captions. Hidden time is never counted. */
export class InterviewClock {
  elapsed = 0;
  private previous: number | null = null;

  tick(now: number) {
    if (this.previous !== null) this.elapsed = Math.min(END_MS, this.elapsed + Math.max(0, now - this.previous));
    this.previous = now;
    return this.elapsed;
  }

  pause() { this.previous = null; }

  seek(elapsed: number) {
    this.elapsed = Math.min(END_MS, Math.max(0, elapsed));
    this.previous = null;
    return this.elapsed;
  }
}

export type SoundCue = { at: number; sound: "vicente" | "reporter" | "tv-impact" | "tv-on"; rate: number; gain: number };

/** Punctuation gives the blips room to breathe; the silent poses have no voice. */
export function createSoundCues(): SoundCue[] {
  const cues: SoundCue[] = [
    { at: IMPACT_MS, sound: "tv-impact", rate: 1, gain: .78 },
    { at: 4440, sound: "tv-on", rate: 1, gain: .55 },
  ];
  INTERVIEW.forEach((beat, beatIndex) => {
    if (!beat.speaker) return;
    const points: { time: number; pitch: number }[] = [];
    let time = 350;
    for (const word of beat.text.split(/\s+/u)) {
      const syllables = word.match(/[aeiouáéíóúâêôãõü]+/giu) ?? [word];
      syllables.forEach((syllable, index) => {
        points.push({ time, pitch: .965 + ((syllable.codePointAt(0)! + index) % 7) * .012 });
        time += 110;
      });
      time += /[.!?…]$/u.test(word) ? 430 : /[,;:]$/u.test(word) ? 240 : 55;
    }
    const scale = Math.min(1.65, (beat.duration - 1400) / Math.max(time, 1));
    for (const point of points) cues.push({
      at: BEAT_STARTS[beatIndex] + point.time * scale,
      sound: beat.speaker === "Vicente" ? "vicente" : "reporter",
      rate: point.pitch * (beatIndex >= 4 && beat.speaker === "Vicente" ? .94 : 1),
      gain: beat.speaker === "Vicente" ? .28 : .22,
    });
  });
  return cues.sort((a, b) => a.at - b.at);
}

export const SOUND_CUES = createSoundCues();

export function cuesBetween(from: number, to: number) {
  // Never burst through missed words after a seek, tab switch or a stalled frame.
  if (to < from || to - from > 160) return [];
  return SOUND_CUES.filter(cue => cue.at > from && cue.at <= to);
}
