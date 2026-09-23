"use client";

import {
  CSSProperties,
  KeyboardEvent,
  PointerEvent,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  CharacterId,
  EVIDENCE,
  EVIDENCE_ORDER,
  EvidenceDefinition,
  EvidenceId,
  RELATIONS,
} from "../chapter3-evidence";
import { deriveRelations } from "../investigation-flow";
import { DocumentFaces } from "../document-faces";
import { useReaderDialog } from "../use-reader-dialog";

const STORAGE_KEY = "myu-chapter3-investigation-v3";

type InvestigationState = {
  version: 3;
  discovered: EvidenceId[];
  activated: EvidenceId[];
  examined: EvidenceId[];
  identified: EvidenceId[];
  puzzleData: Partial<Record<EvidenceId, string[]>>;
  sides: Partial<Record<EvidenceId, Array<"front" | "back">>>;
  hintLevels: Partial<Record<string, number>>;
  relations: string[];
  supernaturalSeen: boolean;
  looseDocuments: Partial<Record<EvidenceId, LooseDocumentPlacement>>;
};

type LooseDocumentPlacement = {
  x: number;
  y: number;
  rotation: number;
  side: "front" | "back";
  z: number;
};

const INITIAL_STATE: InvestigationState = {
  version: 3,
  discovered: ["A-01"],
  activated: [],
  examined: [],
  identified: [],
  puzzleData: {},
  sides: {},
  hintLevels: {},
  relations: [],
  supernaturalSeen: false,
  looseDocuments: {},
};

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function parseLooseDocuments(value: unknown): InvestigationState["looseDocuments"] {
  if (!value || typeof value !== "object") return {};
  const result: InvestigationState["looseDocuments"] = {};
  for (const id of EVIDENCE_ORDER) {
    const placement = (value as Partial<Record<EvidenceId, Partial<LooseDocumentPlacement>>>)[id];
    if (!placement) continue;
    result[id] = {
      x: clamp(Number(placement.x) || 50, 8, 92),
      y: clamp(Number(placement.y) || 45, 10, 88),
      rotation: clamp(Number(placement.rotation) || 0, -8, 8),
      side: placement.side === "back" ? "back" : "front",
      z: Math.max(1, Number(placement.z) || 1),
    };
  }
  return result;
}

function parseState(raw: string | null): InvestigationState {
  if (!raw) return INITIAL_STATE;
  try {
    const value = JSON.parse(raw) as Partial<InvestigationState>;
    if (value.version !== 3) return INITIAL_STATE;
    const evidenceIds = new Set(EVIDENCE_ORDER);
    const puzzleData: InvestigationState["puzzleData"] = {};
    for (const id of EVIDENCE_ORDER) {
      const values = value.puzzleData?.[id]?.filter((item) => typeof item === "string" && item.length <= 120);
      if (values?.length) puzzleData[id] = unique(values);
    }
    return {
      version: 3,
      discovered: unique(["A-01", ...(value.discovered ?? []).filter((id) => evidenceIds.has(id))]),
      activated: unique((value.activated ?? []).filter((id) => evidenceIds.has(id))),
      examined: unique((value.examined ?? []).filter((id) => evidenceIds.has(id))),
      identified: unique((value.identified ?? []).filter((id) => evidenceIds.has(id))),
      puzzleData,
      sides: value.sides ?? {},
      hintLevels: value.hintLevels ?? {},
      relations: unique((value.relations ?? []).filter((id) => RELATIONS.some((relation) => relation.id === id))),
      supernaturalSeen: Boolean(value.supernaturalSeen),
      looseDocuments: parseLooseDocuments(value.looseDocuments),
    };
  } catch {
    return INITIAL_STATE;
  }
}

export function useInvestigation() {
  const [state, setState] = useState<InvestigationState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let restored = INITIAL_STATE;
      try { restored = parseState(window.localStorage.getItem(STORAGE_KEY)); } catch { /* Keep the current investigation usable. */ }
      setState({ ...restored, relations: deriveRelations(restored.discovered, restored.identified, restored.relations) });
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Progress still works for this visit. */ }
  }, [hydrated, state]);

  const update = useCallback((mutator: (current: InvestigationState) => InvestigationState) => {
    setState((current) => {
      const next = mutator(current);
      if (next === current) return current;
      return { ...next, relations: deriveRelations(next.discovered, next.identified, next.relations) };
    });
  }, []);

  const discover = useCallback((id: EvidenceId) => update((current) => current.discovered.includes(id) ? current : ({
    ...current,
    discovered: unique([...current.discovered, id]),
  })), [update]);

  const examine = useCallback((id: EvidenceId, side: "front" | "back" = "front") => update((current) => current.examined.includes(id) && current.sides[id]?.includes(side) ? current : ({
    ...current,
    examined: unique([...current.examined, id]),
    sides: {
      ...current.sides,
      [id]: unique([...(current.sides[id] ?? []), side]),
    },
  })), [update]);

  const activatePuzzle = useCallback((id: EvidenceId) => update((current) => current.activated.includes(id) ? current : ({
    ...current,
    activated: unique([...current.activated, id]),
  })), [update]);

  const identify = useCallback((id: EvidenceId) => update((current) => {
    if (current.identified.includes(id)) return current;
    const identified = unique([...current.identified, id]);
    return {
      ...current,
      examined: unique([...current.examined, id]),
      identified,
    };
  }), [update]);

  const setPuzzleData = useCallback((id: EvidenceId, values: string[]) => update((current) => ({
    ...current,
    examined: unique([...current.examined, id]),
    puzzleData: { ...current.puzzleData, [id]: unique(values) },
  })), [update]);

  const setPuzzleToken = useCallback((id: EvidenceId, prefix: string, value: string) => update((current) => ({
    ...current,
    examined: unique([...current.examined, id]),
    puzzleData: {
      ...current.puzzleData,
      [id]: unique([
        ...(current.puzzleData[id] ?? []).filter((item) => !item.startsWith(prefix)),
        value,
      ]),
    },
  })), [update]);

  const setPuzzleAssignment = useCallback((id: EvidenceId, slotPrefix: string, pieceSuffix: string, value: string) => update((current) => ({
    ...current,
    examined: unique([...current.examined, id]),
    puzzleData: {
      ...current.puzzleData,
      [id]: unique([
        ...(current.puzzleData[id] ?? []).filter((item) => !item.startsWith(slotPrefix) && !item.endsWith(pieceSuffix)),
        value,
      ]),
    },
  })), [update]);

  const addPuzzleValue = useCallback((id: EvidenceId, value: string) => update((current) => current.puzzleData[id]?.includes(value) ? current : ({
    ...current,
    examined: unique([...current.examined, id]),
    puzzleData: {
      ...current.puzzleData,
      [id]: unique([...(current.puzzleData[id] ?? []), value]),
    },
  })), [update]);

  const requestObservation = useCallback((id: string, character: CharacterId, maximum: number) => {
    const key = `${id}:${character}`;
    update((current) => ({
      ...current,
      hintLevels: {
        ...current.hintLevels,
        [key]: Math.min(maximum, (current.hintLevels[key] ?? 0) + 1),
      },
    }));
  }, [update]);

  const markSupernatural = useCallback(() => update((current) => current.supernaturalSeen ? current : ({
    ...current,
    supernaturalSeen: true,
  })), [update]);

  const takeOutDocument = useCallback((id: EvidenceId, point?: { x: number; y: number }) => update((current) => {
    const orderedIds = EVIDENCE_ORDER
      .filter((openId) => openId !== id && current.looseDocuments[openId])
      .sort((first, second) => (current.looseDocuments[first]?.z ?? 0) - (current.looseDocuments[second]?.z ?? 0));
    const looseDocuments = { ...current.looseDocuments };
    orderedIds.forEach((openId, index) => {
      looseDocuments[openId] = { ...looseDocuments[openId]!, z: index + 1 };
    });
    const existing = current.looseDocuments[id];
    const order = EVIDENCE_ORDER.indexOf(id);
    return {
      ...current,
      looseDocuments: {
        ...looseDocuments,
        [id]: {
          x: clamp(point?.x ?? existing?.x ?? 52 + (order % 3) * 4, 8, 92),
          y: clamp(point?.y ?? existing?.y ?? 42 + (order % 4) * 5, 10, 88),
          rotation: existing?.rotation ?? ((order % 3) - 1) * 1.8,
          side: existing?.side ?? "front",
          z: orderedIds.length + 1,
        },
      },
    };
  }), [update]);

  const moveLooseDocument = useCallback((id: EvidenceId, point: { x: number; y: number }) => update((current) => {
    const existing = current.looseDocuments[id];
    if (!existing) return current;
    return {
      ...current,
      looseDocuments: {
        ...current.looseDocuments,
        [id]: { ...existing, x: clamp(point.x, 8, 92), y: clamp(point.y, 10, 88) },
      },
    };
  }), [update]);

  const bringLooseDocumentToFront = useCallback((id: EvidenceId) => update((current) => {
    const existing = current.looseDocuments[id];
    if (!existing) return current;
    const orderedIds = EVIDENCE_ORDER
      .filter((openId) => openId !== id && current.looseDocuments[openId])
      .sort((first, second) => (current.looseDocuments[first]?.z ?? 0) - (current.looseDocuments[second]?.z ?? 0));
    const looseDocuments = { ...current.looseDocuments };
    orderedIds.forEach((openId, index) => {
      looseDocuments[openId] = { ...looseDocuments[openId]!, z: index + 1 };
    });
    return {
      ...current,
      looseDocuments: {
        ...looseDocuments,
        [id]: { ...existing, z: orderedIds.length + 1 },
      },
    };
  }), [update]);

  const flipLooseDocument = useCallback((id: EvidenceId) => update((current) => {
    const existing = current.looseDocuments[id];
    if (!existing) return current;
    const nextSide = existing.side === "front" ? "back" : "front";
    return {
      ...current,
      examined: unique([...current.examined, id]),
      sides: { ...current.sides, [id]: unique([...(current.sides[id] ?? []), nextSide]) },
      looseDocuments: {
        ...current.looseDocuments,
        [id]: { ...existing, side: nextSide },
      },
    };
  }), [update]);

  const storeLooseDocument = useCallback((id: EvidenceId) => update((current) => {
    if (!current.looseDocuments[id]) return current;
    const looseDocuments = { ...current.looseDocuments };
    delete looseDocuments[id];
    return { ...current, looseDocuments };
  }), [update]);

  const reset = useCallback(() => {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* Reset the in-memory investigation too. */ }
    setState(INITIAL_STATE);
  }, []);

  return {
    state,
    hydrated,
    discover,
    activatePuzzle,
    examine,
    identify,
    setPuzzleData,
    setPuzzleToken,
    setPuzzleAssignment,
    addPuzzleValue,
    requestObservation,
    markSupernatural,
    takeOutDocument,
    moveLooseDocument,
    bringLooseDocumentToFront,
    flipLooseDocument,
    storeLooseDocument,
    reset,
  };
}

export type InvestigationController = ReturnType<typeof useInvestigation>;

type DocumentInspectorProps = {
  document: EvidenceDefinition;
  investigation: InvestigationController;
  compact?: boolean;
  initialSide?: "front" | "back";
};

type ViewportPoint = { x: number; y: number };

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

const DIALOGUE_PORTRAITS: Record<CharacterId, string[]> = {
  DERICK: [
    "/images/dialogue/derick-observant.png",
    "/images/dialogue/derick-thinking.png",
    "/images/dialogue/derick-certain.png",
  ],
  LEROY: [
    "/images/dialogue/leroy-concerned.png",
    "/images/dialogue/leroy-reasoning.png",
    "/images/dialogue/leroy-firm.png",
  ],
};

function GameDialogue({ character, text, level }: { character: CharacterId; text: string; level: number }) {
  const portrait = DIALOGUE_PORTRAITS[character][clamp(level - 1, 0, 2)];
  return (
    <blockquote className={`character-dialogue character-${character.toLowerCase()}`}>
      <span className="game-dialogue-speaker" aria-hidden="true">
        <span className="game-dialogue-portrait" style={{ backgroundImage: `url(${portrait})` }} />
      </span>
      <div className="game-dialogue-copy">
        <strong>{character}</strong>
        <p>“{text}”</p>
      </div>
    </blockquote>
  );
}

type PuzzleProps = {
  document: EvidenceDefinition;
  investigation: InvestigationController;
  side: "front" | "back";
  lightEnabled: boolean;
  onFlip: () => void;
  onToggleLight: () => void;
};

function normalizeCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function PuzzleScene({ document, kind, title, children }: { document: EvidenceDefinition; kind: string; title: string; children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const [sceneHeight, setSceneHeight] = useState(0);
  const sceneRef = useRef<HTMLElement>(null);
  const expandButton = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const close = useCallback(() => { restoreFocus.current = true; setExpanded(false); }, []);
  useReaderDialog(sceneRef, expanded, close);
  useEffect(() => {
    if (!expanded && restoreFocus.current) { expandButton.current?.focus({ preventScroll: true }); restoreFocus.current = false; }
  }, [expanded]);
  const scene = <section ref={sceneRef} className={`evidence-puzzle material-workbench game-scene ${kind}-puzzle ${expanded ? "is-expanded" : ""}`} role={expanded ? "dialog" : undefined} aria-modal={expanded || undefined} aria-label={expanded ? title : undefined}>
    <header className="game-hud">
      <div><span>MYU / {document.id}</span><h4>{title}</h4></div>
      <button ref={expandButton} type="button" className="game-expand" data-dialog-close aria-label={expanded ? "Voltar ao capítulo" : "Ampliar mesa de investigação"} onClick={() => {
        if (expanded) close();
        else { setSceneHeight(sceneRef.current?.getBoundingClientRect().height ?? 0); setExpanded(true); }
      }}>{expanded ? "↙ VOLTAR" : "↗ AMPLIAR"}</button>
    </header>
    <div className="game-objective"><span>EM EXAME</span><p>{document.prompt}</p><details><summary>Como mexer</summary><p>{document.instruction}</p></details></div>
    <div className="game-world">{children}</div>
  </section>;
  return expanded ? <><div style={{ height: sceneHeight }} aria-hidden="true" />{createPortal(scene, window.document.body)}</> : scene;
}

function SolvedPuzzle({ document }: { document: EvidenceDefinition }) {
  return (
    <div className="evidence-puzzle-solved" role="status">
      <span>VESTÍGIO RECUPERADO</span>
      <strong>{document.successFeedback}</strong>
    </div>
  );
}

function CarbonRecoveryPuzzle({ document, investigation, side, lightEnabled, onFlip, onToggleLight }: PuzzleProps) {
  const [beam, setBeam] = useState({ x: 50, y: 50 });
  const [feedback, setFeedback] = useState("A borracha limpou a frente. A pressão permaneceu no carbono.");
  const data = investigation.state.puzzleData[document.id] ?? [];
  const code = data.find((value) => value.startsWith("code:"))?.slice(5) ?? "";
  const identified = investigation.state.identified.includes(document.id);
  const fragments = ["carbon:left", "carbon:middle", "carbon:right"];
  const recovered = fragments.filter((fragment) => data.includes(fragment));
  const mirrored = data.includes("carbon:mirrored");

  if (identified) return <SolvedPuzzle document={document} />;

  function inspectFragment(fragment: string) {
    if (side !== "back") {
      setFeedback("Os sulcos não abrem pela frente. Vire a segunda via.");
      return;
    }
    if (!lightEnabled) {
      setFeedback("A pressão existe, mas precisa de luz oblíqua para ganhar relevo.");
      return;
    }
    investigation.addPuzzleValue(document.id, fragment);
    setFeedback("Um trecho respondeu à luz. Ainda não trate a ordem visual como ordem de leitura.");
  }

  function verify() {
    if (!mirrored) {
      setFeedback("A impressão atravessou o papel ao contrário. Corrija primeiro o sentido da leitura.");
      return;
    }
    if (normalizeCode(code) !== "OT081244") {
      setFeedback("A referência ainda não fecha. Preserve letras, quatro algarismos centrais e os dois finais.");
      return;
    }
    investigation.identify(document.id);
  }

  return (
    <PuzzleScene document={document} kind="carbon" title="Debaixo da borracha">
      <div className="material-tools" aria-label="Preparar a leitura do carbono">
        <button type="button" onClick={onFlip}>{side === "front" ? "Virar para o verso" : "Voltar à frente"}</button>
        <button type="button" aria-pressed={lightEnabled} onClick={onToggleLight}>{lightEnabled ? "Luz oblíqua acesa" : "Acender luz oblíqua"}</button>
      </div>
      <p className="material-caption">{side === "back" ? "VERSO" : "FRENTE"} · Passe a luz pela impressão ou toque nos sulcos.</p>
      <div className={`carbon-scan ${side === "back" && lightEnabled ? "is-lit" : ""}`} aria-label="Trechos de pressão no verso" style={{ "--scan-x": `${beam.x}%`, "--scan-y": `${beam.y}%` } as CSSProperties} onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = clamp((event.clientX - bounds.left) / bounds.width * 100, 0, 100);
        const y = clamp((event.clientY - bounds.top) / bounds.height * 100, 0, 100);
        setBeam({ x, y });
        if (event.buttons && side === "back" && lightEnabled) inspectFragment(fragments[Math.min(2, Math.floor(x / 100 * 3))]);
      }}>
        {fragments.map((fragment, index) => (
          <button
            type="button"
            key={fragment}
            className={data.includes(fragment) ? "is-recovered" : ""}
            aria-label={`Examinar sulco ${index + 1}${data.includes(fragment) ? ", recuperado" : ""}`}
            aria-pressed={data.includes(fragment)}
            onClick={() => inspectFragment(fragment)}
          >
            <small>SULCO {index + 1}</small>
            <strong>{data.includes(fragment) ? ["44", "2180", "TO"][index] : "···"}</strong>
          </button>
        ))}
      </div>
      <p className="puzzle-step-status" role="status">{recovered.length}/3 trechos de pressão recuperados{recovered.length === 3 ? " · Confira o sentido da impressão." : ""}</p>
      {recovered.length === fragments.length && (
        <div className="carbon-mirror-stage">
          <span>{mirrored ? "LEITURA RECONSTRUÍDA" : "IMPRESSÃO NO VERSO"}</span>
          <output className={mirrored ? "is-corrected" : "is-reversed"}>
            {mirrored ? "OT · 0812 · 44" : "44 · 2180 · TO"}
          </output>
          {!mirrored && (
            <button type="button" onClick={() => investigation.addPuzzleValue(document.id, "carbon:mirrored")}>
              INVERTER A LEITURA
            </button>
          )}
        </div>
      )}
      {mirrored && (
        <label className="puzzle-entry-field">
          <span>Anotar a referência</span>
          <input value={code} maxLength={20} onChange={(event) => investigation.setPuzzleToken(document.id, "code:", `code:${event.target.value}`)} onKeyDown={(event) => { if (event.key === "Enter") verify(); }} placeholder="__-____-__" autoComplete="off" spellCheck={false} />
        </label>
      )}
      <button className="puzzle-verify" type="button" disabled={!mirrored} onClick={verify}>FIXAR A REFERÊNCIA</button>
      <p className="puzzle-feedback" aria-live="polite">{feedback}</p>
    </PuzzleScene>
  );
}

const SOURCE_THREAD = ["claim", "source", "unchecked"];

function SourceThreadPuzzle({ document, investigation }: PuzzleProps) {
  const [feedback, setFeedback] = useState("Um número parece fato até alguém perguntar quem o colocou no papel.");
  const data = investigation.state.puzzleData[document.id] ?? [];
  const identified = investigation.state.identified.includes(document.id);
  const chain = data.filter((value) => value.startsWith("thread:")).map((value) => value.slice(7));
  const nodes = [
    { id: "claim", eyebrow: "AFIRMAÇÃO", text: "OCUPAÇÃO INFORMADA: 01" },
    { id: "arrival", eyebrow: "RELÓGIO", text: "EQUIPE NO LOCAL: 19H08" },
    { id: "source", eyebrow: "ORIGEM", text: "DECLARAÇÃO: M. GOUVEIA" },
    { id: "escape", eyebrow: "OUTRO VEÍCULO", text: "EVASÃO ANTERIOR À EQUIPE" },
    { id: "unchecked", eyebrow: "CONFERÊNCIA", text: "CABINE NÃO EXAMINADA" },
    { id: "driver", eyebrow: "LOCALIZADO", text: "VICENTE FORA DA VAN" },
  ];

  if (identified) return <SolvedPuzzle document={document} />;

  function chooseNode(id: string) {
    const expected = SOURCE_THREAD[chain.length];
    if (id !== expected) {
      investigation.setPuzzleData(document.id, data.filter((value) => !value.startsWith("thread:")));
      setFeedback(chain.length
        ? "O fio encostou numa informação próxima, mas ela não demonstra a origem nem a conferência do número. A ligação se rompeu."
        : "Essa informação pertence à ocorrência, mas não é a afirmação cuja origem precisa ser rastreada.");
      return;
    }
    const nextChain = [...chain, id];
    const remaining = data.filter((value) => !value.startsWith("thread:"));
    investigation.setPuzzleData(document.id, [...remaining, ...nextChain.map((value) => `thread:${value}`)]);
    if (nextChain.length === SOURCE_THREAD.length) {
      setFeedback("O número termina numa declaração sem conferência independente.");
      investigation.identify(document.id);
    } else {
      setFeedback(nextChain.length === 1
        ? "A afirmação está presa. Agora siga-a até quem forneceu o dado."
        : "A fonte está presa. Falta saber se alguém conseguiu testar a versão.");
    }
  }

  return (
    <section className="evidence-puzzle thread-puzzle" aria-labelledby={`puzzle-${document.id}`}>
      <header>
        <span>TÉCNICA // RASTRO DE AUTORIA</span>
        <h4 id={`puzzle-${document.id}`}>{document.prompt}</h4>
        <p>{document.instruction}</p>
      </header>
      <div className="thread-board">
        {nodes.map((node) => {
          const position = chain.indexOf(node.id);
          return (
            <button type="button" key={node.id} className={position >= 0 ? "is-threaded" : ""} onClick={() => chooseNode(node.id)} aria-pressed={position >= 0}>
              <small>{node.eyebrow}</small>
              <strong>{node.text}</strong>
              {position >= 0 && <i aria-hidden="true">{position + 1}</i>}
            </button>
          );
        })}
      </div>
      <div className="thread-chain" aria-live="polite">
        {chain.length ? chain.map((id, index) => <span key={id}>{index + 1}</span>) : <small>NENHUM FIO PRESO</small>}
      </div>
      <button type="button" className="puzzle-reset" onClick={() => investigation.setPuzzleData(document.id, data.filter((value) => !value.startsWith("thread:")))}>SOLTAR O FIO</button>
      <p className="puzzle-feedback" aria-live="polite">{feedback}</p>
    </section>
  );
}

function SeatReconstructionPuzzle({ document, investigation }: PuzzleProps) {
  const [selectedPiece, setSelectedPiece] = useState("");
  const slotsRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState("Marque o assento. Depois escolha uma tira e toque na anotação em que ela deve ficar.");
  const data = investigation.state.puzzleData[document.id] ?? [];
  const identified = investigation.state.identified.includes(document.id);
  const seat = data.find((value) => value.startsWith("seat:"))?.slice(5) ?? "";
  const assignments = Object.fromEntries(data
    .filter((value) => value.startsWith("slot:"))
    .map((value) => value.slice(5).split("=")));
  const pieces = [
    { id: "load", label: "DEFORMAÇÃO / CARGA" },
    { id: "calibration", label: "CALIBRAÇÃO CONFORME" },
    { id: "sample", label: "COLETA T-19" },
    { id: "pretensioner", label: "PRETENSIONADOR ACIONADO" },
  ];
  const slots = [
    { id: "mechanism", label: "MECANISMO" },
    { id: "effect", label: "EFEITO NA FAIXA" },
    { id: "trace", label: "VESTÍGIO QUE SAI DA VAN" },
  ];

  if (identified) return <SolvedPuzzle document={document} />;

  function setSeat(id: string) {
    investigation.setPuzzleToken(document.id, "seat:", `seat:${id}`);
  }

  function placePiece(slot: string) {
    if (!selectedPiece) {
      if (assignments[slot]) {
        investigation.setPuzzleData(document.id, data.filter((value) => !value.startsWith(`slot:${slot}=`)));
        setFeedback("A tira voltou ao laudo. Você pode escolher outra e recolocá-la.");
      } else setFeedback("Escolha primeiro uma tira do laudo para encaixar neste espaço.");
      return;
    }
    investigation.setPuzzleAssignment(document.id, `slot:${slot}=`, `=${selectedPiece}`, `slot:${slot}=${selectedPiece}`);
    setSelectedPiece("");
    setFeedback("A tira foi encaixada. O conjunto só vale se cada achado cumprir uma função diferente.");
  }

  function verify() {
    if (seat !== "front-passenger") {
      setFeedback("A posição escolhida não coincide com R2 e com a indicação lateral do desenho.");
      return;
    }
    if (assignments.mechanism !== "pretensioner" || assignments.effect !== "load" || assignments.trace !== "sample") {
      setFeedback("Uma das tiras está cumprindo a função errada. Calibração valida o equipamento; não ocupa o assento nem viaja como vestígio.");
      return;
    }
    investigation.identify(document.id);
  }

  return (
    <PuzzleScene document={document} kind="seat" title="O lugar de R2">
      <div className="seat-reconstruction">
        <div className="seat-plan">
          <fieldset className="puzzle-seat-map">
            <legend>Marque R2 no interior da van</legend>
            <p className="van-direction"><span aria-hidden="true">↑</span> SENTIDO DE MARCHA</p>
            <div>
              {[
                { id: "front-driver", row: "FRENTE", label: "CONDUTOR" },
                { id: "front-passenger", row: "FRENTE", label: "PASSAGEIRO" },
                { id: "rear-left", row: "TRASEIRA", label: "ESQUERDA" },
                { id: "rear-right", row: "TRASEIRA", label: "DIREITA" },
              ].map((position) => (
                <button type="button" key={position.id} aria-label={`Marcar R2: ${position.row.toLowerCase()}, ${position.label.toLowerCase()}`} aria-pressed={seat === position.id} onClick={() => setSeat(position.id)}>
                  <span>{position.row}</span><strong>{position.label}</strong><i aria-hidden="true">{seat === position.id ? "R2" : "·"}</i>
                </button>
              ))}
            </div>
          </fieldset>
          <div ref={slotsRef} className="seat-chain-slots" aria-label="Anotações ligadas ao assento">
            {selectedPiece && <p className="piece-in-hand" role="status">Na mão: {pieces.find(piece => piece.id === selectedPiece)?.label}. Toque onde encaixar.</p>}
            {slots.map((slot, index) => (
              <button type="button" key={slot.id} className={assignments[slot.id] ? "is-filled" : ""} onClick={() => placePiece(slot.id)}>
                <small>{index + 1} / {slot.label}</small>
                <strong>{pieces.find((piece) => piece.id === assignments[slot.id])?.label ?? "Encaixar tira"}</strong>
                {assignments[slot.id] && !selectedPiece && <span>Toque para retirar</span>}
              </button>
            ))}
          </div>
        </div>
        <p className="material-caption">RECORTES DO LAUDO · Escolha uma tira; depois, uma anotação acima.</p>
        <div className="evidence-strips" aria-label="Tiras disponíveis">
          {pieces.map((piece) => (
            <button type="button" key={piece.id} className={selectedPiece === piece.id ? "is-selected" : ""} aria-pressed={selectedPiece === piece.id} onClick={() => {
              setSelectedPiece(selectedPiece === piece.id ? "" : piece.id);
              if (selectedPiece !== piece.id && (slotsRef.current?.closest(".game-scene")?.clientWidth ?? 1000) < 620) slotsRef.current?.scrollIntoView({ block: "start" });
            }}>
              {piece.label}<small>{selectedPiece === piece.id ? "NA MÃO" : Object.values(assignments).includes(piece.id) ? "JÁ ANOTADA" : "PEGAR TIRA"}</small>
            </button>
          ))}
        </div>
        <p className="puzzle-step-status" role="status">{selectedPiece ? `${pieces.find((piece) => piece.id === selectedPiece)?.label} — escolha onde encaixar.` : `${seat ? "R2 marcado" : "R2 sem posição"} · ${Object.keys(assignments).length}/3 anotações preenchidas`}</p>
      </div>
      <button className="puzzle-verify" type="button" onClick={verify}>TESTAR A CADEIA FÍSICA</button>
      <p className="puzzle-feedback" aria-live="polite">{feedback}</p>
    </PuzzleScene>
  );
}

const FOLIO_ITEMS = {
  collection: { code: "4-A", title: "TERMO DE COLETA", page: "17" },
  comparison: { code: "4-B", title: "COMPARAÇÃO FÍSICO-QUÍMICA", page: "?" },
  photos: { code: "4-C", title: "REGISTRO FOTOGRÁFICO", page: "19–21" },
  release: { code: "4-D", title: "LIBERAÇÃO DO VEÍCULO", page: "22" },
} as const;
type FolioItemId = keyof typeof FOLIO_ITEMS;
const CORRECT_FOLIO: FolioItemId[] = ["collection", "comparison", "photos", "release"];

function FolioReassemblyPuzzle({ document, investigation, side, onFlip }: PuzzleProps) {
  const [feedback, setFeedback] = useState("A cópia voltou com o índice quebrado. A contagem física ainda pode denunciá-lo.");
  const [dragging, setDragging] = useState<{ id: FolioItemId; x: number; y: number } | null>(null);
  const dragOrigin = useRef<{ x: number; y: number } | null>(null);
  const data = investigation.state.puzzleData[document.id] ?? [];
  const identified = investigation.state.identified.includes(document.id);
  const storedOrder = data.find((value) => value.startsWith("order:"))?.slice(6).split(",");
  const order: FolioItemId[] = storedOrder?.length === 4 && new Set(storedOrder).size === 4 &&
    storedOrder.every((id): id is FolioItemId => Object.hasOwn(FOLIO_ITEMS, id))
    ? storedOrder : ["release", "collection", "photos", "comparison"];
  const tray = data.find((value) => value.startsWith("tray:"))?.slice(5) ?? "";
  const ordered = order.every((item, index) => item === CORRECT_FOLIO[index]);

  if (identified) return <SolvedPuzzle document={document} />;

  function persistOrder(next: FolioItemId[]) {
    investigation.setPuzzleToken(document.id, "order:", `order:${next.join(",")}`);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    persistOrder(next);
    setFeedback("A ordem mudou. Compare a função dos anexos com a numeração física das folhas.");
  }

  function startFolioDrag(event: PointerEvent<HTMLButtonElement>, id: FolioItemId) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOrigin.current = { x: event.clientX, y: event.clientY };
    setDragging({ id, x: 0, y: 0 });
  }

  function moveFolioDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!dragOrigin.current) return;
    const origin = dragOrigin.current;
    setDragging(current => current ? { ...current, x: event.clientX - origin.x, y: event.clientY - origin.y } : null);
  }

  function endFolioDrag(event: PointerEvent<HTMLButtonElement>) {
    if (dragging && dragOrigin.current) {
      const target = event.currentTarget.ownerDocument.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-folio-position]");
      const index = target ? Number(target.dataset.folioPosition) : -1;
      if (index >= 0 && index < order.length && index !== order.indexOf(dragging.id)) {
        const next = order.filter(id => id !== dragging.id);
        next.splice(index, 0, dragging.id);
        persistOrder(next);
        setFeedback("Folha reposicionada. Confira a sequência e a numeração.");
      }
    }
    dragOrigin.current = null;
    setDragging(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function chooseTray(nextTray: string) {
    if (!ordered) {
      setFeedback("Sem remontar o índice, ainda não dá para saber qual item abriu a lacuna.");
      return;
    }
    investigation.setPuzzleToken(document.id, "tray:", `tray:${nextTray}`);
    setFeedback(nextTray === "remessa"
      ? "A linha coberta saiu do laboratório. Vire a cópia e procure prova de que chegou inteira."
      : "O inventário local salta da 17 para a 19. A linha intermediária não pode permanecer nesta bandeja.");
  }

  function verify() {
    if (!ordered) {
      setFeedback("A sequência ainda contradiz os próprios códigos e a passagem da folha 17 para a 19.");
      return;
    }
    if (tray !== "remessa") {
      setFeedback("A abreviação de movimento e o inventário físico colocam a linha ausente fora da cópia local.");
      return;
    }
    if (side !== "back") {
      setFeedback("A saída está registrada. Falta virar a folha e verificar se alguém confirmou o recebimento.");
      return;
    }
    investigation.identify(document.id);
  }

  return (
    <PuzzleScene document={document} kind="folio" title="Uma folha fora do lugar">
      <p className="material-caption">Arraste pela aba PEGAR ou use as setas para ordenar as folhas.</p>
      <ol className="folio-strips" aria-label="Ordem das folhas do volume">
        {order.map((id, index) => {
          const item = FOLIO_ITEMS[id];
          return (
            <li key={id} data-folio-position={index} className={`${id === "comparison" && !ordered ? "is-obscured" : ""} ${dragging?.id === id ? "is-dragging" : ""}`}>
              <button type="button" className="folio-grab" aria-label={`Arrastar ${item.code}; use também as setas para mover`} onPointerDown={(event) => startFolioDrag(event, id)} onPointerMove={moveFolioDrag} onPointerUp={endFolioDrag} onPointerCancel={() => { dragOrigin.current = null; setDragging(null); }}>⠿ PEGAR</button>
              <span>{item.code}</span>
              <strong>{item.title}</strong>
              <small>{`FL. ${id === "comparison" && ordered ? "18" : item.page}`}</small>
              <div>
                <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Mover ${item.code} para cima`}>↑</button>
                <button type="button" disabled={index === order.length - 1} onClick={() => move(index, 1)} aria-label={`Mover ${item.code} para baixo`}>↓</button>
              </div>
            </li>
          );
        })}
      </ol>
      {dragging && createPortal(<div className="folio-drag-ghost" aria-hidden="true" style={{ left: dragOrigin.current?.x ?? 0, top: dragOrigin.current?.y ?? 0, transform: `translate(${dragging.x}px, ${dragging.y}px)` }}><strong>{FOLIO_ITEMS[dragging.id].code}</strong><span>{FOLIO_ITEMS[dragging.id].title}</span></div>, window.document.body)}
      <p className="puzzle-step-status" role="status">{ordered ? "Índice remontado · a lacuna corresponde à folha 18." : "Índice ainda fora de ordem."}</p>
      <div className={`folio-trays ${ordered ? "is-open" : ""}`}>
        <button type="button" aria-disabled={!ordered} aria-pressed={tray === "local"} onClick={() => chooseTray("local")}><small>BANDEJA</small><strong>CÓPIA LOCAL</strong><span>17 · 19 · 20 · 21 · 22</span>{tray === "local" && <b>4-B nesta bandeja</b>}</button>
        <button type="button" aria-disabled={!ordered} aria-pressed={tray === "remessa"} onClick={() => chooseTray("remessa")}><small>BANDEJA</small><strong>REMESSA</strong><span>SAÍDA 08H16</span>{tray === "remessa" && <b>4-B nesta bandeja</b>}</button>
      </div>
      {ordered && <div className="folio-receipt">
        <span>CONFERÊNCIA DA CÓPIA · {side === "back" ? "VERSO" : "FRENTE"}</span>
        <button type="button" onClick={onFlip}>{side === "front" ? "Virar para conferir o verso" : "Voltar à frente"}</button>
        {side === "back" && <p>{document.transcriptBack.slice(0, 2).join(" ")}</p>}
      </div>}
      <button className="puzzle-verify" type="button" onClick={verify}>CONFERIR O DESTINO DA FOLHA</button>
      <p className="puzzle-feedback" aria-live="polite">{feedback}</p>
    </PuzzleScene>
  );
}

function formatClock(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}h${String(minutes).padStart(2, "0")}`;
}

function ClockAnnotation({ value, label, onChange }: { value: number; label: string; onChange: (value: number) => void }) {
  const [draft, setDraft] = useState(formatClock(value));
  const [error, setError] = useState(false);
  const errorId = useId();
  useEffect(() => { setDraft(formatClock(value)); setError(false); }, [value]);
  function commit() {
    const match = draft.trim().match(/^(\d{2})[h:]?(\d{2})$/);
    const minute = match ? Number(match[1]) * 60 + Number(match[2]) : NaN;
    if (!match || Number(match[2]) > 59 || minute < 1040 || minute > 1150 || !Number.isFinite(minute)) {
      setError(true);
      setDraft(formatClock(value));
      return;
    }
    setError(false);
    setDraft(formatClock(minute));
    onChange(minute);
  }
  return <label className="notebook-time"><span>Horário de {label}</span>
    <input type="text" inputMode="numeric" maxLength={5} value={draft} autoComplete="off" spellCheck={false} aria-invalid={error || undefined} aria-describedby={error ? errorId : undefined} onChange={(event) => { setDraft(event.target.value); setError(false); }} onBlur={commit} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); commit(); } }} />
    {error && <small id={errorId} role="status">Use um horário entre 17h20 e 19h10.</small>}
  </label>;
}

function TimelinePuzzle({ document, investigation }: PuzzleProps) {
  const [feedback, setFeedback] = useState("Dois relógios foram escritos por pessoas diferentes. Use apenas os limites que nenhuma versão de Vicente controla.");
  const data = investigation.state.puzzleData[document.id] ?? [];
  const identified = investigation.state.identified.includes(document.id);
  const departure = Number(data.find((value) => value.startsWith("departure:"))?.slice(10) ?? 1042);
  const call = Number(data.find((value) => value.startsWith("call:"))?.slice(5) ?? 1148);

  if (identified) return <SolvedPuzzle document={document} />;

  function setMoment(prefix: "departure:" | "call:", value: number) {
    if (Number.isFinite(value)) investigation.setPuzzleToken(document.id, prefix, `${prefix}${clamp(value, 1040, 1150)}`);
  }

  function verify() {
    if (departure === 1042) {
      setFeedback("17h22 registra ausência. O intervalo procurado só começa quando a van produz movimento verificável.");
      return;
    }
    if (call === 1148) {
      setFeedback("19h08 é a chegada da equipe. O silêncio já terminou quando alguém fez o primeiro acionamento.");
      return;
    }
    if (departure !== 1066 || call !== 1109) {
      setFeedback("Um dos pinos usa um acontecimento real, mas não a borda do intervalo. Releia o caderno e o primeiro registro produzido fora da van.");
      return;
    }
    investigation.identify(document.id);
  }

  const left = ((departure - 1040) / 110) * 100;
  const right = ((call - 1040) / 110) * 100;
  return (
    <PuzzleScene document={document} kind="timeline" title="Entre dois horários">
      <p className="material-caption">Cruze as duas folhas. Escreva os horários ou ajuste as marcações.</p>
      <div className="notebook-entries">
        {[
          { prefix: "departure:" as const, value: departure, code: "B-12", title: "Movimento da van", label: "saída", source: "Caderno de busca" },
          { prefix: "call:" as const, value: call, code: "T-01", title: "Primeiro registro externo", label: "chamada", source: "Registro de ocorrência" },
        ].map((entry) => (
          <div className="notebook-entry" key={entry.code}>
            <div className="notebook-entry-heading"><span>{entry.code}</span><strong>{entry.title}</strong><small>{entry.source}</small></div>
            <ClockAnnotation value={entry.value} label={entry.label} onChange={(value) => setMoment(entry.prefix, value)} />
            <div className="notebook-adjust">
              <button type="button" aria-label={`Recuar ${entry.label} um minuto`} disabled={entry.value <= 1040} onClick={() => setMoment(entry.prefix, entry.value - 1)}>−</button>
              <input type="range" min="1040" max="1150" step="1" value={entry.value} aria-label={`Ajustar horário de ${entry.label}`} aria-valuetext={formatClock(entry.value)} onChange={(event) => setMoment(entry.prefix, Number(event.target.value))} />
              <button type="button" aria-label={`Avançar ${entry.label} um minuto`} disabled={entry.value >= 1150} onClick={() => setMoment(entry.prefix, entry.value + 1)}>+</button>
            </div>
          </div>
        ))}
      </div>
      <div className="notebook-interval">
        <div className="timeline-rail" aria-hidden="true">
          <i style={{ left: `${Math.min(left, right)}%`, width: `${Math.max(0, Math.abs(right - left))}%` }} />
          <span className="timeline-pin-departure" style={{ left: `${left}%` }}>B-12</span>
          <span className="timeline-pin-call" style={{ left: `${right}%` }}>T-01</span>
        </div>
        <div className="timeline-scale"><span>17H20</span><span>18H00</span><span>19H10</span></div>
        <output className="interval-note" aria-live="polite">{call >= departure ? `${call - departure} minutos entre as marcações` : "A chamada está antes da saída."}<small>HIPÓTESE EM CONFERÊNCIA</small></output>
      </div>
      <button className="puzzle-verify" type="button" onClick={verify}>FECHAR O INTERVALO</button>
      <p className="puzzle-feedback" aria-live="polite">{feedback}</p>
    </PuzzleScene>
  );
}

function EvidencePuzzle(props: PuzzleProps) {
  if (props.document.puzzleKind === "carbon-recovery") return <CarbonRecoveryPuzzle {...props} />;
  if (props.document.puzzleKind === "source-thread") return <SourceThreadPuzzle {...props} />;
  if (props.document.puzzleKind === "seat-reconstruction") return <SeatReconstructionPuzzle {...props} />;
  if (props.document.puzzleKind === "folio-reassembly") return <FolioReassemblyPuzzle {...props} />;
  if (props.document.puzzleKind === "timeline") return <TimelinePuzzle {...props} />;
  return (
    <section className="evidence-memory-note">
      <span>MEMÓRIA // SEM RESPOSTA ÚNICA</span>
      <p>{props.document.instruction}</p>
    </section>
  );
}

const WORKBENCH_LABELS: Partial<Record<EvidenceId, string>> = {
  "D-01": "Examinar o carbono",
  "B-12": "Anotar os horários",
  "T-02": "Marcar o esquema da van",
  "T-03": "Reordenar as folhas",
};

function InspectionIcon({ kind }: { kind: "turn" | "zoom" | "light" | "rotate" | "take" | "focus" | "text" }) {
  const strokes = {
    turn: <><path d="M18 7H9a5 5 0 0 0 0 10h7M14 3l4 4-4 4" /><path d="m13 17 3 3 3-3" /></>,
    zoom: <><circle cx="10" cy="10" r="6" /><path d="m15 15 6 6M7 10h6M10 7v6" /></>,
    light: <><path d="m7 8 4-4 5 5-4 4-5-5Zm5 5 5 5-4 4-5-5M17 3l2-2M20 7h3M13 1v2" /></>,
    rotate: <><path d="M19 9a8 8 0 1 0 0 7M19 3v6h-6" /></>,
    take: <><path d="M9 12V5a2 2 0 0 1 4 0v5m0-1a2 2 0 0 1 4 0v2a2 2 0 0 1 4 0v4c0 4-3 7-7 7h-1c-2 0-4-1-5-3l-5-6a2 2 0 0 1 3-3l3 2Z" /></>,
    focus: <><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M8 8h8v8H8z" /></>,
    text: <><path d="M5 3h10l4 4v14H5V3Zm10 0v5h4M8 12h8M8 16h6" /></>,
  };
  return <svg className="inspection-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{strokes[kind]}</svg>;
}

function DocumentConversation({ document, investigation }: { document: EvidenceDefinition; investigation: InvestigationController }) {
  const [speaker, setSpeaker] = useState<CharacterId | null>(null);
  const responseId = useId();
  const choices = useRef<Partial<Record<CharacterId, HTMLButtonElement | null>>>({});
  const characters = Object.keys(document.observations) as CharacterId[];
  const level = speaker ? investigation.state.hintLevels[`${document.id}:${speaker}`] ?? 0 : 0;
  const observations = speaker ? document.observations[speaker] ?? [] : [];
  const line = observations[level - 1];

  function listen(character: CharacterId) {
    setSpeaker(character);
    if (!investigation.state.hintLevels[`${document.id}:${character}`]) {
      investigation.requestObservation(document.id, character, document.observations[character]?.length ?? 0);
    }
  }

  return <section className={`document-conversation ${speaker ? "is-speaking" : ""}`} aria-label="Conversar sobre a folha">
    <div className="conversation-choices">
      <span>O que você acha?</span>
      {characters.map(character => {
        const seen = investigation.state.hintLevels[`${document.id}:${character}`] ?? 0;
        return <button type="button" key={character} className={`companion-choice companion-${character.toLowerCase()}`}
          ref={element => { choices.current[character] = element; }}
          aria-label={`Ouvir ${character === "DERICK" ? "Derick" : "Leroy"}`} aria-expanded={speaker === character} aria-controls={responseId}
          onClick={() => listen(character)}>
          <span className="companion-portrait" aria-hidden="true" style={{ backgroundImage: `url(${DIALOGUE_PORTRAITS[character][clamp(seen - 1, 0, 2)]})` }} />
          <span>{character === "DERICK" ? "Derick" : "Leroy"}</span>
        </button>;
      })}
    </div>
    <div id={responseId} className="conversation-response" aria-live="polite">
      {speaker && line && <>
        <GameDialogue character={speaker} text={line} level={level} />
        <div className="conversation-turn">
          <span className="conversation-progress" aria-label={`Observação ${level} de ${observations.length}`}>
            {observations.map((_, index) => <i key={index} className={index < level ? "is-heard" : ""} aria-hidden="true" />)}
          </span>
          {level < observations.length && <button type="button" onClick={() => investigation.requestObservation(document.id, speaker, observations.length)}>Outra observação <span aria-hidden="true">↗</span></button>}
          <button type="button" onClick={() => { setSpeaker(null); choices.current[speaker]?.focus(); }}>Voltar à folha</button>
        </div>
      </>}
    </div>
  </section>;
}

function DocumentInspector({ document, investigation, compact = false, interactive = true, initialSide = "front" }: DocumentInspectorProps & { interactive?: boolean }) {
  const [side, setSide] = useState<"front" | "back">(initialSide);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState<ViewportPoint>({ x: 0, y: 0 });
  const [lightEnabled, setLightEnabled] = useState(false);
  const [light, setLight] = useState<ViewportPoint>({ x: 58, y: 38 });
  const [focused, setFocused] = useState(false);
  const [focusedHeight, setFocusedHeight] = useState(0);
  const inspectorRef = useRef<HTMLDivElement>(null);
  const workbenchRef = useRef<HTMLDivElement>(null);
  const closeFocus = useCallback(() => setFocused(false), []);
  useReaderDialog(inspectorRef, focused, closeFocus);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const inspectorId = useId();
  const pointers = useRef(new Map<number, ViewportPoint>());
  const lastPointer = useRef<ViewportPoint | null>(null);
  const pinchStart = useRef<{ distance: number; zoom: number } | null>(null);
  const hasPassengerRelation = investigation.state.relations.includes("passenger-trace");
  const impossibleResidue = document.id === "T-03" && side === "back" && hasPassengerRelation;
  const addPuzzleValue = investigation.addPuzzleValue;

  useEffect(() => {
    if (!impossibleResidue) return;
    const timer = window.setTimeout(investigation.markSupernatural, 650);
    return () => window.clearTimeout(timer);
  }, [impossibleResidue, investigation.markSupernatural]);

  useEffect(() => {
    if (document.id !== "D-01" || side !== "back" || !lightEnabled || !interactive) return;
    if (light.y < 72 || light.y > 94) return;
    if (light.x >= 16 && light.x < 39) addPuzzleValue(document.id, "carbon:left");
    if (light.x >= 39 && light.x < 63) addPuzzleValue(document.id, "carbon:middle");
    if (light.x >= 63 && light.x <= 86) addPuzzleValue(document.id, "carbon:right");
  }, [addPuzzleValue, document.id, side, lightEnabled, light.x, light.y, interactive]);

  const backAlt = document.id === "T-03" && !hasPassengerRelation
    ? "Verso digitalizado sem registro direto." : document.backAlt;
  const imageStyle = {
    transform: `translate3d(${position.x}px, ${position.y}px, 0) rotate(${rotation}deg) scale(${zoom})`,
  } as CSSProperties;
  const lightStyle = {
    "--document-light-x": `${light.x}%`,
    "--document-light-y": `${light.y}%`,
  } as CSSProperties;

  function setNextZoom(next: number) {
    const value = clamp(next, 1, 3.5);
    setZoom(value);
    if (value === 1) setPosition({ x: 0, y: 0 });
    investigation.examine(document.id, side);
  }

  function pointerPosition(event: PointerEvent<HTMLDivElement>): ViewportPoint {
    return { x: event.clientX, y: event.clientY };
  }

  function updateLight(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setLight({
      x: clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100),
    });
  }

  function startPointer(event: PointerEvent<HTMLDivElement>) {
    if (event.target instanceof Element && event.target.closest("button, a, input, select, textarea")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, pointerPosition(event));
    lastPointer.current = pointerPosition(event);
    if (lightEnabled) updateLight(event);
    if (pointers.current.size === 2) {
      const [first, second] = Array.from(pointers.current.values());
      pinchStart.current = { distance: Math.hypot(first.x - second.x, first.y - second.y), zoom };
    }
    investigation.examine(document.id, side);
  }

  function movePointer(event: PointerEvent<HTMLDivElement>) {
    if (lightEnabled && (event.pointerType === "mouse" || pointers.current.has(event.pointerId))) {
      updateLight(event);
      return;
    }
    if (!pointers.current.has(event.pointerId)) return;
    const next = pointerPosition(event);
    pointers.current.set(event.pointerId, next);
    if (pointers.current.size >= 2 && pinchStart.current) {
      const [first, second] = Array.from(pointers.current.values());
      const distance = Math.hypot(first.x - second.x, first.y - second.y);
      setNextZoom(pinchStart.current.zoom * (distance / Math.max(1, pinchStart.current.distance)));
      return;
    }
    if (zoom > 1 && lastPointer.current) {
      setPosition((current) => ({
        x: current.x + next.x - lastPointer.current!.x,
        y: current.y + next.y - lastPointer.current!.y,
      }));
    }
    lastPointer.current = next;
  }

  function endPointer(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    pinchStart.current = null;
    lastPointer.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function keyboardMove(event: KeyboardEvent<HTMLDivElement>) {
    const direction: Record<string, ViewportPoint> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    };
    const delta = direction[event.key];
    if (!delta || (!lightEnabled && zoom === 1)) return;
    event.preventDefault();
    if (lightEnabled) {
      setLight((current) => ({
        x: clamp(current.x + delta.x * 5, 0, 100),
        y: clamp(current.y + delta.y * 5, 0, 100),
      }));
    } else if (zoom > 1) {
      setPosition((current) => ({ x: current.x + delta.x * 22, y: current.y + delta.y * 22 }));
    }
    investigation.examine(document.id, side);
  }

  function flip() {
    const next = side === "front" ? "back" : "front";
    setSide(next);
    setPosition({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    investigation.examine(document.id, next);
  }

  const transcript = side === "front"
    ? document.transcriptFront
    : document.id === "T-03" && !hasPassengerRelation
      ? document.transcriptBack.slice(0, 1)
      : document.transcriptBack;
  const workbenchLabel = WORKBENCH_LABELS[document.id];

  function toggleLight() {
    setLightEnabled(value => !value);
    investigation.examine(document.id, side);
  }

  return (
    <div className="document-inspector-slot" style={focused ? { minHeight: focusedHeight } : undefined}>
    <div ref={inspectorRef} role={focused ? "dialog" : undefined} aria-modal={focused || undefined}
      aria-label={focused ? `Examinar ${document.title}` : undefined} tabIndex={focused ? -1 : undefined}
      className={`document-inspector ${compact ? "is-compact" : ""} ${focused ? "is-focused" : ""}`}>
      {focused && <button type="button" className="document-focus-close" data-dialog-close onClick={closeFocus}>× VOLTAR À LEITURA</button>}
      <div className={`document-tableau ${document.landscape ? "is-landscape" : ""}`}>
      <div className="document-side-label" aria-live="polite"><span>{side === "front" ? "Frente da folha" : "Verso da folha"}</span><span className="document-page-marks" aria-label={`Lado ${side === "front" ? "1" : "2"} de 2`}><i className={side === "front" ? "is-current" : ""} /><i className={side === "back" ? "is-current" : ""} /></span></div>
      <div className="document-page-handling">
      <div
        id={inspectorId}
        className={`document-viewport ${lightEnabled ? "light-enabled" : ""} ${lightEnabled || zoom > 1 ? "is-manipulating" : ""} ${document.landscape ? "is-landscape" : ""}`}
        style={lightStyle}
        role="application"
        tabIndex={0}
        aria-label={`${document.title}. Use os controles para aproximar, arrastar, girar, virar ou alterar a luz.`}
        aria-describedby={`${inspectorId}-gesture`}
        onPointerDown={startPointer}
        onPointerMove={movePointer}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onKeyDown={keyboardMove}
        onDoubleClick={() => setNextZoom(zoom > 1 ? 1 : 2)}
      >
        <div className="document-sheet-layer" style={imageStyle}>
          <DocumentFaces front={document.front} back={document.back} frontAlt={document.frontAlt}
            backAlt={backAlt} side={side} eager={compact} />
        </div>
        {lightEnabled && <div className="document-light" aria-hidden="true" />}
        {impossibleResidue && (
          <div className="document-impossible-residue" aria-hidden="true">
            <span>T-19</span>
          </div>
        )}
      </div>
          <button className="document-turn-corner" type="button" onClick={flip} aria-controls={inspectorId}
            aria-label={`Virar para ${side === "front" ? "o verso" : "a frente"} de ${document.shortTitle}`}>
            <InspectionIcon kind="turn" /><span>Virar a folha</span>
          </button>
      </div>

      <div className="inspection-rack" role="group" aria-label="Ferramentas do documento">
        <button className="inspection-tool" type="button" aria-label="Lupa" aria-pressed={zoom > 1} aria-controls={`${inspectorId}-zoom`} onClick={() => setNextZoom(zoom > 1 ? 1 : 2)}>
          <span className="inspection-tool-disc"><InspectionIcon kind="zoom" /></span><span>Lupa</span>
        </button>
        <button className="inspection-tool" type="button" aria-label="Iluminar a folha" aria-pressed={lightEnabled} onClick={toggleLight}>
          <span className="inspection-tool-disc"><InspectionIcon kind="light" /></span><span>Luz</span>
        </button>
        <button className="inspection-tool" type="button" aria-label="Girar a folha 90 graus" onClick={() => { setRotation(value => (value + 90) % 360); investigation.examine(document.id, side); }}>
          <span className="inspection-tool-disc"><InspectionIcon kind="rotate" /></span><span>Girar</span>
        </button>
        {!compact && <button className="inspection-tool" type="button" aria-label="Pegar folha" onClick={() => {
          investigation.takeOutDocument(document.id);
          if (focused) closeFocus();
        }}>
          <span className="inspection-tool-disc"><InspectionIcon kind="take" /></span><span>Pegar</span>
        </button>}
        {!compact && <button className="inspection-tool" type="button" aria-label={focused ? "Reduzir documento" : "Ampliar documento"} aria-pressed={focused} onClick={() => {
          if (!focused) setFocusedHeight(inspectorRef.current?.getBoundingClientRect().height ?? 0);
          setFocused(value => !value);
        }}>
          <span className="inspection-tool-disc"><InspectionIcon kind="focus" /></span><span>{focused ? "Reduzir" : "Ampliar"}</span>
        </button>}
        <button className="inspection-tool" type="button" aria-label="Transcrição" aria-expanded={transcriptOpen} aria-controls={`${inspectorId}-text`} onClick={() => setTranscriptOpen(value => !value)}>
          <span className="inspection-tool-disc"><InspectionIcon kind="text" /></span><span>Ler texto</span>
        </button>
      </div>
      <div id={`${inspectorId}-zoom`}>
        {(zoom > 1 || rotation !== 0) && <div className="inspection-adjustments">
          <div role="group" aria-label="Ampliação da folha">
            <button type="button" disabled={zoom <= 1} onClick={() => setNextZoom(zoom - 0.35)} aria-label="Diminuir documento">−</button>
            <output aria-label="Nível de aproximação">{Math.round(zoom * 100)}%</output>
            <button type="button" disabled={zoom >= 3.5} onClick={() => setNextZoom(zoom + 0.35)} aria-label="Aproximar documento">+</button>
          </div>
          <button type="button" disabled={zoom === 1 && rotation === 0} onClick={() => { setZoom(1); setRotation(0); setPosition({ x: 0, y: 0 }); }}>Centralizar</button>
        </div>}
      </div>
      <p className="inspection-gesture" id={`${inspectorId}-gesture`}>
        {lightEnabled ? "Passe a luz sobre o papel. As setas também movem o foco." : zoom > 1 ? "Arraste a folha para olhar de perto. Dois toques para afastar." : "Dois toques na folha para olhar de perto."}
      </p>
      </div>

      {impossibleResidue && (
        <p className="document-residue-status" role="status">
          A marca T-19 permaneceu na mesma orientação depois que a folha foi virada.
        </p>
      )}

      {transcriptOpen && (
        <section className="document-transcript" id={`${inspectorId}-text`} aria-label={`Transcrição acessível — ${side === "front" ? "frente" : "verso"}`}>
          <span>{`${side === "front" ? "FRENTE" : "VERSO"} // TRANSCRIÇÃO ESTRUTURAL`}</span>
          {transcript.map((line) => <p key={line}>{line}</p>)}
        </section>
      )}

      {interactive && document.puzzleKind !== "memory" && <DocumentConversation document={document} investigation={investigation} />}

      {interactive && workbenchLabel && !investigation.state.identified.includes(document.id) && (
        <button className="inspection-continue" type="button" aria-controls={`${inspectorId}-workbench`} onClick={() => {
          workbenchRef.current?.scrollIntoView({ block: "start" });
          workbenchRef.current?.focus({ preventScroll: true });
        }}><span>{workbenchLabel}</span><i aria-hidden="true">↓</i></button>
      )}

      {interactive ? (
        <div ref={workbenchRef} id={`${inspectorId}-workbench`} tabIndex={-1} className="document-workbench-anchor">
          <EvidencePuzzle document={document} investigation={investigation} side={side} lightEnabled={lightEnabled} onFlip={flip} onToggleLight={toggleLight} />
        </div>
      ) : (
        <section className="evidence-collection-note">
          <span>{document.id === "T-01" ? "REGISTRO DE APOIO" : "RECOLHIDO // PARA COMPARAR DEPOIS"}</span>
          <strong>{document.id === "T-01" ? "Guarde a origem das informações, além dos números." : "A folha pode ser consultada na pasta de evidências."}</strong>
          <p>{document.id === "T-01" ? "Esta leitura não bloqueia a história. O registro será necessário ao comparar os horários." : "Por enquanto, examine a cópia. A investigação continua quando houver outra peça para confrontá-la."}</p>
        </section>
      )}

    </div>
    </div>
  );
}

export function EvidenceDocument({ id, anchorId, investigation, interactive = true }: {
  id: EvidenceId;
  anchorId: string;
  investigation: InvestigationController;
  interactive?: boolean;
}) {
  const reference = useRef<HTMLElement>(null);
  const document = EVIDENCE[id];
  const discover = investigation.discover;
  const activatePuzzle = investigation.activatePuzzle;

  useEffect(() => {
    const element = reference.current;
    if (!element) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        discover(id);
        if (interactive && document.puzzleKind !== "memory") activatePuzzle(id);
        observer.disconnect();
      }
    }, { rootMargin: "0px 0px -20%", threshold: 0.12 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [activatePuzzle, discover, document.puzzleKind, id, interactive]);

  const identified = investigation.state.identified.includes(id);
  const examined = investigation.state.examined.includes(id);
  return (
    <section
      className="chapter-three-evidence"
      id={anchorId}
      data-reading-anchor={anchorId}
      data-evidence-id={id}
      ref={reference}
    >
      <header className="evidence-heading">
        <div>
          <span>{`${id} // ${document.origin}`}</span>
          <h3>{document.title}</h3>
        </div>
        <strong data-state={identified ? "identified" : examined ? "examined" : "new"}>{identified ? "MARCADO" : examined ? "VISTO" : "NOVO"}</strong>
      </header>
      <DocumentInspector key={id} document={document} investigation={investigation} interactive={interactive} />
    </section>
  );
}

export function EvidenceConvergence({ investigation }: { investigation: InvestigationController }) {
  const required = RELATIONS.filter((relation) => relation.required);
  const solved = required.filter((relation) => investigation.state.relations.includes(relation.id));
  const complete = solved.length === required.length;
  return (
    <section className={`evidence-convergence ${complete ? "is-complete" : ""}`} id="mesa-de-evidencias">
      <header>
        <span>REGISTROS // CONVERGÊNCIA</span>
        <h3>As folhas agora podem ser lidas juntas.</h3>
        <p>Estas são as ligações demonstradas até aqui. A cor da fibra, sozinha, não identifica uma pessoa.</p>
      </header>
      <div>
        {required.map((relation) => {
          const registered = investigation.state.relations.includes(relation.id);
          return (
            <article key={relation.id} className={registered ? "is-registered" : ""}>
              <span>{registered ? "VÍNCULO REGISTRADO" : "AINDA SEPARADO"}</span>
              <strong>{relation.title}</strong>
              <p>{registered ? relation.summary : relation.question}</p>
            </article>
          );
        })}
      </div>
      {complete && (
        <footer role="status">
          <span>CONTRADIÇÃO SUSTENTADA</span>
          <strong>Há um intervalo sem relato e um exame ausente. Quem recebeu o processo precisa explicar os dois.</strong>
        </footer>
      )}
    </section>
  );
}

function dropDocumentAtPoint(clientX: number, clientY: number) {
  const elements = window.document.elementsFromPoint(clientX, clientY);
  if (elements.some((element) => element.closest("[data-evidence-drawer-target]"))) return "drawer" as const;
  return false as const;
}

function LooseEvidencePaper({
  id,
  placement,
  investigation,
  onInspect,
  isTop,
  onCycle,
}: {
  id: EvidenceId;
  placement: LooseDocumentPlacement;
  investigation: InvestigationController;
  onInspect: () => void;
  isTop: boolean;
  onCycle: (direction: -1 | 1) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [dragTilt, setDragTilt] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeY, setSwipeY] = useState(0);
  const [dragPosition, setDragPosition] = useState<ViewportPoint>();
  const evidence = EVIDENCE[id];
  const drag = useRef<{
    pointerId: number;
    clientX: number;
    clientY: number;
    x: number;
    y: number;
  } | undefined>(undefined);
  const passengerRelation = investigation.state.relations.includes("passenger-trace");
  const impossibleResidue = id === "T-03" && placement.side === "back" && passengerRelation;
  const backAlt = id === "T-03" && !passengerRelation ? "Verso digitalizado sem registro direto." : evidence.backAlt;

  useEffect(() => {
    if (!impossibleResidue) return;
    const timer = window.setTimeout(investigation.markSupernatural, 650);
    return () => window.clearTimeout(timer);
  }, [impossibleResidue, investigation.markSupernatural]);

  function startDrag(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      x: placement.x,
      y: placement.y,
    };
    setDragging(true);
    investigation.bringLooseDocumentToFront(id);
    investigation.examine(id, placement.side);
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - active.clientX;
    if (window.innerWidth <= 760) {
      setSwipeOffset(clamp(deltaX, -120, 120));
      setSwipeY(clamp(event.clientY - active.clientY, -35, 110));
      return;
    }
    setDragTilt(clamp(deltaX * 0.035, -4, 4));
    setDragPosition({
      x: clamp(active.x + (deltaX / Math.max(1, window.innerWidth)) * 100, 8, 92),
      y: clamp(active.y + ((event.clientY - active.clientY) / Math.max(1, window.innerHeight)) * 100, 10, 88),
    });
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    drag.current = undefined;
    setDragging(false);
    setDragTilt(0);
    setDragPosition(undefined);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (event.type === "pointercancel") {
      setSwipeOffset(0);
      setSwipeY(0);
      return;
    }
    if (window.innerWidth <= 760) {
      const deltaX = event.clientX - active.clientX;
      const deltaY = event.clientY - active.clientY;
      if (deltaY >= 84 && Math.abs(deltaY) > Math.abs(deltaX)) {
        investigation.storeLooseDocument(id);
      } else if (Math.abs(deltaX) >= 48) {
        onCycle(deltaX > 0 ? -1 : 1);
      }
      setSwipeOffset(0);
      setSwipeY(0);
      return;
    }
    const destination = dropDocumentAtPoint(event.clientX, event.clientY);
    if (destination) {
      investigation.storeLooseDocument(id);
    } else {
      investigation.moveLooseDocument(id, {
        x: active.x + ((event.clientX - active.clientX) / Math.max(1, window.innerWidth)) * 100,
        y: active.y + ((event.clientY - active.clientY) / Math.max(1, window.innerHeight)) * 100,
      });
    }
  }

  function moveWithKeyboard(event: KeyboardEvent<HTMLButtonElement>) {
    const directions: Record<string, ViewportPoint> = {
      ArrowLeft: { x: -3, y: 0 },
      ArrowRight: { x: 3, y: 0 },
      ArrowUp: { x: 0, y: -3 },
      ArrowDown: { x: 0, y: 3 },
    };
    const delta = directions[event.key];
    if (delta) {
      event.preventDefault();
      investigation.moveLooseDocument(id, { x: placement.x + delta.x, y: placement.y + delta.y });
    }
    if (event.key === "Enter") onInspect();
  }

  return (
    <article
      className={`loose-evidence-paper ${evidence.landscape ? "is-landscape" : ""} ${isTop ? "is-top" : ""} ${dragging ? "is-dragging" : ""}`}
      style={{
        left: `${dragPosition?.x ?? placement.x}%`,
        top: `${dragPosition?.y ?? placement.y}%`,
        zIndex: 180 + placement.z,
        "--loose-paper-rotation": `${placement.rotation}deg`,
        "--loose-drag-tilt": `${dragTilt}deg`,
        "--mobile-paper-swipe": `${swipeOffset}px`,
        "--mobile-paper-y": `${swipeY}px`,
      } as CSSProperties}
      data-loose-evidence={id}
    >
      <button
        type="button"
        className="loose-paper-grab"
        aria-label={`${id}, ${evidence.shortTitle}. Segure e arraste para mover; use as setas no teclado. Pressione Enter para examinar.`}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={moveWithKeyboard}
        onDoubleClick={onInspect}
      >
        <span className="loose-paper-grip" aria-hidden="true">••••</span>
        <DocumentFaces front={evidence.front} back={evidence.back} frontAlt={evidence.frontAlt} backAlt={backAlt} side={placement.side} eager retryable={false} />
        {impossibleResidue && <i className="loose-paper-residue" aria-hidden="true">T-19</i>}
      </button>
      <footer>
        <strong>{id}</strong>
        <button type="button" onClick={() => investigation.flipLooseDocument(id)} aria-label={`Virar ${evidence.shortTitle}`}>{placement.side === "front" ? "VER VERSO" : "VER FRENTE"}</button>
        <button type="button" onClick={onInspect}>APROXIMAR</button>
        <button type="button" onClick={() => investigation.storeLooseDocument(id)}>GAVETA</button>
      </footer>
    </article>
  );
}

export function EvidenceDrawer({ investigation }: { investigation: InvestigationController }) {
  const [open, setOpen] = useState(false);
  const [focusEvidence, setFocusEvidence] = useState<EvidenceId>();
  const focusRef = useRef<HTMLDivElement>(null);
  const closeFocus = useCallback(() => setFocusEvidence(undefined), []);
  useReaderDialog(focusRef, Boolean(focusEvidence), closeFocus);
  const [confirmReset, setConfirmReset] = useState(false);
  const drawerSwipe = useRef<{ pointerId: number; x: number; moved: boolean } | undefined>(undefined);
  const suppressDrawerTap = useRef(false);
  const discovered = EVIDENCE_ORDER.filter((id) => investigation.state.discovered.includes(id));
  const unread = discovered.filter((id) => !investigation.state.examined.includes(id)).length;
  const focusedDocument = focusEvidence ? EVIDENCE[focusEvidence] : undefined;
  const looseEntries = Object.entries(investigation.state.looseDocuments)
    .filter((entry): entry is [EvidenceId, LooseDocumentPlacement] => Boolean(entry[1]))
    .sort((first, second) => first[1].z - second[1].z);
  const topLooseId = looseEntries.at(-1)?.[0];

  function cycleLooseDocument(currentId: EvidenceId, direction: -1 | 1) {
    if (looseEntries.length < 2) return;
    const index = looseEntries.findIndex(([id]) => id === currentId);
    const nextIndex = (index + direction + looseEntries.length) % looseEntries.length;
    investigation.bringLooseDocumentToFront(looseEntries[nextIndex][0]);
  }

  return (
    <>
      <button className="evidence-drawer-toggle" data-evidence-drawer-target type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="evidence-drawer">
        <svg className="drawer-symbol" viewBox="0 0 64 52" aria-hidden="true">
          <path d="M7 8h50v35H7z" />
          <path className="drawer-symbol-front" d="M4 17h56v30H4z" />
          <path d="M24 23h16" />
        </svg>
        <span className="screen-reader-only">{open ? "Fechar gaveta de evidências" : "Abrir gaveta de evidências"}</span>
        <strong aria-hidden="true">{discovered.length}/{EVIDENCE_ORDER.length}</strong>
        {unread > 0 && <i aria-label={`${unread} documentos ainda não examinados`}>{unread}</i>}
      </button>

      <aside className={`evidence-drawer ${open ? "is-open" : ""}`} id="evidence-drawer" aria-hidden={!open} inert={!open}>
        <header>
          <div><span>CAPÍTULOS 3 E 4</span><h2>Gaveta de evidências</h2></div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Fechar gaveta">×</button>
        </header>
        <p className="drawer-intro">Use a roda do mouse para folhear. No celular, arraste a pilha. Toque numa folha para pegá-la.</p>
        <div
          className="drawer-list"
          onWheel={(event) => {
            const list = event.currentTarget;
            const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
            const atStart = list.scrollLeft <= 1 && delta < 0;
            const atEnd = list.scrollLeft + list.clientWidth >= list.scrollWidth - 1 && delta > 0;
            if (!delta || atStart || atEnd) return;
            event.preventDefault();
            list.scrollLeft += delta;
          }}
          onPointerDown={(event) => {
            drawerSwipe.current = { pointerId: event.pointerId, x: event.clientX, moved: false };
          }}
          onPointerMove={(event) => {
            const gesture = drawerSwipe.current;
            if (!gesture || gesture.pointerId !== event.pointerId) return;
            if (Math.abs(event.clientX - gesture.x) > 8) gesture.moved = true;
          }}
          onPointerUp={(event) => {
            const gesture = drawerSwipe.current;
            if (!gesture || gesture.pointerId !== event.pointerId) return;
            suppressDrawerTap.current = gesture.moved;
            drawerSwipe.current = undefined;
            window.setTimeout(() => { suppressDrawerTap.current = false; }, 0);
          }}
          onPointerCancel={() => { drawerSwipe.current = undefined; }}
        >
          {discovered.map((id) => {
            const evidence = EVIDENCE[id];
            const examined = investigation.state.examined.includes(id);
            const loose = Boolean(investigation.state.looseDocuments[id]);
            return (
              <button
                type="button"
                key={id}
                className={loose ? "is-loose" : ""}
                onClick={() => {
                  if (suppressDrawerTap.current) return;
                  investigation.takeOutDocument(id);
                  if (window.innerWidth <= 760) setOpen(false);
                }}
                aria-label={`${id}, ${evidence.shortTitle}. ${loose ? "Folha fora da gaveta." : "Tirar folha da gaveta."}`}
              >
                <img src={evidence.front} alt="" loading="lazy" decoding="async" />
                <span><small>{id}</small><strong>{evidence.shortTitle}</strong></span>
                <i>{loose ? "NA PÁGINA" : examined ? "EXAMINADO" : "NOVO"}</i>
              </button>
            );
          })}
        </div>
        <section className="drawer-relations">
          <span>RELAÇÕES REGISTRADAS</span>
          {investigation.state.relations.length ? (
            <ul>
              {RELATIONS.filter((relation) => investigation.state.relations.includes(relation.id)).map((relation) => <li key={relation.id}>{relation.title}</li>)}
            </ul>
          ) : <p>Nenhuma relação marcada.</p>}
        </section>
        <div className="drawer-reset">
          {!confirmReset ? (
            <button type="button" onClick={() => setConfirmReset(true)}>REINICIAR INVESTIGAÇÃO</button>
          ) : (
            <div role="alert">
              <p>Isso reinicia as investigações dos capítulos 3 e 4. A leitura, os capítulos liberados e a aparência ficam salvos.</p>
              <button type="button" onClick={() => { investigation.reset(); setConfirmReset(false); setOpen(false); }}>CONFIRMAR REINÍCIO</button>
              <button type="button" onClick={() => setConfirmReset(false)}>CANCELAR</button>
            </div>
          )}
        </div>
      </aside>

      {looseEntries.map(([id, placement]) => (
        <LooseEvidencePaper
          key={id}
          id={id}
          placement={placement}
          investigation={investigation}
          onInspect={() => setFocusEvidence(id)}
          isTop={id === topLooseId}
          onCycle={(direction) => cycleLooseDocument(id, direction)}
        />
      ))}

      {looseEntries.length > 0 && (
        <nav className="mobile-paper-rack" aria-label="Folhas fora da gaveta">
          {looseEntries.map(([id]) => (
            <button
              type="button"
              key={id}
              className={id === topLooseId ? "is-active" : ""}
              onClick={() => investigation.bringLooseDocumentToFront(id)}
              aria-pressed={id === topLooseId}
              aria-label={`Segurar ${id}, ${EVIDENCE[id].shortTitle}`}
            >
              <img src={EVIDENCE[id].front} alt="" />
              <span>{id}</span>
            </button>
          ))}
        </nav>
      )}

      {focusedDocument && (
        <div ref={focusRef} className="evidence-focus-overlay" role="dialog" aria-modal="true" tabIndex={-1} aria-label={`Examinar ${focusedDocument.title}`}>
          <section>
            <header>
              <div><span>{`${focusedDocument.id} // GAVETA`}</span><h2>{focusedDocument.title}</h2></div>
              <button type="button" data-dialog-close onClick={closeFocus} aria-label="Fechar documento">×</button>
            </header>
            <DocumentInspector
              key={focusedDocument.id}
              document={focusedDocument}
              investigation={investigation}
              initialSide={investigation.state.looseDocuments[focusedDocument.id]?.side}
              compact
              interactive={focusedDocument.puzzleKind === "memory" || investigation.state.activated.includes(focusedDocument.id)}
            />
          </section>
        </div>
      )}
    </>
  );
}
