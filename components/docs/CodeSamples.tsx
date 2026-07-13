"use client";

import { useState } from "react";
import CopyButton from "./CopyButton";

export type Sample = { id: string; label: string; code: string };

export default function CodeSamples({
  title,
  samples,
}: {
  title: string;
  samples: Sample[];
}) {
  const [active, setActive] = useState(samples[0]?.id);
  const current = samples.find((s) => s.id === active) ?? samples[0];

  return (
    <div className="overflow-hidden rounded-card border border-white/10 bg-code-bg shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-code-bar px-3 py-2">
        <span className="truncate pl-1 font-mono text-[11px] text-code-comment">{title}</span>
        <div className="flex items-center gap-1" role="tablist" aria-label="Sample language">
          {samples.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={s.id === current.id}
              onClick={() => setActive(s.id)}
              className={`h-6 rounded-md px-2 font-mono text-[11px] transition-colors ${
                s.id === current.id
                  ? "bg-white/10 text-code-text"
                  : "text-code-comment hover:text-code-text"
              }`}
            >
              {s.label}
            </button>
          ))}
          <span aria-hidden="true" className="mx-1 h-4 w-px bg-white/10" />
          <CopyButton text={current.code} />
        </div>
      </div>
      <pre className="no-scrollbar max-h-[420px] overflow-auto p-4 font-mono text-[12.5px] leading-[1.7] text-code-text">
        <code>{current.code}</code>
      </pre>
    </div>
  );
}
