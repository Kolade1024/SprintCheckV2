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

// Field order drives which invalid field receives focus first on submit.
const FIELD_ORDER = ["name", "email", "phone", "password", "confirm", "terms"] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  // Per-field validation messages, plus a separate server/submit-level error.
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Clear a field's error as soon as the user edits it.
  const clearError = (field: string) =>
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const businessName = data.get("name")?.toString().trim() ?? "";
    const email = data.get("email")?.toString().trim() ?? "";
    // The API expects 7–15 bare digits, so strip formatting from the input.
    const phone = (data.get("phone")?.toString() ?? "").replace(/\D/g, "");
    const password = data.get("password")?.toString() ?? "";
    const confirm = data.get("confirm")?.toString() ?? "";
    const accepted = data.get("terms") === "on";

    // Validate every field up front so all problems surface at once.
    const next: Record<string, string> = {};
    if (!businessName) next.name = "Enter your business name.";
    if (!email) next.email = "Enter your email address.";
    else if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (!phone) next.phone = "Enter your phone number.";
    else if (!/^[0-9]{7,15}$/.test(phone))
      next.phone = "Enter a valid phone number (7–15 digits).";
    if (!password) next.password = "Create a password.";
    else if (password.length < 8)
      next.password = "Password must be at least 8 characters.";
    if (!confirm) next.confirm = "Re-enter your password.";
    else if (confirm !== password) next.confirm = "Passwords don't match.";
    if (!accepted) next.terms = "Please accept the Terms and Privacy Policy.";

    setSubmitError(null);
    if (Object.keys(next).length > 0) {
      setErrors(next);
      const firstInvalid = FIELD_ORDER.find((f) => next[f]);
      if (firstInvalid) document.getElementById(firstInvalid)?.focus();
      return;
    }

    setErrors({});
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
      setSubmitError(
        err instanceof Error ? err.message : "Unable to create account."
      );
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
        noValidate
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
          error={errors.name}
          onChange={() => clearError("name")}
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
          error={errors.email}
          onChange={() => clearError("email")}
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
          error={errors.phone}
          onChange={() => clearError("phone")}
        />

        <PasswordField
          id="password"
          name="password"
          label="Password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          error={errors.password}
          onChange={() => clearError("password")}
        />

        <PasswordField
          id="confirm"
          name="confirm"
          label="Confirm password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Re-enter your password"
          error={errors.confirm}
          onChange={() => clearError("confirm")}
        />

        {submitError && (
          <p
            className="text-small font-medium text-red-600 md:col-span-2"
            role="alert"
          >
            {submitError}
          </p>
        )}

        <div className="flex flex-col gap-1.5 md:col-span-2">
        <label
          htmlFor="terms"
          className="flex cursor-pointer items-start gap-2.5 text-small text-body"
        >
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            aria-invalid={errors.terms ? true : undefined}
            aria-describedby={errors.terms ? "terms-error" : undefined}
            onChange={() => clearError("terms")}
            className={`mt-0.5 h-4 w-4 shrink-0 rounded text-brand accent-brand focus:ring-2 focus:ring-brand/20 ${
              errors.terms ? "border-red-500" : "border-line"
            }`}
          />
          <span>
            I agree to the{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline-offset-2 hover:underline"
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline-offset-2 hover:underline"
            >
              Privacy Policy
            </a>
            .
          </span>
        </label>
        {errors.terms && (
          <p id="terms-error" className="text-small font-medium text-red-600" role="alert">
            {errors.terms}
          </p>
        )}
        </div>

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
