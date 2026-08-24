"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle, Mail } from "@/components/icons";
import {
  AuthShell,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/AuthShell";
import CodeInput from "@/components/dashboard/CodeInput";
import { authApi } from "@/lib/client/endpoints";

/** Credentials the second step needs after upstream asks for a 2FA code. */
interface PendingLogin {
  email: string;
  remember: boolean;
}

/**
 * `useSearchParams` opts a route into dynamic rendering unless it sits under a
 * Suspense boundary, so the form is wrapped rather than letting the whole
 * sign-in page lose its static prerender for one banner.
 */
export default function SignInPage() {
  return (
    <Suspense fallback={<SignInForm justRegistered={false} />}>
      <SignInFormWithParams />
    </Suspense>
  );
}

function SignInFormWithParams() {
  // Set by the post-signup redirect (/signin?registered=1).
  const justRegistered = useSearchParams().get("registered") === "1";
  return <SignInForm justRegistered={justRegistered} />;
}

function SignInForm({ justRegistered }: { justRegistered: boolean }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingLogin | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get("email")?.toString() ?? "";
    const password = data.get("password")?.toString() ?? "";
    const remember = data.get("remember") === "on";

    setError(null);
    setSubmitting(true);
    try {
      const result = await authApi.login({ email, password, remember });
      // 2FA accounts get no session yet — a code was emailed instead.
      if (result.twoFactorRequired) {
        setPending({ email, remember });
        setSubmitting(false);
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
      setSubmitting(false);
    }
  }

  if (pending) {
    return (
      <TwoFactorStep
        pending={pending}
        onBack={() => {
          setPending(null);
          setError(null);
        }}
      />
    );
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
        {justRegistered && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-card border border-line bg-subtle px-4 py-3.5"
          >
            <CheckCircle className="h-5 w-5 shrink-0 text-success" />
            <span className="text-small text-body">
              Account created. Sign in to get started.
            </span>
          </div>
        )}

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

/** Second half of sign-in for accounts with 2FA switched on. */
function TwoFactorStep({ pending, onBack }: { pending: PendingLogin; onBack: () => void }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function verify(value: string) {
    if (value.length !== 6 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await authApi.verifyLoginCode(pending.email, value, pending.remember);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code didn't work.");
      setCode("");
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Check your email"
      subtitle={`We sent a 6-digit code to ${pending.email}.`}
      footer={
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 font-medium text-brand-accent transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Use a different account
        </button>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          verify(code);
        }}
        className="mt-7 flex flex-col gap-6"
      >
        <CodeInput
          value={code}
          onChange={setCode}
          onComplete={verify}
          disabled={submitting}
          autoFocus
        />

        {error && (
          <p className="text-center text-small font-medium text-red-600" role="alert">
            {error}
          </p>
        )}

        <SubmitButton loading={submitting} loadingText="Verifying…" disabled={code.length !== 6}>
          Verify and sign in
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
