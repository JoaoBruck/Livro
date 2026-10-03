import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";

export function createOffline(base) {
  const root = new URL("../out/", import.meta.url);
  const files = readdirSync(root, { recursive: true }).filter(file =>
    statSync(new URL(file, root)).isFile() && !file.includes("outro-lado") &&
    !["sw.js", "offline-manifest.json", ".nojekyll"].includes(file) && !file.endsWith(".map"));
  const hash = createHash("sha256");
  let bytes = 0;
  for (const file of files.sort()) {
    const data = readFileSync(new URL(file, root));
    hash.update(file).update(data); bytes += data.length;
  }
  const version = hash.digest("hex").slice(0, 16);
  const config = { prefix: `myu-offline-${base || "root"}-`, version, base: `${base}/`,
    urls: files.map(file => `${base}/${file.replace(/(^|\/)index\.html$/, "$1")}`) };
  const template = readFileSync(new URL("./offline-worker.js", import.meta.url), "utf8");
  writeFileSync(new URL("sw.js", root), template.replace("__MYU_OFFLINE_CONFIG__", JSON.stringify(config)));
  writeFileSync(new URL("offline-manifest.json", root), JSON.stringify({ version, bytes, files: files.length }));
}
