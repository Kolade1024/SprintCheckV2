"use client";

import { useEffect, useRef } from "react";

/**
 * Background radial glows over white plus a gradient spotlight that follows the
 * cursor — the same treatment used on the auth pages (see AuthShell). Drop it
 * as the first child of a `relative overflow-hidden` container.
 */
export default function CursorGlow() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = spotlightRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let frame = 0;
    function onMove(e: PointerEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el!.style.setProperty("--x", `${e.clientX}px`);
        el!.style.setProperty("--y", `${e.clientY}px`);
        el!.style.opacity = "1";
      });
    }
    function onLeave() {
      el!.style.opacity = "0";
    }

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
      {/* Static radial glows over white — mirrors the hero / auth treatment */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 85% 15%, rgba(166,114,255,0.22) 0%, rgba(166,114,255,0) 60%), radial-gradient(50% 40% at 5% 85%, rgba(75,72,238,0.16) 0%, rgba(75,72,238,0) 60%)",
        }}
      />

      {/* Gradient spotlight that follows the cursor */}
      <div
        ref={spotlightRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 opacity-0 transition-opacity duration-500 ease-smooth motion-reduce:hidden"
        style={{
          background:
            "radial-gradient(360px circle at var(--x, 50%) var(--y, 50%), rgba(118,59,241,0.18) 0%, rgba(75,72,238,0.10) 35%, rgba(118,59,241,0) 70%)",
        }}
      />
    </>
  );
}
