import { request } from "./http";
import type {
  AuditLogEntry,
  CacBusinessMatch,
  CacRecord,
  ChangePasswordPayload,
  Country,
  DashboardSummary,
  InviteTeamMemberPayload,
  LoginPayload,
  MessageResponse,
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
  login: (payload: LoginPayload) =>
    request<MessageResponse>("/auth/login", { method: "POST", body: payload }),

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

  logout: () => request<MessageResponse>("/auth/logout", { method: "POST" }),
};

export const appApi = {
  dashboard: (signal?: AbortSignal) => request<DashboardSummary>("/dashboard", { signal }),

  dashboardStats: (signal?: AbortSignal) => request<unknown>("/dashboard/stats", { signal }),

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

  auditLogs: (signal?: AbortSignal) => request<AuditLogEntry[]>("/audit-logs", { signal }),

  team: (signal?: AbortSignal) => request<TeamMember[]>("/team", { signal }),

  inviteTeamMember: (payload: InviteTeamMemberPayload) =>
    request<MessageResponse>("/team", { method: "POST", body: payload }),

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
