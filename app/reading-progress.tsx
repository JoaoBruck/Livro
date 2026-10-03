"use client";

import { sitePath } from "./site-path";

import { useEffect, useRef, useState } from "react";
import splitMap from "./chapter-split-map.json";
import anchorRedirects from "./reading-anchor-redirects.json";
import { findReadingAnchor } from "./reading-preferences";
import { isReadingPosition, migrateChapterStorage, resolveReadingPosition, type ChapterNumber, type ReadingPosition, type ReadingStore } from "./chapter-migration";
export type { ChapterNumber } from "./chapter-migration";

const STORAGE_KEY = "myu-reading-progress-v1";
const ROUTES: Record<ChapterNumber, string> = {
  1: "/",
  2: "/capitulo-2",
  3: "/capitulo-3",
  4: "/capitulo-4",
  5: "/capitulo-5",
};

function emptyStore(): ReadingStore {
  return { version: 1, chapters: {} };
}

export function ensureChapterSplit() {
  migrateChapterStorage(window.localStorage, splitMap);
}

function readStore(): ReadingStore {
  try {
    ensureChapterSplit();
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<ReadingStore>;
    const chapters = parsed.chapters && typeof parsed.chapters === "object"
      ? parsed.chapters
      : {};
    return {
      version: 1,
      current: isReadingPosition(parsed.current) ? parsed.current : undefined,
      chapters,
    };
  } catch {
    return emptyStore();
  }
}

function writePosition(position: ReadingPosition) {
  const store = readStore();
  store.current = position;
  store.chapters[String(position.chapter) as `${ChapterNumber}`] = position;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch { return; }
  window.dispatchEvent(new Event("myu:reading-progress"));
}

export function setNextChapterResume(chapter: ChapterNumber) {
  const saved = readStore().chapters[`${chapter}`];
  if (isReadingPosition(saved)) { writePosition(saved); return; }
  const position: ReadingPosition = {
    chapter,
    route: ROUTES[chapter],
    anchor: `c${chapter}-start`,
    offset: 0,
    progress: 0,
    updatedAt: Date.now(),
  };
  writePosition(position);
}

function getFallbackTarget(): ReadingPosition | undefined {
  if (window.localStorage.getItem("myu-capitulo-5") === "unlocked" || window.localStorage.getItem("myu-capitulo-4-complete") === "true") {
    return { chapter: 5, route: ROUTES[5], anchor: "c5-start", offset: 0, progress: 0, updatedAt: Date.now() };
  }
  if (window.localStorage.getItem("myu-capitulo-4") === "unlocked") {
    return { chapter: 4, route: ROUTES[4], anchor: "c4-start", offset: 0, progress: 0, updatedAt: Date.now() };
  }
  if (
    window.localStorage.getItem("myu-capitulo-3") === "unlocked" ||
    window.localStorage.getItem("myu-arg-a07") === "recovered"
  ) {
    return {
      chapter: 3,
      route: ROUTES[3],
      anchor: "c3-start",
      offset: 0,
      progress: 0,
      updatedAt: Date.now(),
    };
  }
  if (window.localStorage.getItem("myu-capitulo-2") === "unlocked") {
    return {
      chapter: 2,
      route: ROUTES[2],
      anchor: "c2-start",
      offset: 0,
      progress: 0,
      updatedAt: Date.now(),
    };
  }
  return undefined;
}

export function useReadingProgress(
  chapter: ChapterNumber,
  enabled = true,
) {
  const [progress, setProgress] = useState(0);
  const restoredRef = useRef<ChapterNumber | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const anchors = () => Array.from(
      document.querySelectorAll<HTMLElement>(`[data-reading-anchor^="c${chapter}-"]`),
    );

    const documentTop = (element: HTMLElement) => (
      element.getBoundingClientRect().top + window.scrollY
    );

    const calculatePosition = (updateProgress = true): ReadingPosition | undefined => {
      const start = document.getElementById(`c${chapter}-start`);
      if (!start) return undefined;

      const readingLine = window.innerHeight * 0.46;
      const startTop = documentTop(start);
      if (window.scrollY + readingLine < startTop) return undefined;

      const readingRoot = start.closest<HTMLElement>("article");
      const readingEnd = readingRoot
        ? documentTop(readingRoot) + readingRoot.offsetHeight
        : document.documentElement.scrollHeight;
      const currentTarget = readStore().current;
      if (
        currentTarget &&
        currentTarget.chapter > chapter &&
        window.scrollY + readingLine >= readingEnd
      ) {
        return undefined;
      }

      const scrollable = document.documentElement.scrollHeight - window.innerHeight - startTop;
      const nextProgress = scrollable > 0
        ? Math.min(100, Math.max(0, ((window.scrollY - startTop) / scrollable) * 100))
        : 0;
      if (updateProgress) setProgress(nextProgress);

      const active = findReadingAnchor(anchors(), readingLine, element => element.getBoundingClientRect().top);
      if (!active?.id) return undefined;

      return {
        chapter,
        route: ROUTES[chapter],
        anchor: active.id,
        offset: Math.round(window.scrollY - documentTop(active)),
        progress: Math.round(nextProgress * 10) / 10,
        updatedAt: Date.now(),
      };
    };

    const persist = (updateProgress = true) => {
      const position = calculatePosition(updateProgress);
      if (position) writePosition(position);
    };

    const update = () => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        const position = calculatePosition();
        if (!position) return;
        if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = window.setTimeout(() => writePosition(position), 320);
      });
    };

    const shouldRestore = new URLSearchParams(window.location.search).get("retomar") === "1";
    if (shouldRestore && restoredRef.current !== chapter) {
      restoredRef.current = chapter;
      const saved = readStore().chapters[String(chapter) as `${ChapterNumber}`];
      window.setTimeout(() => {
        const restored = saved && resolveReadingPosition(saved, anchorRedirects);
        const target = restored && document.getElementById(restored.anchor);
        const fallback = document.getElementById(`c${chapter}-start`);
        const top = target && restored
          ? Math.max(0, documentTop(target) + restored.offset)
          : fallback
            ? documentTop(fallback)
            : 0;
        const previousScrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = "auto";
        window.scrollTo({ top, behavior: "auto" });
        window.requestAnimationFrame(() => {
          document.documentElement.style.scrollBehavior = previousScrollBehavior;
        });
        const url = new URL(window.location.href);
        url.searchParams.delete("retomar");
        window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
        update();
      }, 120);
    } else {
      update();
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("myu:reading-settings", update);
    const persistBeforeLeaving = () => persist(false);
    window.addEventListener("pagehide", persistBeforeLeaving);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("myu:reading-settings", update);
      window.removeEventListener("pagehide", persistBeforeLeaving);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current);
      persist(false);
    };
  }, [chapter, enabled]);

  return progress;
}

// Scrolling updates this small component, not every paragraph and investigation.
export function ReadingProgressBar({ chapter, enabled = true }: { chapter: ChapterNumber; enabled?: boolean }) {
  const progress = useReadingProgress(chapter, enabled);
  return <div className="reading-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress / 100})` }} /></div>;
}

export function ContinueReading({ className = "" }: { className?: string }) {
  const [target, setTarget] = useState<ReadingPosition>();

  useEffect(() => {
    const refresh = () => setTarget(readStore().current ?? getFallbackTarget());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("myu:reading-progress", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("myu:reading-progress", refresh);
    };
  }, []);

  if (!target) return null;

  const detail = target.progress > 0
    ? `CAPÍTULO ${target.chapter} · ${Math.round(target.progress)}% LIDO`
    : `CAPÍTULO ${target.chapter} · PRONTO PARA COMEÇAR`;

  return (
    <a
      className={`continue-reading ${className}`.trim()}
      href={sitePath(`${target.route}?retomar=1`)}
      onClick={(event) => {
        event.preventDefault();
        window.location.assign(sitePath(`${target.route}?retomar=1`));
      }}
      aria-label={`Continuar a leitura no capítulo ${target.chapter}`}
    >
      <span>CONTINUAR LEITURA</span>
      <strong>{detail}</strong>
      <i aria-hidden="true">→</i>
    </a>
  );
}
