"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_PREFERENCES, findReadingAnchor, normalizePreferences, normalizeTheme, PREFERENCES_KEY, THEME_KEY,
  type ReadingPreferences, type ReadingTheme,
} from "./reading-preferences";

const THEMES = [
  { id: "claro", label: "Papel" }, { id: "escuro", label: "Carvão" },
  { id: "branco", label: "Branco" }, { id: "preto", label: "Preto" },
] as const;

function applyAppearance(preferences: ReadingPreferences, theme: ReadingTheme) {
  const root = document.documentElement;
  const line = window.innerHeight * 0.3;
  const anchors = [...document.querySelectorAll<HTMLElement>("[data-reading-anchor]")];
  const anchor = findReadingAnchor(anchors, line, element => element.getBoundingClientRect().top);
  const top = anchor?.getBoundingClientRect().top;
  const inView = anchor && anchor.getBoundingClientRect().bottom > 0;
  root.dataset.readingTheme = theme;
  root.dataset.readingFont = preferences.font;
  root.dataset.readingFocus = String(preferences.focus);
  root.style.setProperty("--reader-size", `${preferences.size / 16}rem`);
  root.style.setProperty("--reader-leading", preferences.spacing === "amplo" ? "1.95" : "1.72");
  root.style.setProperty("--reader-width", preferences.width === "estreita" ? "34rem" : "42.5rem");
  if (inView && top !== undefined) {
    const behavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollBy({ top: anchor.getBoundingClientRect().top - top, behavior: "instant" });
    root.style.scrollBehavior = behavior;
  }
  window.dispatchEvent(new Event("myu:reading-settings"));
  window.dispatchEvent(new CustomEvent("myu:reading-theme", { detail: theme }));
}

export function ReadingThemeControl() {
  const [theme, setTheme] = useState<ReadingTheme>("claro");
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setTheme(normalizeTheme(window.localStorage.getItem(THEME_KEY)));
        setPreferences(normalizePreferences(JSON.parse(window.localStorage.getItem(PREFERENCES_KEY) || "{}")));
      } catch { setSaved(false); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function close() { setOpen(false); trigger.current?.focus(); }

  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    };
    const outside = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", escape);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);

  function update(next: ReadingPreferences, nextTheme = theme) {
    setPreferences(next);
    setTheme(nextTheme);
    applyAppearance(next, nextTheme);
    try {
      window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
      window.localStorage.setItem(THEME_KEY, nextTheme);
      setSaved(true);
    } catch { setSaved(false); }
  }

  return (
    <div className={`reading-theme-control ${open ? "is-open" : ""}`} ref={panelRef}
      onBlur={(event) => {
        // A pointer on a label can briefly leave focus on the document before
        // activating its radio. Outside pointers are handled separately.
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}>
      <button className="reading-theme-toggle" type="button" ref={trigger}
        aria-expanded={open} aria-controls="reading-theme-panel" aria-label="Ajustar leitura"
        onClick={() => setOpen(!open)}>
        <span aria-hidden="true">Aa</span><strong>LEITURA</strong>
      </button>
      <div className="reading-theme-panel" id="reading-theme-panel" hidden={!open} aria-label="Ajustes de leitura" role="region">
        <header><div><span>NO SEU RITMO</span><strong>Ajustar leitura</strong></div>
          <button type="button" ref={closeButton} onClick={close} aria-label="Fechar ajustes de leitura">×</button>
        </header>
        <fieldset className="reader-themes"><legend>Cor da página</legend>
          <div>{THEMES.map((option) => <label className={`reader-swatch swatch-${option.id}`} key={option.id}>
            <input type="radio" name="reading-theme" value={option.id} checked={theme === option.id}
              onChange={() => update(preferences, option.id)} />
            <span aria-hidden="true">Aa</span><b>{option.label}</b>
          </label>)}</div>
        </fieldset>
        <div className="reader-size-control"><span id="reader-size-label">Tamanho do texto</span>
          <div role="group" aria-labelledby="reader-size-label">
            <button type="button" disabled={preferences.size <= 18} aria-label="Diminuir texto"
              onClick={() => update({ ...preferences, size: preferences.size - 2 })}>A−</button>
            <output aria-live="polite">{Math.round(preferences.size / 20 * 100)}%</output>
            <button type="button" disabled={preferences.size >= 28} aria-label="Aumentar texto"
              onClick={() => update({ ...preferences, size: preferences.size + 2 })}>A+</button>
          </div>
        </div>
        <fieldset className="reader-options"><legend>Tipo de letra</legend><div>
          <label><input type="radio" name="reading-font" checked={preferences.font === "serif"} onChange={() => update({ ...preferences, font: "serif" })} /><span>Literária</span></label>
          <label><input type="radio" name="reading-font" checked={preferences.font === "sans"} onChange={() => update({ ...preferences, font: "sans" })} /><span>Simples</span></label>
        </div></fieldset>
        <fieldset className="reader-options"><legend>Entrelinhas</legend><div>
          <label><input type="radio" name="reading-spacing" checked={preferences.spacing === "normal"} onChange={() => update({ ...preferences, spacing: "normal" })} /><span>Normal</span></label>
          <label><input type="radio" name="reading-spacing" checked={preferences.spacing === "amplo"} onChange={() => update({ ...preferences, spacing: "amplo" })} /><span>Ampla</span></label>
        </div></fieldset>
        <fieldset className="reader-options"><legend>Largura da coluna</legend><div>
          <label><input type="radio" name="reading-width" checked={preferences.width === "normal"} onChange={() => update({ ...preferences, width: "normal" })} /><span>Normal</span></label>
          <label><input type="radio" name="reading-width" checked={preferences.width === "estreita"} onChange={() => update({ ...preferences, width: "estreita" })} /><span>Estreita</span></label>
        </div></fieldset>
        <label className="reader-focus"><input type="checkbox" checked={preferences.focus} onChange={(event) => update({ ...preferences, focus: event.target.checked })} />
          <span><strong>Página discreta</strong><small>Menos ornamentos ao redor do texto.</small></span></label>
        <button type="button" className="reader-reset" onClick={() => update(DEFAULT_PREFERENCES, "claro")}>Restaurar aparência original</button>
        <p role="status">{saved ? "Suas escolhas ficam salvas neste dispositivo." : "Ajustes aplicados. Este navegador não permitiu salvá-los."}</p>
      </div>
    </div>
  );
}
