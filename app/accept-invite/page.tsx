"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Phone, User } from "@/components/icons";
import { AuthShell, PasswordField, SubmitButton, TextField } from "@/components/AuthShell";
import { authApi } from "@/lib/client/endpoints";

/**
 * Landing page for the invite email. The token arrives as `?token=…`; the
 * invitee sets their own name, phone and password to activate the account.
 */
function AcceptInviteForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const password = data.get("password")?.toString() ?? "";
    const confirmation = data.get("password_confirmation")?.toString() ?? "";

    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await authApi.acceptTeamInvite({
        token,
        name: data.get("name")?.toString() ?? "",
        phone_number: data.get("phone_number")?.toString() ?? "",
        password,
        password_confirmation: confirmation,
      });
      setDone(res.message);
      setTimeout(() => router.push("/signin"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not accept this invitation.");
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthShell
        title="Invitation link incomplete"
        subtitle="This link is missing its invite token. Open the link from your invitation email, or ask your admin to send a new one."
        footer={
          <a
            href="/signin"
            className="font-medium text-brand-accent transition-colors hover:text-brand"
          >
            Go to sign in
          </a>
        }
      >
        <span />
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="You're in" subtitle={done}>
        <p className="mt-7 text-small text-body">Taking you to sign in…</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Join the team"
      subtitle={
        email
          ? `Finish setting up the account for ${email}.`
          : "Finish setting up your SprintCheck account."
      }
      footer={
        <>
          Already set up?{" "}
          <a
            href="/signin"
            className="font-medium text-brand-accent transition-colors hover:text-brand"
          >
            Sign in
          </a>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
        {email && (
          <TextField
            id="email"
            label="Email address"
            icon={Mail}
            type="email"
            value={email}
            readOnly
            disabled
          />
        )}

        <TextField
          id="name"
          name="name"
          label="Your name"
          icon={User}
          autoComplete="name"
          required
          placeholder="Ada Obi"
        />

        <TextField
          id="phone_number"
          name="phone_number"
          label="Phone number"
          icon={Phone}
          type="tel"
          autoComplete="tel"
          required
          placeholder="08012345678"
        />

        <PasswordField
          id="password"
          name="password"
          label="Password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="At least 6 characters"
        />

        <PasswordField
          id="password_confirmation"
          name="password_confirmation"
          label="Confirm password"
          autoComplete="new-password"
          required
          placeholder="Re-enter your password"
        />

        {error && (
          <p className="text-small font-medium text-red-600" role="alert">
            {error}
          </p>
        )}

        <SubmitButton loading={submitting} loadingText="Setting up…">
          Accept invitation
        </SubmitButton>
      </form>
    </AuthShell>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <AcceptInviteForm />
    </Suspense>
  );
}
