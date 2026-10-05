import type { Metadata } from "next";
import { CHAPTER_COVERS } from "../chapter-covers";
import chapter from "../chapter4.json";
import InvestigationReader from "../investigation-reader";

export const metadata: Metadata = {
  title: `Myu — ${CHAPTER_COVERS[4].title} · Capítulo 4`,
};

export default function ChapterFour() {
  return <InvestigationReader number={4} chapter={chapter} />;
}
