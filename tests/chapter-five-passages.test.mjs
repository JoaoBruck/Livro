import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { splitIntoScenes } from "../app/investigation-flow.ts";
import { chapterFivePassages } from "../app/capitulo-5/passages.ts";

const chapter = JSON.parse(readFileSync(new URL("../app/chapter5.json", import.meta.url), "utf8"));

test("atmosphere boundaries preserve every readable paragraph and saved anchor in order", () => {
  const scenes = splitIntoScenes(chapter.tokens);
  const seen = new Set();
  for (const scene of scenes) {
    const passages = chapterFivePassages(scene);
    assert.ok(passages.every(passage => passage.tokens.length > 0));
    assert.deepEqual(passages.flatMap(passage => passage.tokens), scene);
    for (const token of passages.flatMap(passage => passage.tokens)) {
      assert.ok(token.anchorId);
      assert.ok(!seen.has(token.anchorId), token.anchorId);
      seen.add(token.anchorId);
    }
  }
  assert.equal(seen.size, chapter.tokens.filter(token => token.kind !== "break").length);
  // The cut back to Natan must reset the atmosphere of the preceding fire.
  assert.deepEqual(chapterFivePassages(scenes[6]).map(passage => passage.atmosphere), ["paper"]);
});
