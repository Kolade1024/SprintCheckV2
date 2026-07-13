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
  token: string;
  message: string;
}

export async function login(email: unknown, password: unknown): Promise<LoginResult> {
  const payload = {
    email: required(email, "Email"),
    password: required(password, "Password"),
  };
  const res = await upstream<{ message?: string; token?: string }>("/auth/login", {
    method: "POST",
    auth: APIKEY,
    body: payload,
  });
  if (!res.token) {
    throw new UpstreamError("Login succeeded but no session token was returned.", 502);
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
