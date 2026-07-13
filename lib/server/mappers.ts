import type {
  AuditLogEntry,
  BusinessProfile,
  CacBusinessMatch,
  Country,
  DashboardSummary,
  PricingService,
  RegeneratedKeys,
  TeamMember,
  UserProfile,
  VerificationLog,
  VerificationStatus,
  VirtualAccount,
  WalletTransaction,
} from "@/lib/shared/types";

/**
 * Upstream → domain mapping. All the tolerance for the upstream API's
 * loose typing (string numbers, alternate key names, missing fields) lives
 * here so the rest of the app works with clean, typed shapes.
 */

type Raw = Record<string, unknown>;

function str(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function num(value: unknown, fallback = 0): number {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

function numOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = num(value, Number.NaN);
  return Number.isNaN(n) ? null : n;
}

/** First present-and-non-empty value among alternate upstream key names. */
function pick(raw: Raw, keys: string[]): unknown {
  for (const key of keys) {
    const value = raw[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

/* -------------------------------------------------------------- dashboard */

function mapBusiness(raw: Raw | null | undefined): BusinessProfile | null {
  if (!raw) return null;
  return {
    id: num(raw.id),
    name: str(raw.name),
    confidence_level: raw.confidence_level == null ? null : str(raw.confidence_level),
    webhook_url: raw.webhook_url == null ? null : str(raw.webhook_url),
    api_key: raw.api_key == null ? null : str(raw.api_key),
    test_api_key: raw.test_api_key == null ? null : str(raw.test_api_key),
    encryption_key: raw.encryption_key == null ? null : str(raw.encryption_key),
    business_email: raw.business_email == null ? null : str(raw.business_email),
    business_phone_number:
      raw.business_phone_number == null ? null : str(raw.business_phone_number),
    business_registration_number:
      raw.business_registration_number == null ? null : str(raw.business_registration_number),
    business_address: raw.business_address == null ? null : str(raw.business_address),
    city: raw.city == null ? null : str(raw.city),
    business_description:
      raw.business_description == null ? null : str(raw.business_description),
    country: raw.country == null ? null : str(raw.country),
    tax_identification_number:
      raw.tax_identification_number == null ? null : str(raw.tax_identification_number),
    business_website: raw.business_website == null ? null : str(raw.business_website),
  };
}

function mapUser(raw: Raw | null | undefined): UserProfile | null {
  if (!raw) return null;
  return {
    id: num(raw.id),
    name: str(raw.name),
    email: str(raw.email),
    phone_number: raw.phone_number == null ? null : str(raw.phone_number),
    created_at: raw.created_at == null ? null : str(raw.created_at),
    business: mapBusiness(raw.business as Raw | null | undefined),
  };
}

export function mapVirtualAccount(raw: Raw): VirtualAccount {
  return {
    account_number: str(pick(raw, ["account_number", "accountNumber"])),
    bank_name: str(pick(raw, ["bank_name", "bankName"])),
    customer_name: str(pick(raw, ["customer_name", "account_name", "customerName"])),
    currency_code: str(pick(raw, ["currency_code", "currency"]), "NGN"),
    status: str(raw.status, "active"),
  };
}

export function mapDashboardSummary(data: Raw): DashboardSummary {
  const accounts = Array.isArray(data.virtual_accounts) ? data.virtual_accounts : [];
  const calls = (data.api_calls ?? {}) as Raw;
  return {
    user: mapUser(data.user as Raw | null | undefined),
    wallet_balance: num(data.wallet_balance),
    virtual_accounts: accounts.map((a) => mapVirtualAccount(a as Raw)),
    api_calls: {
      total: num(calls.total),
      successful: num(calls.successful),
      failed: num(calls.failed),
    },
  };
}

/* ---------------------------------------------------------------- history */

function normalizeStatus(value: unknown): VerificationStatus {
  const s = str(value).toLowerCase();
  return s === "successful" || s === "success" || s === "1" || s === "true"
    ? "successful"
    : "failed";
}

export function mapVerificationLog(raw: Raw): VerificationLog {
  return {
    id: str(pick(raw, ["id", "reference", "request_id"])),
    endpoint: str(pick(raw, ["type", "service", "endpoint", "verification_type"])).toUpperCase(),
    name: str(pick(raw, ["name", "full_name", "customer_name", "subject"])),
    source: str(pick(raw, ["source", "channel", "mode"]), "API").toUpperCase(),
    status: normalizeStatus(pick(raw, ["status", "state"])),
    createdAt: str(pick(raw, ["created_at", "createdAt", "date"])),
  };
}

/* ----------------------------------------------------------------- wallet */

export function mapWalletTransaction(raw: Raw): WalletTransaction {
  const type = str(pick(raw, ["type", "transaction_type", "kind"])).toLowerCase();
  const amount = num(pick(raw, ["amount", "value"]));
  const kind: WalletTransaction["kind"] =
    type === "credit" || (type === "" && amount > 0) ? "Credit" : "Debit";
  return {
    id: str(pick(raw, ["id", "reference", "transaction_id"])),
    description: str(
      pick(raw, ["description", "narration", "note", "reason"]),
      kind === "Credit" ? "Wallet top-up" : "Verification charge",
    ),
    kind,
    amount: Math.abs(amount),
    balanceBefore: numOrNull(pick(raw, ["pre_balance", "previous_balance", "balance_before"])),
    balanceAfter: numOrNull(pick(raw, ["post_balance", "new_balance", "balance_after"])),
    createdAt: str(pick(raw, ["created_at", "createdAt", "date"])),
  };
}

/* ---------------------------------------------------------------- pricing */

/**
 * The upstream /pricing rows carry only `{ service, fee }`, so the display
 * metadata (readable name, category, popularity) is a presentation concern
 * catalogued here. Unknown services fall back to a prettified code.
 */
const SERVICE_META: Record<string, { name: string; category: string; popular?: boolean }> = {
  BVN: { name: "BVN Verification", category: "Identity", popular: true },
  NIN: { name: "NIN Verification", category: "Identity", popular: true },
  VOTERS: { name: "Voter's Card", category: "Documents" },
  PASSPORT: { name: "International Passport", category: "Documents" },
  DRIVERLICENSE: { name: "Driver's License", category: "Documents" },
  FACIAL: { name: "Facial Verification", category: "Biometrics" },
  FACE_DETECTION: { name: "Face Detection", category: "Biometrics" },
  FACE_LIVENESS: { name: "Face Liveness", category: "Biometrics" },
  FACE_COMPARE: { name: "Face Compare", category: "Biometrics" },
  CAC_BY_NAME: { name: "CAC Search by Name", category: "Business" },
  CAC_PROFILE: { name: "CAC Company Profile", category: "Business" },
  CAC_DIRECTORS: { name: "CAC Directors", category: "Business" },
  CAC_SHAREHOLDERS: { name: "CAC Shareholders", category: "Business" },
  TIN: { name: "TIN Verification", category: "Business" },
};

function prettifyServiceCode(code: string): string {
  return code
    .toLowerCase()
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function mapPricingService(raw: Raw): PricingService {
  const code = str(pick(raw, ["service", "name"])).toUpperCase();
  const meta = SERVICE_META[code] ?? { name: prettifyServiceCode(code), category: "Other" };
  return {
    code,
    name: meta.name,
    category: meta.category,
    country: "Nigeria",
    cost: num(pick(raw, ["fee", "cost", "price"])),
    popular: meta.popular,
  };
}

/* --------------------------------------------------------- cac verification */

export function mapCacBusinessMatch(raw: Raw): CacBusinessMatch {
  return {
    id: num(raw.id),
    approvedName: str(pick(raw, ["approved_name", "approvedName", "name"])),
    rcNumber: str(pick(raw, ["rc_number", "rcNumber"])),
    classification: str(pick(raw, ["classification", "company_type_name"])),
    registrationDate: str(pick(raw, ["registration_date", "registrationDate"])),
    natureOfBusiness:
      raw.nature_of_business_name == null ? null : str(raw.nature_of_business_name),
    active: typeof raw.active === "boolean" ? raw.active : null,
    companyType: raw.company_type_name == null ? null : str(raw.company_type_name),
    address:
      raw.address == null && raw.head_office_address == null
        ? null
        : str(pick(raw, ["address", "head_office_address"])),
    city: raw.city == null ? null : str(raw.city),
    state: raw.state == null ? null : str(raw.state),
    email: raw.email == null ? null : str(raw.email),
  };
}

/** Upstream marks disabled services with status 0 — hide them from merchants. */
export function isActivePricingRow(raw: Raw): boolean {
  return raw.status === undefined || num(raw.status, 1) === 1;
}

/* -------------------------------------------------------- audit log / team */

function normalizeSeverity(value: unknown): AuditLogEntry["severity"] {
  const s = str(value).toLowerCase();
  if (s === "critical" || s === "danger" || s === "high") return "critical";
  if (s === "warning" || s === "medium") return "warning";
  return "info";
}

export function mapAuditLogEntry(raw: Raw): AuditLogEntry {
  const actor = (raw.actor ?? raw.user ?? {}) as Raw;
  return {
    id: str(pick(raw, ["id", "reference", "log_id"])),
    actorName: str(pick(raw, ["actor_name", "user_name"]) ?? pick(actor, ["name"])),
    actorEmail: str(pick(raw, ["actor_email", "user_email"]) ?? pick(actor, ["email"])),
    actorRole: str(pick(raw, ["actor_role", "role"]) ?? pick(actor, ["role"]), "Member"),
    action: str(pick(raw, ["action", "activity", "title"])),
    target: str(pick(raw, ["target", "target_type", "module"])),
    targetEntity: str(pick(raw, ["target_entity", "entity", "target_name"])),
    targetId: str(pick(raw, ["target_id", "entity_id", "reference"])),
    ip: str(pick(raw, ["ip", "ip_address"])),
    browser: str(pick(raw, ["browser", "user_agent", "device"])),
    severity: normalizeSeverity(pick(raw, ["severity", "level"])),
    createdAt: str(pick(raw, ["created_at", "createdAt", "time", "date"])),
  };
}

const TEAM_ROLES: TeamMember["role"][] = ["Owner", "Admin", "Finance", "Viewer"];

export function mapTeamMember(raw: Raw): TeamMember {
  const roleRaw = str(pick(raw, ["role", "permission"]), "Viewer").toLowerCase();
  const role =
    TEAM_ROLES.find((r) => r.toLowerCase() === roleRaw) ??
    (roleRaw === "owner" || roleRaw === "admin" ? "Admin" : "Viewer");
  return {
    id: str(pick(raw, ["id", "member_id"])),
    name: str(pick(raw, ["name", "full_name"])),
    email: str(pick(raw, ["email"])),
    role,
  };
}

/* ------------------------------------------------------------------ misc */

export function mapCountry(raw: Raw): Country {
  return { code: str(raw.code), name: str(raw.name) };
}

export function mapRegeneratedKeys(data: Raw): RegeneratedKeys {
  return {
    id: num(data.id),
    api_key: str(data.api_key),
    test_api_key: str(data.test_api_key),
    encryption_key: str(data.encryption_key),
  };
}
