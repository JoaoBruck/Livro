"use client";

import {
  CSSProperties,
  KeyboardEvent,
  PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import chapter from "../chapter2.json";
import { ChapterNavigation, ChapterContents, DialogueText, ReadingEstimate } from "../reading-tools";
import {
  ContinueReading,
  setNextChapterResume,
  ReadingProgressBar,
} from "../reading-progress";

type StoryToken = {
  kind: "paragraph" | "dialogue" | "artifact" | "break";
  text: string;
};

type Point = { x: number; y: number };
type ArchiveProgress = {
  found: string[];
  light: Point;
  angle: number;
  contrast: number;
};
type ArchiveStage =
  | "sealed"
  | "scan"
  | "unstable"
  | "reconstructing"
  | "recovered";

const SCENE_LABELS = ["SEXTA-FEIRA", "12 DE AGOSTO", "OITO ANOS DEPOIS"];
const ARCHIVE_PROGRESS_KEY = "myu-arg-a07-progress-v1";

const IMPRESSIONS = [
  { id: "leroy", x: 29, y: 34, rotate: -1.2, text: "Leroy, deixa minha prateleira vazia..." },
  { id: "derick", x: 67, y: 49, rotate: 0.8, text: "Derick, não termina o livro..." },
  { id: "domingo", x: 36, y: 63, rotate: -0.5, text: "...domingo depois do almoço..." },
  { id: "noite", x: 72, y: 79, rotate: 1.1, text: "...eu pego à noite." },
];

function splitIntoScenes(tokens: StoryToken[]) {
  const scenes: StoryToken[][] = [[]];
  for (const token of tokens) {
    if (token.kind === "break") {
      if (scenes.at(-1)?.length) scenes.push([]);
      continue;
    }
    scenes.at(-1)?.push(token);
  }
  return scenes.filter((scene) => scene.length > 0);
}

function StoryTokenView({ token, anchorId }: { token: StoryToken; anchorId: string }) {
  const isBlackoutStart = token.text === "A cozinha apagou.";
  const isPowerReturn = token.text.startsWith("Quando a luz elétrica voltou");

  if (token.kind === "artifact") {
    return <p className="chapter-two-artifact" id={anchorId} data-reading-anchor={anchorId}>{token.text}</p>;
  }

  return (
    <p
      data-reading-anchor={anchorId}
      className={token.kind === "dialogue" ? "dialogue" : undefined}
      id={
        isBlackoutStart
          ? "apagao-inicio"
          : isPowerReturn
            ? "apagao-fim"
            : anchorId
      }
    >
      {token.kind === "dialogue" ? <DialogueText text={token.text} /> : token.text}
    </p>
  );
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function readArchiveProgress(): ArchiveProgress | null {
  try {
    const raw = window.localStorage.getItem(ARCHIVE_PROGRESS_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<ArchiveProgress>;
    const validIds = new Set(IMPRESSIONS.map((fragment) => fragment.id));
    return {
      found: Array.from(new Set((value.found ?? []).filter((id) => validIds.has(id)))),
      light: {
        x: clamp(value.light?.x ?? 51, 2, 98),
        y: clamp(value.light?.y ?? 46, 2, 98),
      },
      angle: clamp(value.angle ?? 14, 6, 42),
      contrast: clamp(value.contrast ?? 58, 20, 90),
    };
  } catch {
    return null;
  }
}

function MemoryArchive() {
  const [stage, setStage] = useState<ArchiveStage>("sealed");
  const [found, setFound] = useState<string[]>([]);
  const [light, setLight] = useState<Point>({ x: 51, y: 46 });
  const [angle, setAngle] = useState(14);
  const [contrast, setContrast] = useState(58);
  const [scanSeconds, setScanSeconds] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const draggingRef = useRef(false);
  const recoveredRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.location.hash !== "#arg") return;
    const timer = window.setTimeout(() => {
      if (window.localStorage.getItem("myu-arg-a07") === "recovered") {
        setStage("recovered");
        return;
      }
      const saved = readArchiveProgress();
      if (!saved) return;
      setFound(saved.found);
      setLight(saved.light);
      setAngle(saved.angle);
      setContrast(saved.contrast);
      setStage(saved.found.length >= IMPRESSIONS.length ? "unstable" : "scan");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (stage !== "scan") return;
    const timer = window.setInterval(() => setScanSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "scan") return;
    window.localStorage.setItem(ARCHIVE_PROGRESS_KEY, JSON.stringify({
      found,
      light,
      angle,
      contrast,
    } satisfies ArchiveProgress));
  }, [angle, contrast, found, light, stage]);

  useEffect(() => {
    if (stage !== "unstable") return;
    const timer = window.setTimeout(
      () => setStage("reconstructing"),
      reduceMotion ? 350 : 2400,
    );
    return () => window.clearTimeout(timer);
  }, [reduceMotion, stage]);

  useEffect(() => {
    if (stage !== "reconstructing") return;
    const timer = window.setTimeout(
      () => setStage("recovered"),
      reduceMotion ? 500 : 5200,
    );
    return () => window.clearTimeout(timer);
  }, [reduceMotion, stage]);

  useEffect(() => {
    if (stage !== "recovered") return;
    window.localStorage.setItem("myu-arg-a07", "recovered");
    window.localStorage.setItem("myu-capitulo-3", "unlocked");
    window.localStorage.removeItem(ARCHIVE_PROGRESS_KEY);
    setNextChapterResume(3);
    window.setTimeout(() => recoveredRef.current?.focus(), 80);
  }, [stage]);

  function markImpressions(point: Point, nextAngle = angle) {
    if (stage !== "scan" || nextAngle > 34) return;
    const hits = IMPRESSIONS.filter((fragment) => {
      const dx = (point.x - fragment.x) / 1.25;
      const dy = point.y - fragment.y;
      return Math.hypot(dx, dy) < 18;
    }).map((fragment) => fragment.id);

    if (!hits.length) return;
    setFound((current) => {
      const next = Array.from(new Set([...current, ...hits]));
      if (next.length >= IMPRESSIONS.length) {
        window.setTimeout(() => setStage("unstable"), 0);
      }
      return next;
    });
  }

  function moveLight(event: PointerEvent<HTMLDivElement>) {
    if (stage !== "scan" || (event.pointerType !== "mouse" && !draggingRef.current)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const next = {
      x: clamp(((event.clientX - rect.left) / rect.width) * 100, 2, 98),
      y: clamp(((event.clientY - rect.top) / rect.height) * 100, 2, 98),
    };
    setLight(next);
    markImpressions(next);
  }

  function startDragging(event: PointerEvent<HTMLDivElement>) {
    if (stage !== "scan") return;
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    moveLight(event);
  }

  function stopDragging(event: PointerEvent<HTMLDivElement>) {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function moveLightWithKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (stage !== "scan") return;
    const movement: Record<string, Point> = {
      ArrowLeft: { x: -5, y: 0 },
      ArrowRight: { x: 5, y: 0 },
      ArrowUp: { x: 0, y: -5 },
      ArrowDown: { x: 0, y: 5 },
    };
    const delta = movement[event.key];
    if (!delta) return;
    event.preventDefault();
    const next = {
      x: clamp(light.x + delta.x, 2, 98),
      y: clamp(light.y + delta.y, 2, 98),
    };
    setLight(next);
    markImpressions(next);
  }

  function openArchive() {
    const recovered = window.localStorage.getItem("myu-arg-a07") === "recovered";
    const saved = recovered ? null : readArchiveProgress();
    if (saved) {
      setFound(saved.found);
      setLight(saved.light);
      setAngle(saved.angle);
      setContrast(saved.contrast);
    }
    setStage(recovered
      ? "recovered"
      : saved && saved.found.length >= IMPRESSIONS.length
        ? "unstable"
        : "scan");
    window.setTimeout(
      () => document.getElementById("arquivo-a07-documento")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      }),
      80,
    );
  }

  function resetArchive() {
    window.localStorage.removeItem(ARCHIVE_PROGRESS_KEY);
    setFound([]);
    setLight({ x: 51, y: 46 });
    setAngle(14);
    setContrast(58);
    setScanSeconds(0);
    setStage("scan");
  }

  const archiveStatus =
    stage === "recovered"
      ? "ARQUIVO RECUPERADO"
      : stage === "reconstructing"
        ? "ORIGEM: AUSENTE"
        : stage === "unstable"
          ? "STATUS: ÍNTEGRA?"
          : scanSeconds > 28
            ? "INCIDÊNCIA BAIXA RECOMENDADA"
            : scanSeconds > 14
              ? "SUPERFÍCIE: IRREGULAR"
              : "STATUS: ÍNTEGRA";

  const documentStyle = {
    "--light-x": `${light.x}%`,
    "--light-y": `${light.y}%`,
    "--scan-contrast": `${0.72 + contrast / 145}`,
    "--indent-opacity": `${0.24 + contrast / 210}`,
    "--light-tilt": `${angle - 14}deg`,
  } as CSSProperties;

  return (
    <section className={`memory-archive archive-${stage}`} id="arg" data-reading-anchor="c2-arg">
      <div className="memory-noise" aria-hidden="true" />

      {stage === "sealed" ? (
        <div className="archive-entry">
          <p>A-07</p>
          <h2>CADERNO AZUL // FOLHA 43</h2>
          <span>STATUS: ÍNTEGRA</span>
          <button type="button" onClick={openArchive}>ABRIR ARQUIVO</button>
        </div>
      ) : (
        <div className="archive-workbench" id="arquivo-a07-documento">
          <header className="archive-document-header">
            <div>
              <span>ARQUIVO DE MEMÓRIA // A-07</span>
              <strong>CADERNO AZUL // FOLHA{stage === "recovered" ? " 42" : " 43"}</strong>
            </div>
            <p>{archiveStatus}</p>
          </header>

          {stage === "scan" && <div className="impression-progress" aria-hidden="true">
            {IMPRESSIONS.map((fragment) => <i key={fragment.id} className={found.includes(fragment.id) ? "is-found" : undefined} />)}
            <span>{found.length}/{IMPRESSIONS.length} MARCAS</span>
          </div>}
          <div className={`paper-inspection stage-${stage}`} style={documentStyle}>
            <div
              className="paper-surface"
              role="application"
              tabIndex={stage === "scan" ? 0 : -1}
              aria-label="Folha de caderno sob uma fonte de luz móvel. Use o mouse, toque ou as setas do teclado para deslocar a luz."
              onPointerDown={startDragging}
              onPointerMove={moveLight}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
              onKeyDown={moveLightWithKeyboard}
            >
              <div className="page-ruling" aria-hidden="true" />
              <span className="page-folio page-folio-43" aria-hidden="true">43</span>
              <span className="page-folio page-folio-42" aria-hidden="true">42</span>
              <div className="ordinary-marks" aria-hidden="true"><i /><i /><i /></div>

              <div className="moving-impressions" aria-hidden="true">
                {IMPRESSIONS.map((fragment) => (
                  <span
                    className="indent-fragment"
                    key={`moving-${fragment.id}`}
                    style={{
                      left: `${fragment.x}%`,
                      top: `${fragment.y}%`,
                      transform: `translate(-50%, -50%) rotate(${fragment.rotate}deg)`,
                    }}
                  >
                    {fragment.text}
                  </span>
                ))}
              </div>

              <div className="fixed-impressions" aria-hidden="true">
                {IMPRESSIONS.filter((fragment) => found.includes(fragment.id)).map((fragment) => (
                  <span
                    className="indent-fragment"
                    key={`fixed-${fragment.id}`}
                    style={{
                      left: `${fragment.x}%`,
                      top: `${fragment.y}%`,
                      transform: `translate(-50%, -50%) rotate(${fragment.rotate}deg)`,
                    }}
                  >
                    {fragment.text}
                  </span>
                ))}
              </div>

              <div className="moving-light" aria-hidden="true" />

              <article
                ref={recoveredRef}
                className="burned-letter"
                tabIndex={stage === "recovered" ? 0 : -1}
                aria-hidden={stage !== "recovered"}
                aria-label="Carta recuperada de Alana para Leroy e Derick"
              >
                <p>Leroy e Derick,</p>
                <p>
                  eu ia falar amanhã, mas o Leroy vai começar a dizer o que eu
                  tenho que levar e o Derick vai perguntar a mesma coisa até
                  alguém responder. Então estou escrevendo.
                </p>
                <p>
                  Eu vou com a Sônia e o Augusto. Eu gosto deles. Também gosto
                  daqui. As duas coisas cabem. Minhas roupas é que não.
                </p>
                <p>
                  Leroy, deixa minha prateleira vazia. Você falou que não quer,
                  então não pega depois só porque está sobrando. E a blusa cinza
                  fica. Ela pinica.
                </p>
                <p>
                  Derick, não termina o livro. Você contou errado. Faltam sete
                  páginas. Domingo depois do almoço eu termino, e se você ler
                  antes eu conto o final errado do próximo.
                </p>
                <p>
                  A cachorra pode dormir na minha cama, mas não deixa ela comer
                  o canto do travesseiro de novo.
                </p>
                <p className="crossed-line"><del>Tchau.</del></p>
                <p>Não sei terminar isso.</p>
                <p>Alana</p>
                <p className="letter-postscript">
                  P.S. se sobrar o pedaço queimado do bolo, guarda. Eu pego à
                  noite.
                </p>
              </article>
            </div>

            {stage === "scan" && (
              <div className="inspection-controls" aria-label="Controles de iluminação">
                <label>
                  <span>ÂNGULO</span>
                  <input
                    type="range"
                    min="6"
                    max="42"
                    value={angle}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      setAngle(next);
                      markImpressions(light, next);
                    }}
                  />
                  <output>{angle}°</output>
                </label>
                <label>
                  <span>CONTRASTE</span>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    value={contrast}
                    onChange={(event) => setContrast(Number(event.target.value))}
                  />
                  <output>{contrast}</output>
                </label>
              </div>
            )}
          </div>

          <p className="archive-live-status" aria-live="polite">
            {stage === "scan" && `${found.length}/${IMPRESSIONS.length} marcas localizadas. Desloque a luz e ajuste o ângulo para examinar a folha.`}
            {stage === "unstable" && "A fonte de luz deixou de responder."}
            {stage === "reconstructing" && "O suporte não corresponde ao arquivo."}
            {stage === "recovered" && "Folha 42 recuperada."}
          </p>

          {stage === "recovered" && (
            <div className="archive-residue">
              <span>ARQUIVO RECUPERADO</span>
              <strong>O PAPEL LEMBRA.</strong>
              <button
                className="open-chapter-three"
                type="button"
                onClick={() => {
                  setNextChapterResume(3);
                  window.location.assign("/capitulo-3");
                }}
              >
                ABRIR CAPÍTULO 3
              </button>
              <button type="button" onClick={resetArchive}>REEXAMINAR FOLHA 43</button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default function ChapterTwo() {
  const [access, setAccess] = useState<"checking" | "locked" | "unlocked">("checking");
  const [blackout, setBlackout] = useState(false);
  const [blackoutEpoch, setBlackoutEpoch] = useState(0);
  const blackoutRef = useRef(false);

  const scenes = useMemo(() => splitIntoScenes(chapter.tokens as StoryToken[]), []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAccess(
        window.localStorage.getItem("myu-capitulo-2") === "unlocked"
          ? "unlocked"
          : "locked",
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (access !== "unlocked") return;
    const update = () => {
      const start = document.getElementById("apagao-inicio");
      const end = document.getElementById("apagao-fim");
      if (!start || !end) return;
      const readingLine = window.innerHeight * 0.48;
      const next = readingLine >= start.getBoundingClientRect().top && readingLine < end.getBoundingClientRect().top;
      if (next !== blackoutRef.current) {
        blackoutRef.current = next;
        setBlackout(next);
        if (next) setBlackoutEpoch((value) => value + 1);
      }
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("myu:reading-settings", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("myu:reading-settings", update);
    };
  }, [access]);

  if (access === "checking") return <main className="chapter-two-shell" aria-busy="true" />;

  if (access === "locked") {
    return (
      <main className="chapter-two-shell">
        <div className="chapter-two-card locked-card">
          <div className="color-code" aria-hidden="true"><i /><i /><i /><i /></div>
          <p>ARQUIVO 02 // BLOQUEADO</p>
          <h1>VOCÊ CHEGOU<br />CEDO DEMAIS.</h1>
          <span>A resposta está no final do Capítulo 1.</span>
          <button type="button" onClick={() => window.location.assign("/#arg")}>VOLTAR AO ARQUIVO 01</button>
        </div>
      </main>
    );
  }

  return (
    <main className={`chapter-two-reading ${blackout ? "blackout-active" : ""}`}>
      <ReadingProgressBar chapter={2} />
      {blackout && <div className="blackout-flash" key={blackoutEpoch} aria-hidden="true" />}

      <header className="site-header reader-site-header chapter-two-site-header">
        <Link href="/" className="wordmark" aria-label="Voltar ao Capítulo 1">MYU</Link>
        <ChapterNavigation current={2} />
        <div className="chapter-marker"><span>PILOTO</span><span>{"//"}</span><span>CAPÍTULO 2</span></div>
        <a href="#arg" className="archive-link">A-07</a>
      </header>

      <section className="chapter-two-cover" id="inicio">
        <div className="chapter-two-cover-noise" aria-hidden="true" />
        <div className="chapter-two-cover-copy">
          <div className="color-code" aria-hidden="true"><i /><i /><i /><i /><i /></div>
          <p>UMA HISTÓRIA DE ZERO</p>
          <h1>MYU</h1>
          <span>PILOTO // CAPÍTULO 2</span>
          <small>EDIÇÃO REVISADA</small>
        </div>

        <figure className="chapter-two-photo-frame">
          <div className="chapter-two-photo-label">
            <span>ARQUIVO DE IMAGEM // REGISTRO ATUAL</span>
            <span className="status-dot" aria-hidden="true" />
          </div>
          <img
            src="/images/myu-chapter-2-current-group.webp"
            alt="Leroy com as sete crianças atuais da casa-lar no pátio."
          />
        </figure>
        <ContinueReading className="cover-continue" />
        <a className="start-reading" href="#leitura">INICIAR LEITURA <span>↓</span></a>
      </section>

      <article className="chapter-two-article" id="leitura">
        <header className="chapter-title-block chapter-two-title-block" id="c2-start" data-reading-anchor="c2-start">
          <p>02</p>
          <h2>CAPÍTULO 2</h2>
          <ReadingEstimate tokens={chapter.tokens} />
        </header>

        <ChapterContents chapter={2} labels={SCENE_LABELS} />

        {scenes.map((scene, sceneIndex) => (
          <section
            className={`story-scene chapter-two-scene chapter-two-scene-${sceneIndex}`}
            id={`c2-scene-${sceneIndex + 1}`}
            data-scene={String(sceneIndex + 1).padStart(2, "0")}
            key={`chapter-two-scene-${sceneIndex}`}
          >
            <aside className="scene-label" aria-hidden="true">
              <span>{String(sceneIndex + 1).padStart(2, "0")}</span>
              <small>{SCENE_LABELS[sceneIndex]}</small>
            </aside>
            <div className="story-copy">
              {scene.map((token, tokenIndex) => (
                <StoryTokenView
                  token={token}
                  anchorId={`c2-s${sceneIndex + 1}-t${tokenIndex + 1}`}
                  key={`${sceneIndex}-${tokenIndex}-${token.text.slice(0, 20)}`}
                />
              ))}
            </div>
          </section>
        ))}
      </article>

      <MemoryArchive />

      <footer><span>MYU // PILOTO</span><span>UMA HISTÓRIA DE ZERO</span></footer>
    </main>
  );
}
