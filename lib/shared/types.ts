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
  /** Human-readable action, e.g. "Regenerating Key". */
  action: string;
  /** High-level target area, e.g. "API", "Team". */
  target: string;
  targetEntity: string;
  targetId: string;
  ip: string;
  browser: string;
  severity: AuditSeverity;
  /** ISO timestamp. */
  createdAt: string;
}

/* -------------------------------------------------------------------- team */

export type TeamRole = "Owner" | "Admin" | "Finance" | "Viewer";

export interface TeamMember {
  id: string | number;
  name: string;
  email: string;
  role: TeamRole;
}

export interface InviteTeamMemberPayload {
  email: string;
  role: TeamRole;
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
