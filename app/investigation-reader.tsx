"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChapterNavigation, ChapterContents, DialogueText, ReadingEstimate } from "./reading-tools";
import { ContinueReading, ensureChapterSplit, setNextChapterResume, ReadingProgressBar } from "./reading-progress";
import { gateScenes, splitIntoScenes, type StoryToken } from "./investigation-flow";
import type { EvidenceId } from "./chapter3-evidence";
import { EvidenceConvergence, EvidenceDocument, EvidenceDrawer, type InvestigationController, useInvestigation } from "./capitulo-3/evidence-system";

type Chapter = { tokens: readonly { kind: string; text: string }[]; sceneLabels: readonly string[] };

function StoryTokenView({ token, anchorId, investigation }: {
  token: StoryToken; anchorId: string; investigation: InvestigationController;
}) {
  if (token.kind === "document") {
    const id = token.documentId as EvidenceId;
    const interactive = token.mode !== "collect";
    return <>
      <EvidenceDocument id={id} anchorId={anchorId} investigation={investigation} interactive={interactive} />
      {id === "T-03" && interactive && investigation.state.identified.includes(id) &&
        <EvidenceConvergence investigation={investigation} />}
    </>;
  }
  if (token.kind === "message") return (
    <div className={`chapter-three-message from-${token.speaker?.toLowerCase() ?? "unknown"}`} id={anchorId} data-reading-anchor={anchorId}>
      <span>{token.speaker}</span><p>{token.text}</p>
    </div>
  );
  return <p className={token.kind === "dialogue" ? "dialogue" : undefined} id={anchorId} data-reading-anchor={anchorId}>
    {token.kind === "dialogue" ? <DialogueText text={token.text} /> : token.text}
  </p>;
}

function ChapterGate({ documentId }: { documentId: EvidenceId }) {
  return <section className="chapter-evidence-gate" role="status" aria-live="polite">
    <div className="chapter-gate-lock" aria-hidden="true">
      <svg viewBox="0 0 80 96"><path className="gate-lock-shackle" d="M21 42V29C21 13 29 6 40 6s19 7 19 23v13" /><path className="gate-lock-body" d="M9 39h62v49H9z" /><circle cx="40" cy="60" r="5" /><path d="M40 64v11" /></svg>
    </div>
    <div><span>{`${documentId} // EM EXAME`}</span><strong>A leitura continua depois desta descoberta.</strong>
      <p>Conclua a investigação na folha acima. Se precisar, peça uma observação a Leroy ou Derick.</p></div>
  </section>;
}

function markChapterComplete(number: 3 | 4) {
  try {
    window.localStorage.setItem(`myu-capitulo-${number}-complete`, "true");
    window.localStorage.setItem(`myu-capitulo-${number + 1}`, "unlocked");
    window.dispatchEvent(new Event("myu:reading-progress"));
  } catch { /* Browsers may deny persistent storage. */ }
}

export default function InvestigationReader({ number, chapter }: { number: 3 | 4; chapter: Chapter }) {
  const [access, setAccess] = useState<"checking" | "locked" | "unlocked">("checking");
  const investigation = useInvestigation();
  const scenes = useMemo(() => splitIntoScenes(chapter.tokens as StoryToken[]), [chapter.tokens]);
  const visibleScenes = useMemo(() => gateScenes(scenes, investigation.state.identified), [scenes, investigation.state.identified]);
  const chapterComplete = visibleScenes.length === scenes.length && !visibleScenes.some((scene) => scene.gateId);
  const ending = useRef<HTMLElement>(null);
  const firstDocument = number === 3 ? "documento-d-01" : "documento-t-02";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      ensureChapterSplit();
      const unlocked = number === 3
        ? window.localStorage.getItem("myu-capitulo-3") === "unlocked" || window.localStorage.getItem("myu-arg-a07") === "recovered"
        : window.localStorage.getItem("myu-capitulo-4") === "unlocked";
      if (unlocked) window.localStorage.setItem(`myu-capitulo-${number}`, "unlocked");
      setAccess(unlocked ? "unlocked" : "locked");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [number]);

  useEffect(() => {
    if (access !== "unlocked" || !investigation.hydrated || !chapterComplete || !ending.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { markChapterComplete(number); observer.disconnect(); }
    }, { threshold: 0.15 });
    observer.observe(ending.current);
    return () => observer.disconnect();
  }, [number, access, chapterComplete, investigation.hydrated]);

  if (access === "checking") return <main className="chapter-two-shell chapter-loading" aria-busy="true"><p>Abrindo o capítulo {number}…</p></main>;
  if (access === "locked") return <main className="chapter-two-shell">
    <div className="chapter-two-card locked-card">
      <div className="color-code" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <p>CAPÍTULO 0{number}</p>
      <h1>{number === 3 ? <>O PAPEL AINDA<br />NÃO LEMBROU.</> : <>A HISTÓRIA<br />CONTINUA ALI.</>}</h1>
      <span>{number === 3 ? "Recupere a folha perdida ao final do Capítulo 2." : "Termine a leitura do Capítulo 3 para continuar."}</span>
      <Link className="chapter-return-link" href={number === 3 ? "/capitulo-2#arg" : "/capitulo-3?retomar=1"}>← VOLTAR AO CAPÍTULO {number - 1}</Link>
    </div>
  </main>;

  return <main className={`chapter-three-reading investigation-reading chapter-${number}-reading`}>
    <ReadingProgressBar chapter={number} enabled={investigation.hydrated} />
    <EvidenceDrawer investigation={investigation} />
    <header className="site-header reader-site-header chapter-three-site-header">
      <Link href="/" className="wordmark" aria-label="Ir ao início de Myu">MYU</Link>
      <ChapterNavigation current={number} />
      <div className="chapter-marker"><span>PILOTO</span><span>{"//"}</span><span>CAPÍTULO {number}</span></div>
      <a href={`#${firstDocument}`} className="archive-link">DOCUMENTOS</a>
    </header>
    <section className={`chapter-three-cover investigation-cover investigation-cover-${number}`} id="inicio">
      <div className="chapter-three-cover-noise" aria-hidden="true" />
      <div className="chapter-three-cover-copy">
        <div className="color-code" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <p>UMA HISTÓRIA DE ZERO</p><h1>MYU</h1>
        <span>PILOTO // CAPÍTULO {number}</span>
        <small>CANDEIA · 13 DE AGOSTO DE 2025</small>
      </div>
      <aside className="chapter-three-investigation-note">
        <span>0{number} / ARQUIVO EM ABERTO</span>
        <strong>{number === 3 ? <>O QUE FICOU<br />SEM SER DITO.</> : <>O QUE FICOU<br />FORA DO PAPEL.</>}</strong>
        <p>{number === 3 ? "Dois irmãos. Oito anos de uma mesma versão." : "A lembrança terminou. Ainda há alguém que precisa responder."}</p>
        <span className="cover-investigation-count">2 INVESTIGAÇÕES NESTE CAPÍTULO</span>
      </aside>
      <ContinueReading className="cover-continue" />
      <a className="start-reading" href="#leitura">INICIAR LEITURA <span>↓</span></a>
    </section>
    <article className="chapter-three-article" id="leitura">
      <header className="chapter-title-block chapter-three-title-block" id={`c${number}-start`} data-reading-anchor={`c${number}-start`}>
        <p>0{number}</p><h2>CAPÍTULO {number}</h2><ReadingEstimate tokens={chapter.tokens} investigation />
      </header>
      <ChapterContents chapter={number} labels={visibleScenes.map(({ sceneIndex }) => chapter.sceneLabels[sceneIndex])} />
      {visibleScenes.map(({ scene, sceneIndex, gateId }) => <section
        className={`story-scene chapter-three-scene chapter-three-scene-${sceneIndex}${number === 3 && sceneIndex === scenes.length - 1 ? " memory-scene" : ""}`}
        id={`c${number}-scene-${sceneIndex + 1}`} data-scene={String(sceneIndex + 1).padStart(2, "0")} key={sceneIndex}>
        <aside className="scene-label" aria-hidden="true"><span>{String(sceneIndex + 1).padStart(2, "0")}</span><small>{chapter.sceneLabels[sceneIndex]}</small></aside>
        <div className="story-copy">
          {scene.map((token, tokenIndex) => <StoryTokenView key={token.anchorId ?? `${sceneIndex}-${tokenIndex}`}
            token={token} anchorId={token.kind === "document"
              ? token.documentId === "D-01" ? "documento-d-01" : number === 4 && token.documentId === "T-02" ? "documento-t-02"
                : `documento-${token.documentId?.toLowerCase()}-${token.mode ?? "challenge"}-${tokenIndex + 1}`
              : token.anchorId ?? `c${number}-s${sceneIndex + 1}-t${tokenIndex + 1}`}
            investigation={investigation} />)}
          {gateId && <ChapterGate documentId={gateId} />}
        </div>
      </section>)}
    </article>
    {chapterComplete && <section className="chapter-three-complete chapter-ending" ref={ending} id={`c${number}-complete`} data-reading-anchor={`c${number}-complete`}>
      <span id="fim">MYU / {number === 3 ? "03" : "04"}</span><h2>FIM DO CAPÍTULO {number}</h2>
      <p>{number === 3 ? "A continuação começa naquela mesma mesa." : "A continuação começa naquela mesma noite."}</p>
      <Link className="next-chapter-link" href={`/capitulo-${number + 1}?retomar=1`} onClick={() => {
        markChapterComplete(number); setNextChapterResume(number === 3 ? 4 : 5);
      }}><span><small>CONTINUAR</small><strong>Capítulo {number + 1}</strong></span><b aria-hidden="true">→</b></Link>
      <Link className="ending-return" href={`/capitulo-${number - 1}?retomar=1`}>← Voltar ao Capítulo {number - 1}</Link>
      <span className="ending-save-note">Seu lugar e suas evidências ficam salvos neste navegador.</span>
    </section>}
    <footer><span>MYU // PILOTO</span><span>UMA HISTÓRIA DE ZERO</span></footer>
  </main>;
}
