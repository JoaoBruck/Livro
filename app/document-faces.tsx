"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Side = "front" | "back";

/** Keep both faces decoded near the reader, so turning never swaps an img's source. */
export function DocumentFaces({ front, back, frontAlt, backAlt, side, eager = false, retryable = true }: {
  front: string; back: string; frontAlt: string; backAlt: string;
  side: Side; eager?: boolean; retryable?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const images = useRef<Partial<Record<Side, HTMLImageElement | null>>>({});
  const [near, setNear] = useState(eager);
  const [ready, setReady] = useState<Partial<Record<Side, boolean>>>({});
  const [failed, setFailed] = useState<Partial<Record<Side, boolean>>>({});
  const [attempt, setAttempt] = useState(0);
  const prepareImage = useCallback(async (img: HTMLImageElement, face: Side) => {
    const source = img.currentSrc;
    try { await img.decode(); } catch { /* A loaded image can still be displayed. */ }
    if (img.isConnected && img.currentSrc === source && img.naturalWidth > 0) {
      setReady(current => current[face] ? current : { ...current, [face]: true });
    }
  }, []);

  useEffect(() => {
    // A cached image may finish before hydration attaches its load listener.
    for (const face of ["front", "back"] as const) {
      const img = images.current[face];
      if (!img?.complete || !img.getAttribute("src")) continue;
      if (img.naturalWidth > 0) void prepareImage(img, face);
      else setFailed(current => current[face] ? current : { ...current, [face]: true });
    }
  }, [near, side, attempt, prepareImage]);

  useEffect(() => {
    const element = frame.current;
    if (!element || eager) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNear(true); observer.disconnect(); }
    }, { rootMargin: "600px 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [eager]);

  const label = side === "front" ? "frente" : "verso";
  return <div className="document-faces" ref={frame} data-side={side} aria-busy={!ready[side] && !failed[side]}>
    {(["front", "back"] as const).map(face => {
      const source = face === "front" ? front : back;
      const selected = face === side;
      return <img key={`${face}-${attempt}`} data-face={face}
        ref={element => { images.current[face] = element; }}
        src={face === "front" || near || selected ? `${source}${attempt ? `?retry=${attempt}` : ""}` : undefined}
        alt={selected ? (face === "front" ? frontAlt : backAlt) : ""}
        aria-hidden={!selected} draggable={false}
        loading={near || eager || face === "back" ? "eager" : "lazy"} decoding="async"
        className={selected && ready[face] ? "is-visible" : ""}
        onLoad={event => void prepareImage(event.currentTarget, face)}
        onError={() => setFailed(current => ({ ...current, [face]: true }))} />;
    })}
    {!ready[side] && (near || eager) && <div className="document-image-status" role="status">
      {failed[side] ? <>
        <strong>Não foi possível carregar o {label === "frente" ? "lado da frente" : label}.</strong>
        {retryable && <button type="button" onClick={() => {
          setFailed({}); setReady({}); setAttempt(value => value + 1);
        }}>Tentar novamente</button>}
        <span>{retryable ? "A transcrição continua disponível abaixo." : "Abra a folha para tentar novamente."}</span>
      </> : <><span className="document-loading-mark" aria-hidden="true" />Preparando {label}…</>}
    </div>}
  </div>;
}
