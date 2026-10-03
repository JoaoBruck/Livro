import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { sitePath } from "../app/site-path.ts";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "/Livro";

test("mount paths preserve chapter queries, hashes, assets and existing save routes", () => {
  for (const mount of ["", "/Livro", "/Livro/"]) {
    const prefix = mount.replace(/\/$/, "");
    for (const path of ["/", "/#arg", "/capitulo-2/?retomar=1", "/images/myu-old-photo.webp", "/audio/postcredits/tv-impact.wav"]) {
      assert.equal(sitePath(path, mount), `${prefix}${path}`);
      assert.equal(sitePath(sitePath(path, mount), mount), `${prefix}${path}`);
    }
    for (const external of ["https://example.com/file", "//example.com/file", "#leitura", "data:image/png;base64,AA"]) {
      assert.equal(sitePath(external, mount), external);
    }
  }
});

test("published assets and anchors stay intact; only documented narrative revisions differ from version 41", () => {
  const manifest = JSON.parse(readFileSync(new URL("../docs/migration/source-v41.json", import.meta.url), "utf8"));
  const revisions = JSON.parse(readFileSync(new URL("../docs/reviews/2026-10-03-narrative.json", import.meta.url), "utf8")).files;
  for (const [file, hash] of Object.entries(manifest.sha256)) {
    const bytes = readFileSync(new URL(`../${file}`, import.meta.url));
    if (revisions[file]) {
      const revision = revisions[file];
      assert.equal(revision.beforeSha256, hash);
      assert.equal(createHash("sha256").update(bytes).digest("hex"), revision.afterSha256, file);
      const original = JSON.parse(bytes);
      for (const change of revision.changes) {
        assert.equal(original.tokens[change.index].text, change.after);
        original.tokens[change.index].text = change.before;
      }
      assert.equal(createHash("sha256").update(JSON.stringify(original, null, 2) + "\n").digest("hex"), hash,
        `${file}: every other token, anchor and metadata must match version 41`);
    } else assert.equal(createHash("sha256").update(bytes).digest("hex"), hash, file);
    if (file.startsWith("public/")) {
      const exported = readFileSync(new URL(`../out/${file.slice(7)}`, import.meta.url));
      assert.equal(createHash("sha256").update(exported).digest("hex"), hash, `export: ${file}`);
    }
  }
});

test("exported HTML and CSS reference real files under the deployment path", () => {
  const root = new URL("../out/", import.meta.url);
  let checked = 0, cssImages = 0;
  for (const file of readdirSync(root, { recursive: true }).filter(name => /\.(html|css)$/.test(name))) {
    const text = readFileSync(new URL(file, root), "utf8");
    const urls = file.endsWith(".html")
      ? [...text.matchAll(/(?:src|href)="([^"#]+)"/g)].map(match => match[1])
      : [...text.matchAll(/url\(["']?([^)'"\s]+)["']?\)/g)].map(match => match[1]);
    for (let url of urls) {
      if (!url.startsWith("/") || url.startsWith("//")) continue;
      assert.ok(!base || url.startsWith(`${base}/`), `${file}: unmounted URL ${url}`);
      url = url.slice(base.length).split(/[?#]/)[0];
      if (url.endsWith("/")) url += "index.html";
      assert.ok(existsSync(new URL(`.${url}`, root)), `${file}: missing ${url}`);
      checked++;
      if (file.endsWith(".css") && url.startsWith("/images/")) cssImages++;
    }
  }
  assert.ok(checked > 20);
  assert.ok(cssImages >= 5, "chapter covers and photo backgrounds must be present");
  assert.ok(existsSync(new URL(".nojekyll", root)));
  assert.ok(!existsSync(new URL("outro-lado/index.html", root)));
});
