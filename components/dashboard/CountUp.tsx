"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";

/**
 * Animates a number from 0 to `value` once it scrolls into view.
 * Writes straight to the DOM node so the count-up doesn't re-render React.
 */
export default function CountUp({
  value,
  duration = 1.2,
  format = (v) => Math.round(v).toLocaleString("en-US"),
  className,
}: {
  value: number;
  duration?: number;
  format?: (v: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView) return;
    const node = ref.current;
    if (!node) return;
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => {
        node.textContent = format(v);
      },
    });
    return () => controls.stop();
  }, [inView, value, duration, format]);

  return (
    <span ref={ref} className={className}>
      {format(0)}
    </span>
  );
}
