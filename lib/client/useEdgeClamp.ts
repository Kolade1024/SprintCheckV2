"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

/**
 * Keeps a right-anchored dropdown inside the viewport.
 *
 * A fixed-width panel hung off `right-0` grows leftwards from its trigger, so
 * on a narrow screen its left edge can land off-screen — the topbar bell sits
 * close enough to the right edge that a 320px panel starts at a negative x on
 * a phone. This returns how many pixels to push the panel back in, applied as
 * a negative `right` offset so the panel stays absolutely positioned (and so
 * keeps scrolling with its trigger).
 *
 * Returns 0 whenever the panel already fits, which is every desktop case.
 */
export function useEdgeClamp(
  open: boolean,
  triggerRef: RefObject<HTMLElement>,
  panelRef: RefObject<HTMLElement>,
  margin = 12,
): number {
  const [shift, setShift] = useState(0);

  const measure = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;

    // Where the panel's left edge would sit with no correction. offsetWidth is
    // unaffected by the shift, so this can't feed back into itself.
    const left = trigger.getBoundingClientRect().right - panel.offsetWidth;
    setShift(left < margin ? Math.round(margin - left) : 0);
  }, [triggerRef, panelRef, margin]);

  useEffect(() => {
    if (!open) {
      setShift(0);
      return;
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open, measure]);

  return shift;
}
