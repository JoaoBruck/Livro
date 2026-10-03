import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Myu",
  description: "",
  robots: { index: false, follow: false, nosnippet: true },
};

export default function OtherSidePage() {
  // The route is reserved, not a playable release. Do not expose a teaser,
  // invented scene or empty Start button. Replace this only once the game and
  // server-validated discovery/access contract have been approved and built.
  notFound();
}
