import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { runInNewContext } from "node:vm";
import test from "node:test";

const worker = readFileSync(new URL("../out/sw.js", import.meta.url), "utf8");
const config = JSON.parse(worker.match(/const CONFIG = (.*);/)[1]);

function environment({ failInstall = false } = {}) {
  const handlers = {}, data = new Map();
  let online = true, claimed = false, skipped = false;
  const location = new URL(`https://example.com${config.base}sw.js`);
  const key = url => new URL(typeof url === "string" ? url : url.url, location).pathname;
  const caches = {
    keys: async () => [...data.keys()],
    delete: async name => data.delete(name),
    open: async name => {
      if (!data.has(name)) data.set(name, new Map());
      return { addAll: async requests => {
        for (const request of requests) {
          if (failInstall && key(request).includes("capitulo-5")) throw Error("connection-lost");
          data.get(name).set(key(request), { ok: true, source: "snapshot", path: key(request) });
        }
      } };
    },
    match: async (url, { cacheName }) => data.get(cacheName)?.get(key(url)),
  };
  const self = { location, addEventListener: (type, handler) => { handlers[type] = handler; },
    skipWaiting: async () => { skipped = true; }, clients: { claim: async () => { claimed = true; } } };
  runInNewContext(worker, { self, caches, URL,
    Request: class { constructor(url) { this.url = new URL(url, location).href; } },
    fetch: async request => { if (!online) throw Error("offline"); return { ok: true, status: 200, source: "network", url: request.url }; },
  });
  return { data, get claimed() { return claimed; }, get skipped() { return skipped; }, setOnline: value => { online = value; },
    lifecycle: type => { let promise; handlers[type]({ waitUntil: value => { promise = value; } }); return promise; },
    request: (path, method = "GET") => { let promise; handlers.fetch({ request: { url: new URL(path, location).href, method }, respondWith: value => { promise = value; } }); return promise; },
  };
}

test("the offline snapshot includes all five chapters, documents, audio and route payloads at the correct mount", () => {
  assert.equal(new Set(config.urls).size, config.urls.length);
  for (const url of config.urls) {
    assert.ok(url.startsWith(config.base));
    let file = url.slice(config.base.length);
    if (!file || file.endsWith("/")) file += "index.html";
    assert.ok(existsSync(new URL(`../out/${file}`, import.meta.url)), file);
    assert.ok(!url.includes("outro-lado"));
  }
  for (let n = 2; n <= 5; n++) assert.ok(config.urls.includes(`${config.base}capitulo-${n}/`));
  assert.ok(config.urls.some(url => url.endsWith("audio/postcredits/vicente.wav")));
  assert.ok(config.urls.some(url => url.endsWith("documents/t03-front.webp")));
  assert.ok(config.urls.some(url => url.endsWith(".txt")));
});

test("offline navigation resumes with query parameters; online requests always get fresh pages, and other origins remain untouched", async () => {
  const app = environment();
  await app.lifecycle("install"); await app.lifecycle("activate");
  assert.ok(app.skipped && app.claimed);
  const route = `${config.base}capitulo-4/?retomar=1`;
  assert.equal((await app.request(route)).source, "network");
  app.setOnline(false);
  assert.equal((await app.request(route)).source, "snapshot");
  assert.equal((await app.request(`${config.base}capitulo-4`)).source, "snapshot");
  const payload = config.urls.find(url => url.endsWith(".txt"));
  assert.equal((await app.request(`${payload}?_rsc=xyz`)).source, "snapshot");
  assert.equal((await app.request(`${config.base}audio/postcredits/tv-impact.wav`)).source, "snapshot");
  assert.equal(app.request("https://other.example/"), undefined);
  assert.equal(app.request(route, "POST"), undefined);
});

test("a failed download cannot activate a partial snapshot or delete a working previous copy", async () => {
  const app = environment({ failInstall: true });
  app.data.set(`${config.prefix}previous`, new Map([[config.base, { source: "previous" }]]));
  app.data.set("other-app-cache", new Map());
  await assert.rejects(app.lifecycle("install"), /connection-lost/);
  assert.equal(app.skipped, false);
  assert.equal(app.data.has(`${config.prefix}${config.version}`), false);
  assert.ok(app.data.has(`${config.prefix}previous`));
  assert.ok(app.data.has("other-app-cache"));
});
