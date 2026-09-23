export type ChapterNumber = 1 | 2 | 3 | 4;
export type ReadingPosition = {
  chapter: ChapterNumber; route: string; anchor: string;
  offset: number; progress: number; updatedAt: number;
};
export type ReadingStore = {
  version: 1; current?: ReadingPosition;
  chapters: Partial<Record<`${ChapterNumber}`, ReadingPosition>>;
};
export type SplitMap = Record<string, { chapter: number; anchor: string }>;
export type AnchorRedirects = Record<string, string>;
type Storage = Pick<globalThis.Storage, "getItem" | "setItem">;
export const READING_STORAGE_KEY = "myu-reading-progress-v1";
const MIGRATION_KEY = "myu-chapter-split-v1";

export function isReadingPosition(value: unknown): value is ReadingPosition {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<ReadingPosition>;
  return [1, 2, 3, 4].includes(Number(p.chapter)) && typeof p.chapter === "number" &&
    typeof p.route === "string" && typeof p.anchor === "string" &&
    Number.isFinite(p.offset) && Number.isFinite(p.progress) && Number.isFinite(p.updatedAt);
}

/** Resume a shortened passage at its surviving paragraph instead of the chapter opening. */
export function resolveReadingPosition(position: ReadingPosition, redirects: AnchorRedirects): ReadingPosition {
  const anchor = redirects[position.anchor];
  return anchor ? { ...position, anchor, offset: 0 } : position;
}

/** Move only positions from the former combined chapter; preserve all other saves. */
export function migrateChapterStorage(storage: Storage, map: SplitMap) {
  try {
    if (storage.getItem(MIGRATION_KEY) === "1") return;
    let unlockFourth = storage.getItem("myu-capitulo-3-complete") === "true";
    const raw = storage.getItem(READING_STORAGE_KEY);
    if (raw) {
      let value: Partial<ReadingStore> | undefined;
      try { value = JSON.parse(raw); } catch { /* Corrupt data must not prevent access. */ }
      if (value && value.version === 1) {
        const migrate = (p: ReadingPosition): ReadingPosition => {
          if (p.chapter !== 3) return p;
          const target = p.anchor === "c3-complete" || p.anchor === "fim"
            ? { chapter: 4, anchor: "c4-complete" }
            : p.anchor === "c3-convergence" || p.anchor === "mesa-de-evidencias"
              ? { chapter: 4, anchor: "c4-s6-t102" } : map[p.anchor];
          if (!target || (target.chapter !== 3 && target.chapter !== 4)) return p;
          if (target.chapter === 4) unlockFourth = true;
          return { ...p, chapter: target.chapter, route: `/capitulo-${target.chapter}`,
            anchor: target.anchor, offset: 0, progress: target.anchor === "c4-complete" ? 100 : 0 };
        };
        const chapters: ReadingStore["chapters"] = {};
        for (const saved of Object.values(value.chapters ?? {})) {
          if (!isReadingPosition(saved)) continue;
          const next = migrate(saved);
          chapters[`${next.chapter}`] = next;
          if (saved.chapter === 3 && next.chapter === 4) chapters["3"] = {
            ...saved, anchor: "c3-complete", offset: 0, progress: 100,
          };
        }
        const current = isReadingPosition(value.current) ? migrate(value.current) : undefined;
        if (current) chapters[`${current.chapter}`] = current;
        storage.setItem(READING_STORAGE_KEY, JSON.stringify({ version: 1, current, chapters }));
      }
    }
    if (unlockFourth) storage.setItem("myu-capitulo-4", "unlocked");
    storage.setItem(MIGRATION_KEY, "1");
  } catch { /* Storage restrictions must not crash the reader. */ }
}
