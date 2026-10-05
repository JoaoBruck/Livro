export const IMPACT_MS = 3200;
export const BROADCAST_MS = 5600;

type PortraitFrame = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type Delivery = "steady" | "firm" | "hesitant" | "broken";
type PortraitPose = { frame: PortraitFrame; speakingFrame?: PortraitFrame };
type InterviewBeat = PortraitPose & {
  id: string;
  speaker: "Entrevistador" | "Vicente" | null;
  text: string;
  duration: number;
  delivery?: Delivery;
  crying?: number;
  poses?: readonly (PortraitPose & { at: number })[];
  description?: string;
};

// Sheet: 0/1 composed, 2 raised hand, 3 lowered head, 4 wiping an eye,
// 5 face covered, 6/7 tearful, 8 looking aside. Pose changes are held gestures;
// only matched closed/open-mouth pairs alternate with the voice cues.
// This is Vicente's public account, not the narrator's account of the fire.
export const INTERVIEW: readonly InterviewBeat[] = [
  {
    id: "opening", speaker: "Entrevistador",
    text: "Senhor Vicente, o senhor estava na casa antes do incêndio. Como responde às acusações?",
    duration: 6500, frame: 0,
  },
  {
    id: "kaio-account", speaker: "Vicente",
    text: "Isso é um absurdo. Eu fui avisar o Kaio. Quando vi a fumaça, tentei voltar.",
    duration: 6500, frame: 2, delivery: "firm",
    poses: [{ at: 1800, frame: 0, speakingFrame: 1 }],
  },
  {
    id: "brothers-question", speaker: "Entrevistador",
    text: "O senhor chegou a ver Leroy ou Derick?",
    duration: 4000, frame: 0,
  },
  {
    id: "hesitation", speaker: "Vicente", text: "Eu…",
    duration: 1600, frame: 0, speakingFrame: 1, delivery: "hesitant",
  },
  {
    id: "leroy-name", speaker: "Vicente", text: "Leroy…",
    duration: 2200, frame: 3, delivery: "broken", crying: .6,
  },
  {
    id: "covering-face", speaker: null, text: "",
    description: "Ele abaixa a cabeça. Passa a mão pelos olhos e cobre o rosto.",
    duration: 2400, frame: 4, crying: 1,
    poses: [{ at: 1200, frame: 5 }],
  },
  {
    id: "apology", speaker: "Vicente", text: "Desculpa.",
    duration: 1800, frame: 5, delivery: "broken", crying: 1,
  },
  {
    id: "silence", speaker: null, text: "",
    description: "Vicente baixa as mãos. Respira antes de continuar.",
    duration: 1700, frame: 5, crying: .85,
    poses: [{ at: 800, frame: 6 }],
  },
  {
    id: "like-a-son", speaker: "Vicente",
    text: "O Leroy era como um filho. Eu vi aquele menino crescer.",
    duration: 6200, frame: 6, speakingFrame: 7, delivery: "broken", crying: .55,
  },
  {
    id: "alana-question", speaker: "Entrevistador",
    text: "E a morte de Alana? O senhor nega envolvimento nos dois casos?",
    duration: 6500, frame: 6, crying: .15,
    poses: [{ at: 3600, frame: 8 }],
  },
  {
    id: "denial", speaker: "Vicente",
    text: "Claro que nego. Eu procurei aquela menina.",
    duration: 4300, frame: 0, speakingFrame: 1, delivery: "firm",
  },
  {
    id: "public-defense", speaker: "Vicente",
    text: "Eu fiquei para cuidar deles. Agora dizem que fui eu.",
    duration: 6000, frame: 0, speakingFrame: 1,
  },
  {
    id: "last-pause", speaker: null, text: "",
    description: "Ele desvia o olhar por um momento.",
    duration: 1600, frame: 8,
  },
  {
    id: "last-line", speaker: "Vicente",
    text: "Eu não sei como me defender sem parecer que estou me defendendo demais.",
    duration: 7000, frame: 0, speakingFrame: 1, delivery: "hesitant",
  },
  {
    id: "sign-off", speaker: null, text: "",
    description: "Vicente se cala. A transmissão termina.",
    duration: 2000, frame: 8,
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
  let pose: PortraitPose = beat ?? { frame: 0 };
  if (!reducedMotion && phase === "interview") {
    for (const change of beat?.poses ?? []) {
      if (localTime >= change.at) pose = change;
    }
  }
  let frame = pose.frame;
  if (!reducedMotion && phase === "interview") {
    // The same syllable cues drive the portrait and sound, even when muted.
    let syllable: SoundCue | undefined;
    for (let index = SOUND_CUES.length - 1; index >= 0; index--) {
      if (SOUND_CUES[index].at <= elapsed && SOUND_CUES[index].sound === "vicente") {
        syllable = SOUND_CUES[index]; break;
      }
    }
    if (beat?.speaker === "Vicente" && pose.speakingFrame !== undefined && syllable
        && syllable.at >= BEAT_STARTS[beatIndex] && elapsed - syllable.at < 100) {
      frame = pose.speakingFrame;
    }
  }
  // The body and tears share the active-time clock with speech. Seeking, pausing,
  // leaving the tab and reduced motion therefore cannot leave a CSS loop running.
  const strength = !reducedMotion && phase === "interview" && frame >= 3 && frame <= 7
    ? (beat?.crying ?? 0) : 0;
  const sob = Math.max(0, Math.sin(elapsed / 530)) ** 5;
  const tremble = Math.sin(elapsed / 43) * Math.sin(elapsed / 71) * sob;
  const leftDrop = (elapsed % 2700) / 2700;
  const rightDrop = ((elapsed + 1250) % 3200) / 3200;
  const visibleTears = strength > 0 && (frame === 6 || frame === 7);
  const motion = {
    x: tremble * strength * .8,
    y: -(Math.sin(elapsed / 310) * .65 + sob * 2.4) * strength,
    tilt: tremble * strength * .22,
    breath: 1 + (Math.sin(elapsed / 900) * .004 + sob * .012) * strength,
    leftDrop: visibleTears ? leftDrop : 0,
    rightDrop: visibleTears ? rightDrop : 0,
    leftOpacity: visibleTears ? Math.sin(leftDrop * Math.PI) * .8 : 0,
    rightOpacity: visibleTears ? Math.sin(rightDrop * Math.PI) * .65 : 0,
  };
  return { phase, beatIndex, frame, motion } as const;
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

const DELIVERY: Record<Delivery, { pitch: number; gain: number; leadIn: number }> = {
  steady: { pitch: 1, gain: .28, leadIn: 350 },
  firm: { pitch: 1.025, gain: .29, leadIn: 250 },
  hesitant: { pitch: .96, gain: .23, leadIn: 650 },
  broken: { pitch: .93, gain: .17, leadIn: 500 },
};

/** Punctuation gives the blips room to breathe; the silent poses have no voice. */
export function createSoundCues(): SoundCue[] {
  const cues: SoundCue[] = [
    { at: IMPACT_MS, sound: "tv-impact", rate: 1, gain: .78 },
    { at: 4440, sound: "tv-on", rate: 1, gain: .55 },
  ];
  INTERVIEW.forEach((beat, beatIndex) => {
    if (!beat.speaker) return;
    const points: { time: number; pitch: number }[] = [];
    const delivery = DELIVERY[beat.delivery ?? "steady"];
    let time = delivery.leadIn;
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
      rate: point.pitch * (beat.speaker === "Vicente" ? delivery.pitch : 1),
      gain: beat.speaker === "Vicente" ? delivery.gain : .22,
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
