import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import test from "node:test";
import { getOtherSideDestination, OTHER_SIDE_PATH } from "../app/outro-lado/access.ts";

async function render(pathname) {
  const route = pathname === "/outro-lado" ? "404.html" : pathname === "/" ? "index.html" : `${pathname.slice(1)}/index.html`;
  return new Response(readFileSync(new URL(`../out/${route}`, import.meta.url), "utf8"), {
    status: pathname === "/outro-lado" ? 404 : 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

test("exports every chapter as a directly accessible HTML page", async (t) => {
  for (const pathname of ["/", "/capitulo-2", "/capitulo-3", "/capitulo-4", "/capitulo-5"]) {
    await t.test(pathname, async () => {
      const response = await render(pathname);
      assert.equal(response.status, 200);
      assert.match(
        response.headers.get("content-type") ?? "",
        /^text\/html\b/i,
      );
      assert.match(await response.text(), /<html[^>]*lang="pt-BR"/u);
    });
  }
});

test("renders chapter navigation, scene anchors and accessible reading controls", async () => {
  const response = await render("/");
  const html = await response.text();
  assert.match(html, /aria-label="Navegar entre capítulos"/u);
  assert.match(html, /aria-label="Ajustar leitura"/u);
  assert.match(html, /aria-label="Aumentar texto"/u);
  assert.match(html, /id="c1-scene-7"/u);
  assert.match(html, /href="#c1-scene-7"/u);
  assert.match(html, /Cenas disponíveis neste capítulo/u);
  assert.match(html, /class="dialogue-lead"/u);
});

test("keeps the split chapters canonical", () => {
  const chapter = JSON.parse(
    readFileSync(new URL("../app/chapter3.json", import.meta.url), "utf8"),
  );
  const chapterFour = JSON.parse(readFileSync(new URL("../app/chapter4.json", import.meta.url), "utf8"));
  const completeStory = JSON.stringify([chapter, chapterFour]);
  const chapterTwo = JSON.parse(
    readFileSync(new URL("../app/chapter2.json", import.meta.url), "utf8"),
  );
  const documentMoments = chapter.tokens
    .filter((token) => token.kind === "document")
    .map((token) => [token.documentId, token.mode ?? "challenge"]);

  assert.equal(chapter.status, "canonical");
  assert.deepEqual(chapter.canonicalNames, ["Ravi Nair", "Mauro Gouveia"]);
  assert.deepEqual(documentMoments, [
    ["D-01", "challenge"],
    ["T-01", "collect"],
    ["T-02", "collect"],
    ["T-03", "collect"],
    ["B-12", "challenge"],
  ]);
  assert.deepEqual([...new Set(documentMoments.map(([id]) => id))], ["D-01", "T-01", "T-02", "T-03", "B-12"]);
  assert.ok(chapter.tokens.filter((token) => token.kind === "document").every((token) => token.status === "final"));
  assert.match(completeStory, /Eu tirei ela da água/u);
  assert.match(completeStory, /Ela não me ajudava a carregar/u);
  assert.match(completeStory, /Ela não perguntou isso\. Você perguntou/u);
  assert.match(completeStory, /Coisas que dava para resolver sem me ver/u);
  assert.match(completeStory, /Eu não vim para resolver isso entre nós/u);
  assert.match(completeStory, /Eu te pedi lá na mesa\. Era só deixar ele acabar de falar\. Você disse que ia/u);
  assert.match(JSON.stringify(chapterTwo), /Amanhã, pergunta antes de entregar a fotografia/u);
  assert.match(JSON.stringify(chapterTwo), /Uma bandeirinha se enroscou no cabelo dele/u);
  assert.match(completeStory, /17h46 ele saiu com a van/u);
  const dogReply = chapter.tokens.find(token => token.anchorId === "c3-s4-t19");
  assert.match(dogReply.text, /Levei a Meia no colo.*desceu sozinha/u);
  assert.match(completeStory, /Eu não me machuquei no quadriciclo/u);
  assert.match(completeStory, /A composição da fibra não estava em nenhuma das folhas que tinham levado/u);
  assert.doesNotMatch(completeStory, /Nenhuma peça nova apareceu/u);
  assert.doesNotMatch(completeStory, /17h46 ele saiu com ela|Me fez carregar ela/u);
  assert.doesNotMatch(completeStory, /Leroy contou todos|contagem dos carros|nove lugares e levava doze/u);
  assert.doesNotMatch(completeStory, /cebola/iu);
  assert.match(completeStory, /operação da Casa Real/u);
  assert.match(completeStory, /a Família Real entrou pela frente do teatro/u);
  assert.doesNotMatch(completeStory, /língua no queixo/u);
  assert.doesNotMatch(completeStory, /Afastado primeiro\. Aposentadoria/u);
});

test("records Natan's future secret without exposing it in the published chapters", () => {
  const continuity = readFileSync(new URL("../MYU_CONTINUIDADE.md", import.meta.url), "utf8");
  const publicStory = ["app/chapter.json", "app/chapter2.json", "app/chapter3.json", "app/chapter4.json", "app/chapter5.json"]
    .map((file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8"))
    .join("\n");

  assert.match(continuity, /a habilidade de pré-reescrita pertence a Natan/u);
  assert.match(continuity, /Derick tentará matar Vicente/u);
  assert.match(continuity, /A tragédia acontece apesar das intervenções de Natan/u);
  assert.doesNotMatch(publicStory, /pré-reescrita|Derick tentará matar Vicente|mãos espectrais|Executioner/iu);
});

test("distinguishes Leroy's lived memory from the missing causal sequence", () => {
  const chapterOne = JSON.parse(readFileSync(new URL("../app/chapter.json", import.meta.url), "utf8"));
  const chapterThree = JSON.parse(readFileSync(new URL("../app/chapter3.json", import.meta.url), "utf8"));

  assert.match(JSON.stringify(chapterOne), /Lembrava da festa\. Do riacho também/u);
  assert.match(JSON.stringify(chapterOne), /Não sabia o que acontecera com Alana entre os dois/u);
  assert.match(JSON.stringify(chapterThree), /Eu tirei ela da água/u);
  assert.doesNotMatch(JSON.stringify(chapterOne), /sabia contar essa história porque a escutara|sua memória não guardava caminho algum/u);
});

test("keeps the optional game closed until both discovery and release are ready", () => {
  assert.equal(getOtherSideDestination(false), null);
  assert.equal(getOtherSideDestination(true), null);
  assert.equal(getOtherSideDestination(false, true), null);
  assert.equal(getOtherSideDestination("true", true), null);
  assert.equal(getOtherSideDestination(true, true), OTHER_SIDE_PATH);
});

test("reserves the extra page without exposing a game or linking from chapters", async () => {
  assert.equal(existsSync(new URL("../out/outro-lado/index.html", import.meta.url)), false);
  const response = await render(OTHER_SIDE_PATH);
  assert.equal(response.status, 404);
  const html = await response.text();
  assert.doesNotMatch(html, /<h[1-6][^>]*>[^<]*Outro Lado/u);
  for (const file of ["app/page.tsx", "app/capitulo-2/page.tsx", "app/capitulo-3/page.tsx", "app/capitulo-4/page.tsx", "app/capitulo-5/page.tsx", "app/capitulo-5/reader.tsx", "app/investigation-reader.tsx"]) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /OtherSidePassage|outro-lado/u);
  }
});

test("ships the five Chapter 3 document images at readable resolution", () => {
  const assets = [
    "d01-front.png",
    "d01-back.png",
    "t01-front.png",
    "t01-back.png",
    "t02-front.png",
    "t02-back.png",
    "t03-front.png",
    "t03-back.png",
    "b12-front.png",
    "b12-back.png",
    "a01-back.png",
  ];

  for (const asset of assets) {
    const path = new URL(`../public/documents/${asset}`, import.meta.url);
    assert.ok(statSync(path).size > 50_000, `${asset} deve conservar resolução de leitura`);
  }
});

test("ships expressive dialogue portraits for Derick and Leroy", () => {
  const portraits = [
    "derick-observant.png",
    "derick-thinking.png",
    "derick-certain.png",
    "leroy-concerned.png",
    "leroy-reasoning.png",
    "leroy-firm.png",
  ];

  for (const portrait of portraits) {
    const path = new URL(`../public/images/dialogue/${portrait}`, import.meta.url);
    assert.ok(statSync(path).size > 100_000, `${portrait} deve conservar os detalhes do rosto`);
  }
});

test("keeps reading, investigation, and A-07 persistence independent", () => {
  const chapterTwo = readFileSync(new URL("../app/capitulo-2/page.tsx", import.meta.url), "utf8");
  const chapterThree = readFileSync(new URL("../app/investigation-reader.tsx", import.meta.url), "utf8");
  const evidence = readFileSync(new URL("../app/capitulo-3/evidence-system.tsx", import.meta.url), "utf8");
  const evidenceDefinitions = readFileSync(new URL("../app/chapter3-evidence.ts", import.meta.url), "utf8");
  const styles = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  const theme = readFileSync(new URL("../app/reading-theme.tsx", import.meta.url), "utf8");

  assert.match(chapterTwo, /myu-arg-a07-progress-v1/u);
  assert.doesNotMatch(chapterTwo.match(/function resetArchive\(\)[\s\S]*?\n  \}/u)?.[0] ?? "", /removeItem\("myu-capitulo-3"\)/u);
  assert.match(evidence, /myu-chapter3-investigation-v3/u);
  assert.match(evidence, /looseDocuments/u);
  assert.match(evidence, /mobile-paper-rack/u);
  assert.match(evidence, /dropDocumentAtPoint/u);
  assert.match(evidence, /const setPuzzleToken = useCallback/u);
  assert.match(evidence, /const setPuzzleAssignment = useCallback/u);
  assert.match(evidence, /onWheel/u);
  assert.match(evidence, /suppressDrawerTap/u);
  assert.match(chapterThree, /<ChapterGate documentId=\{gateId\}/u);
  assert.match(chapterThree, /investigation\.hydrated/u);
  assert.match(chapterThree, /markChapterComplete/u);
  assert.match(chapterThree, /FIM DO CAPÍTULO \{number\}/u);
  assert.match(evidence, /function GameDialogue/u);
  assert.match(evidence, /DIALOGUE_PORTRAITS/u);
  assert.match(evidence, /VESTÍGIO RECUPERADO/u);
  assert.match(evidence, /function CarbonRecoveryPuzzle/u);
  assert.match(evidence, /function SourceThreadPuzzle/u);
  assert.match(evidence, /function SeatReconstructionPuzzle/u);
  assert.match(evidence, /function FolioReassemblyPuzzle/u);
  assert.match(evidence, /function TimelinePuzzle/u);
  assert.match(evidence, /export function EvidenceConvergence/u);
  assert.deepEqual(
    [...evidenceDefinitions.matchAll(/puzzleKind:\s*"([^"]+)"/gu)].map((match) => match[1]),
    ["memory", "carbon-recovery", "source-thread", "seat-reconstruction", "folio-reassembly", "timeline"],
  );
  const observations = [...evidenceDefinitions.matchAll(/observations:\s*\{([\s\S]*?)\n\s{4}\},\n\s{2}\},/gu)];
  assert.equal(observations.length, 6);
  const observationBodies = observations.map((match) => match[1]).join("\n");
  assert.doesNotMatch(observationBodies, /OT-0812-44|17h46|18h29|dianteiro direito|folha 18|poliéster|algodão/iu);
  assert.doesNotMatch(evidence, /function ComparisonWorkbench/u);
  assert.doesNotMatch(evidence, /toggleDocumentField/u);
  assert.doesNotMatch(evidence, /evidence-fragments/u);
  assert.doesNotMatch(evidence, /onDrop=\{dropFragment\}/u);
  assert.doesNotMatch(evidence, /type="radio"/u);
  assert.match(styles, /\.chapter-evidence-gate/u);
  for (const puzzleClass of ["carbon-scan", "thread-board", "puzzle-seat-map", "folio-strips", "timeline-rail", "evidence-convergence", "chapter-three-complete"]) {
    assert.match(styles, new RegExp(`\\.${puzzleClass}`, "u"));
  }
  assert.match(styles, /\.game-dialogue-speaker/u);
  const preferences = readFileSync(new URL("../app/reading-preferences.ts", import.meta.url), "utf8");
  assert.match(preferences, /myu-reading-theme-v1/u);
  for (const mode of ["claro", "escuro", "branco", "preto"]) assert.match(theme, new RegExp(`"${mode}"`, "u"));
});
