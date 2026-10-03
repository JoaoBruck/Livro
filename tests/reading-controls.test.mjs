import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";
import * as jsx from "react/jsx-runtime";
import * as preferences from "../app/reading-preferences.ts";

// Exercise the shipped component's event handlers without requiring a browser.
// In particular, a label's pointer action may blur the focused close button
// with a null relatedTarget before the native radio receives its click.
function mountControls({ legacyArray = false, deniedStorage = false } = {}) {
  const states = [];
  let cursor = 0;
  const values = {};
  const stored = {};
  const root = { dataset: {}, style: { setProperty: (key, value) => { values[key] = value; } } };
  const exports = {};
  const source = ts.transpileModule(readFileSync(new URL("../app/reading-theme.tsx", import.meta.url), "utf8"), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
  }).outputText;
  const hooks = {
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = initial;
      return [states[index], next => { states[index] = typeof next === "function" ? next(states[index]) : next; }];
    },
    useRef: () => ({ current: null }),
    useEffect() {},
  };
  const window = {
    innerHeight: 800,
    scrollBy() {},
    dispatchEvent() {},
    localStorage: { setItem(key, value) { if (deniedStorage) throw Error("SecurityError"); stored[key] = value; } },
  };
  runInNewContext((legacyArray ? "Array.prototype.findLast = undefined;\n" : "") + source, {
    exports,
    require: name => {
      if (name === "react") return hooks;
      if (name === "react/jsx-runtime") return jsx;
      if (name === "next/link") return { default: "a" };
      if (name === "./reading-preferences") return preferences;
      throw Error(`Unexpected import: ${name}`);
    },
    document: { documentElement: root, querySelectorAll: () => [] },
    window, Event, CustomEvent,
  });
  const render = () => { cursor = 0; return exports.ReadingThemeControl(); };
  return { render, root, values, stored };
}

function find(tree, predicate) {
  if (!tree || typeof tree !== "object") return undefined;
  if (predicate(tree)) return tree;
  const children = [tree.props?.children].flat(Infinity);
  for (const child of children) { const found = find(child, predicate); if (found) return found; }
}
const panel = tree => find(tree, el => el.props?.id === "reading-theme-panel");
const control = (tree, name) => find(tree, el => el.props?.["aria-label"] === name);

test("clicking a reading option does not dismiss the panel before the radio can activate", () => {
  const app = mountControls();
  control(app.render(), "Ajustar leitura").props.onClick();
  let tree = app.render();
  assert.equal(panel(tree).props.hidden, false);
  tree.props.onBlur({ relatedTarget: null, currentTarget: { contains: () => false } });
  tree = app.render();
  assert.equal(panel(tree).props.hidden, false);
  find(tree, el => el.type === "input" && el.props.value === "escuro").props.onChange();
  assert.equal(app.root.dataset.readingTheme, "escuro");
  assert.equal(panel(app.render()).props.hidden, false);
  app.render().props.onBlur({ relatedTarget: {}, currentTarget: { contains: () => false } });
  assert.equal(panel(app.render()).props.hidden, true);
});

test("all appearance controls work without findLast and save only reading preferences", () => {
  const app = mountControls({ legacyArray: true });
  for (const theme of ["escuro", "branco", "preto", "claro"]) {
    find(app.render(), el => el.type === "input" && el.props.value === theme).props.onChange();
    assert.equal(app.root.dataset.readingTheme, theme);
  }
  control(app.render(), "Aumentar texto").props.onClick();
  assert.equal(app.values["--reader-size"], "1.375rem");
  for (const name of ["reading-font", "reading-spacing", "reading-width"]) {
    find(app.render(), el => el.type === "input" && el.props.name === name && !el.props.checked).props.onChange();
  }
  find(app.render(), el => el.type === "input" && el.props.type === "checkbox").props.onChange({ target: { checked: true } });
  assert.equal(app.root.dataset.readingFont, "sans");
  assert.equal(app.root.dataset.readingFocus, "true");
  assert.equal(app.values["--reader-leading"], "1.95");
  assert.equal(app.values["--reader-width"], "34rem");
  assert.deepEqual(Object.keys(app.stored).sort(), [preferences.PREFERENCES_KEY, preferences.THEME_KEY].sort());
  find(app.render(), el => el.props?.className === "reader-reset").props.onClick();
  assert.deepEqual(JSON.parse(app.stored[preferences.PREFERENCES_KEY]), preferences.DEFAULT_PREFERENCES);
  assert.equal(app.root.dataset.readingTheme, "claro");
});

test("denied storage still applies appearance and explains that it was not saved", () => {
  const app = mountControls({ deniedStorage: true });
  control(app.render(), "Aumentar texto").props.onClick();
  assert.equal(app.values["--reader-size"], "1.375rem");
  assert.match(find(app.render(), el => el.props?.role === "status").props.children, /não permitiu salvá-los/u);
});
