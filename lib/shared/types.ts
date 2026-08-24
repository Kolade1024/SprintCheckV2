/**
 * Domain types shared between the server-side BFF (app/api/*) and the client.
 *
 * These are the app's own normalized shapes — the BFF maps the upstream
 * SprintCheck API responses (Laravel `{status, message, data}` envelopes,
 * paginated lists, string numbers) into these before they reach the browser.
 */

export type VerificationStatus = "successful" | "failed";

export interface VerificationLog {
  id: string | number;
  /** Service that was called, e.g. "BVN", "NIN". */
  endpoint: string;
  /** Name of the person/entity that was verified, when available. */
  name: string;
  /** Where the request came from, e.g. "API" or "SDK". */
  source: string;
  status: VerificationStatus;
  /** ISO timestamp. */
  createdAt: string;
}

export interface WalletTransaction {
  id: string | number;
  description: string;
  kind: "Credit" | "Debit";
  amount: number;
  balanceBefore: number | null;
  balanceAfter: number | null;
  /** ISO timestamp. */
  createdAt: string;
}

export interface PricingService {
  /** Raw upstream service code, e.g. "CAC_BY_NAME" — stable lookup key. */
  code: string;
  name: string;
  category: string;
  country: string;
  cost: number;
  popular?: boolean;
}

export interface ApiCallStats {
  total: number;
  successful: number;
  failed: number;
}

export interface VirtualAccount {
  account_number: string;
  bank_name: string;
  customer_name?: string;
  currency_code?: string;
  status?: string;
}

export interface BusinessProfile {
  id: number;
  name: string;
  confidence_level: string | null;
  webhook_url: string | null;
  api_key: string | null;
  test_api_key: string | null;
  encryption_key: string | null;
  business_email: string | null;
  business_phone_number: string | null;
  business_registration_number: string | null;
  business_address: string | null;
  city: string | null;
  business_description: string | null;
  country: string | null;
  tax_identification_number: string | null;
  business_website: string | null;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
  /** ISO timestamp of account creation — drives "Member since". */
  created_at: string | null;
  business: BusinessProfile | null;
}

export interface DashboardSummary {
  user: UserProfile | null;
  wallet_balance: number;
  virtual_accounts: VirtualAccount[];
  api_calls: ApiCallStats;
}

export interface Country {
  code: string;
  name: string;
}

/** One row of GET /dashboard/stats — the API returns the last 8 days only. */
export interface DailyVerificationStat {
  /** `YYYY-MM-DD`. */
  date: string;
  successful: number;
  failed: number;
}

/* --------------------------------------------------------------- account */

/** Upstream reports `two_factor_status` as off | pending | on. */
export type TwoFactorStatus = "off" | "pending" | "on";

/** `none` until a deletion is scheduled, then `pending` through the grace period. */
export type DeletionStatus = "none" | "pending";

export interface AccountBusiness {
  id: number;
  name: string;
  walletBalance: number;
  confidenceLevel: string | null;
}

/**
 * GET /account — everything the settings screens need in one call: role, 2FA
 * state, photo, unread badge, funding fee and the business summary. Distinct
 * from `DashboardSummary`, which carries wallet/virtual-account/API-call stats.
 */
export interface AccountDetails {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  roleLabel: string;
  status: string;
  twoFactorEnabled: boolean;
  twoFactorStatus: TwoFactorStatus;
  deletionStatus: DeletionStatus;
  deletionScheduledAt: string | null;
  /**
   * Presigned object-storage URL that expires after an hour — always render
   * the value from a fresh /account load rather than persisting it.
   */
  profilePhotoUrl: string | null;
  unreadNotifications: number;
  fundingFee: number;
  business: AccountBusiness | null;
}

export interface FundingFee {
  fee: number;
  currency: string;
}

/* ---------------------------------------------------------- notifications */

export interface AppNotification {
  id: string;
  /** Machine code, e.g. "api_keys_regenerated". */
  type: string;
  title: string;
  body: string;
  /** Matching audit action, e.g. "api_keys.regenerated". */
  action: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

/** Upstream `meta` block on the flat-array paginated lists. */
export interface PageMeta {
  currentPage: number;
  lastPage: number;
  total: number;
}

export interface NotificationPage {
  items: AppNotification[];
  meta: PageMeta;
}

export interface RegeneratedKeys {
  id: number;
  api_key: string;
  test_api_key: string;
  encryption_key: string;
}

export interface MessageResponse {
  message: string;
}

/* ---------------------------------------------------------- cac verification */

/** The five lookups in the Merchant > Verification collection folder. */
export type CacLookupType = "name" | "profile" | "directors" | "shareholders" | "tin";

/** One match from POST /cac/name. Its `id` is the biz_id for drill-downs. */
export interface CacBusinessMatch {
  id: number;
  approvedName: string;
  rcNumber: string;
  classification: string;
  registrationDate: string;
  natureOfBusiness: string | null;
  active: boolean | null;
  companyType: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  email: string | null;
}

/**
 * Profile / directors / shareholders / TIN responses have no documented
 * shape, so the BFF passes their `data` through and the UI renders it
 * generically.
 */
export type CacRecord = Record<string, unknown>;

/* --------------------------------------------------------------- audit log */

export type AuditSeverity = "info" | "warning" | "critical";

export interface AuditLogEntry {
  id: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  /** Raw upstream action code, e.g. "api_keys.regenerated" — the filter key. */
  action: string;
  /** Prettified action for display, e.g. "API keys regenerated". */
  actionLabel: string;
  /** Target entity type, e.g. "business". */
  target: string;
  targetEntity: string;
  targetId: string;
  ip: string;
  browser: string;
  severity: AuditSeverity;
  /** Extra per-action context, e.g. `{ webhook_url }`. Shape varies by action. */
  metadata: Record<string, unknown>;
  /** ISO timestamp. */
  createdAt: string;
}

/** Server-side filters accepted by GET /audit-logs. */
export interface AuditLogQuery {
  severity?: AuditSeverity | "";
  action?: string;
  actor?: string;
  /** YYYY-MM-DD. */
  from?: string;
  /** YYYY-MM-DD. */
  to?: string;
  search?: string;
  perPage?: number;
  page?: number;
}

export interface AuditLogPage {
  entries: AuditLogEntry[];
  meta: PageMeta;
}

/* -------------------------------------------------------------------- team */

/** Wire values accepted by POST /team/invite — upstream validates lowercase. */
export type TeamRole = "admin" | "finance" | "viewer";

export type TeamMemberStatus = "active" | "invited" | "suspended";

export interface TeamMember {
  id: string | number;
  name: string;
  email: string;
  role: TeamRole;
  /** Upstream's display casing, e.g. "Viewer". */
  roleLabel: string;
  status: TeamMemberStatus;
  statusLabel: string;
  /** The business owner can't be removed. */
  isOwner: boolean;
  /** ISO timestamp, null when upstream omits it. */
  createdAt: string | null;
}

export interface InviteTeamMemberPayload {
  email: string;
  role: TeamRole;
}

/** Public invite completion — upstream also requires `password_confirmation`. */
export interface AcceptInvitePayload {
  token: string;
  name: string;
  phone_number: string;
  password: string;
  password_confirmation: string;
}

/* ------------------------------------------------------------ API payloads */

export interface LoginPayload {
  email: string;
  password: string;
  /** Extends the session cookie to 30 days. */
  remember?: boolean;
}

export interface SignupPayload {
  email: string;
  password: string;
  business_name: string;
  phone_number: string;
}

export interface UpdateProfilePayload {
  name: string;
  phone_number: string;
}

export interface UpdateBusinessPayload {
  business_email?: string;
  business_phone_number?: string;
  business_registration_number?: string;
  business_address?: string;
  city?: string;
  business_description?: string;
  country?: string;
  tax_identification_number?: string;
  business_website?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

/**
 * POST /auth/login answers with either a token (signed in) or
 * `two_factor_required`, in which case a code is emailed and the caller must
 * finish through POST /auth/two-factor/verify.
 */
export interface LoginResponse extends MessageResponse {
  twoFactorRequired: boolean;
}

/* ------------------------------------------------------------------ support */

/** Ticket category, from the public GET /support-topics list. */
export interface SupportTopic {
  id: number;
  name: string;
  slug: string;
}

export type SupportTicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface SupportTicket {
  id: number;
  fullname: string;
  email: string;
  company: string | null;
  topic: SupportTopic | null;
  message: string;
  status: SupportTicketStatus;
  /** Only present when upstream eager-counts replies; null on the detail view. */
  repliesCount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketPage {
  items: SupportTicket[];
  meta: PageMeta;
}

export interface TicketReply {
  id: number;
  senderType: "admin" | "customer";
  senderName: string;
  senderEmail: string;
  message: string;
  createdAt: string;
}

/** Body for the public POST /support-tickets. */
export interface SubmitTicketPayload {
  fullname: string;
  email: string;
  company?: string;
  topic_id: number;
  message: string;
}
