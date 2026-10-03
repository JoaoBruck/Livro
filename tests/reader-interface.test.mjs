import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import test from "node:test";
import { EVIDENCE } from "../app/chapter3-evidence.ts";
import { findReadingAnchor } from "../app/reading-preferences.ts";

test("reading position matches the last reached paragraph at boundaries and after resizing", () => {
  assert.equal(findReadingAnchor([], 10, x => x), undefined);
  for (const heights of [[0, 0, 70, 190, 350], [100, 170, 310, 510, 650]]) {
    const anchors = heights.map((top, id) => ({ top, id }));
    for (let line = -10; line < 900; line += 5) {
      assert.equal(findReadingAnchor(anchors, line, anchor => anchor.top), anchors.filter(anchor => anchor.top <= line).at(-1));
    }
  }
});

test("a long chapter needs at most ten measured paragraph positions per scroll calculation", () => {
  const anchors = Array.from({ length: 551 }, (_, index) => ({ id: index, top: index * 80 }));
  let measurements = 0;
  const active = findReadingAnchor(anchors, 317 * 80 + 40, anchor => {
    measurements++;
    return anchor.top;
  });
  assert.equal(active.id, 317);
  assert.ok(measurements <= 10, `${measurements} layout measurements`);
});

function luminance(hex) {
  const [r, g, b] = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255)
    .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

test("all four tool palettes meet 4.5:1 for normal text and selected actions", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8").split("/* Reader tools:")[1];
  const palettes = [...css.matchAll(/([^{}]+)\{([^{}]*--ui-surface:[^{}]*)\}/g)];
  assert.equal(palettes.length, 4);
  const pairs = [
    ["text", "surface"], ["muted", "surface"], ["text", "raised"], ["muted", "raised"],
    ["accent", "accent-fill"], ["text", "accent-fill"], ["action-text", "action"], ["success", "success-fill"],
  ];
  for (const [, selector, declarations] of palettes) {
    const colors = Object.fromEntries([...declarations.matchAll(/--ui-([\w-]+):\s*(#[\da-f]{6})/g)].map(([, key, value]) => [key, value]));
    for (const [foreground, background] of pairs) {
      const a = luminance(colors[foreground]), b = luminance(colors[background]);
      const contrast = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      assert.ok(contrast >= 4.5, `${selector.trim()} ${foreground}/${background}: ${contrast.toFixed(2)}`);
    }
  }
});

test("every front and back is a valid, smaller image asset", () => {
  const urls = [...new Set(Object.values(EVIDENCE).flatMap(document => [document.front, document.back]))];
  assert.equal(urls.length, 12);
  let original = 0, optimized = 0;
  for (const url of urls) {
    assert.match(url, /\.webp$/);
    const asset = new URL(`../public${url}`, import.meta.url);
    const bytes = readFileSync(asset);
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
    optimized += bytes.length;
    original += statSync(new URL(`../public${url.replace(/\.webp$/, ".png")}`, import.meta.url)).size;
  }
  assert.ok(optimized < original * 0.8, "document transfers should be at least 20% lighter");
});
