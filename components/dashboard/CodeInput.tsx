"use client";

import { useRef } from "react";

const LENGTH = 6;

/**
 * Six-digit code entry used by every 2FA step (enabling, disabling, and the
 * second half of sign-in). Pasting a full code into any box fills the rest.
 */
export default function CodeInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = false,
}: {
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");

  function setDigits(next: string[]) {
    const code = next.join("").slice(0, LENGTH);
    onChange(code);
    if (code.length === LENGTH) onComplete?.(code);
  }

  function handleChange(index: number, raw: string) {
    const typed = raw.replace(/\D/g, "");
    const next = [...digits];

    if (!typed) {
      next[index] = "";
      setDigits(next);
      return;
    }

    for (let i = 0; i < typed.length && index + i < LENGTH; i++) {
      next[index + i] = typed[i];
    }
    setDigits(next);
    inputs.current[Math.min(index + typed.length, LENGTH - 1)]?.focus();
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < LENGTH - 1) inputs.current[index + 1]?.focus();
  }

  return (
    <div className="flex items-center justify-center gap-2 md:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={LENGTH}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          aria-label={`Digit ${index + 1}`}
          className="h-14 w-12 rounded-2xl border border-line bg-subtle text-center text-[22px] font-semibold text-ink outline-none transition-colors focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 disabled:opacity-60 md:h-16 md:w-16"
        />
      ))}
    </div>
  );
}
