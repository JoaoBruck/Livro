"use client";

import { sitePath } from "../site-path";

import { useEffect, useRef } from "react";
import { getOtherSideDestination } from "./access";

/**
 * Mount ONLY at the future, approved discovery point, after validation.
 * No existing chapter/ARG imports this component while that point is pending.
 * Navigation uses the same tab, so it does not rely on a pop-up permission.
 */
export function OtherSidePassage({ discovered }: { discovered: boolean }) {
  const destination = getOtherSideDestination(discovered);
  const leaving = useRef(false);

  useEffect(() => {
    if (!destination || leaving.current) return;
    leaving.current = true;
    // The existing reading hook saves the position on pagehide.
    // assign preserves browser Back and avoids changing any chapter/save keys.
    window.location.assign(sitePath(destination));
  }, [destination]);

  // A normal link remains available if automatic navigation is interrupted.
  if (!destination) return null;
  return <a href={sitePath(destination)}>Continuar</a>;
}
