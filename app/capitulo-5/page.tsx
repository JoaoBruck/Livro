import type { Metadata } from "next";
import { CHAPTER_COVERS } from "../chapter-covers";
import chapter from "../chapter5.json";
import ChapterFiveReader from "./reader";

export const metadata: Metadata = {
  title: `Myu — ${CHAPTER_COVERS[5].title} · Capítulo 5`,
  description: "A carona. Capítulo 5 de Myu, uma história de Zero.",
};

export default function ChapterFive() {
  return <ChapterFiveReader chapter={chapter} />;
}
