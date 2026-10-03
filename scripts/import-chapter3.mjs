import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const inputPath = process.argv[2];
const outputPath = process.argv[3] ?? "app/chapter3.json";

if (!inputPath) {
  throw new Error("Uso: node scripts/import-chapter3.mjs <texto-extraido> [saida]");
}

const messageSpeakers = new Map([
  ["Encontrei o número. Não venha esperando uma resposta bonita.", "Ravi"],
  ["desde sábado.", "Derick"],
  ["17h46 ele saiu com ela.", "Leroy"],
  ["com a van.", "Derick"],
  ["sim.", "Leroy"],
  ["isso é o quê?", "Derick"],
  ["pode ser.", "Leroy"],
  ["vou confirmar.", "Leroy"],
  ["ainda vale sete e meia?", "Leroy"],
  ["vale. levo o arquivo.", "Derick"],
  ["eu seguro aqui.", "Kaio"],
  ["não rouba placa de trânsito.", "Kaio"],
  ["isso não é placa", "Leroy"],
  ["ótimo argumento para a audiência.", "Kaio"],
]);

// Ajustes mínimos exigidos pelo cânone vigente. O PDF permanece intacto;
// apenas a edição destinada ao site evita cristalizar decisões revogadas.
const canonicalSiteReplacements = new Map([
  [
    "Derick aparecia à direita, fora da ampliação, mas sabia exatamente a própria posição: Meia nos braços, língua no queixo, olhos fechados.",
    "Derick aparecia à direita, fora da ampliação, mas sabia exatamente a própria posição: Meia nos braços, língua no rosto, olhos fechados.",
  ],
  ["— Aposentado?", "— Sabe por que ele deixou o cargo?"],
  [
    "— Afastado primeiro. Aposentadoria veio durante o processo. Não foi por Alana.",
    "— Houve um processo. Não foi por Alana.",
  ],
]);

function normalizeBlock(lines) {
  const normalized = lines
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
  const aligned = normalized.replace("língua no queixo", "língua no rosto");
  return canonicalSiteReplacements.get(aligned) ?? aligned;
}

function pageBlocks(page, pageIndex) {
  const lines = page.split(/\r?\n/);
  const cleaned = [];
  let skippingDraftNote = pageIndex === 1;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      cleaned.push("");
      continue;
    }

    if (/^MYU\s+CAPÍTULO 3$/u.test(trimmed)) continue;
    if (/^\d+$/u.test(trimmed)) continue;
    if (pageIndex === 1 && trimmed === "CAPÍTULO 3") continue;

    if (skippingDraftNote) {
      if (trimmed === "NOTA DE RASCUNHO") continue;
      if (
        trimmed.startsWith("Ravi Nair e Mauro Gouveia") ||
        trimmed.startsWith("marcam os pontos em que os documentos") ||
        trimmed.startsWith("camada interativa no site")
      ) {
        continue;
      }
      skippingDraftNote = false;
    }

    if (messageSpeakers.has(trimmed)) {
      cleaned.push("");
      cleaned.push(trimmed);
      cleaned.push("");
      continue;
    }

    cleaned.push(trimmed);
  }

  const blocks = [];
  let current = [];

  for (const line of cleaned) {
    if (!line) {
      if (current.length) blocks.push(normalizeBlock(current));
      current = [];
      continue;
    }
    current.push(line);
  }

  if (current.length) blocks.push(normalizeBlock(current));
  return blocks.filter(Boolean);
}

const raw = readFileSync(resolve(inputPath), "utf8");
const pages = raw.split("\f").slice(1);
const blocks = [];

for (const [pageOffset, page] of pages.entries()) {
  const current = pageBlocks(page, pageOffset + 1);
  if (!current.length) continue;

  if (
    blocks.length > 0 &&
    /^[a-záàâãéêíóôõúç]/u.test(current[0]) &&
    !blocks.at(-1).startsWith("DOCUMENTO INTERATIVO")
  ) {
    blocks[blocks.length - 1] = `${blocks.at(-1)} ${current.shift()}`;
  }

  blocks.push(...current);
}

const tokens = blocks.map((text) => {
  if (text === "◆") return { kind: "break", text };

  if (text.startsWith("DOCUMENTO INTERATIVO")) {
    const match = text.match(
      /^DOCUMENTO INTERATIVO · ([A-Z]-\d+) (.+?) ((?:Imagem|Primeira|O mesmo|A página).*)$/u,
    );
    const id = match?.[1] ?? "PENDENTE";
    const title = match?.[2]?.trim() ?? "Documento em desenvolvimento";
    const description = match?.[3]?.trim() ?? text;
    return {
      kind: "document",
      text: title,
      documentId: id,
      description,
      status: "pending",
    };
  }

  const speaker = messageSpeakers.get(text);
  if (speaker) return { kind: "message", text, speaker };
  if (text.startsWith("—")) return { kind: "dialogue", text };
  return { kind: "paragraph", text };
});

const chapter = {
  title: "Capítulo 3",
  author: "Zero",
  source: "Myu_Capitulo_3_Primeiro_Rascunho-3.pdf",
  edition: "Primeiro rascunho completo — edição de leitura zero",
  status: "draft",
  provisionalNames: ["Ravi Nair", "Mauro Gouveia"],
  tokens,
};

writeFileSync(resolve(outputPath), `${JSON.stringify(chapter, null, 2)}\n`);
