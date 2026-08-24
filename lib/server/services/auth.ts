import { upstream, UpstreamError } from "@/lib/server/upstream";
import type { MessageResponse, SignupPayload } from "@/lib/shared/types";

/**
 * Auth business logic. Talks to the unauthenticated upstream /auth/* routes
 * with the public ApiKey; token/cookie handling stays in the controllers so
 * this layer remains framework-agnostic.
 */

const APIKEY = { kind: "apiKey" } as const;

function required(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new UpstreamError(`${field} is required.`, 422);
  }
  return value.trim();
}

export interface LoginResult {
  /** Null when 2FA is required — the session starts after the code is verified. */
  token: string | null;
  twoFactorRequired: boolean;
  message: string;
}

/**
 * Accounts with 2FA on get no token here: upstream answers
 * `two_factor_required: true` and emails a code, which the caller trades for a
 * token through `verifyLoginTwoFactor`.
 */
export async function login(email: unknown, password: unknown): Promise<LoginResult> {
  const payload = {
    email: required(email, "Email"),
    password: required(password, "Password"),
  };
  const res = await upstream<{
    message?: string;
    token?: string;
    two_factor_required?: boolean;
  }>("/auth/login", {
    method: "POST",
    auth: APIKEY,
    body: payload,
  });

  if (res.two_factor_required === true && !res.token) {
    return {
      token: null,
      twoFactorRequired: true,
      message: res.message ?? "Enter the 6-digit code we emailed you.",
    };
  }
  if (!res.token) {
    throw new UpstreamError("Login succeeded but no session token was returned.", 502);
  }
  return { token: res.token, twoFactorRequired: false, message: res.message ?? "Login successful" };
}

/** Second login step for 2FA accounts — exchanges the emailed code for a token. */
export async function verifyLoginTwoFactor(
  email: unknown,
  code: unknown,
): Promise<{ token: string; message: string }> {
  const value = required(code, "Code").replace(/\D/g, "");
  if (value.length !== 6) {
    throw new UpstreamError("Enter the 6-digit code from your email.", 422);
  }
  const res = await upstream<{ message?: string; token?: string }>("/auth/two-factor/verify", {
    method: "POST",
    auth: APIKEY,
    body: { email: required(email, "Email"), code: value },
  });
  if (!res.token) {
    throw new UpstreamError("Verification succeeded but no session token was returned.", 502);
  }
  return { token: res.token, message: res.message ?? "Login successful" };
}

export async function signup(payload: SignupPayload): Promise<MessageResponse> {
  const body = {
    email: required(payload.email, "Email"),
    password: required(payload.password, "Password"),
    business_name: required(payload.business_name, "Business name"),
    phone_number: required(payload.phone_number, "Phone number"),
  };
  const res = await upstream<{ message?: string }>("/auth/signup", {
    method: "POST",
    auth: APIKEY,
    body,
  });
  return { message: res.message ?? "Registration successful" };
}

/**
 * Answers identically whether or not the email has an account. Upstream
 * distinguishes the two — an unknown address gets 422 "The selected email is
 * invalid." (Laravel's `exists:users,email` rule) while a registered one gets
 * 200 — and passing that through let anyone sort a list of emails into
 * customers and non-customers. Every outcome below a 5xx returns this message.
 */
const RESET_CODE_SENT = "If an account exists for that email, we've sent a reset code.";

/**
 * The rest of the reset flow still takes an email, so it inherits the same
 * oracle one step deeper: an unknown address and a wrong code have to be
 * indistinguishable, which means one message for both.
 */
const RESET_CODE_REJECTED = "That code is invalid or has expired. Request a new one.";

/**
 * `/auth/reset-password` dereferences a null user when the email has no
 * account (ErrorException at AuthController.php:189, "Attempt to read property
 * reset_code on null"), so an unknown address answers 500 while a wrong code
 * answers 422. The body is already scrubbed, but the *status* alone would
 * re-open the oracle — so this one signature counts as a rejected code rather
 * than an outage. Remove once upstream validates the user before the lookup.
 */
function isMissingAccountCrash(error: UpstreamError): boolean {
  return (
    error.status >= 500 &&
    /attempt to read property|reset_code|on null/i.test(error.detail ?? "")
  );
}

/**
 * Syntax-only check, so a typo'd address still gets real feedback instead of
 * silently landing on a generic message. Reveals nothing about the account.
 */
function emailAddress(value: unknown): string {
  const address = required(value, "Email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
    throw new UpstreamError("Enter a valid email address.", 422);
  }
  return address;
}

export async function forgotPassword(email: unknown): Promise<MessageResponse> {
  const address = emailAddress(email);

  try {
    await upstream<{ message?: string }>("/auth/forgot-password", {
      method: "POST",
      auth: APIKEY,
      body: { email: address },
    });
  } catch (error) {
    // 5xx and transport failures don't depend on whether the account exists,
    // so they can surface — the user needs to know to retry.
    if (!(error instanceof UpstreamError) || error.status >= 500) throw error;
    console.warn(`[auth] forgot-password suppressed ${error.status}: ${error.message}`);
  }

  return { message: RESET_CODE_SENT };
}

export async function verifyResetCode(email: unknown, code: unknown): Promise<MessageResponse> {
  const body = { email: emailAddress(email), code: required(code, "Code") };

  try {
    const res = await upstream<{ message?: string }>("/auth/verify-reset-code", {
      method: "POST",
      auth: APIKEY,
      body,
    });
    return { message: res.message ?? "Code verified" };
  } catch (error) {
    if (!(error instanceof UpstreamError)) throw error;
    if (error.status >= 500 && !isMissingAccountCrash(error)) throw error;
    console.warn(`[auth] verify-reset-code collapsed ${error.status}: ${error.detail}`);
    throw new UpstreamError(RESET_CODE_REJECTED, 422);
  }
}

/** Field errors that describe the submitted password, not the account. */
const PASSWORD_FIELDS = new Set(["password", "password_confirmation"]);

export async function resetPassword(
  email: unknown,
  code: unknown,
  password: unknown,
): Promise<MessageResponse> {
  const body = {
    email: emailAddress(email),
    code: required(code, "Code"),
    password: required(password, "Password"),
  };

  try {
    const res = await upstream<{ message?: string }>("/auth/reset-password", {
      method: "POST",
      auth: APIKEY,
      body,
    });
    return { message: res.message ?? "Password updated" };
  } catch (error) {
    if (!(error instanceof UpstreamError)) throw error;
    if (error.status >= 500 && !isMissingAccountCrash(error)) throw error;

    // A complaint about the new password is safe to show — it describes what
    // was just typed, not whether the account exists. Anything touching the
    // email or the code collapses into the single rejection message.
    const fields = Object.keys(error.fieldErrors ?? {});
    if (fields.length > 0 && fields.every((field) => PASSWORD_FIELDS.has(field))) {
      throw error;
    }

    console.warn(`[auth] reset-password collapsed ${error.status}: ${error.detail}`);
    throw new UpstreamError(RESET_CODE_REJECTED, 422);
  }
}
