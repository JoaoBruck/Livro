import assert from "node:assert/strict";
import test from "node:test";
import { runInNewContext } from "node:vm";
import {
  chapterAccess, chapterStats, DEFAULT_PREFERENCES, normalizePreferences,
  normalizeTheme, PREFERENCES_KEY, READING_BOOTSTRAP, THEME_KEY,
} from "../app/reading-preferences.ts";

test("invalid saved reading settings always leave legible defaults", () => {
  for (const value of [null, [], "corrupt", 8, { size: -900, font: "missing", spacing: false, focus: "true" }]) {
    assert.deepEqual(normalizePreferences(value), DEFAULT_PREFERENCES);
  }
  assert.deepEqual(normalizePreferences({ size: 28, font: "sans", spacing: "amplo", width: "estreita", focus: true }), {
    size: 28, font: "sans", spacing: "amplo", width: "estreita", focus: true,
  });
  assert.equal(normalizeTheme("unknown"), "claro");
});

test("first-paint appearance matches the saved controls, including malformed storage", () => {
  const cases = [null, "{broken", "null", '"text"', JSON.stringify({ size: 28, font: "sans", spacing: "amplo", width: "estreita", focus: true })];
  for (const raw of cases) {
    const values = {};
    const root = { dataset: {}, style: { setProperty: (name, value) => { values[name] = value; } } };
    runInNewContext(READING_BOOTSTRAP, {
      document: { documentElement: root },
      localStorage: { getItem: (key) => key === THEME_KEY ? "escuro" : raw },
    });
    let parsed;
    try { parsed = JSON.parse(raw); } catch { parsed = null; }
    const expected = normalizePreferences(parsed);
    assert.equal(values["--reader-size"], `${expected.size / 16}rem`);
    assert.equal(values["--reader-leading"], expected.spacing === "amplo" ? "1.95" : "1.72");
    assert.equal(values["--reader-width"], expected.width === "estreita" ? "34rem" : "42.5rem");
    assert.equal(root.dataset.readingFont, expected.font);
    assert.equal(root.dataset.readingFocus, String(expected.focus));
    assert.equal(root.dataset.readingTheme, "escuro");
  }
});

test("appearance can start when browser storage is denied and never changes story progress", () => {
  const values = {};
  const root = { dataset: {}, style: { setProperty: (name, value) => { values[name] = value; } } };
  runInNewContext(READING_BOOTSTRAP, {
    document: { documentElement: root },
    localStorage: { getItem: () => { throw new Error("SecurityError"); } },
  });
  assert.equal(root.dataset.readingTheme, "claro");
  assert.equal(values["--reader-size"], "1.25rem");
  const keys = [];
  runInNewContext(READING_BOOTSTRAP, {
    document: { documentElement: root },
    localStorage: { getItem: (key) => { keys.push(key); return null; } },
  });
  assert.deepEqual(keys, [THEME_KEY, PREFERENCES_KEY]);
});

test("chapter menu respects both existing unlock paths without unlocking future chapters", () => {
  const read = (state) => (key) => state[key] ?? null;
  assert.deepEqual(chapterAccess(1, read({})), [1]);
  assert.deepEqual(chapterAccess(1, read({ "myu-capitulo-2": "unlocked" })), [1, 2]);
  assert.deepEqual(chapterAccess(2, read({ "myu-arg-a07": "recovered" })), [1, 2, 3]);
  assert.deepEqual(chapterAccess(1, read({ "myu-capitulo-3": "unlocked" })), [1, 2, 3]);
  assert.deepEqual(chapterAccess(2, read({ "myu-capitulo-3": "false" })), [1, 2]);
  assert.deepEqual(chapterAccess(3, () => { throw new Error("SecurityError"); }), [1, 2, 3]);
});

test("reading estimates count Portuguese words, not dialogue punctuation or puzzle controls", () => {
  assert.deepEqual(chapterStats([
    { kind: "dialogue", text: "— Pra quê?! — Derick perguntou." },
    { kind: "paragraph", text: "A casa-lar silenciou." },
    { kind: "break", text: "◆" },
    { kind: "document", text: "MESA DE RECONSTRUÇÃO" },
  ]), { words: 7, minutes: 1, label: "7" });
});


test("chapter five honors existing completion without unlocking early", () => {
  const read = values => key => values[key] ?? null;
  assert.deepEqual(chapterAccess(1, read({ "myu-capitulo-4": "unlocked" })), [1, 2, 3, 4]);
  assert.deepEqual(chapterAccess(1, read({ "myu-capitulo-4-complete": "true" })), [1, 2, 3, 4, 5]);
  assert.deepEqual(chapterAccess(1, read({ "myu-capitulo-5": "unlocked" })), [1, 2, 3, 4, 5]);
  assert.deepEqual(chapterAccess(5, () => { throw new Error("SecurityError"); }), [1, 2, 3, 4, 5]);
});
