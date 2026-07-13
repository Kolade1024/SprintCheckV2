"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "@/components/icons";

export default function CopyButton({
  text,
  className = "",
  label = "Copy to clipboard",
  variant = "dark",
}: {
  text: string;
  className?: string;
  label?: string;
  /** "dark" sits on code windows; "light" sits on light surfaces. */
  variant?: "dark" | "light";
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API unavailable (non-secure context) — fall back.
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2 font-mono text-[11px] transition-colors ${
        copied
          ? "text-success"
          : variant === "dark"
            ? "text-code-comment hover:text-code-text"
            : "text-body hover:text-ink"
      } ${className}`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
