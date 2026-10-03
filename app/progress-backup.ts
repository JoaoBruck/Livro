// Explicit allowlist: a backup never includes unrelated data from this origin.
export const PROGRESS_KEYS = [
  "myu-reading-progress-v1", "myu-reading-preferences-v1", "myu-reading-theme-v1",
  "myu-chapter-split-v1", "myu-capitulo-2", "myu-capitulo-3", "myu-capitulo-4", "myu-capitulo-5",
  "myu-capitulo-3-complete", "myu-capitulo-4-complete", "myu-capitulo-5-complete",
  "myu-arg-a07", "myu-arg-a07-progress-v1", "myu-chapter3-investigation-v3",
  "myu-investigation-notebook-v1",
] as const;
export const MAX_BACKUP_BYTES = 256 * 1024;
type ProgressKey = typeof PROGRESS_KEYS[number];
type ProgressStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type ProgressBackup = {
  format: "myu-progresso"; version: 1; savedAt: string;
  entries: Partial<Record<ProgressKey, string>>;
};
const evidenceIds = ["A-01", "D-01", "T-01", "T-02", "T-03", "B-12"];
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const strings = (v: unknown, allowed?: readonly string[]) => Array.isArray(v) && v.length <= 200 &&
  v.every(x => typeof x === "string" && x.length <= 200 && (!allowed || allowed.includes(x)));

function safeJSON(value: unknown, depth = 0): boolean {
  if (depth > 8) return false;
  if (value === null || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") return value.length <= 6000;
  if (Array.isArray(value)) return value.length <= 200 && value.every(v => safeJSON(v, depth + 1));
  return record(value) && Object.entries(value).every(([key, v]) =>
    !["__proto__", "constructor", "prototype"].includes(key) && safeJSON(v, depth + 1));
}

function validPosition(value: unknown) {
  if (!record(value) || ![1, 2, 3, 4, 5].includes(value.chapter as number)) return false;
  return value.route === (value.chapter === 1 ? "/" : `/capitulo-${value.chapter}`) &&
    typeof value.anchor === "string" && /^[a-z\d-]{1,100}$/.test(value.anchor) &&
    finite(value.offset) && Math.abs(value.offset) < 100000 &&
    finite(value.progress) && value.progress >= 0 && value.progress <= 100 && finite(value.updatedAt);
}

function validEntry(key: ProgressKey, raw: string): boolean {
  if (/^myu-capitulo-[2-5]$/.test(key)) return raw === "unlocked";
  if (key.endsWith("-complete")) return raw === "true";
  if (key === "myu-arg-a07") return raw === "recovered";
  if (key === "myu-chapter-split-v1") return raw === "1";
  if (key === "myu-reading-theme-v1") return ["claro", "escuro", "branco", "preto"].includes(raw);
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return false; }
  if (!record(value) || !safeJSON(value)) return false;
  if (key === "myu-reading-progress-v1") return value.version === 1 &&
    (value.current === undefined || validPosition(value.current)) && record(value.chapters) &&
    Object.entries(value.chapters).every(([chapter, p]) => validPosition(p) && record(p) && String(p.chapter) === chapter);
  if (key === "myu-reading-preferences-v1") return [18, 20, 22, 24, 26, 28].includes(value.size as number) &&
    ["serif", "sans"].includes(value.font as string) && ["normal", "amplo"].includes(value.spacing as string) &&
    ["normal", "estreita"].includes(value.width as string) && typeof value.focus === "boolean";
  if (key === "myu-arg-a07-progress-v1") return strings(value.found, ["leroy", "derick", "domingo", "noite"]) &&
    record(value.light) && finite(value.light.x) && finite(value.light.y) && finite(value.angle) && finite(value.contrast);
  if (key === "myu-investigation-notebook-v1") return value.version === 1 &&
    typeof value.note === "string" && value.note.length <= 4000 && strings(value.comparisons, ["same-occurrence", "time-gap", "passenger-trace", "yellow-material", "occupancy-conflict"]);
  if (key === "myu-chapter3-investigation-v3") return value.version === 3 &&
    ["discovered", "activated", "examined", "identified"].every(k => value[k] === undefined || strings(value[k], evidenceIds)) &&
    (value.relations === undefined || strings(value.relations, ["same-occurrence", "time-gap", "passenger-trace", "yellow-material"])) &&
    (value.puzzleData === undefined || (record(value.puzzleData) && Object.entries(value.puzzleData).every(([id, items]) => evidenceIds.includes(id) && strings(items)))) &&
    (value.sides === undefined || (record(value.sides) && Object.entries(value.sides).every(([id, sides]) => evidenceIds.includes(id) && strings(sides, ["front", "back"])))) &&
    (value.hintLevels === undefined || (record(value.hintLevels) && Object.values(value.hintLevels).every(v => finite(v) && v >= 0 && v <= 20))) &&
    (value.looseDocuments === undefined || (record(value.looseDocuments) && Object.entries(value.looseDocuments).every(([id, p]) => evidenceIds.includes(id) && record(p) && [p.x, p.y, p.rotation, p.z].every(finite) && ["front", "back"].includes(p.side as string))));
  return false;
}

export function parseBackup(raw: string): ProgressBackup {
  if (new TextEncoder().encode(raw).length > MAX_BACKUP_BYTES) throw Error("Este arquivo é grande demais para uma cópia de progresso.");
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw Error("Não foi possível ler o arquivo. Escolha uma cópia de progresso do Myu."); }
  if (!record(value) || value.format !== "myu-progresso" || value.version !== 1 ||
      typeof value.savedAt !== "string" || !Number.isFinite(Date.parse(value.savedAt)) || !record(value.entries) ||
      !Object.keys(value.entries).length) throw Error("Este arquivo não é uma cópia de progresso compatível.");
  for (const [key, entry] of Object.entries(value.entries)) {
    if (!PROGRESS_KEYS.includes(key as ProgressKey) || typeof entry !== "string" || !validEntry(key as ProgressKey, entry))
      throw Error("A cópia contém dados inválidos. Seu progresso atual foi mantido.");
  }
  return value as ProgressBackup;
}

export function createBackup(storage: Pick<Storage, "getItem">, now = new Date()): ProgressBackup {
  const entries: ProgressBackup["entries"] = {};
  for (const key of PROGRESS_KEYS) {
    const value = storage.getItem(key);
    if (value !== null) entries[key] = value;
  }
  if (!Object.keys(entries).length) throw Error("Ainda não há progresso salvo neste navegador.");
  return parseBackup(JSON.stringify({ format: "myu-progresso", version: 1, savedAt: now.toISOString(), entries }));
}

/** Validate before writing; roll back the entire allowlist on quota/storage errors. */
export function restoreBackup(storage: ProgressStorage, backup: ProgressBackup) {
  const checked = parseBackup(JSON.stringify(backup));
  const previous = PROGRESS_KEYS.map(key => [key, storage.getItem(key)] as const);
  try {
    for (const key of PROGRESS_KEYS) storage.removeItem(key);
    for (const [key, value] of Object.entries(checked.entries)) storage.setItem(key, value);
  } catch {
    try {
      for (const key of PROGRESS_KEYS) storage.removeItem(key);
      for (const [key, value] of previous) if (value !== null) storage.setItem(key, value);
    } catch { throw Error("O navegador bloqueou o armazenamento. Guarde a cópia baixada e tente importá-la em outro navegador."); }
    throw Error("Não foi possível salvar a cópia neste navegador. O progresso anterior foi restaurado.");
  }
}

export function backupSummary(backup: ProgressBackup) {
  const current = JSON.parse(backup.entries["myu-reading-progress-v1"] || "{}").current;
  let chapter = 1;
  for (let n = 2; n <= 5; n++) if (backup.entries[`myu-capitulo-${n}` as ProgressKey] === "unlocked") chapter = n;
  if (backup.entries["myu-arg-a07"] === "recovered") chapter = Math.max(chapter, 3);
  if (backup.entries["myu-capitulo-4-complete"] === "true") chapter = 5;
  if (current) chapter = Math.min(chapter, current.chapter);
  return { chapter, route: chapter === 1 ? "/" : `/capitulo-${chapter}`, progress: current?.chapter === chapter ? Math.round(current.progress) : 0 };
}
