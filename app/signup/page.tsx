"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, User } from "@/components/icons";
import {
  AuthShell,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/AuthShell";
import { authApi } from "@/lib/client/endpoints";

export default function SignUpPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const businessName = data.get("name")?.toString().trim() ?? "";
    const email = data.get("email")?.toString() ?? "";
    // The API expects 7–15 bare digits, so strip formatting from the input.
    const phone = (data.get("phone")?.toString() ?? "").replace(/\D/g, "");
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
    if (!/^[0-9]{7,15}$/.test(phone)) {
      setError("Enter a valid phone number (7–15 digits).");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await authApi.signup({
        email,
        password,
        business_name: businessName,
        phone_number: phone,
      });
      router.push("/signin?registered=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      wide
      title="Create your account"
      subtitle="Start verifying identities in minutes."
      footer={
        <>
          Already have an account?{" "}
          <a
            href="/signin"
            className="font-medium text-brand-accent transition-colors hover:text-brand"
          >
            Sign in
          </a>
        </>
      }
    >
      <form
        onSubmit={handleSubmit}
        className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2"
      >
        <TextField
          id="name"
          name="name"
          type="text"
          label="Business name"
          icon={User}
          autoComplete="organization"
          required
          placeholder="Acme Inc."
          wrapperClassName="md:col-span-2"
        />

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

        <TextField
          id="phone"
          name="phone"
          type="tel"
          label="Phone number"
          icon={Phone}
          autoComplete="tel"
          required
          placeholder="+234 800 000 0000"
        />

        <PasswordField
          id="password"
          name="password"
          label="Password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
        />

        <PasswordField
          id="confirm"
          name="confirm"
          label="Confirm password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Re-enter your password"
        />

        {error && (
          <p
            className="text-small font-medium text-red-600 md:col-span-2"
            role="alert"
          >
            {error}
          </p>
        )}

        <label
          htmlFor="terms"
          className="flex cursor-pointer items-start gap-2.5 text-small text-body md:col-span-2"
        >
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-line text-brand accent-brand focus:ring-2 focus:ring-brand/20"
          />
          <span>
            I agree to the{" "}
            <a href="#" className="text-ink underline-offset-2 hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-ink underline-offset-2 hover:underline">
              Privacy Policy
            </a>
            .
          </span>
        </label>

        <SubmitButton
          loading={submitting}
          loadingText="Creating account…"
          className="w-full md:col-span-2"
        >
          Create account
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
