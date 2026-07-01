"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle } from "@/components/icons";
import {
  AuthShell,
  PasswordField,
  SubmitButton,
} from "@/components/AuthShell";

export default function SetNewPasswordPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const password = data.get("password")?.toString() ?? "";
    const confirm = data.get("confirm")?.toString() ?? "";

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setError(null);
    setSubmitting(true);
    // Wire up to your "set new password" endpoint here.
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
    }, 1200);
  }

  if (done) {
    return (
      <AuthShell
        title="Password updated"
        subtitle="Your password has been changed. You can now sign in with your new password."
      >
        <div className="mt-7 flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-card border border-line bg-subtle px-4 py-3.5">
            <CheckCircle className="h-5 w-5 shrink-0 text-success" />
            <span className="text-small text-body">
              All set — your account is secured with the new password.
            </span>
          </div>
          <button
            type="button"
            onClick={() => router.push("/signin")}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-brand px-6 text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px"
          >
            Continue to sign in
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you don't use anywhere else."
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
        <PasswordField
          id="password"
          name="password"
          label="New password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
        />

        <PasswordField
          id="confirm"
          name="confirm"
          label="Confirm new password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Re-enter your password"
        />

        {error && (
          <p className="text-small font-medium text-red-600" role="alert">
            {error}
          </p>
        )}

        <SubmitButton loading={submitting} loadingText="Updating…">
          Update password
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
