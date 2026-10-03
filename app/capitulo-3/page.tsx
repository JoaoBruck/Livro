import chapter from "../chapter3.json";
import InvestigationReader from "../investigation-reader";

export default function ChapterThree() {
  return <InvestigationReader number={3} chapter={chapter} />;
}
