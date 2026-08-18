import { request } from "./http";
import type {
  AccountDetails,
  AcceptInvitePayload,
  AuditLogPage,
  AuditLogQuery,
  CacBusinessMatch,
  CacRecord,
  ChangePasswordPayload,
  Country,
  DailyVerificationStat,
  DashboardSummary,
  FundingFee,
  InviteTeamMemberPayload,
  LoginPayload,
  LoginResponse,
  MessageResponse,
  NotificationPage,
  PricingService,
  RegeneratedKeys,
  SignupPayload,
  TeamMember,
  UpdateBusinessPayload,
  UpdateProfilePayload,
  VerificationLog,
  VirtualAccount,
  WalletTransaction,
} from "@/lib/shared/types";

/**
 * The complete client-side API surface. Every call goes through the BFF
 * (app/api/*) — the browser never talks to the upstream SprintCheck API or
 * sees its credentials.
 */

export const authApi = {
  /** Resolves with `twoFactorRequired` when the account needs a code first. */
  login: (payload: LoginPayload) =>
    request<LoginResponse>("/auth/login", { method: "POST", body: payload }),

  /** Second login step — trades the emailed code for a session. */
  verifyLoginCode: (email: string, code: string, remember = false) =>
    request<MessageResponse>("/auth/two-factor", {
      method: "POST",
      body: { email, code, remember },
    }),

  signup: (payload: SignupPayload) =>
    request<MessageResponse>("/auth/signup", { method: "POST", body: payload }),

  forgotPassword: (email: string) =>
    request<MessageResponse>("/auth/forgot-password", { method: "POST", body: { email } }),

  verifyResetCode: (email: string, code: string) =>
    request<MessageResponse>("/auth/verify-reset-code", { method: "POST", body: { email, code } }),

  resetPassword: (email: string, code: string, password: string) =>
    request<MessageResponse>("/auth/reset-password", {
      method: "POST",
      body: { email, code, password },
    }),

  /** Public — completes an invited teammate's signup from the emailed token. */
  acceptTeamInvite: (payload: AcceptInvitePayload) =>
    request<MessageResponse>("/team/invite/accept", { method: "POST", body: payload }),

  logout: () => request<MessageResponse>("/auth/logout", { method: "POST" }),
};

function auditLogQuery(query: AuditLogQuery): string {
  const params = new URLSearchParams();
  const set = (key: string, value: string | number | undefined) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  };
  set("severity", query.severity || undefined);
  set("action", query.action);
  set("actor", query.actor);
  set("from", query.from);
  set("to", query.to);
  set("search", query.search);
  set("per_page", query.perPage);
  set("page", query.page);
  const search = params.toString();
  return search ? `?${search}` : "";
}

export const appApi = {
  dashboard: (signal?: AbortSignal) => request<DashboardSummary>("/dashboard", { signal }),

  dashboardStats: (signal?: AbortSignal) =>
    request<DailyVerificationStat[]>("/dashboard/stats", { signal }),

  history: (signal?: AbortSignal) => request<VerificationLog[]>("/history", { signal }),

  walletHistory: (signal?: AbortSignal) =>
    request<WalletTransaction[]>("/wallet-history", { signal }),

  pricing: (signal?: AbortSignal) => request<PricingService[]>("/pricing", { signal }),

  countries: (signal?: AbortSignal) => request<Country[]>("/countries", { signal }),

  updateWebhook: (webhookUrl: string) =>
    request<MessageResponse>("/update-webhook", {
      method: "POST",
      body: { webhook_url: webhookUrl },
    }),

  generateAccount: (bvn: string) =>
    request<VirtualAccount>("/generate-account", { method: "POST", body: { bvn } }),

  regenerateKeys: () => request<RegeneratedKeys>("/regenerate-keys", { method: "PUT" }),

  updateProfile: (payload: UpdateProfilePayload) =>
    request<MessageResponse>("/profile", { method: "PUT", body: payload }),

  updateBusiness: (payload: UpdateBusinessPayload) =>
    request<MessageResponse>("/business", { method: "PUT", body: payload }),

  changePassword: (payload: ChangePasswordPayload) =>
    request<MessageResponse>("/change-password", { method: "PUT", body: payload }),

  /* ------------------------------------------------------------- account */

  account: (signal?: AbortSignal) => request<AccountDetails>("/account", { signal }),

  fundingFee: (signal?: AbortSignal) => request<FundingFee>("/wallet/funding-fee", { signal }),

  enableTwoFactor: () =>
    request<MessageResponse>("/account/two-factor/enable", { method: "POST" }),

  verifyTwoFactor: (code: string) =>
    request<MessageResponse>("/account/two-factor/verify", { method: "POST", body: { code } }),

  resendTwoFactorCode: () =>
    request<MessageResponse>("/account/two-factor/resend", { method: "POST" }),

  disableTwoFactor: (code: string) =>
    request<MessageResponse>("/account/two-factor/disable", { method: "POST", body: { code } }),

  uploadProfilePhoto: (file: File) => {
    const form = new FormData();
    form.append("image", file);
    return request<MessageResponse & { profilePhotoUrl: string | null }>(
      "/account/profile-photo",
      { method: "POST", body: form },
    );
  },

  removeProfilePhoto: () =>
    request<MessageResponse>("/account/profile-photo", { method: "DELETE" }),

  requestAccountDeletion: (password: string) =>
    request<MessageResponse & { deletionScheduledAt: string | null }>(
      "/account/deletion-request",
      { method: "POST", body: { password } },
    ),

  cancelAccountDeletion: () =>
    request<MessageResponse>("/account/deletion-request", { method: "DELETE" }),

  /* ------------------------------------------------------- notifications */

  notifications: (page = 1, signal?: AbortSignal) =>
    request<NotificationPage>(`/notifications?page=${page}`, { signal }),

  markNotificationsRead: (ids: string[]) =>
    request<MessageResponse>("/notifications/read", { method: "POST", body: { ids } }),

  markAllNotificationsRead: () =>
    request<MessageResponse>("/notifications/read-all", { method: "POST" }),

  /* ------------------------------------------------------ audit log/team */

  auditLogs: (query: AuditLogQuery = {}, signal?: AbortSignal) =>
    request<AuditLogPage>(`/audit-logs${auditLogQuery(query)}`, { signal }),

  team: (signal?: AbortSignal) => request<TeamMember[]>("/team", { signal }),

  inviteTeamMember: (payload: InviteTeamMemberPayload) =>
    request<MessageResponse>("/team/invite", { method: "POST", body: payload }),

  removeTeamMember: (memberId: string | number) =>
    request<MessageResponse>(`/team/${encodeURIComponent(String(memberId))}`, {
      method: "DELETE",
    }),

  /** Merchant > Verification lookups — each call is billed to the wallet. */
  cacNameSearch: (name: string) =>
    request<CacBusinessMatch[]>("/verification/name", { method: "POST", body: { name } }),

  cacProfileSearch: (number: string) =>
    request<CacRecord>("/verification/profile", { method: "POST", body: { number } }),

  cacDirectorsLookup: (bizId: number) =>
    request<unknown>("/verification/directors", { method: "POST", body: { biz_id: bizId } }),

  cacShareholdersLookup: (bizId: number) =>
    request<unknown>("/verification/shareholders", { method: "POST", body: { biz_id: bizId } }),

  cacTinSearch: (number: string) =>
    request<CacRecord>("/verification/tin", { method: "POST", body: { number } }),
};
