export const PREFERENCES_KEY = "myu-reading-preferences-v1";
export const THEME_KEY = "myu-reading-theme-v1";
export const THEMES = ["claro", "escuro", "branco", "preto"] as const;
export type ReadingTheme = typeof THEMES[number];
export type ReadingPreferences = {
  size: number;
  font: "serif" | "sans";
  spacing: "normal" | "amplo";
  width: "normal" | "estreita";
  focus: boolean;
};
export const DEFAULT_PREFERENCES: ReadingPreferences = {
  size: 20, font: "serif", spacing: "normal", width: "normal", focus: false,
};

export function normalizePreferences(value: unknown): ReadingPreferences {
  const data = value && typeof value === "object" ? value as Partial<ReadingPreferences> : {};
  return {
    size: [18, 20, 22, 24, 26, 28].includes(data.size ?? 0) ? data.size! : 20,
    font: data.font === "sans" ? "sans" : "serif",
    spacing: data.spacing === "amplo" ? "amplo" : "normal",
    width: data.width === "estreita" ? "estreita" : "normal",
    focus: data.focus === true,
  };
}

export function normalizeTheme(value: unknown): ReadingTheme {
  return THEMES.includes(value as ReadingTheme) ? value as ReadingTheme : "claro";
}

// Runs before the first paint; invalid or unavailable storage leaves a readable page.
export const READING_BOOTSTRAP = `(function(){
  var root=document.documentElement,p={},t='claro';
  try{t=localStorage.getItem('${THEME_KEY}');p=JSON.parse(localStorage.getItem('${PREFERENCES_KEY}')||'{}')||{}}catch(e){}
  root.dataset.readingTheme=/^(claro|escuro|branco|preto)$/.test(t||'')?t:'claro';
  root.style.setProperty('--reader-size',([18,20,22,24,26,28].indexOf(p.size)>=0?p.size:20)/16+'rem');
  root.style.setProperty('--reader-leading',p.spacing==='amplo'?'1.95':'1.72');
  root.style.setProperty('--reader-width',p.width==='estreita'?'34rem':'42.5rem');
  root.dataset.readingFont=p.font==='sans'?'sans':'serif';
  root.dataset.readingFocus=p.focus===true?'true':'false';
})();`;

export function chapterStats(tokens: readonly { kind: string; text: string }[]) {
  const words = tokens.reduce((sum, token) => {
    if (token.kind === "break" || token.kind === "document") return sum;
    return sum + (token.text.match(/[\p{L}\p{N}_]+(?:[-'][\p{L}\p{N}_]+)*/gu)?.length ?? 0);
  }, 0);
  return { words, minutes: Math.max(1, Math.ceil(words / 200)), label: words.toLocaleString("pt-BR") };
}

export function chapterAccess(current: number, read: (key: string) => string | null): number[] {
  const accessible = new Set([1, current]);
  if (current >= 2) accessible.add(2);
  if (current >= 3) accessible.add(3);
  if (current >= 4) accessible.add(4);
  try {
    if (read("myu-capitulo-5") === "unlocked" || read("myu-capitulo-4-complete") === "true") {
      [2, 3, 4, 5].forEach(number => accessible.add(number));
    }
    if (read("myu-capitulo-4") === "unlocked") { accessible.add(2); accessible.add(3); accessible.add(4); }
    if (read("myu-capitulo-2") === "unlocked") accessible.add(2);
    if (read("myu-capitulo-3") === "unlocked" || read("myu-arg-a07") === "recovered") {
      accessible.add(2);
      accessible.add(3);
    }
  } catch { /* Current and earlier chapters remain available without storage. */ }
  return [...accessible].sort();
}

// Anchors follow the vertical reading order. Read only logarithmically many bounds.
export function findReadingAnchor<T>(anchors: readonly T[], line: number, top: (anchor: T) => number): T | undefined {
  let low = 0, high = anchors.length - 1;
  while (low <= high) {
    const middle = (low + high) >>> 1;
    if (top(anchors[middle]) <= line) low = middle + 1;
    else high = middle - 1;
  }
  return anchors[high];
}
