/* The build replaces this configuration with the exported files and their hash. */
const CONFIG = __MYU_OFFLINE_CONFIG__;
const CACHE = `${CONFIG.prefix}${CONFIG.version}`;

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      for (let i = 0; i < CONFIG.urls.length; i += 8) {
        await cache.addAll(CONFIG.urls.slice(i, i + 8).map(url => new Request(url, { cache: "reload" })));
      }
      await self.skipWaiting();
    } catch (error) {
      await caches.delete(CACHE);
      throw error;
    }
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    // Retain one previous snapshot for tabs still running the previous JS build.
    const previous = (await caches.keys()).filter(name => name.startsWith(CONFIG.prefix) && name !== CACHE);
    await Promise.all(previous.slice(0, -1).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith(CONFIG.base)) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);
      if (response.ok || (response.status < 500 && response.status !== 404)) return response;
      const cached = await offlineResponse(url);
      return cached || response;
    } catch (error) {
      const cached = await offlineResponse(url);
      if (cached) return cached;
      throw error;
    }
  })());
});

async function offlineResponse(url) {
  let path = url.pathname;
  if (CONFIG.urls.includes(`${path}/`)) path += "/";
  const names = [CACHE, ...(await caches.keys()).filter(name => name.startsWith(CONFIG.prefix) && name !== CACHE).reverse()];
  for (const name of names) {
    const hit = await caches.match(path, { cacheName: name });
    if (hit) return hit;
  }
}
