"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "@/components/icons";
import { useTour } from "@/lib/client/tour/TourProvider";
import type { TourPlacement } from "@/lib/client/tour/steps";

const PAD = 8; // breathing room around the spotlit element
const GAP = 14; // distance from the element to the tooltip
const MARGIN = 12; // minimum distance from any viewport edge
const CARD_W = 320;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function readRect(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  return {
    top: r.top - PAD,
    left: r.left - PAD,
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
  };
}

/**
 * Places the card beside the spotlight, flipping to the opposite side when
 * there isn't room and clamping so it never leaves the viewport. Falls back
 * to dead centre for steps with no anchor.
 */
function placeCard(
  rect: Rect | null,
  preferred: TourPlacement,
  cardHeight: number,
  vw: number,
  vh: number,
): { top: number; left: number } {
  const width = Math.min(CARD_W, vw - MARGIN * 2);

  if (!rect) {
    return { top: Math.max(MARGIN, (vh - cardHeight) / 2), left: (vw - width) / 2 };
  }

  const fits = {
    bottom: rect.top + rect.height + GAP + cardHeight <= vh - MARGIN,
    top: rect.top - GAP - cardHeight >= MARGIN,
    right: rect.left + rect.width + GAP + width <= vw - MARGIN,
    left: rect.left - GAP - width >= MARGIN,
  };

  // Try the requested side, then its opposite, then anything that fits.
  const opposite: Record<TourPlacement, TourPlacement> = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
  };
  const order: TourPlacement[] = [
    preferred,
    opposite[preferred],
    "bottom",
    "top",
    "right",
    "left",
  ];
  const placement = order.find((p) => fits[p]) ?? "bottom";

  let top: number;
  let left: number;

  if (placement === "bottom" || placement === "top") {
    top = placement === "bottom" ? rect.top + rect.height + GAP : rect.top - GAP - cardHeight;
    left = rect.left + rect.width / 2 - width / 2;
  } else {
    left = placement === "right" ? rect.left + rect.width + GAP : rect.left - GAP - width;
    top = rect.top + rect.height / 2 - cardHeight / 2;
  }

  return {
    top: Math.min(Math.max(MARGIN, top), Math.max(MARGIN, vh - cardHeight - MARGIN)),
    left: Math.min(Math.max(MARGIN, left), Math.max(MARGIN, vw - width - MARGIN)),
  };
}

export default function TourOverlay() {
  const { step, index, total, anchorEl, settling, next, back, skip } = useTour();
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const [cardHeight, setCardHeight] = useState(180);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Track the anchor through scrolling and resizing so the spotlight follows it.
  useEffect(() => {
    if (!step) return;

    function measure() {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
      setRect(anchorEl ? readRect(anchorEl) : null);
    }

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [step, anchorEl]);

  useLayoutEffect(() => {
    if (cardRef.current) setCardHeight(cardRef.current.offsetHeight);
  }, [step, viewport.w]);

  // Escape leaves the tour; arrows move through it.
  useEffect(() => {
    if (!step) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") skip();
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      if (e.key === "ArrowLeft") back();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [step, skip, next, back]);

  // The tour drives navigation itself, so freeze background scrolling while
  // it runs — otherwise the page can drift out from under the spotlight.
  useEffect(() => {
    if (!step) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [step]);

  if (!mounted || !step) return null;

  const width = Math.min(CARD_W, viewport.w - MARGIN * 2);
  const { top, left } = placeCard(
    rect,
    step.placement ?? "bottom",
    cardHeight,
    viewport.w,
    viewport.h,
  );
  const duration = reducedMotion ? 0 : 0.25;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="tour"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration }}
        // z-[60] clears the app's own modals and dropdowns, which sit at z-50.
        className="fixed inset-0 z-[60]"
        aria-live="polite"
      >
        {/* Spotlight. A huge spread shadow dims everything except the cutout,
            which avoids compositing four separate panels around the target. */}
        {rect ? (
          <motion.div
            initial={false}
            animate={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
            transition={{ duration, ease: [0.4, 0, 0.2, 1] }}
            className="pointer-events-none absolute rounded-2xl"
            style={{ boxShadow: "0 0 0 9999px rgba(11, 16, 35, 0.62)" }}
          />
        ) : (
          <div className="absolute inset-0 bg-ink/60" />
        )}

        {/* Swallows clicks so the app can't change under the tour. */}
        <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />

        <motion.div
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-label={step.title}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: settling ? 0 : 1, scale: 1, top, left }}
          transition={{ duration, ease: [0.4, 0, 0.2, 1] }}
          style={{ width }}
          className="absolute rounded-panel border border-line bg-white p-5 shadow-glass"
        >
          <button
            type="button"
            onClick={skip}
            aria-label="Skip the tour"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-btn text-body transition-colors hover:bg-black/5 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>

          <p className="text-stat-label font-semibold uppercase tracking-wide text-brand-accent">
            Step {index + 1} of {total}
          </p>
          <h2 className="mt-1.5 pr-6 text-card-title font-bold text-ink">{step.title}</h2>
          <p className="mt-2 text-small leading-relaxed text-body">{step.body}</p>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {Array.from({ length: total }, (_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-pill transition-all ${
                    i === index ? "w-4 bg-brand" : "w-1.5 bg-line"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {index > 0 && (
                <button
                  type="button"
                  onClick={back}
                  className="inline-flex h-9 items-center justify-center rounded-btn px-3 text-small font-medium text-body transition-colors hover:bg-subtle hover:text-ink"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={next}
                autoFocus
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-btn bg-brand px-4 text-small font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px"
              >
                {index === total - 1 ? "Finish" : "Next"}
                {index < total - 1 && <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {index === 0 && (
            <button
              type="button"
              onClick={skip}
              className="mt-3 text-stat-label font-medium text-body transition-colors hover:text-ink"
            >
              Skip the tour
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
