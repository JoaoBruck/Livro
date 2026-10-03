import type { Metadata } from "next";
import chapter from "../chapter5.json";
import ChapterFiveReader from "./reader";

export const metadata: Metadata = {
  title: "Myu — Capítulo 5",
  description: "O capítulo final de Myu. Uma noite em Candeia. Uma história de Zero.",
};

export default function ChapterFive() {
  return <ChapterFiveReader chapter={chapter} />;
}
