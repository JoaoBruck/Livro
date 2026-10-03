import chapter from "../chapter4.json";
import InvestigationReader from "../investigation-reader";

export default function ChapterFour() {
  return <InvestigationReader number={4} chapter={chapter} />;
}
