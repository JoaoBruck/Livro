import type { EvidenceId } from "./chapter3-evidence";

export type ComparisonFragment = { id: string; document: EvidenceId; side: "Frente" | "Verso"; text: string };
export const COMPARISON_FRAGMENTS: ComparisonFragment[] = [
  { id: "photo-jacket", document: "A-01", side: "Frente", text: "Alana aparece com uma jaqueta amarela amarrada à cintura." },
  { id: "photo-date", document: "A-01", side: "Verso", text: "Anotação manuscrita: 12/08." },
  { id: "transport-collision", document: "D-01", side: "Frente", text: "Veículo institucional indisponível desde 12/08; avaria por colisão." },
  { id: "transport-reference", document: "D-01", side: "Frente", text: "Referência recuperada a lápis: OT-0812-44." },
  { id: "incident-reference", document: "T-01", side: "Frente", text: "Ocorrência OT-0812-44. Veículo 1: van da Casa-Lar de Candeia." },
  { id: "incident-count", document: "T-01", side: "Frente", text: "Ocupação informada: 01. Origem do dado: declaração de M. Gouveia." },
  { id: "incident-call", document: "T-01", side: "Frente", text: "Primeiro acionamento às 18h29; equipe no local às 19h08." },
  { id: "incident-check", document: "T-01", side: "Verso", text: "Cabine não conferida no atendimento inicial; lado direito contra a proteção da via." },
  { id: "belt-load", document: "T-02", side: "Frente", text: "R2 — quadrante F/D. Faixa: deformação longitudinal e marcas compatíveis com carga durante o evento." },
  { id: "belt-sample", document: "T-02", side: "Frente", text: "Coleta T-19: microvestígios retirados do alojamento inferior do fecho." },
  { id: "belt-caution", document: "T-02", side: "Frente", text: "Acionamento isolado pode ocorrer por configuração, objeto afivelado ou dano anterior. Interpretar os achados em conjunto." },
  { id: "lab-color", document: "T-03", side: "Frente", text: "Amostra T-19. Origem: alojamento inferior do fecho dianteiro direito. Triagem: microfibras amarelas." },
  { id: "lab-comparison", document: "T-03", side: "Frente", text: "4-B — comparação físico-química da T-19. Número da folha encoberto; movimento abreviado como REM." },
  { id: "search-departure", document: "B-12", side: "Frente", text: "17h46 — Vicente saiu com a van." },
];

export const COMPARISONS = [
  { id: "same-occurrence", fragments: ["transport-reference", "incident-reference"], title: "O mesmo registro",
    observation: "A referência da segunda via leva à ocorrência da van. É possível seguir a colisão entre os dois arquivos.",
    speaker: "LEROY", dialogue: "É o mesmo número. Eu teria deixado essa folha na pasta do Derick." },
  { id: "time-gap", fragments: ["search-departure", "incident-call"], title: "Quarenta e três minutos",
    observation: "Entre a saída às 17h46 e a chamada às 18h29 há 43 minutos. Os horários delimitam o intervalo; não dizem tudo o que aconteceu nele.",
    speaker: "DERICK", dialogue: "Quarenta e três minutos até alguém ligar. A gente ainda não sabe quanto disso foi estrada." },
  { id: "passenger-trace", fragments: ["belt-sample", "lab-comparison"], title: "Uma amostra, um exame ausente",
    observation: "A T-19 liga o fecho ao exame 4-B. O índice registra a comparação, mas essa cópia não traz seu resultado.",
    speaker: "LEROY", dialogue: "Coletaram. Mandaram comparar. Eu quero ler o que saiu dessa comparação." },
  { id: "yellow-material", fragments: ["photo-jacket", "lab-color"], title: "Uma cor em comum",
    observation: "A jaqueta e as microfibras são amarelas. A compatibilidade justifica investigar; não identifica Alana como passageira.",
    speaker: "DERICK", dialogue: "Pode ser a jaqueta dela. Mas amarelo tem em um monte de coisa, Leroy." },
  { id: "occupancy-conflict", fragments: ["incident-count", "belt-load"], title: "A contagem precisa ser conferida",
    observation: "O número veio de uma declaração. As marcas no cinto dianteiro direito pedem uma verificação que a equipe inicial não conseguiu fazer. Ainda falta identificar a origem da carga.",
    speaker: "LEROY", dialogue: "Eu li esse um como se alguém tivesse contado. Foi o que o Gouveia disse." },
] as const;

export function compareFragments(first: string, second: string) {
  return COMPARISONS.find(({ fragments }) =>
    (fragments[0] === first && fragments[1] === second) || (fragments[0] === second && fragments[1] === first));
}

// T-01 is a supporting record with no required puzzle. Other analyses wait for their gate.
export function availableFragments(discovered: readonly EvidenceId[], identified: readonly EvidenceId[]) {
  return COMPARISON_FRAGMENTS.filter(f => discovered.includes(f.document) &&
    (f.document === "A-01" || f.document === "T-01" || identified.includes(f.document)));
}

export const NOTEBOOK_KEY = "myu-investigation-notebook-v1";
export type Notebook = { version: 1; note: string; comparisons: string[] };
export function readNotebook(raw: string | null): Notebook {
  try {
    const value = JSON.parse(raw || "null");
    if (value?.version === 1) return {
      version: 1, note: typeof value.note === "string" ? value.note.slice(0, 4000) : "",
      comparisons: Array.isArray(value.comparisons) ? [...new Set<string>(value.comparisons.filter((id: unknown) => COMPARISONS.some(c => c.id === id)))] : [],
    };
  } catch { /* A damaged note must not block the investigation. */ }
  return { version: 1, note: "", comparisons: [] };
}
