"use client";

import { useEffect, useState } from "react";
import { sitePath } from "./site-path";

export function OfflineReading() {
  const [supported, setSupported] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [size, setSize] = useState("");
  const [status, setStatus] = useState("");
  const scope = sitePath("/");
  useEffect(() => {
    const supported = "serviceWorker" in navigator && "caches" in window;
    setSupported(supported);
    if (!supported) return;
    let disposed = false;
    void navigator.serviceWorker.getRegistration(scope).then(registration => {
      if (!disposed) setReady(!!registration?.active);
    }).catch(() => { if (!disposed) setSupported(false); });
    void fetch(sitePath("/offline-manifest.json")).then(response => response.ok ? response.json() : undefined)
      .then(manifest => { if (!disposed && typeof manifest?.bytes === "number") setSize(`${Math.ceil(manifest.bytes / 1024 / 1024)} MB`); }).catch(() => {});
    return () => { disposed = true; };
  }, [scope]);

  async function save() {
    setBusy(true);
    setStatus("Guardando os capítulos, imagens e documentos. Mantenha esta página aberta até terminar.");
    try {
      const manifestResponse = await fetch(sitePath("/offline-manifest.json"), { cache: "no-store" });
      if (!manifestResponse.ok) throw Error("manifest");
      const manifest = await manifestResponse.json() as { version: string; files: number };
      const cacheName = `myu-offline-${scope.slice(0, -1) || "root"}-${manifest.version}`;
      const existing = await navigator.serviceWorker.getRegistration(scope);
      if (existing?.active && (!await caches.has(cacheName) || (await (await caches.open(cacheName)).keys()).length !== manifest.files)) {
        // Evicted/partial copies must be installable again even if the script is unchanged.
        await existing.unregister();
      }
      const registration = await navigator.serviceWorker.register(sitePath("/sw.js"), { scope, updateViaCache: "none" });
      await registration.update();
      const worker = registration.installing || registration.waiting;
      if (worker && worker.state !== "activated") await new Promise<void>((resolve, reject) => {
        const timer = window.setTimeout(() => { worker.removeEventListener("statechange", changed); reject(Error("timeout")); }, 180000);
        function changed() {
          if (worker!.state === "activated" || worker!.state === "redundant") {
            window.clearTimeout(timer); worker!.removeEventListener("statechange", changed);
            if (worker!.state === "activated") resolve(); else reject(Error("download"));
          }
        }
        worker.addEventListener("statechange", changed); changed();
      });
      if (!registration.active || !await caches.has(cacheName) || (await (await caches.open(cacheName)).keys()).length !== manifest.files) throw Error("not-complete");
      setReady(true);
      setStatus("Leitura disponível sem internet neste navegador. Os capítulos continuam sendo liberados pelas descobertas da história.");
    } catch {
      setStatus("Não foi possível concluir a cópia. Confira a conexão e o espaço disponível e tente novamente. Seu progresso continua salvo.");
    } finally { setBusy(false); }
  }

  async function remove() {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration(scope);
      await registration?.unregister();
      const prefix = `myu-offline-${scope.slice(0, -1) || "root"}-`;
      await Promise.all((await caches.keys()).filter(name => name.startsWith(prefix)).map(name => caches.delete(name)));
      setReady(false);
      setStatus("Cópia offline removida. Seu progresso e suas anotações foram mantidos.");
    } catch { setStatus("O navegador não permitiu remover a cópia. Tente novamente."); }
    finally { setBusy(false); }
  }

  return <section className="offline-reading" aria-labelledby="offline-title">
    <span>03 / SEM INTERNET</span><h2 id="offline-title">Guardar a leitura neste aparelho</h2>
    <p>Baixe os cinco capítulos com imagens, documentos e o encerramento{size ? ` (${size})` : ""}. Depois, abra este mesmo endereço no mesmo navegador.</p>
    <p>Se você limpar os dados do site, a cópia também será removida. Guarde seu progresso em um arquivo para poder recuperá-lo.</p>
    {supported ? <div className="offline-actions"><button type="button" disabled={busy} onClick={() => void save()}>{busy ? "Aguarde…" : ready ? "Atualizar cópia offline" : "Salvar para ler offline"}</button>
      {ready && <button type="button" disabled={busy} onClick={() => void remove()}>Remover cópia offline</button>}</div>
      : <p>Este navegador não disponibilizou a leitura offline. Você pode continuar lendo com conexão.</p>}
    <p role="status">{status}</p>
  </section>;
}
