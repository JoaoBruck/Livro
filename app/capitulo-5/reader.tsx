"use client";

import { sitePath } from "../site-path";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ChapterCover from "../chapter-cover";
import { CHAPTER_COVERS } from "../chapter-covers";
import { ChapterNavigation, ChapterContents, DialogueText, ReadingEstimate } from "../reading-tools";
import { ReadingProgressBar, ensureChapterSplit } from "../reading-progress";
import { splitIntoScenes, type StoryToken } from "../investigation-flow";
import { chapterFivePassages } from "./passages";
import Postcredits from "./postcredits";

type Chapter = {
  tokens: readonly { kind: string; text: string; anchorId?: string }[];
  sceneLabels: readonly string[];
  sceneModes?: readonly string[];
};

function StoryParagraphs({ tokens }: { tokens: readonly StoryToken[] }) {
  return tokens.map(token => <p className={token.kind === "dialogue" ? "dialogue" : undefined}
    data-reading-impact={token.anchorId === "c5-r3-s7-t21" || token.anchorId === "c5-r3-s7-t44" ? "absence" : token.anchorId === "c5-r3-s7-t49" ? "farewell" : undefined}
    id={token.anchorId} data-reading-anchor={token.anchorId} key={token.anchorId}>
    {token.kind === "dialogue" ? <DialogueText text={token.text} /> : token.text}
  </p>);
}

export default function ChapterFiveReader({ chapter }: { chapter: Chapter }) {
  const [access, setAccess] = useState<"checking" | "locked" | "unlocked">("checking");
  const scenes = useMemo(() => splitIntoScenes(chapter.tokens as StoryToken[]), [chapter.tokens]);
  const ending = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      ensureChapterSplit();
      let unlocked = false;
      try {
        unlocked = window.localStorage.getItem("myu-capitulo-5") === "unlocked"
          || window.localStorage.getItem("myu-capitulo-4-complete") === "true";
        if (unlocked) window.localStorage.setItem("myu-capitulo-5", "unlocked");
      } catch { /* A denied storage read must leave a usable return link. */ }
      setAccess(unlocked ? "unlocked" : "locked");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (access !== "unlocked" || !ending.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      try {
        window.localStorage.setItem("myu-capitulo-5-complete", "true");
        window.dispatchEvent(new Event("myu:reading-progress"));
      } catch { /* Completion remains readable when storage is unavailable. */ }
      observer.disconnect();
    }, { threshold: 0.15 });
    observer.observe(ending.current);
    return () => observer.disconnect();
  }, [access]);

  if (access === "checking") return <main className="chapter-two-shell chapter-loading" aria-busy="true"><p>Abrindo o capítulo 5…</p></main>;
  if (access === "locked") return <main className="chapter-two-shell">
    <div className="chapter-two-card locked-card">
      <div className="color-code" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <p>CAPÍTULO 05</p>
      <h1>{CHAPTER_COVERS[5].title}</h1>
      <span>Termine a leitura do Capítulo 4 para continuar.</span>
      <Link className="chapter-return-link" href="/capitulo-4?retomar=1">← VOLTAR AO CAPÍTULO 4</Link>
    </div>
  </main>;

  return <main className="chapter-three-reading chapter-five-reading">
    <ReadingProgressBar chapter={5} />
    <header className="site-header reader-site-header chapter-three-site-header">
      <Link href="/" className="wordmark" aria-label="Ir ao início de Myu">MYU</Link>
      <ChapterNavigation current={5} />
      <div className="chapter-marker"><span>PILOTO</span><span>{"//"}</span><span>CAPÍTULO 5</span></div>
      <a href="#leitura" className="archive-link">LEITURA</a>
    </header>
    <ChapterCover number={5} />
    <article className="chapter-three-article" id="leitura">
      <header className="chapter-title-block chapter-three-title-block" id="c5-start" data-reading-anchor="c5-start">
        <p>CAPÍTULO 05</p><h2>{CHAPTER_COVERS[5].title}</h2><ReadingEstimate tokens={chapter.tokens} />
      </header>
      <ChapterContents chapter={5} labels={chapter.sceneLabels} />
      {scenes.map((scene, index) => chapter.sceneModes?.[index] === "van-memory" ? <section
        className="story-scene chapter-three-scene van-memory-scene"
        id={`c5-scene-${index + 1}`} data-scene={String(index + 1).padStart(2, "0")}
        aria-labelledby="van-memory-title" key={index}>
        <div className="van-memory-backdrop" aria-hidden="true">
          <div className="van-memory-window">
            {/* The cabin is scenery; all story information remains selectable text. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sitePath("/images/myu-van-memory.webp")} width={1672} height={941} alt="" loading="lazy" decoding="async" />
          </div>
        </div>
        <header className="van-memory-caption">
          <span>12 DE AGOSTO DE 2017 · VICENTE</span>
          <h3 id="van-memory-title">{chapter.sceneLabels[index]}</h3>
        </header>
        <div className="van-memory-manuscript">
          <div className="story-copy"><StoryParagraphs tokens={scene} /></div>
        </div>
      </section> : <section className={`story-scene chapter-three-scene chapter-five-scene-${index}`}
        id={`c5-scene-${index + 1}`} data-scene={String(index + 1).padStart(2, "0")} key={index}
        aria-label={chapter.sceneLabels[index]}>
        <aside className="scene-label" aria-hidden="true"><span>{index === 4 ? "13.08.2025" : String(index + 1).padStart(2, "0")}</span><small>{chapter.sceneLabels[index]}</small></aside>
        <div className="chapter-five-passages">
          {chapterFivePassages(scene).map(passage => <div
            className="chapter-five-passage" data-atmosphere={passage.atmosphere}
            key={passage.tokens[0].anchorId}>
            <div className="story-copy"><StoryParagraphs tokens={passage.tokens} /></div>
          </div>)}
        </div>
      </section>)}
    </article>
    <section className="myu-finale" ref={ending} id="c5-complete" data-reading-anchor="c5-complete" aria-labelledby="myu-finale-title">
      <div className="myu-finale-title" id="fim">
        <p className="myu-finale-end">FIM</p>
        <h2 id="myu-finale-title">MYU</h2>
        <p className="myu-finale-credit">Uma história de <span>Zero</span></p>
      </div>
      <nav className="myu-finale-navigation" aria-label="Após o fim de Myu">
        <Link href="/">Voltar ao início</Link>
      </nav>
    </section>
    <Postcredits />
  </main>;
}
