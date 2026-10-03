import type { EvidenceId } from "./chapter3-evidence";

export type StoryToken = {
  kind: "paragraph" | "dialogue" | "message" | "document" | "break";
  text: string; anchorId?: string; speaker?: string; documentId?: string;
  mode?: "collect" | "challenge";
};

export function splitIntoScenes(tokens: readonly StoryToken[]) {
  const scenes: StoryToken[][] = [[]];
  for (const token of tokens) {
    if (token.kind === "break") {
      if (scenes.at(-1)?.length) scenes.push([]);
    } else scenes.at(-1)?.push(token);
  }
  return scenes.filter((scene) => scene.length > 0);
}

export function gateScenes(scenes: StoryToken[][], identified: readonly EvidenceId[]) {
  const visible: Array<{ scene: StoryToken[]; sceneIndex: number; gateId?: EvidenceId }> = [];
  for (const [sceneIndex, scene] of scenes.entries()) {
    const stop = scene.findIndex((token) => token.kind === "document" && token.mode !== "collect" && !identified.includes(token.documentId as EvidenceId));
    visible.push({ scene: stop < 0 ? scene : scene.slice(0, stop + 1), sceneIndex,
      gateId: stop < 0 ? undefined : scene[stop].documentId as EvidenceId });
    if (stop >= 0) break;
  }
  return visible;
}

export function deriveRelations(discovered: readonly EvidenceId[], identified: readonly EvidenceId[], previous: readonly string[] = []) {
  const relations = new Set(previous);
  if (identified.includes("D-01") && discovered.includes("T-01")) relations.add("same-occurrence");
  if (identified.includes("B-12")) relations.add("time-gap");
  if (identified.includes("T-02") && identified.includes("T-03")) relations.add("passenger-trace");
  return [...relations];
}
