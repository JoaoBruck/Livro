import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
const root = resolve("out");
const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? "/Livro").replace(/\/$/, "");
const port = Number(process.env.PORT ?? 4173);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".txt": "text/plain", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".wav": "audio/wav", ".woff2": "font/woff2" };
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    let path = decodeURIComponent(url.pathname);
    if (base && path === base) { res.writeHead(308, { Location: `${base}/${url.search}` }); res.end(); return; }
    if (base && !path.startsWith(`${base}/`)) throw Error("Not found");
    path = path.slice(base.length);
    let file = resolve(root, `.${path}`);
    if (file !== root && !file.startsWith(`${root}${sep}`)) throw Error("Not found");
    if ((await stat(file)).isDirectory()) {
      if (!path.endsWith("/")) { res.writeHead(308, { Location: `${url.pathname}/${url.search}` }); res.end(); return; }
      file = resolve(file, "index.html");
    }
    res.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    try { res.end(await readFile(resolve(root, "404.html"))); } catch { res.end("Not found"); }
  }
}).listen(port, "0.0.0.0", () => console.log(`Myu: http://localhost:${port}${base}/`));
