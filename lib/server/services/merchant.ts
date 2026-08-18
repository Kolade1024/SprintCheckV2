import {
  isActivePricingRow,
  mapAuditLogEntry,
  mapCacBusinessMatch,
  mapCountry,
  mapDailyStat,
  mapDashboardSummary,
  mapPageMeta,
  mapPricingService,
  mapRegeneratedKeys,
  mapTeamMember,
  mapVerificationLog,
  mapVirtualAccount,
  mapWalletTransaction,
} from "@/lib/server/mappers";
import {
  queryString,
  upstream,
  upstreamAllPages,
  upstreamList,
  UpstreamError,
} from "@/lib/server/upstream";
import type {
  AcceptInvitePayload,
  AuditLogPage,
  AuditLogQuery,
  AuditSeverity,
  CacBusinessMatch,
  CacRecord,
  ChangePasswordPayload,
  Country,
  DailyVerificationStat,
  DashboardSummary,
  InviteTeamMemberPayload,
  MessageResponse,
  PricingService,
  RegeneratedKeys,
  TeamMember,
  TeamRole,
  UpdateBusinessPayload,
  UpdateProfilePayload,
  VerificationLog,
  VirtualAccount,
  WalletTransaction,
} from "@/lib/shared/types";

/**
 * Merchant-facing business logic for the authenticated dashboard routes.
 * Every function takes the caller's bearer token, hits the upstream API,
 * and returns normalized domain shapes.
 */

type Raw = Record<string, unknown>;

const bearer = (token: string) => ({ kind: "bearer", token }) as const;

export async function getDashboard(token: string): Promise<DashboardSummary> {
  const res = await upstream<{ data?: Raw }>("/dashboard", { auth: bearer(token) });
  return mapDashboardSummary(res.data ?? {});
}

/**
 * Daily successful/failed counts. Upstream only returns the last 8 days, so
 * this can back the chart's 7-day view but not its longer ranges.
 */
export async function getDashboardStats(token: string): Promise<DailyVerificationStat[]> {
  const res = await upstream<{ data?: Raw[] }>("/dashboard/stats", { auth: bearer(token) });
  return (res.data ?? []).map(mapDailyStat);
}

export async function getHistory(token: string): Promise<VerificationLog[]> {
  const rows = await upstreamAllPages<Raw>("/history", bearer(token));
  return rows.map(mapVerificationLog);
}

export async function getWalletHistory(token: string): Promise<WalletTransaction[]> {
  const rows = await upstreamAllPages<Raw>("/wallet-history", bearer(token));
  return rows.map(mapWalletTransaction);
}

export async function getPricing(token: string): Promise<PricingService[]> {
  const res = await upstream<{ data?: Raw[] }>("/pricing", { auth: bearer(token) });
  return (res.data ?? []).filter(isActivePricingRow).map(mapPricingService);
}

export async function getCountries(token: string): Promise<Country[]> {
  const res = await upstream<{ data?: Raw[] }>("/countries", { auth: bearer(token) });
  return (res.data ?? []).map(mapCountry);
}

export async function updateWebhook(token: string, webhookUrl: unknown): Promise<MessageResponse> {
  const url = typeof webhookUrl === "string" ? webhookUrl.trim() : "";
  if (!/^https?:\/\/.+/.test(url)) {
    throw new UpstreamError("Enter a valid webhook URL (must start with http:// or https://).", 422);
  }
  const res = await upstream<{ message?: string }>("/update-webhook", {
    method: "POST",
    auth: bearer(token),
    body: { webhook_url: url },
  });
  return { message: res.message ?? "Webhook URL updated successfully" };
}

export async function regenerateKeys(token: string): Promise<RegeneratedKeys> {
  const res = await upstream<{ data?: Raw }>("/regenerate-keys", {
    method: "PUT",
    auth: bearer(token),
    body: {},
  });
  return mapRegeneratedKeys(res.data ?? {});
}

export async function generateAccount(token: string, bvn: unknown): Promise<VirtualAccount> {
  const digits = typeof bvn === "string" ? bvn.replace(/\D/g, "") : "";
  if (digits.length !== 11) {
    throw new UpstreamError("BVN must be exactly 11 digits.", 422);
  }
  const res = await upstream<{ data?: Raw }>("/generate-account", {
    method: "POST",
    auth: bearer(token),
    body: { bvn: digits },
  });
  return mapVirtualAccount(res.data ?? {});
}

export async function updateProfile(
  token: string,
  payload: UpdateProfilePayload,
): Promise<MessageResponse> {
  const name = payload.name?.trim();
  const phone = payload.phone_number?.trim();
  if (!name) throw new UpstreamError("Name is required.", 422);
  if (!phone) throw new UpstreamError("Phone number is required.", 422);
  const res = await upstream<{ message?: string }>("/profile", {
    method: "PUT",
    auth: bearer(token),
    body: { name, phone_number: phone },
  });
  return { message: res.message ?? "Profile updated successfully" };
}

const BUSINESS_FIELDS: (keyof UpdateBusinessPayload)[] = [
  "business_email",
  "business_phone_number",
  "business_registration_number",
  "business_address",
  "city",
  "business_description",
  "country",
  "tax_identification_number",
  "business_website",
];

export async function updateBusiness(
  token: string,
  payload: UpdateBusinessPayload,
): Promise<MessageResponse> {
  // Forward only known fields, dropping empties so optional inputs left blank
  // in the form don't overwrite existing values with "".
  const body: Record<string, string> = {};
  for (const field of BUSINESS_FIELDS) {
    const value = payload[field];
    if (typeof value === "string" && value.trim()) body[field] = value.trim();
  }
  const res = await upstream<{ message?: string }>("/business", {
    method: "PUT",
    auth: bearer(token),
    body,
  });
  return { message: res.message ?? "Business profile updated" };
}

/* --------------------------------------------------------- cac verification */

// Merchant > Verification (Postman collection v3): five POST /cac/* lookups,
// each billed to the merchant's wallet per successful call.

function requiredString(value: unknown, message: string): string {
  const s = typeof value === "string" ? value.trim() : "";
  if (!s) throw new UpstreamError(message, 422);
  return s;
}

export async function cacNameSearch(token: string, name: unknown): Promise<CacBusinessMatch[]> {
  const res = await upstream<{ data?: Record<string, unknown>[] }>("/cac/name", {
    method: "POST",
    auth: bearer(token),
    body: { name: requiredString(name, "Enter a business name to search.") },
  });
  return (res.data ?? []).map(mapCacBusinessMatch);
}

export async function cacProfileSearch(token: string, number: unknown): Promise<CacRecord> {
  const res = await upstream<{ data?: CacRecord }>("/cac/profile", {
    method: "POST",
    auth: bearer(token),
    body: { number: requiredString(number, "Enter an RC or BN registration number.") },
  });
  return res.data ?? {};
}

export async function cacDirectorsLookup(token: string, bizId: unknown): Promise<unknown> {
  const id = Number(bizId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new UpstreamError("Enter a valid business ID (find it with a name search).", 422);
  }
  const res = await upstream<{ data?: unknown }>("/cac/directors", {
    method: "POST",
    auth: bearer(token),
    body: { biz_id: id },
  });
  return res.data ?? [];
}

export async function cacShareholdersLookup(token: string, bizId: unknown): Promise<unknown> {
  const id = Number(bizId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new UpstreamError("Enter a valid business ID (find it with a name search).", 422);
  }
  const res = await upstream<{ data?: unknown }>("/cac/shareholders", {
    method: "POST",
    auth: bearer(token),
    body: { biz_id: id },
  });
  return res.data ?? [];
}

export async function cacTinSearch(token: string, number: unknown): Promise<CacRecord> {
  const res = await upstream<{ data?: CacRecord }>("/cac/tin", {
    method: "POST",
    auth: bearer(token),
    body: { number: requiredString(number, "Enter a TIN to search.") },
  });
  return res.data ?? {};
}

/* -------------------------------------------------------------- audit log */

const AUDIT_SEVERITIES: AuditSeverity[] = ["info", "warning", "critical"];

/**
 * Filtering and paging happen upstream — the API validates `severity` and
 * `action` and 422s on unknown values, so only recognised filters are
 * forwarded and the rest are dropped rather than rejected here.
 */
export async function getAuditLogs(token: string, query: AuditLogQuery): Promise<AuditLogPage> {
  const severity = AUDIT_SEVERITIES.find((s) => s === query.severity);
  const path = `/audit-logs${queryString({
    severity,
    action: query.action?.trim(),
    actor: query.actor?.trim(),
    from: query.from,
    to: query.to,
    search: query.search?.trim(),
    per_page: query.perPage,
    page: query.page,
  })}`;

  const { rows, meta } = await upstreamList<Raw>(path, bearer(token));
  const entries = rows.map(mapAuditLogEntry);
  return { entries, meta: mapPageMeta(meta, entries.length) };
}

/* ------------------------------------------------------------------- team */

const TEAM_PATH = "/team";
const INVITE_ROLES: TeamRole[] = ["admin", "finance", "viewer"];

export async function getTeam(token: string): Promise<TeamMember[]> {
  const res = await upstream<{ data?: Raw[] }>(TEAM_PATH, { auth: bearer(token) });
  return (res.data ?? []).map(mapTeamMember);
}

export async function inviteTeamMember(
  token: string,
  payload: InviteTeamMemberPayload,
): Promise<MessageResponse> {
  const email = payload.email?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new UpstreamError("Enter a valid email address.", 422);
  }
  // Upstream validates the role case-sensitively against admin|finance|viewer.
  const role = INVITE_ROLES.find((r) => r === payload.role?.toLowerCase());
  if (!role) {
    throw new UpstreamError("Choose a role for this teammate.", 422);
  }
  const res = await upstream<{ message?: string }>(`${TEAM_PATH}/invite`, {
    method: "POST",
    auth: bearer(token),
    body: { email, role },
  });
  return { message: res.message ?? "Invitation sent" };
}

/**
 * Public: completes an invited teammate's signup from the emailed token. No
 * session exists yet, so this goes out with the ApiKey like the /auth routes.
 */
export async function acceptTeamInvite(payload: AcceptInvitePayload): Promise<MessageResponse> {
  const requireField = (value: unknown, message: string): string => {
    const s = typeof value === "string" ? value.trim() : "";
    if (!s) throw new UpstreamError(message, 422);
    return s;
  };

  const password = typeof payload.password === "string" ? payload.password : "";
  if (password.length < 6) {
    throw new UpstreamError("Password must be at least 6 characters.", 422);
  }
  if (password !== payload.password_confirmation) {
    throw new UpstreamError("Passwords do not match.", 422);
  }

  const res = await upstream<{ message?: string }>(`${TEAM_PATH}/invite/accept`, {
    method: "POST",
    auth: { kind: "apiKey" },
    body: {
      token: requireField(payload.token, "This invite link is missing its token."),
      name: requireField(payload.name, "Your name is required."),
      phone_number: requireField(payload.phone_number, "Phone number is required."),
      password,
      // Undocumented in Swagger but required by the API.
      password_confirmation: password,
    },
  });
  return { message: res.message ?? "Invitation accepted. You can now log in." };
}

export async function removeTeamMember(
  token: string,
  memberId: string,
): Promise<MessageResponse> {
  if (!memberId) throw new UpstreamError("Member id is required.", 422);
  const res = await upstream<{ message?: string }>(
    `${TEAM_PATH}/${encodeURIComponent(memberId)}`,
    { method: "DELETE", auth: bearer(token) },
  );
  return { message: res.message ?? "Member removed" };
}

export async function changePassword(
  token: string,
  payload: ChangePasswordPayload,
): Promise<MessageResponse> {
  if (!payload.current_password) throw new UpstreamError("Current password is required.", 422);
  if (!payload.new_password || payload.new_password.length < 8) {
    throw new UpstreamError("New password must be at least 8 characters.", 422);
  }
  if (payload.new_password !== payload.new_password_confirmation) {
    throw new UpstreamError("New passwords do not match.", 422);
  }
  const res = await upstream<{ message?: string }>("/change-password", {
    method: "PUT",
    auth: bearer(token),
    body: payload,
  });
  return { message: res.message ?? "Password changed successfully" };
}
