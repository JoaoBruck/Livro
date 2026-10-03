"use client";

import { useEffect, useId, useState } from "react";
import { EVIDENCE, EVIDENCE_ORDER, type EvidenceId } from "./chapter3-evidence";
import { availableFragments, compareFragments, COMPARISONS, NOTEBOOK_KEY, readNotebook, type Notebook } from "./notebook-data";

export function EvidenceNotebook({ discovered, identified }: { discovered: EvidenceId[]; identified: EvidenceId[] }) {
  const [notebook, setNotebook] = useState<Notebook>(readNotebook(null));
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(true);
  const [documents, setDocuments] = useState<[string, string]>(["", ""]);
  const [selected, setSelected] = useState<[string, string]>(["", ""]);
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState<ReturnType<typeof compareFragments>>();
  const prefix = useId();
  const fragments = availableFragments(discovered, identified);
  const eligible = EVIDENCE_ORDER.filter(id => fragments.some(f => f.document === id));
  const recorded = COMPARISONS.filter(c => notebook.comparisons.includes(c.id) &&
    c.fragments.every(id => fragments.some(f => f.id === id)));

  useEffect(() => {
    try { setNotebook(readNotebook(window.localStorage.getItem(NOTEBOOK_KEY))); } catch { setSaved(false); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(NOTEBOOK_KEY, JSON.stringify(notebook)); setSaved(true); } catch { setSaved(false); }
  }, [ready, notebook]);

  function compare() {
    if (!selected.every(id => fragments.some(f => f.id === id))) return;
    const match = compareFragments(...selected);
    setResult(match);
    if (!match) {
      setFeedback("Esses trechos, sozinhos, não sustentam uma ligação nova. Você pode guardar a hipótese abaixo e voltar a ela com outro registro.");
      return;
    }
    setFeedback(match.observation);
    setNotebook(current => ({ ...current, comparisons: [...new Set([...current.comparisons, match.id])] }));
  }

  return <section className="evidence-notebook" aria-labelledby={`${prefix}-title`}>
    <header><span>ENTRE AS FOLHAS</span><h3 id={`${prefix}-title`}>Comparar e anotar</h3>
      <p>Escolha dois registros já examinados e marque um trecho de cada um. Esta consulta é opcional.</p></header>
    {eligible.length < 2 ? <p>As folhas ficam disponíveis aqui depois que você conclui o exame de cada uma.</p> : <>
      <div className="notebook-comparison">
        {([0, 1] as const).map(slot => <fieldset key={slot}>
          <legend>Registro {slot + 1}</legend>
          <label htmlFor={`${prefix}-document-${slot}`}>Documento</label>
          <select id={`${prefix}-document-${slot}`} value={documents[slot]} onChange={event => {
            setDocuments(current => slot === 0 ? [event.target.value, current[1]] : [current[0], event.target.value]);
            setSelected(current => slot === 0 ? ["", current[1]] : [current[0], ""]);
            setFeedback(""); setResult(undefined);
          }}>
            <option value="">Escolher uma folha</option>
            {eligible.filter(id => id !== documents[1 - slot]).map(id => <option value={id} key={id}>{id} · {EVIDENCE[id].shortTitle}</option>)}
          </select>
          <div className="notebook-fragments">{fragments.filter(f => f.document === documents[slot]).map(f =>
            <label key={f.id} className={selected[slot] === f.id ? "is-selected" : ""}>
              <input type="radio" name={`${prefix}-fragment-${slot}`} value={f.id} checked={selected[slot] === f.id}
                onChange={() => { setSelected(current => slot === 0 ? [f.id, current[1]] : [current[0], f.id]); setFeedback(""); setResult(undefined); }} />
              <span><small>{f.side}</small>{f.text}</span>
            </label>)}</div>
        </fieldset>)}
      </div>
      <button type="button" className="notebook-compare" disabled={!ready || selected.some(id => !fragments.some(f => f.id === id))} onClick={compare}>Ler os trechos juntos</button>
      <div className="notebook-feedback" role="status">{feedback && <p>{feedback}</p>}
        {result && <blockquote><cite>{result.speaker === "LEROY" ? "Leroy" : "Derick"}</cite><p>— {result.dialogue}</p></blockquote>}</div>
    </>}
    {recorded.length > 0 && <details className="notebook-recorded"><summary>Ligações anotadas · {recorded.length}</summary>
      <ul>{recorded.map(c => <li key={c.id}><strong>{c.title}</strong><p>{c.observation}</p></li>)}</ul>
    </details>}
    <label className="notebook-note" htmlFor={`${prefix}-note`}>Minhas hipóteses</label>
    <p id={`${prefix}-help`}>Uma dúvida, uma explicação possível, algo para conferir depois. Só você escreve aqui.</p>
    <textarea id={`${prefix}-note`} aria-describedby={`${prefix}-help ${prefix}-saved`} maxLength={4000} rows={5} disabled={!ready}
      value={notebook.note} placeholder="O que ainda não fecha?"
      onChange={event => setNotebook(current => ({ ...current, note: event.target.value }))} />
    <p id={`${prefix}-saved`} className="notebook-save" role="status">{!ready ? "Abrindo anotações…" : saved ? "Suas anotações ficam salvas neste navegador e entram na cópia do progresso." : "O navegador não permitiu salvar. Copie suas anotações antes de sair."}</p>
  </section>;
}
