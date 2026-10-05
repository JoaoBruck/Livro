import type { Metadata } from "next";
import { CHAPTER_COVERS } from "../chapter-covers";
import chapter from "../chapter3.json";
import InvestigationReader from "../investigation-reader";

export const metadata: Metadata = {
  title: `Myu — ${CHAPTER_COVERS[3].title} · Capítulo 3`,
};

export default function ChapterThree() {
  return <InvestigationReader number={3} chapter={chapter} />;
}
