import {
  mapAccountDetails,
  mapFundingFee,
  mapNotification,
  mapPageMeta,
} from "@/lib/server/mappers";
import { queryString, upstream, upstreamList, UpstreamError } from "@/lib/server/upstream";
import type {
  AccountDetails,
  FundingFee,
  MessageResponse,
  NotificationPage,
} from "@/lib/shared/types";

/**
 * Account settings, two-factor authentication, profile photo, scheduled
 * deletion and notifications — everything behind the Settings screens and the
 * topbar bell. All routes are bearer-authenticated.
 */

type Raw = Record<string, unknown>;

const bearer = (token: string) => ({ kind: "bearer", token }) as const;

/** Upstream emails 6-digit codes; anything else is rejected before the call. */
function requireCode(value: unknown): string {
  const code = typeof value === "string" ? value.trim() : "";
  if (!/^\d{6}$/.test(code)) {
    throw new UpstreamError("Enter the 6-digit code from your email.", 422);
  }
  return code;
}

export async function getAccount(token: string): Promise<AccountDetails> {
  const res = await upstream<{ data?: Raw }>("/account", { auth: bearer(token) });
  return mapAccountDetails(res.data ?? {});
}

export async function getFundingFee(token: string): Promise<FundingFee> {
  const res = await upstream<{ data?: Raw }>("/wallet/funding-fee", { auth: bearer(token) });
  return mapFundingFee(res.data ?? {});
}

/* ------------------------------------------------------------ two-factor */

/** Step 1 — emails a code. 2FA only switches on once the code is verified. */
export async function enableTwoFactor(token: string): Promise<MessageResponse> {
  const res = await upstream<{ message?: string }>("/account/two-factor/enable", {
    method: "POST",
    auth: bearer(token),
    body: {},
  });
  return { message: res.message ?? "Verification code sent to your email." };
}

/** Step 2 — confirms the emailed code and turns 2FA on. */
export async function verifyTwoFactor(token: string, code: unknown): Promise<MessageResponse> {
  const res = await upstream<{ message?: string }>("/account/two-factor/verify", {
    method: "POST",
    auth: bearer(token),
    body: { code: requireCode(code) },
  });
  return { message: res.message ?? "Two-factor authentication enabled." };
}

export async function resendTwoFactorCode(token: string): Promise<MessageResponse> {
  const res = await upstream<{ message?: string }>("/account/two-factor/resend", {
    method: "POST",
    auth: bearer(token),
    body: {},
  });
  return { message: res.message ?? "A new verification code has been sent to your email." };
}

/** Turning 2FA off also needs a current code, so the UI sends one here too. */
export async function disableTwoFactor(token: string, code: unknown): Promise<MessageResponse> {
  const res = await upstream<{ message?: string }>("/account/two-factor/disable", {
    method: "POST",
    auth: bearer(token),
    body: { code: requireCode(code) },
  });
  return { message: res.message ?? "Two-factor authentication disabled." };
}

/* --------------------------------------------------------- profile photo */

const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface ProfilePhotoResult extends MessageResponse {
  profilePhotoUrl: string | null;
}

export async function uploadProfilePhoto(
  token: string,
  image: unknown,
): Promise<ProfilePhotoResult> {
  if (!(image instanceof File) || image.size === 0) {
    throw new UpstreamError("Choose an image to upload.", 422);
  }
  if (!ALLOWED_PHOTO_TYPES.includes(image.type)) {
    throw new UpstreamError("Use a JPG, PNG or WebP image.", 422);
  }
  if (image.size > MAX_PHOTO_BYTES) {
    throw new UpstreamError("That image is larger than 4MB. Pick a smaller one.", 422);
  }

  const form = new FormData();
  form.append("image", image, image.name || "profile-photo");

  const res = await upstream<{ message?: string; data?: Raw }>("/account/profile-photo", {
    method: "POST",
    auth: bearer(token),
    body: form,
  });
  const url = res.data?.profile_photo_url;
  return {
    message: res.message ?? "Profile photo uploaded.",
    profilePhotoUrl: typeof url === "string" ? url : null,
  };
}

export async function removeProfilePhoto(token: string): Promise<MessageResponse> {
  const res = await upstream<{ message?: string }>("/account/profile-photo", {
    method: "DELETE",
    auth: bearer(token),
  });
  return { message: res.message ?? "Profile photo removed." };
}

/* ------------------------------------------------------- account deletion */

export interface DeletionResult extends MessageResponse {
  deletionScheduledAt: string | null;
}

/** Schedules a hard delete after a 30-day grace period; password-confirmed. */
export async function requestAccountDeletion(
  token: string,
  password: unknown,
): Promise<DeletionResult> {
  const value = typeof password === "string" ? password : "";
  if (!value) throw new UpstreamError("Enter your password to confirm.", 422);

  const res = await upstream<{ message?: string; data?: Raw }>("/account/deletion-request", {
    method: "POST",
    auth: bearer(token),
    body: { password: value },
  });
  const scheduled = res.data?.deletion_scheduled_at;
  return {
    message: res.message ?? "Account deletion scheduled.",
    deletionScheduledAt: typeof scheduled === "string" ? scheduled : null,
  };
}

export async function cancelAccountDeletion(token: string): Promise<MessageResponse> {
  const res = await upstream<{ message?: string }>("/account/deletion-request", {
    method: "DELETE",
    auth: bearer(token),
  });
  return { message: res.message ?? "Account deletion cancelled." };
}

/* ---------------------------------------------------------- notifications */

export async function getNotifications(token: string, page = 1): Promise<NotificationPage> {
  const { rows, meta } = await upstreamList<Raw>(
    `/notifications${queryString({ page })}`,
    bearer(token),
  );
  const items = rows.map(mapNotification);
  return { items, meta: mapPageMeta(meta, items.length) };
}

export async function markNotificationsRead(
  token: string,
  ids: unknown,
): Promise<MessageResponse> {
  const list = Array.isArray(ids) ? ids.filter((id) => id !== null && id !== undefined) : [];
  if (list.length === 0) {
    throw new UpstreamError("No notifications selected.", 422);
  }
  const res = await upstream<{ message?: string }>("/notifications/read", {
    method: "POST",
    auth: bearer(token),
    body: { ids: list },
  });
  return { message: res.message ?? "Notifications marked as read." };
}

export async function markAllNotificationsRead(token: string): Promise<MessageResponse> {
  const res = await upstream<{ message?: string }>("/notifications/read-all", {
    method: "POST",
    auth: bearer(token),
    body: {},
  });
  return { message: res.message ?? "All notifications marked as read." };
}
