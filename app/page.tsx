"use client";

import { sitePath } from "./site-path";

import { FormEvent, useMemo, useState } from "react";
import chapter from "./chapter.json";
import { ChapterNavigation, ChapterContents, DialogueText, ReadingEstimate } from "./reading-tools";
import {
  ContinueReading,
  setNextChapterResume,
  ReadingProgressBar,
} from "./reading-progress";

type Token = {
  kind: "paragraph" | "dialogue" | "message" | "break";
  text: string;
  speaker?: string;
};

const SCENE_LABELS = [
  "O grave",
  "06:30",
  "06:40",
  "Ainda não procurou",
  "Candeia",
  "Os arquivos",
  "A fotografia",
];

const CORRECT_ANSWERS = new Set([
  "2017",
  "12082017",
  "12agosto2017",
  "12deagostode2017",
]);

function normalizeAnswer(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function splitIntoScenes(tokens: Token[]) {
  const scenes: Token[][] = [[]];
  for (const token of tokens) {
    if (token.kind === "break") {
      if (scenes.at(-1)?.length) scenes.push([]);
      continue;
    }
    scenes.at(-1)?.push(token);
  }
  return scenes.filter((scene) => scene.length > 0);
}

function SceneToken({ token, anchorId }: { token: Token; anchorId: string }) {
  if (token.kind === "message") {
    return (
      <div
        id={anchorId}
        data-reading-anchor={anchorId}
        className={`inline-message ${token.speaker === "Leroy" ? "from-leroy" : "from-derick"}`}
      >
        <span>{token.speaker}</span>
        <p>{token.text}</p>
      </div>
    );
  }

  if (token.kind === "dialogue") {
    return <p className="dialogue" id={anchorId} data-reading-anchor={anchorId}><DialogueText text={token.text} /></p>;
  }

  return <p id={anchorId} data-reading-anchor={anchorId}>{token.text}</p>;
}

export default function Home() {
  const scenes = useMemo(
    () => splitIntoScenes(chapter.tokens as Token[]),
    [],
  );
  const [answer, setAnswer] = useState("");
  const [argState, setArgState] = useState<"idle" | "wrong" | "unlocked">(
    "idle",
  );
  const [hintOpen, setHintOpen] = useState(false);

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (CORRECT_ANSWERS.has(normalizeAnswer(answer))) {
      window.localStorage.setItem("myu-capitulo-2", "unlocked");
      setNextChapterResume(2);
      setArgState("unlocked");
      window.setTimeout(() => {
        document.getElementById("arquivo-recuperado")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 220);
      return;
    }
    setArgState("wrong");
  }

  return (
    <main>
      <ReadingProgressBar chapter={1} />

      <header className="site-header reader-site-header">
        <a href="#inicio" className="wordmark" aria-label="Voltar ao início">
          MYU
        </a>
        <ChapterNavigation current={1} />
        <div className="chapter-marker">
          <span>PILOTO</span>
          <span>{"//"}</span>
          <span>CAPÍTULO 1</span>
        </div>
        <a href="#arg" className="archive-link">
          ARQUIVO 01
        </a>
      </header>

      <section className="cover" id="inicio">
        <div className="cover-noise" />
        <div className="cover-copy">
          <div className="color-code" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
          <p className="eyebrow">UMA HISTÓRIA DE ZERO</p>
          <h1>MYU</h1>
          <div className="cover-rule" />
          <p className="cover-subtitle">PILOTO // CAPÍTULO 1</p>
          <p className="edition">EDIÇÃO REVISADA</p>
        </div>

        <div className="locked-frame" aria-label="Arquivo de imagem bloqueado">
          <div className="locked-frame-top">
            <span>ARQUIVO DE IMAGEM // BLOQUEADO</span>
            <span className="status-dot" />
          </div>
          <div className="silhouette-row" aria-hidden="true">
            {["violet", "sage", "cream", "teal", "rust", "gold", "violet", "sage", "cream", "teal"].map(
              (color, index) => (
                <span
                  className={`silhouette ${color}`}
                  style={{ height: `${48 + ((index * 17) % 42)}%` }}
                  key={`${color}-${index}`}
                />
              ),
            )}
          </div>
        </div>

        <ContinueReading className="cover-continue" />
        <a className="start-reading" href="#leitura">
          INICIAR LEITURA <span>↓</span>
        </a>
      </section>

      <article className="chapter" id="leitura">
        <header className="chapter-title-block" id="c1-start" data-reading-anchor="c1-start">
          <p>01</p>
          <h2>CAPÍTULO 1</h2>
          <ReadingEstimate tokens={chapter.tokens} />
        </header>

        <ChapterContents chapter={1} labels={SCENE_LABELS} />

        {scenes.map((scene, sceneIndex) => (
          <section
            className={`story-scene scene-${sceneIndex}`}
            key={`scene-${sceneIndex}`}
            id={`c1-scene-${sceneIndex + 1}`}
            data-scene={String(sceneIndex + 1).padStart(2, "0")}
          >
            <aside className="scene-label" aria-hidden="true">
              <span>{String(sceneIndex + 1).padStart(2, "0")}</span>
              <small>{SCENE_LABELS[sceneIndex]}</small>
            </aside>
            <div className="story-copy">
              {scene.map((token, tokenIndex) => (
                <SceneToken
                  token={token}
                  anchorId={`c1-s${sceneIndex + 1}-t${tokenIndex + 1}`}
                  key={`${sceneIndex}-${tokenIndex}-${token.text.slice(0, 18)}`}
                />
              ))}
            </div>
          </section>
        ))}
      </article>

      <section className="arg-section" id="arg" data-reading-anchor="c1-arg">
        <div className="arg-grain" />
        <div className="arg-intro">
          <p>FIM DO CAPÍTULO 1 // ETAPA DO ARG</p>
          <h2>EM QUE ANO ESTA<br />FOTOGRAFIA FOI<br />TIRADA?</h2>
          <span>A resposta conduz ao próximo capítulo.</span>
        </div>

        <div className="arg-grid">
          <div className="arg-console">
            <p className="console-label">CONSULTA DE ARQUIVO</p>
            <p className="console-copy">
              REGISTRO PARCIAL: 12 / 08 / ____<br />
              O capítulo contém o intervalo que falta.
            </p>

            <form onSubmit={submitAnswer} noValidate>
              <label htmlFor="photo-date">ANO DA FOTOGRAFIA</label>
              <div className="answer-row">
                <input
                  id="photo-date"
                  inputMode="text"
                  autoComplete="off"
                  placeholder="AAAA"
                  value={answer}
                  onChange={(event) => {
                    setAnswer(event.target.value);
                    if (argState === "wrong") setArgState("idle");
                  }}
                  aria-describedby="arg-feedback"
                />
                <button type="submit">VERIFICAR</button>
              </div>
              <p
                id="arg-feedback"
                className={`arg-feedback ${argState}`}
                role="status"
                aria-live="polite"
              >
                {argState === "wrong" && "O ano não corresponde ao registro."}
                {argState === "unlocked" && "Registro localizado. Acesso autorizado."}
              </p>
            </form>

            <button
              className="hint-toggle"
              type="button"
              onClick={() => setHintOpen((value) => !value)}
              aria-expanded={hintOpen}
            >
              {hintOpen ? "FECHAR PISTA" : "SOLICITAR PISTA"}
            </button>
            {hintOpen && (
              <div className="hint-card">
                <span>PISTA 01</span>
                <p>
                  A tela mostra o presente. Vicente informou quantos anos
                  separam os dois registros.
                </p>
              </div>
            )}
          </div>

          <div className={`phone ${argState === "unlocked" ? "is-unlocked" : ""}`}>
            <div className="phone-speaker" />
            <div className="phone-screen">
              <div className="phone-photo old-photo" />
              <div className="phone-photo current-photo" />
              <div className="phone-status">
                <span>14:08</span>
                <span>● ● ●</span>
              </div>
              <div className="lock-date">
                <strong>14:08</strong>
                <span>terça-feira, 12 de agosto de 2025</span>
              </div>
              <div className="unlock-home">
                <span>ARQUIVO RECUPERADO</span>
                <strong>Derick</strong>
                <small>últimas chamadas recusadas</small>
              </div>
              <div className="swipe-line" />
            </div>
          </div>
        </div>

        {argState === "unlocked" && (
          <div className="recovered" id="arquivo-recuperado">
            <div className="recovered-heading">
              <p>REGISTRO PRIVADO // ACESSO 01</p>
              <h3>O CELULAR DE LEROY</h3>
            </div>

            <div className="recovered-grid">
              <figure className="photo-record">
                <div className="recovered-photo old-photo" />
                <figcaption>
                  <span>IMG_12082017.JPG</span>
                  <span>12.08.2017 // HORÁRIO CORROMPIDO</span>
                </figcaption>
              </figure>

              <div className="chat-record" aria-label="Conversa recuperada com Derick">
                <div className="chat-top">
                  <span className="chat-avatar">D</span>
                  <div>
                    <strong>Derick</strong>
                    <small>contato bloqueado</small>
                  </div>
                </div>
                <div className="chat-search">BUSCA: “FACULDADE” // 6 RESULTADOS</div>
                <div className="bubble derick">Quando terminar a escola, vou tentar a Universidade de Candeia.</div>
                <div className="bubble leroy">Fazer o quê?</div>
                <div className="bubble derick">Entrar nela.</div>
                <div className="bubble leroy">O curso, animal.</div>
                <div className="bubble derick">Ainda não sei.<br />Só sei que quero estudar lá.</div>
              </div>
            </div>

            <div className="unlock-next">
              <div>
                <span>ARQUIVO 02</span>
                <strong>CAPÍTULO 2</strong>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNextChapterResume(2);
                  window.location.assign(sitePath("/capitulo-2/"));
                }}
              >
                ABRIR PRÓXIMO CAPÍTULO <span>→</span>
              </button>
            </div>
          </div>
        )}
      </section>

      <footer>
        <span>MYU // PILOTO</span>
        <span>UMA HISTÓRIA DE ZERO</span>
      </footer>
    </main>
  );
}
