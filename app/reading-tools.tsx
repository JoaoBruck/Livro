"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { chapterAccess, chapterStats } from "./reading-preferences";

const CHAPTERS = [
  { number: 1, route: "/" },
  { number: 2, route: "/capitulo-2" },
  { number: 3, route: "/capitulo-3" },
  { number: 4, route: "/capitulo-4" },
  { number: 5, route: "/capitulo-5" },
];

export function ChapterNavigation({ current }: { current: 1 | 2 | 3 | 4 | 5 }) {
  const [open, setOpen] = useState(false);
  const [accessible, setAccessible] = useState<number[]>([1, current]);
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!menu.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div className={`chapter-back-menu${open ? " is-open" : ""}`} ref={menu}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <button type="button" className="chapter-back-button" ref={trigger}
        aria-expanded={open} aria-controls="chapter-back-options"
        onClick={() => {
          setAccessible(chapterAccess(current, (key) => window.localStorage.getItem(key)));
          setOpen(!open);
        }}>
        <span aria-hidden="true">{current > 1 ? "←" : "≡"}</span>
        {current > 1 ? "VOLTAR" : "CAPÍTULOS"}
      </button>
      <nav id="chapter-back-options" aria-label="Navegar entre capítulos" hidden={!open}>
        <span className="chapter-back-label">MYU / ÍNDICE DE CAPÍTULOS</span>
        {CHAPTERS.map(({ number, route }) => {
          const content = <><span>{`0${number}`}</span><strong>Capítulo {number}</strong>
            <small>{number === current ? "Você está aqui" : accessible.includes(number) ? "Retomar leitura ↗" : "Bloqueado"}</small></>;
          return number === current || !accessible.includes(number)
            ? <span key={number} className="chapter-back-option" aria-current={number === current ? "page" : undefined}
                aria-disabled={number !== current || undefined}>{content}</span>
            : <Link key={number} href={`${route}?retomar=1`} className="chapter-back-option" onClick={() => setOpen(false)}>{content}</Link>;
        })}
      </nav>
    </div>
  );
}

export function ChapterContents({ chapter, labels }: { chapter: number; labels: readonly string[] }) {
  return (
    <nav className="chapter-contents" aria-label="Cenas disponíveis neste capítulo">
      <span>PELAS PÁGINAS</span>
      <ol>{labels.map((label, index) => <li key={index}>
        <a href={`#c${chapter}-scene-${index + 1}`}><b>{String(index + 1).padStart(2, "0")}</b>{label}<i aria-hidden="true">↓</i></a>
      </li>)}</ol>
    </nav>
  );
}

export function ReadingEstimate({ tokens, investigation = false }: {
  tokens: readonly { kind: string; text: string }[]; investigation?: boolean;
}) {
  const { minutes, label } = chapterStats(tokens);
  return <span className="reading-estimate">{label} PALAVRAS / CERCA DE {minutes} MIN DE LEITURA{investigation ? " + INVESTIGAÇÃO" : ""}</span>;
}

export function DialogueText({ text }: { text: string }) {
  const dash = text.indexOf("— ");
  if (dash <= 0) return <>{text}</>;
  return <><span className="dialogue-lead">{text.slice(0, dash).trimEnd()}</span><span className="dialogue-speech">{text.slice(dash)}</span></>;
}
