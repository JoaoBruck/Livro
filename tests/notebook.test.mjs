import assert from "node:assert/strict";
import test from "node:test";
import { availableFragments, compareFragments, COMPARISONS, readNotebook } from "../app/notebook-data.ts";
import { gateScenes } from "../app/investigation-flow.ts";

test("comparison offers only discovered and completed examinations", () => {
  const collected = ["A-01", "D-01", "T-01", "T-02", "T-03", "B-12"];
  assert.ok(availableFragments(collected, []).every(f => ["A-01", "T-01"].includes(f.document)));
  assert.ok(availableFragments(collected, ["D-01"]).some(f => f.document === "T-01"), "a supporting record must not require an extra puzzle");
  const fragments = availableFragments(collected, ["D-01", "T-01"]);
  assert.ok(fragments.some(f => f.id === "transport-reference"));
  assert.ok(fragments.every(f => ["A-01", "D-01", "T-01"].includes(f.document)));
  assert.equal(availableFragments(["A-01"], collected).some(f => f.document === "T-03"), false);
});

test("marked fragments give the same supported relation in either order; plausible weak pairs remain hypotheses", () => {
  for (const c of COMPARISONS) {
    assert.equal(compareFragments(...c.fragments), c);
    assert.equal(compareFragments(...[...c.fragments].reverse()), c);
  }
  assert.equal(compareFragments("photo-date", "incident-count"), undefined);
  assert.equal(compareFragments("belt-caution", "photo-jacket"), undefined);
  assert.equal(compareFragments("belt-load", "belt-load"), undefined);
  assert.match(compareFragments("photo-jacket", "lab-color").observation, /não identifica Alana/);
});

test("notes restore safely and optional comparisons cannot unlock a story gate", () => {
  assert.deepEqual(readNotebook('{"version":1,"note":"Uma hipótese","comparisons":["time-gap","time-gap","invented"]}'), { version: 1, note: "Uma hipótese", comparisons: ["time-gap"] });
  assert.equal(readNotebook("broken").note, "");
  const scenes = [[{ kind: "document", text: "", documentId: "T-03" }, { kind: "paragraph", text: "depois" }]];
  assert.equal(gateScenes(scenes, [])[0].scene.length, 1);
  assert.equal(gateScenes(scenes, ["T-03"])[0].scene.length, 2);
});
