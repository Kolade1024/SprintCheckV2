import type { ReactNode } from "react";

const TONES = {
  info: "border-brand/25 bg-brand/[0.04] text-ink [&_svg]:text-brand-accent",
  warn: "border-[#dc6803]/30 bg-[#dc6803]/[0.05] text-ink [&_svg]:text-[#b54708] dark:[&_svg]:text-[#f5b169]",
} as const;

export default function Callout({
  tone = "info",
  children,
}: {
  tone?: keyof typeof TONES;
  children: ReactNode;
}) {
  return (
    <div className={`flex items-start gap-3 rounded-card border px-4 py-3 text-small leading-relaxed ${TONES[tone]}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 h-4 w-4 shrink-0">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
      </svg>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
