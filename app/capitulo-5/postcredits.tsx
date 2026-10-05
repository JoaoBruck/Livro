"use client";

import { sitePath } from "../site-path";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { BEAT_STARTS, BROADCAST_MS, END_MS, IMPACT_MS, INTERVIEW, InterviewClock, getInterviewMoment, nextInterviewPosition } from "./postcredits-sequence";
import { PostcreditsSound } from "./postcredits-sound";

const FRAME = sitePath("/images/postcredits/myu-crt-frame.png");
const PORTRAITS = sitePath("/images/postcredits/vicente-interview-spritesheet.png");
const DUST = [-1, -0.72, -0.45, -0.2, 0.18, 0.4, 0.68, 1];

export default function Postcredits() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const television = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const boot = useRef<HTMLDivElement>(null);
  const portrait = useRef<HTMLDivElement>(null);
  const animations = useRef<Animation[]>([]);
  const clock = useRef(new InterviewClock());
  const sound = useRef<PostcreditsSound | null>(null);
  const soundPosition = useRef(0);
  const [nearby, setNearby] = useState(false);
  const [inView, setInView] = useState(false);
  const [canStart, setCanStart] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [imagesReady, setImagesReady] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [soundReady, setSoundReady] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(55);
  const [moment, setMoment] = useState(() => getInterviewMoment(0));
  const lastMoment = useRef("");

  const paint = useCallback((elapsed: number) => {
    for (const animation of animations.current) animation.currentTime = elapsed;
    const next = getInterviewMoment(elapsed, reducedMotion);
    if (portrait.current) {
      const { motion } = next;
      const style = portrait.current.style;
      style.setProperty("--cry-x", `${motion.x.toFixed(3)}px`);
      style.setProperty("--cry-y", `${motion.y.toFixed(3)}px`);
      style.setProperty("--cry-tilt", `${motion.tilt.toFixed(3)}deg`);
      style.setProperty("--cry-breath", motion.breath.toFixed(5));
      style.setProperty("--tear-left-y", `${motion.leftDrop * 500}%`);
      style.setProperty("--tear-right-y", `${motion.rightDrop * 480}%`);
      style.setProperty("--tear-left-opacity", String(motion.leftOpacity));
      style.setProperty("--tear-right-opacity", String(motion.rightOpacity));
    }
    const key = `${next.phase}:${next.beatIndex}:${next.frame}`;
    if (lastMoment.current !== key) {
      lastMoment.current = key;
      setMoment(next);
    }
  }, [reducedMotion]);

  useEffect(() => {
    const region = section.current;
    const screen = stage.current;
    if (!region || !screen) return;
    if (typeof window.IntersectionObserver !== "function") {
      // The transcript and manual play remain available in older readers.
      const timer = window.setTimeout(() => setNearby(true), 0);
      return () => window.clearTimeout(timer);
    }
    const preload = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNearby(true); preload.disconnect(); }
    }, { rootMargin: "700px 0px" });
    const visibility = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting;
      if (entry.intersectionRatio >= .4) setCanStart(true);
      if (!visible) { clock.current.pause(); sound.current?.stop(); }
      setInView(visible);
    }, { threshold: [0, 0.4] });
    preload.observe(region);
    visibility.observe(screen);
    return () => { preload.disconnect(); visibility.disconnect(); };
  }, []);

  useEffect(() => {
    if (!nearby) return;
    let cancelled = false;
    // Load in parallel before the falling image becomes visible.
    const assets = [FRAME, PORTRAITS].map(src => new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("postcredits image"));
      image.src = src;
    }));
    Promise.all(assets).then(() => { if (!cancelled) setImagesReady(true); })
      .catch(() => { if (!cancelled) setImageError(true); });
    return () => { cancelled = true; };
  }, [nearby]);

  useEffect(() => {
    const engine = new PostcreditsSound();
    sound.current = engine;
    let cancelled = false;
    const prepare = (event: Event) => {
      if (event.target instanceof Element && event.target.closest(".postcredits-audio")) return;
      void engine.unlock().then(ready => {
        if (!cancelled && ready) {
          setSoundReady(true);
          document.removeEventListener("pointerdown", prepare);
          document.removeEventListener("keydown", prepare);
        }
      });
    };
    document.addEventListener("pointerdown", prepare, { passive: true });
    document.addEventListener("keydown", prepare);
    return () => {
      cancelled = true; engine.close();
      document.removeEventListener("pointerdown", prepare);
      document.removeEventListener("keydown", prepare);
      if (sound.current === engine) sound.current = null;
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(query.matches || document.documentElement.dataset.readingFocus === "true");
    const updateVisibility = () => {
      if (document.hidden) { clock.current.pause(); sound.current?.stop(); }
      setPageVisible(!document.hidden);
    };
    const preferences = new MutationObserver(updateMotion);
    preferences.observe(document.documentElement, { attributes: true, attributeFilter: ["data-reading-focus"] });
    query.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const timer = window.setTimeout(() => { updateMotion(); updateVisibility(); }, 0);
    return () => {
      preferences.disconnect(); query.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility); window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!imagesReady || !canStart || !inView || started) return;
    const timer = window.setTimeout(() => {
      clock.current.seek(reducedMotion ? BROADCAST_MS : 0);
      soundPosition.current = clock.current.elapsed;
      setStarted(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [imagesReady, inView, canStart, started, reducedMotion]);

  useEffect(() => {
    if (!started || !television.current || !shadow.current || !boot.current) return;
    if (reducedMotion || !television.current.animate) {
      if (clock.current.elapsed < BROADCAST_MS) clock.current.seek(BROADCAST_MS);
      const timer = window.setTimeout(() => paint(clock.current.elapsed), 0);
      return () => window.clearTimeout(timer);
    }
    const create = (element: Element, frames: Keyframe[], duration: number, delay = 0) => {
      const animation = element.animate(frames, { duration, delay, fill: "both", easing: "linear" });
      animation.pause(); animation.currentTime = clock.current.elapsed;
      animations.current.push(animation);
    };
    create(television.current, [
      { transform: "translate(12%, -105%) rotate(-210deg)", opacity: 0, offset: 0 },
      { transform: "translate(10%, -95%) rotate(-176deg)", opacity: 1, offset: 0.14 },
      { transform: "translate(5%, -58%) rotate(-105deg)", opacity: 1, offset: 0.48 },
      { transform: "translate(1%, -20%) rotate(-35deg)", opacity: 1, offset: 0.71 },
      { transform: "translate(0, 0) rotate(3deg) scaleY(.965)", opacity: 1, offset: IMPACT_MS / 3950 },
      { transform: "translate(0, -3%) rotate(-1.5deg)", opacity: 1, offset: 0.9 },
      { transform: "translate(0, 0) rotate(.5deg)", opacity: 1, offset: 0.96 },
      { transform: "translate(0, 0) rotate(0)", opacity: 1, offset: 1 },
    ], 3950);
    create(shadow.current, [
      { transform: "scaleX(.45)", opacity: 0 },
      { transform: "scaleX(.68)", opacity: 0.15, offset: .65 },
      { transform: "scaleX(1.04)", opacity: .9, offset: .82 },
      { transform: "scaleX(1)", opacity: .7 },
    ], 3950);
    create(boot.current, [
      { transform: "scale(.08, .003)", opacity: 0, offset: 0 },
      { transform: "scale(.94, .005)", opacity: .55, offset: .22 },
      { transform: "scale(1, .014)", opacity: .7, offset: .45 },
      { transform: "scale(1, 1)", opacity: .12, offset: .78 },
      { transform: "scale(1, 1)", opacity: 0, offset: 1 },
    ], BROADCAST_MS - 4400, 4400);
    stage.current?.querySelectorAll<HTMLElement>(".postcredits-dust i").forEach((particle, index) => {
      const direction = DUST[index];
      create(particle, [
        { transform: "translate(0,0) scale(.4)", opacity: 0, offset: 0 },
        { opacity: .45, offset: .12 },
        { transform: `translate(${direction * 95}px, ${-10 - (index % 3) * 9}px) scale(1.3)`, opacity: .2, offset: .6 },
        { transform: `translate(${direction * 160}px, ${-17 - (index % 3) * 10}px) scale(.6)`, opacity: 0, offset: 1 },
      ], 1350, IMPACT_MS);
    });
    return () => {
      for (const animation of animations.current) animation.cancel();
      animations.current = [];
    };
  }, [started, reducedMotion, paint]);

  const running = started && !paused && inView && pageVisible && moment.phase !== "ended";
  useEffect(() => {
    const activeClock = clock.current;
    const activeSound = sound.current;
    if (!running) { activeClock.pause(); activeSound?.stop(); return; }
    let request = 0;
    const update = (now: number) => {
      const elapsed = activeClock.tick(now);
      activeSound?.advance(soundPosition.current, elapsed);
      soundPosition.current = elapsed;
      paint(elapsed);
      if (elapsed < END_MS) request = window.requestAnimationFrame(update);
    };
    request = window.requestAnimationFrame(update);
    return () => { window.cancelAnimationFrame(request); activeClock.pause(); activeSound?.stop(); };
  }, [running, paint]);

  const seek = (elapsed: number) => {
    sound.current?.stop();
    soundPosition.current = elapsed;
    paint(clock.current.seek(elapsed));
  };
  const replay = () => {
    seek(reducedMotion ? BROADCAST_MS : 0);
    if (typeof window.IntersectionObserver !== "function") setInView(true);
    setPaused(false); setStarted(true);
  };
  const beat = INTERVIEW[moment.beatIndex];
  const broadcast = moment.phase === "interview" || moment.phase === "ended";
  const position = `${(moment.frame % 3) * 50}% ${Math.floor(moment.frame / 3) * 50}%`;

  return <section ref={section} className="postcredits" id="c5-pos-creditos" data-reading-anchor="c5-pos-creditos"
    data-phase={started ? moment.phase : "waiting"} data-reduced-motion={reducedMotion ? "true" : "false"}
    aria-labelledby="postcredits-title">
    <h2 className="postcredits-accessible" id="postcredits-title">Depois dos créditos</h2>
    <div className="postcredits-audio">
      <button type="button" aria-pressed={soundReady && !muted} onClick={async () => {
        if (!soundReady) { setSoundReady(await sound.current?.unlock() ?? false); return; }
        const next = !muted;
        sound.current?.setMuted(next); setMuted(next);
      }}>{!soundReady ? "Ativar som" : muted ? "Som desligado" : "Som ligado"}</button>
      {soundReady && <label>Volume<input type="range" min="0" max="100" value={volume} onChange={event => {
        const next = Number(event.target.value);
        setVolume(next); sound.current?.setVolume(next / 100);
      }} /></label>}
    </div>
    <div className="postcredits-stage" ref={stage} aria-hidden="true">
      <div className="postcredits-floor" />
      <div className="postcredits-shadow" ref={shadow} />
      <div className="postcredits-tv" ref={television}>
        <div className="postcredits-glass">
          <div className="postcredits-boot" ref={boot} />
          {broadcast && <div className="postcredits-broadcast">
            <div ref={portrait} className="postcredits-portrait" data-portrait-frame={moment.frame}
              style={{ backgroundImage: `url("${PORTRAITS}")`, backgroundPosition: position }}>
              <i className="postcredits-tear postcredits-tear-left" />
              <i className="postcredits-tear postcredits-tear-right" />
            </div>
            <div className="postcredits-vignette" />
            <div className="postcredits-live"><span />AO VIVO</div>
            <div className="postcredits-channel">JC<span>JORNAL DA CIDADE</span></div>
            <div className="postcredits-news">
              <strong>VICENTE BRAGA</strong><span>Coordenador da casa-lar</span>
            </div>
            <div className="postcredits-scanlines" />
          </div>}
        </div>
        {/* This transparent pixel-art frame must retain its exact screen aperture. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {nearby && <img className="postcredits-frame" src={FRAME} width={1254} height={1254} alt="" decoding="async" />}
      </div>
      <div className="postcredits-dust">{DUST.map((direction, index) => <i key={index} style={{ "--dust-position": `${50 + direction * 22}%` } as CSSProperties} />)}</div>
    </div>
    <div className="postcredits-reading">
      <div className="postcredits-caption" aria-live="off">
        {broadcast && beat?.speaker ? <>
          <span className="postcredits-speaker">{beat.speaker}</span>
          <p>{beat.text}</p>
        </> : broadcast ? <>
          <span className="postcredits-speaker">{moment.phase === "ended" ? "Fim da transmissão" : "Vicente"}</span>
          <p className="postcredits-silence">{moment.phase === "ended" ? "" : "…"}</p>
          <span className="postcredits-accessible">{beat?.description}</span>
        </> : <span className="postcredits-speaker">{imageError ? "A imagem não carregou. A entrevista está disponível abaixo." : nearby && !imagesReady ? "Sintonizando…" : ""}</span>}
      </div>
      <div className="postcredits-controls" role="group" aria-label="Controles da entrevista">
        <button type="button" onClick={() => {
          if (!started || moment.phase === "ended") replay();
          else { clock.current.pause(); setPaused(value => !value); }
        }} disabled={!imagesReady}>
          {!started ? "Assistir" : moment.phase === "ended" ? "Rever a cena" : paused ? "Continuar" : "Pausar"}
        </button>
        <button type="button" onClick={() => {
          if (!started) setStarted(true);
          setPaused(true); seek(nextInterviewPosition(clock.current.elapsed));
        }} disabled={!imagesReady || moment.phase === "ended"}>Próxima fala <span aria-hidden="true">→</span></button>
        {started && moment.phase !== "ended" && <button type="button" onClick={replay}>Rever</button>}
      </div>
      <details className="postcredits-transcript" open={imageError || undefined} onToggle={event => {
        if (event.currentTarget.open) { clock.current.pause(); setPaused(true); }
      }}>
        <summary>Ler a entrevista</summary>
        <p className="postcredits-transcript-context">Jornal da Cidade. Vicente Braga, coordenador da casa-lar, responde aos repórteres.</p>
        {INTERVIEW.map((line, index) => line.speaker ? <p key={BEAT_STARTS[index]}>
          <strong>{line.speaker}</strong><span>{line.text}</span>
        </p> : <p className="postcredits-transcript-action" key={BEAT_STARTS[index]}>{line.description}</p>)}
      </details>
    </div>
  </section>;
}
