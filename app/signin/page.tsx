"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "@/components/icons";
import {
  AuthShell,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/AuthShell";
import { authApi } from "@/lib/client/endpoints";

export default function SignInPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get("email")?.toString() ?? "";
    const password = data.get("password")?.toString() ?? "";
    const remember = data.get("remember") === "on";

    setError(null);
    setSubmitting(true);
    try {
      await authApi.login({ email, password, remember });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your SprintCheck account to continue."
      footer={
        <>
          New to SprintCheck?{" "}
          <a
            href="/signup"
            className="font-medium text-brand-accent transition-colors hover:text-brand"
          >
            Create an account
          </a>
        </>
      }
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

        <PasswordField
          id="password"
          name="password"
          label="Password"
          autoComplete="current-password"
          required
          placeholder="Enter your password"
          action={
            <a
              href="/forgot-password"
              className="text-small font-medium text-brand-accent transition-colors hover:text-brand"
            >
              Forgot password?
            </a>
          }
        />

        {error && (
          <p className="text-small font-medium text-red-600" role="alert">
            {error}
          </p>
        )}

        <label
          htmlFor="remember"
          className="flex w-fit cursor-pointer items-center gap-2.5 text-small text-body"
        >
          <input
            id="remember"
            name="remember"
            type="checkbox"
            className="h-4 w-4 rounded border-line text-brand accent-brand focus:ring-2 focus:ring-brand/20"
          />
          Keep me signed in for 30 days
        </label>

        <SubmitButton loading={submitting} loadingText="Signing in…">
          Sign in
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
