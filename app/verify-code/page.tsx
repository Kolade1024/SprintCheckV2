"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "@/components/icons";
import { AuthShell, SubmitButton } from "@/components/AuthShell";

const CODE_LENGTH = 6;

function VerifyCodeForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email");

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [resent, setResent] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join("");
  const complete = code.length === CODE_LENGTH;

  function setDigit(index: number, value: string) {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleChange(index: number, raw: string) {
    const value = raw.replace(/\D/g, "");
    if (!value) {
      setDigit(index, "");
      return;
    }
    // Support pasting / typing multiple digits at once.
    const chars = value.split("");
    setDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < chars.length && index + i < CODE_LENGTH; i++) {
        next[index + i] = chars[i];
      }
      return next;
    });
    const nextIndex = Math.min(index + chars.length, CODE_LENGTH - 1);
    inputs.current[nextIndex]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < CODE_LENGTH - 1)
      inputs.current[index + 1]?.focus();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!complete) return;
    setSubmitting(true);
    // Wire up to your "verify code" endpoint here.
    setTimeout(() => {
      setSubmitting(false);
      router.push("/set-new-password");
    }, 1200);
  }

  function handleResend() {
    setResent(true);
    // Wire up to your "resend code" endpoint here.
    setTimeout(() => setResent(false), 3000);
  }

  return (
    <AuthShell
      title="Enter verification code"
      subtitle={
        email ? (
          <>
            We sent a 6-digit code to{" "}
            <span className="font-medium text-ink">{email}</span>.
          </>
        ) : (
          "Enter the 6-digit code we sent to your email."
        )
      }
      footer={
        <a
          href="/signin"
          className="inline-flex items-center gap-1.5 font-medium text-brand-accent transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </a>
      }
    >
      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={CODE_LENGTH}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              aria-label={`Digit ${i + 1}`}
              className="h-14 w-full rounded-btn border border-line bg-white text-center text-card-title font-semibold text-ink shadow-card outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          ))}
        </div>

        <SubmitButton loading={submitting} loadingText="Verifying…">
          Verify
        </SubmitButton>
      </form>

      <p className="mt-7 text-center text-small text-body">
        Didn&apos;t get a code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resent}
          className="font-medium text-brand-accent transition-colors hover:text-brand disabled:text-body"
        >
          {resent ? "Code sent ✓" : "Resend code"}
        </button>
      </p>
    </AuthShell>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense fallback={null}>
      <VerifyCodeForm />
    </Suspense>
  );
}
