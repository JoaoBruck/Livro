import { CHAPTER_COVERS, type ChapterNumber } from "./chapter-covers";
import { ContinueReading } from "./reading-progress";
import { sitePath } from "./site-path";

export default function ChapterCover({ number }: { number: ChapterNumber }) {
  const cover = CHAPTER_COVERS[number];
  return <section className="chapter-cover" id="inicio" data-cover={number} aria-labelledby="chapter-cover-title">
    <div className="chapter-cover-art">
      {/* Static export: the original composition stays visible without an image service. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={sitePath(cover.image)} alt={cover.alt} width={1024} height={1536} fetchPriority="high" decoding="async" />
    </div>
    <div className="chapter-cover-copy">
      <p className="chapter-cover-author">Uma história de Zero</p>
      <div className="chapter-cover-wordmark" aria-label="Myu">MYU<span aria-hidden="true">.</span></div>
      <div className="chapter-cover-heading">
        <p className="chapter-cover-number">Capítulo <span>{String(number).padStart(2, "0")}</span></p>
        <h1 id="chapter-cover-title">{cover.title}</h1>
      </div>
      <div className="chapter-cover-actions">
        <ContinueReading />
        <a className="chapter-cover-start" href="#leitura">Começar o capítulo <span aria-hidden="true">↓</span></a>
      </div>
    </div>
    <span className="chapter-cover-imprint" aria-hidden="true">MYU · {String(number).padStart(2, "0")}</span>
  </section>;
}
