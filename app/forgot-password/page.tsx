"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Mail } from "@/components/icons";
import { AuthShell, SubmitButton, TextField } from "@/components/AuthShell";
import { authApi } from "@/lib/client/endpoints";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email")?.toString() ?? "";
    setError(null);
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      setSentTo(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset code.");
    } finally {
      setSubmitting(false);
    }
  }

  const backToSignIn = (
    <a
      href="/signin"
      className="inline-flex items-center gap-1.5 font-medium text-brand-accent transition-colors hover:text-brand"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to sign in
    </a>
  );

  if (sentTo) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle={
          <>
            We sent a password reset code to{" "}
            <span className="font-medium text-ink">{sentTo}</span>. It expires in
            10 minutes.
          </>
        }
        footer={backToSignIn}
      >
        <div className="mt-7 flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-card border border-line bg-subtle px-4 py-3.5">
            <CheckCircle className="h-5 w-5 shrink-0 text-success" />
            <span className="text-small text-body">
              If an account exists for that email, the code is on its way.
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              router.push(`/verify-code?email=${encodeURIComponent(sentTo)}`)
            }
            className="inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-brand px-6 text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px"
          >
            Enter reset code
          </button>
          <button
            type="button"
            onClick={() => setSentTo(null)}
            className="text-small font-medium text-body transition-colors hover:text-ink"
          >
            Use a different email
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot password?"
      subtitle="Enter the email tied to your account and we'll send a reset code."
      footer={backToSignIn}
    >
      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
        <TextField
          id="email"
          name="email"
          type="email"
          label="Email address"
          icon={Mail}
          autoComplete="email"
          required
          placeholder="you@company.com"
        />

        {error && (
          <p className="text-small font-medium text-red-600" role="alert">
            {error}
          </p>
        )}

        <SubmitButton loading={submitting} loadingText="Sending code…">
          Send reset code
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
