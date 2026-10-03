import assert from "node:assert/strict";
import test from "node:test";
import { createBackup, parseBackup, restoreBackup, backupSummary, MAX_BACKUP_BYTES } from "../app/progress-backup.ts";

function storage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return { map, getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: key => map.delete(key) };
}
const position = { chapter: 4, route: "/capitulo-4", anchor: "c4-s2-t18", offset: 25, progress: 42.5, updatedAt: 1 };
const entries = {
  "myu-chapter-split-v1": "1", "myu-capitulo-2": "unlocked", "myu-capitulo-3": "unlocked", "myu-capitulo-4": "unlocked",
  "myu-arg-a07": "recovered", "myu-reading-theme-v1": "escuro",
  "myu-reading-preferences-v1": JSON.stringify({ size: 22, font: "sans", spacing: "amplo", width: "estreita", focus: true }),
  "myu-reading-progress-v1": JSON.stringify({ version: 1, current: position, chapters: { 4: position } }),
  "myu-chapter3-investigation-v3": JSON.stringify({ version: 3, discovered: ["A-01", "D-01", "T-01"], activated: ["D-01"], examined: ["D-01"], identified: ["D-01"], puzzleData: { "D-01": ["carbon:left"] }, sides: { "D-01": ["back"] }, hintLevels: { "D-01:LEROY": 2 }, relations: ["same-occurrence"], supernaturalSeen: false, looseDocuments: { "D-01": { x: 50, y: 40, rotation: 1, side: "back", z: 1 } } }),
  "myu-investigation-notebook-v1": JSON.stringify({ version: 1, note: "E o horário da chamada?", comparisons: ["same-occurrence"] }),
};

test("a portable save restores reading, clues, loose papers, notes and appearance exactly, without unrelated origin data", () => {
  const source = storage({ ...entries, "private-other-app": "never export me" });
  const backup = parseBackup(JSON.stringify(createBackup(source)));
  assert.deepEqual(backup.entries, entries);
  const destination = storage({ "private-other-app": "keep", "myu-capitulo-5": "unlocked" });
  restoreBackup(destination, backup);
  assert.equal(destination.getItem("private-other-app"), "keep");
  assert.equal(destination.getItem("myu-capitulo-5"), null);
  for (const [key, value] of Object.entries(entries)) assert.equal(destination.getItem(key), value);
  assert.deepEqual(backupSummary(backup), { chapter: 4, route: "/capitulo-4", progress: 43 });
});

test("invalid, oversized, unrelated and redirect-bearing files never modify the current save", () => {
  const backup = createBackup(storage(entries));
  const target = storage(entries);
  for (const patch of [
    { format: "another-app" }, { version: 2 }, { entries: { token: "secret" } },
    { entries: { "myu-reading-progress-v1": JSON.stringify({ version: 1, current: { ...position, route: "https://example.com" }, chapters: {} }) } },
    { entries: { "myu-chapter3-investigation-v3": '{"version":3,"discovered":"A-01"}' } },
    { entries: { "myu-chapter3-investigation-v3": '{"version":3,"sides":{"A-01":"back"}}' } },
    { entries: { "myu-investigation-notebook-v1": '{"version":1,"note":"x","comparisons":[],"__proto__":{}}' } },
  ]) assert.throws(() => restoreBackup(target, { ...backup, ...patch }));
  assert.deepEqual(Object.fromEntries(target.map), entries);
  assert.throws(() => parseBackup("x".repeat(MAX_BACKUP_BYTES + 1)));
  assert.throws(() => parseBackup("{"));
});

test("a mid-import quota failure rolls back the entire save and keeps unrelated keys", () => {
  const target = storage({ "myu-capitulo-2": "unlocked", other: "keep" });
  const setItem = target.setItem;
  let writes = 0;
  target.setItem = (key, value) => { if (++writes === 3) throw Error("QuotaExceeded"); return setItem(key, value); };
  assert.throws(() => restoreBackup(target, createBackup(storage(entries))), /anterior foi restaurado/);
  assert.deepEqual(Object.fromEntries(target.map), { "myu-capitulo-2": "unlocked", other: "keep" });
});

test("partial A-07 progress and legacy saves survive a transfer without replaying chapter migration", () => {
  const partial = { "myu-chapter-split-v1": "1", "myu-arg-a07-progress-v1": JSON.stringify({ found: ["leroy", "domingo"], light: { x: 31, y: 64 }, angle: 22, contrast: 70 }) };
  const destination = storage();
  restoreBackup(destination, createBackup(storage(partial)));
  assert.deepEqual(Object.fromEntries(destination.map), partial);
});
