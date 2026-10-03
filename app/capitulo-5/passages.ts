import type { StoryToken } from "../investigation-flow";

type Atmosphere = "paper" | "closed" | "fire" | "smoke" | "loss";
type Passage = { atmosphere: Atmosphere; tokens: StoryToken[] };

// Boundaries stay attached to narrative anchors, not word counts or scroll time.
const boundaries: Readonly<Record<string, Atmosphere>> = {
  "c5-r5-s6-t1": "closed",
  "c5-r3-s5-t31": "fire",
  "c5-r3-s5-t46": "smoke",
  "c5-r3-s7-t21": "loss",
};

export function chapterFivePassages(tokens: readonly StoryToken[]): Passage[] {
  const passages: Passage[] = [];
  let atmosphere: Atmosphere = "paper";
  for (const token of tokens) {
    const boundary = token.anchorId && boundaries[token.anchorId];
    if (boundary) atmosphere = boundary;
    let passage = passages[passages.length - 1];
    if (!passage || passage.atmosphere !== atmosphere) {
      passage = { atmosphere, tokens: [] };
      passages.push(passage);
    }
    passage.tokens.push(token);
  }
  return passages;
}
