import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { migrateChapterStorage, resolveReadingPosition, READING_STORAGE_KEY } from "../app/chapter-migration.ts";
import { deriveRelations, gateScenes, splitIntoScenes } from "../app/investigation-flow.ts";
import { chapterAccess, chapterStats } from "../app/reading-preferences.ts";

const readJson = (file) => JSON.parse(readFileSync(new URL(`../app/${file}`, import.meta.url), "utf8"));
const three = readJson("chapter3.json"), four = readJson("chapter4.json"), map = readJson("chapter-split-map.json");
const redirects = readJson("reading-anchor-redirects.json");
const position = (anchor, chapter = 3) => ({ chapter, route: chapter === 1 ? "/" : `/capitulo-${chapter}`, anchor, offset: 90, progress: 68, updatedAt: 12345 });
function storageWith(position, extra = {}) {
  const data = new Map(Object.entries(extra));
  if (position) data.set(READING_STORAGE_KEY, JSON.stringify({ version: 1, current: position, chapters: { [position.chapter]: position, 2: { ...position, chapter: 2, route: "/capitulo-2", anchor: "c2-s1-t4" } } }));
  return { getItem: (k) => data.get(k) ?? null, setItem: (k,v) => data.set(k,v), data };
}

test("split preserves a real ending, unresolved rupture, dates and a later confirmation", () => {
  const a=JSON.stringify(three), b=JSON.stringify(four);
  assert.match(a, /Eu não vim para resolver isso entre nós/);
  assert.match(a, /Eu tirei ela da água/);
  assert.match(three.tokens.at(-1).text, /Mas eu trouxe ela/);
  assert.match(four.tokens[0].text, /13 de agosto de 2025/);
  assert.match(b, /Ela entrou na van\. Eu pedi que viesse, e ela veio/);
  assert.match(four.tokens.at(-1).text, /Não voltem para a casa-lar hoje/);
  assert.doesNotMatch(a, /Poliéster|O Mauro acabou de me ligar/);
  assert.ok(chapterStats(three.tokens).words < 7000);
  assert.ok(chapterStats(four.tokens).words > 3500 && chapterStats(four.tokens).words < 5000);
  for (const chapter of [three,four]) {
    const anchors=chapter.tokens.filter(t=>t.anchorId).map(t=>t.anchorId);
    assert.equal(new Set(anchors).size, anchors.length);
    assert.equal(splitIntoScenes(chapter.tokens).length, chapter.sceneLabels.length);
    assert.doesNotMatch(JSON.stringify(chapter), /pré-reescrita|Derick tentará matar Vicente|cebola/i);
  }
});

test("each chapter has two different required methods and no conclusion leaks through a gate", () => {
  const s3=splitIntoScenes(three.tokens), s4=splitIntoScenes(four.tokens);
  const ids=c=>c.tokens.filter(t=>t.kind==="document"&&t.mode!=="collect").map(t=>t.documentId);
  assert.deepEqual(ids(three), ["D-01","B-12"]);
  assert.deepEqual(ids(four), ["T-02","T-03"]);
  assert.equal(gateScenes(s3,[]).at(-1).gateId,"D-01");
  assert.equal(gateScenes(s3,["D-01"]).at(-1).gateId,"B-12");
  assert.equal(gateScenes(s3,["D-01","B-12"]).length,s3.length);
  assert.equal(gateScenes(s4,[]).at(-1).gateId,"T-02");
  const beforeSecond=gateScenes(s4,["T-02"]);
  assert.equal(beforeSecond.at(-1).gateId,"T-03");
  assert.ok(beforeSecond.at(-1).sceneIndex >= 2, "the folio task belongs at Gouveia's house");
  assert.doesNotMatch(JSON.stringify(beforeSecond), /Poliéster|Ela entrou na van\. Eu pedi/);
  assert.equal(gateScenes(s4,["T-02","T-03"]).length,s4.length);
  const first=four.tokens.findIndex(t=>t.documentId==="T-02"), second=four.tokens.findIndex(t=>t.documentId==="T-03");
  assert.ok(chapterStats(four.tokens.slice(first+1,second)).words > 1500, "space the two investigations across the story");
  assert.deepEqual(deriveRelations(["A-01","T-01"],["D-01","B-12","T-02","T-03"]).sort(),["passenger-trace","same-occurrence","time-gap"]);
});

test("old positions before and after the split survive without touching evidence or appearance", () => {
  for (const [anchor,target] of Object.entries(map)) {
    const s=storageWith(position(anchor), { "myu-chapter3-investigation-v3": "keep-evidence", "myu-reading-theme-v1":"escuro", "myu-arg-a07":"recovered" });
    migrateChapterStorage(s,map);
    const updated=JSON.parse(s.getItem(READING_STORAGE_KEY));
    assert.equal(updated.current.chapter,target.chapter);
    assert.equal(updated.current.anchor,target.anchor);
    assert.ok((target.chapter===3?three:four).tokens.some(t=>t.anchorId===target.anchor && t.kind!=="document"));
    assert.equal(updated.chapters[2].anchor,"c2-s1-t4");
    assert.equal(s.getItem("myu-chapter3-investigation-v3"),"keep-evidence");
    assert.equal(s.getItem("myu-reading-theme-v1"),"escuro");
    assert.equal(s.getItem("myu-arg-a07"),"recovered");
    if(target.chapter===4) assert.equal(s.getItem("myu-capitulo-4"),"unlocked");
    else assert.equal(s.getItem("myu-capitulo-4"),null);
    const once=s.getItem(READING_STORAGE_KEY);
    migrateChapterStorage(s,map);
    assert.equal(s.getItem(READING_STORAGE_KEY),once);
  }
});

test("legacy completion grants chapter four and new completion does not rerun migration", () => {
  const s=storageWith(position("c3-complete"),{"myu-capitulo-3-complete":"true"});
  migrateChapterStorage(s,map);
  assert.equal(s.getItem("myu-capitulo-4"),"unlocked");
  assert.equal(JSON.parse(s.getItem(READING_STORAGE_KEY)).current.anchor,"c4-complete");
  const newReader=storageWith(position("c3-added-583-20"),{"myu-chapter-split-v1":"1","myu-capitulo-3-complete":"true"});
  migrateChapterStorage(newReader,map);
  assert.equal(JSON.parse(newReader.getItem(READING_STORAGE_KEY)).current.chapter,3);
  assert.deepEqual(chapterAccess(4,k=>s.getItem(k)),[1,2,3,4]);
});

test("malformed and denied saves do not crash the split migration", () => {
  for(const raw of ["{broken","null","[]",'{"version":1,"chapters":{"3":null},"current":{}}']) {
    const s=storageWith(null,{[READING_STORAGE_KEY]:raw,"myu-capitulo-3-complete":"true"});
    assert.doesNotThrow(()=>migrateChapterStorage(s,map));
    assert.equal(s.getItem("myu-capitulo-4"),"unlocked");
  }
  assert.doesNotThrow(()=>migrateChapterStorage({getItem(){throw Error("SecurityError")},setItem(){throw Error("SecurityError")}},map));
});

test("readers resume inside their original chapter after an editorial rewrite", () => {
  const chapters = { 4: four, 5: readJson("chapter5.json") };
  for (const anchor of Object.keys(redirects)) {
    const chapter = Number(anchor.match(/^c([45])-/)?.[1]);
    assert.ok(chapters[chapter], `known chapter for ${anchor}`);
    const anchors = new Set(chapters[chapter].tokens.filter(t => t.kind !== "document").map(t => t.anchorId));
    const saved = position(anchor, chapter);
    const s = storageWith(saved, { "myu-chapter-split-v1": "1", "myu-chapter3-investigation-v3": "keep-evidence" });
    migrateChapterStorage(s, map);
    const current = JSON.parse(s.getItem(READING_STORAGE_KEY)).current;
    const restored = resolveReadingPosition(current, redirects);
    assert.ok(anchors.has(restored.anchor));
    assert.equal(restored.chapter, chapter);
    assert.equal(restored.route, `/capitulo-${chapter}`);
    assert.equal(restored.offset, 0);
    assert.equal(s.getItem("myu-chapter3-investigation-v3"), "keep-evidence");
    assert.deepEqual(current, saved, "resolving an edited passage does not rewrite the saved progress");
  }
  const unaffected = position("c4-s6-t220", 4);
  assert.deepEqual(resolveReadingPosition(unaffected, redirects), unaffected);
  const newFifthPosition = position(chapters[5].tokens[0].anchorId, 5);
  assert.deepEqual(resolveReadingPosition(newFifthPosition, redirects), newFifthPosition);
});

test("the trap is disclosed during the confrontation and its broken condition afterward", () => {
  const at = anchor => four.tokens.findIndex(t => t.anchorId === anchor);
  const bluff = at("c4-s6-t114"), correction = at("c4-s6-t125");
  const before = four.tokens.slice(0, bluff).map(t => t.text).join("\n");
  assert.doesNotMatch(before, /algodão|poliéster|Se corrigir a composição|Se ele negar ter lido/iu);
  assert.match(before, /Tem uma coisa que a gente pode tentar/);
  assert.match(four.tokens[correction].text, /Poliéster/);
  assert.match(four.tokens[correction + 1].text, /sugerira no restaurante/);
  assert.ok(at("c4-s6-t155") < at("c4-s6-t190"));
  assert.match(four.tokens[at("c4-s6-t190")].text, /Eu te pedi lá na mesa.*deixar ele acabar de falar/);
});
