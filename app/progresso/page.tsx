"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sitePath } from "../site-path";
import { OfflineReading } from "../offline-reading";
import { createBackup, parseBackup, restoreBackup, backupSummary, MAX_BACKUP_BYTES, type ProgressBackup } from "../progress-backup";

function download(backup: ProgressBackup) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `myu-progresso-${backup.savedAt.slice(0, 10)}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ProgressPage() {
  const [pending, setPending] = useState<ProgressBackup>();
  const [status, setStatus] = useState("");
  const [returnRoute, setReturnRoute] = useState("/");
  const [backedUp, setBackedUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  useEffect(() => {
    try { setReturnRoute(backupSummary(createBackup(window.localStorage)).route); } catch { /* First visit. */ }
  }, []);

  function exportProgress() {
    try {
      download(createBackup(window.localStorage));
      setBackedUp(true);
      setStatus("Cópia preparada. Guarde o arquivo para continuar em outro navegador ou dispositivo.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Não foi possível criar a cópia."); }
  }

  async function readFile(file?: File) {
    setPending(undefined);
    if (!file) return;
    try {
      if (file.size > MAX_BACKUP_BYTES) throw Error("Este arquivo é grande demais para uma cópia de progresso.");
      const backup = parseBackup(await file.text());
      setPending(backup);
      setStatus("Cópia lida. Confira os dados antes de importar.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Não foi possível ler esta cópia."); }
  }

  function importProgress() {
    if (!pending || restoring) return;
    setRestoring(true);
    try {
      // Offer a recoverable copy before replacing existing state.
      let existing: ProgressBackup | undefined;
      try { existing = createBackup(window.localStorage); } catch { /* Empty/invalid existing save. */ }
      if (existing && !backedUp) {
        setStatus("Baixe uma cópia do progresso atual antes de substituí-lo.");
        setRestoring(false);
        return;
      }
      restoreBackup(window.localStorage, pending);
      const destination = backupSummary(pending).route;
      window.location.assign(sitePath(`${destination}${destination === "/" ? "" : "/"}?retomar=1`));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível importar a cópia.");
      setRestoring(false);
    }
  }

  return <main className="progress-page">
    <Link className="wordmark" href="/" aria-label="Início de Myu">MYU</Link>
    <header><span>SEU LUGAR NA HISTÓRIA</span><h1>Leve a leitura com você.</h1>
      <p>Guarde os capítulos liberados, as descobertas, suas anotações e os ajustes de leitura em um arquivo.</p></header>
    <section aria-labelledby="export-title"><span>01 / GUARDAR</span><h2 id="export-title">Criar uma cópia</h2>
      <p>O progresso fica neste navegador. Uma cópia permite recuperá-lo se você trocar de aparelho ou limpar os dados.</p>
      <button type="button" onClick={exportProgress}>Baixar meu progresso</button></section>
    <section aria-labelledby="import-title"><span>02 / CONTINUAR</span><h2 id="import-title">Abrir uma cópia</h2>
      <p>Escolha o arquivo que você salvou. Ele será lido aqui, sem ser enviado a um servidor.</p>
      <label className="backup-file">Arquivo de progresso <input type="file" accept=".json,application/json"
        disabled={restoring} onChange={event => { void readFile(event.target.files?.[0]); event.target.value = ""; }} /></label>
      {pending && <div className="backup-preview">
        <strong>Capítulo {backupSummary(pending).chapter} · {backupSummary(pending).progress}% da leitura</strong>
        <p>Cópia de {new Date(pending.savedAt).toLocaleString("pt-BR")}. Ao importar, o progresso deste navegador será substituído pelo arquivo.</p>
        <div><button type="button" disabled={restoring} onClick={importProgress}>Importar e continuar</button>
          <button type="button" disabled={restoring} onClick={() => { setPending(undefined); setStatus(""); }}>Cancelar</button></div>
      </div>}
    </section>
    <p className="backup-status" role="status">{status}</p>
    <OfflineReading />
    <Link className="progress-return" href={`${returnRoute}?retomar=1`}>← Voltar à leitura</Link>
  </main>;
}
