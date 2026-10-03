"use client";

import { useEffect, type RefObject } from "react";

/** Keep a document's keyboard focus and page position while it is enlarged. */
export function useReaderDialog(root: RefObject<HTMLElement | null>, open: boolean, close: () => void) {
  useEffect(() => {
    const surface = root.current;
    if (!open || !surface) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    const blocked: { element: HTMLElement; inert: boolean }[] = [];
    let branch: HTMLElement = surface;
    while (branch.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch && sibling instanceof HTMLElement) {
          blocked.push({ element: sibling, inert: sibling.inert });
          sibling.inert = true;
        }
      }
      if (branch.parentElement === document.body) break;
      branch = branch.parentElement;
    }
    document.body.style.overflow = "hidden";
    const focusable = () => Array.from(surface.querySelectorAll<HTMLElement>(
      'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    )).filter(element => element.getClientRects().length > 0 && !element.closest("[inert]"));
    const first = surface.querySelector<HTMLElement>("[data-dialog-close]") ?? focusable()[0] ?? surface;
    first.focus({ preventScroll: true });
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close();
      } else if (event.key === "Tab") {
        const controls = focusable();
        const index = controls.indexOf(document.activeElement as HTMLElement);
        if (!controls.length || index < 0 || (event.shiftKey ? index === 0 : index === controls.length - 1)) {
          event.preventDefault();
          (event.shiftKey ? controls.at(-1) ?? surface : controls[0] ?? surface).focus();
        }
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.body.style.overflow = overflow;
      blocked.forEach(({ element, inert }) => { element.inert = inert; });
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [root, open, close]);
}
