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

export async function forgotPassword(email: unknown): Promise<MessageResponse> {
  const res = await upstream<{ message?: string }>("/auth/forgot-password", {
    method: "POST",
    auth: APIKEY,
    body: { email: required(email, "Email") },
  });
  return { message: res.message ?? "Reset code sent" };
}

export async function verifyResetCode(email: unknown, code: unknown): Promise<MessageResponse> {
  const res = await upstream<{ message?: string }>("/auth/verify-reset-code", {
    method: "POST",
    auth: APIKEY,
    body: { email: required(email, "Email"), code: required(code, "Code") },
  });
  return { message: res.message ?? "Code verified" };
}

export async function resetPassword(
  email: unknown,
  code: unknown,
  password: unknown,
): Promise<MessageResponse> {
  const res = await upstream<{ message?: string }>("/auth/reset-password", {
    method: "POST",
    auth: APIKEY,
    body: {
      email: required(email, "Email"),
      code: required(code, "Code"),
      password: required(password, "Password"),
    },
  });
  return { message: res.message ?? "Password updated" };
}
