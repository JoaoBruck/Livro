export default function Loading() {
  return <main className="chapter-loading chapter-two-shell" role="status" aria-live="polite" aria-busy="true">
    <div className="chapter-loading-card"><span className="loading-wordmark">MYU</span>
      <span className="loading-rule" aria-hidden="true" />
      <p>Abrindo a próxima página…</p>
    </div>
  </main>;
}
