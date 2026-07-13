"use client";

import { useRef, useState, type ComponentType, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppData } from "@/lib/client/AppDataProvider";
import { appApi } from "@/lib/client/endpoints";
import { useApi } from "@/lib/client/useApi";
import { EmptyState, ErrorState, LoadingState } from "@/components/dashboard/AsyncState";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import type { TeamMember, TeamRole } from "@/lib/shared/types";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  Camera,
  Eye,
  EyeOff,
  Globe,
  Headset,
  Key,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  ShieldCheck,
  Trash,
  User,
  Users,
  ChevronDown,
  X,
  type IconProps,
} from "@/components/icons";

const TABS = ["Profile", "Business info", "Security", "Team"] as const;
type Tab = (typeof TABS)[number];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

type Notice = { kind: "success" | "error"; message: string };

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function NoticeBanner({ notice }: { notice: Notice }) {
  return (
    <p
      role="status"
      className={`text-small font-medium ${
        notice.kind === "success" ? "text-success" : "text-red-600"
      }`}
    >
      {notice.message}
    </p>
  );
}

/* --------------------------------------------------------------- field UI */

function Field({
  label,
  icon: Icon,
  name,
  defaultValue,
  type = "text",
  trailing,
}: {
  label: string;
  icon: ComponentType<IconProps>;
  name?: string;
  defaultValue?: string;
  type?: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-base font-medium text-ink">{label}</label>
      <div className="flex h-14 items-center gap-3 rounded-2xl border border-line bg-subtle px-4 transition-colors focus-within:border-brand focus-within:bg-white">
        <Icon className="h-5 w-5 shrink-0 text-body" />
        <input
          type={type}
          name={name}
          defaultValue={defaultValue}
          className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-body/60"
        />
        {trailing}
      </div>
    </div>
  );
}

function TextAreaField({
  label,
  icon: Icon,
  name,
  defaultValue,
}: {
  label: string;
  icon?: ComponentType<IconProps>;
  name?: string;
  defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-2 md:col-span-2">
      <label className="text-base font-medium text-ink">{label}</label>
      <div className="flex gap-3 rounded-2xl border border-line bg-subtle px-4 py-3.5 transition-colors focus-within:border-brand focus-within:bg-white">
        {Icon && <Icon className="mt-0.5 h-5 w-5 shrink-0 text-body" />}
        <textarea
          rows={3}
          name={name}
          defaultValue={defaultValue}
          className="min-w-0 flex-1 resize-none bg-transparent text-base text-ink outline-none"
        />
      </div>
    </div>
  );
}

function SaveButton({
  children = "Save profile",
  loading = false,
}: {
  children?: ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="mt-8 flex justify-end">
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-brand px-6 text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Save className="h-4 w-4" />
        {loading ? "Saving…" : children}
      </button>
    </div>
  );
}

/* --------------------------------------------------------------- profile card */

function memberSince(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

function ProfileCard() {
  const { summary } = useAppData();
  const user = summary?.user;
  const name = user?.name || "Your account";
  const email = user?.email || "";
  const business = user?.business;

  const stats: { label: string; value: ReactNode }[] = [
    {
      label: "Plan",
      // The API has no plan field yet — the business name is the closest
      // account identity we can show truthfully.
      value: <span className="font-semibold text-ink">{business?.name || "—"}</span>,
    },
    {
      label: "Member since",
      value: (
        <span className="font-semibold text-ink">{memberSince(user?.created_at)}</span>
      ),
    },
    {
      label: "2FA",
      value: (
        <span className="inline-flex items-center gap-1 rounded-pill bg-star/10 px-2.5 py-1 text-stat-label font-semibold text-star">
          <AlertTriangle className="h-3.5 w-3.5" />
          Off
        </span>
      ),
    },
  ];

  return (
    <motion.aside
      {...fadeUp}
      transition={{ duration: 0.5, delay: 0.05, ease: [0.4, 0, 0.2, 1] }}
      className="w-full shrink-0 rounded-panel border border-line bg-white p-7 shadow-glass lg:w-[340px]"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="flex h-28 w-28 items-center justify-center rounded-pill bg-brand text-[32px] font-bold text-offwhite shadow-glow ring-4 ring-white">
            {initialsOf(name)}
          </div>
          <button
            type="button"
            aria-label="Change photo"
            className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-pill bg-brand text-offwhite ring-4 ring-white transition-transform hover:scale-105"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>

        <h2 className="mt-5 text-card-title font-bold text-ink">{name}</h2>
        <p className="text-small text-body">{email}</p>

        <span className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-subtle px-3 py-1.5 text-small font-medium text-brand-accent">
          <BadgeCheck className="h-4 w-4" />
          Verified business
        </span>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-btn bg-subtle text-small font-medium text-brand-accent transition-colors hover:bg-brand/10"
        >
          <Camera className="h-4 w-4" />
          Upload
        </button>
        <button
          type="button"
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-btn text-small font-medium text-red-500 transition-colors hover:bg-red-50"
        >
          <Trash className="h-4 w-4" />
          Remove
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-line pt-6">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <span className="text-small text-body">{s.label}</span>
            <span className="text-small">{s.value}</span>
          </div>
        ))}
      </div>
    </motion.aside>
  );
}

/* --------------------------------------------------------------- 2FA modal */

function TwoFactorModal({ onClose }: { onClose: () => void }) {
  const LEN = 6;
  const [digits, setDigits] = useState<string[]>(Array(LEN).fill(""));
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const complete = digits.join("").length === LEN;

  function handleChange(i: number, raw: string) {
    const value = raw.replace(/\D/g, "");
    if (!value) {
      setDigits((p) => p.map((d, idx) => (idx === i ? "" : d)));
      return;
    }
    const chars = value.split("");
    setDigits((p) => {
      const next = [...p];
      for (let k = 0; k < chars.length && i + k < LEN; k++) next[i + k] = chars[k];
      return next;
    });
    inputs.current[Math.min(i + chars.length, LEN - 1)]?.focus();
  }

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-[520px] rounded-hero bg-white p-8 shadow-glass"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-btn text-body transition-colors hover:bg-black/5 hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-brand text-offwhite shadow-glow">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h3 className="text-card-title font-bold text-ink">Set up two-factor auth</h3>
            <p className="text-small text-body">Takes about 60 seconds.</p>
          </div>
        </div>

        <p className="mt-6 text-base text-body">
          Enter the 6-digit code we sent to{" "}
          <span className="font-medium text-ink">odejinmemmanuel@gmail.com</span>.
        </p>

        <div className="mt-5 flex items-center justify-center gap-3">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={LEN}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              aria-label={`Digit ${i + 1}`}
              className="h-16 w-16 rounded-2xl border border-line bg-subtle text-center text-[22px] font-semibold text-ink outline-none transition-colors focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
            />
          ))}
        </div>

        <div className="mt-7 flex items-center justify-center gap-3">
          <button
            type="button"
            className="inline-flex h-12 items-center justify-center rounded-btn bg-subtle px-6 text-base font-medium text-brand-accent transition-colors hover:bg-brand/10"
          >
            Resend
          </button>
          <button
            type="button"
            disabled={!complete}
            onClick={onClose}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-brand px-6 text-base font-medium text-offwhite shadow-glow transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            Verify
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* --------------------------------------------------------------- tab panels */

function ProfilePanel() {
  const { summary, refresh } = useAppData();
  const user = summary?.user;
  const business = user?.business;
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  // Backed by PUT /profile, which accepts `name` and `phone_number`. Email is
  // shown for reference (no endpoint changes it); country and about belong to
  // the business record and are edited under "Business info".
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name")?.toString().trim() ?? "";
    const phone = data.get("phone_number")?.toString().trim() ?? "";

    if (!name) {
      setNotice({ kind: "error", message: "Your name is required." });
      return;
    }

    setSubmitting(true);
    setNotice(null);
    try {
      const res = await appApi.updateProfile({ name, phone_number: phone });
      setNotice({ kind: "success", message: res.message ?? "Profile updated." });
      refresh();
    } catch (err) {
      setNotice({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not update your profile.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field
          key={user?.name}
          label="Your name"
          icon={User}
          name="name"
          defaultValue={user?.name ?? ""}
        />
        <Field
          key={user?.phone_number}
          label="Phone number"
          icon={Phone}
          name="phone_number"
          defaultValue={user?.phone_number ?? ""}
        />
        <Field
          key={user?.email}
          label="Email address"
          icon={Mail}
          type="email"
          defaultValue={user?.email ?? ""}
        />
        <Field
          key={business?.country}
          label="Country"
          icon={Globe}
          defaultValue={business?.country ?? ""}
        />
        <TextAreaField
          key={business?.business_description}
          label="About"
          defaultValue={business?.business_description ?? ""}
        />
      </div>
      {notice && (
        <div className="mt-6">
          <NoticeBanner notice={notice} />
        </div>
      )}
      <SaveButton loading={submitting} />
    </form>
  );
}

function BusinessPanel() {
  const { summary, refresh } = useAppData();
  const business = summary?.user?.business;
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const value = (key: string) => data.get(key)?.toString().trim() ?? "";
    setSubmitting(true);
    setNotice(null);
    try {
      await appApi.updateBusiness({
        business_registration_number: value("business_registration_number"),
        business_website: value("business_website"),
        city: value("city"),
        country: value("country"),
        tax_identification_number: value("tax_identification_number"),
        business_description: value("business_description"),
        // The upstream API requires these two even though the form focuses on
        // registration details — default them from the account when blank.
        business_email: value("business_email") || summary?.user?.email || "",
        business_phone_number: summary?.user?.phone_number ?? "",
      });
      setNotice({ kind: "success", message: "Business profile updated." });
      refresh();
    } catch (err) {
      setNotice({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not update business profile.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field
          key={business?.name}
          label="Business name"
          icon={Building2}
          defaultValue={business?.name ?? ""}
        />
        <Field
          key={business?.business_registration_number}
          label="RC number"
          icon={BadgeCheck}
          name="business_registration_number"
          defaultValue={business?.business_registration_number ?? ""}
        />
        <Field
          key={business?.business_website}
          label="Website"
          icon={Globe}
          name="business_website"
          type="url"
          defaultValue={business?.business_website ?? ""}
        />
        <Field
          key={business?.business_email}
          label="Support email"
          icon={Headset}
          name="business_email"
          type="email"
          defaultValue={business?.business_email ?? ""}
        />
        <Field
          key={business?.city}
          label="City"
          icon={MapPin}
          name="city"
          defaultValue={business?.city ?? ""}
        />
        <Field
          key={business?.country}
          label="Country"
          icon={Globe}
          name="country"
          defaultValue={business?.country ?? ""}
        />
        <Field
          key={business?.tax_identification_number}
          label="Tax identification number"
          icon={BadgeCheck}
          name="tax_identification_number"
          defaultValue={business?.tax_identification_number ?? ""}
        />
        <TextAreaField
          key={business?.business_description}
          label="Business description"
          icon={MessageSquare}
          name="business_description"
          defaultValue={business?.business_description ?? ""}
        />
      </div>
      {notice && (
        <div className="mt-6">
          <NoticeBanner notice={notice} />
        </div>
      )}
      <SaveButton loading={submitting}>Save business info</SaveButton>
    </form>
  );
}

function SecurityPanel({ onEnable2FA }: { onEnable2FA: () => void }) {
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const current = data.get("current_password")?.toString() ?? "";
    const next = data.get("new_password")?.toString() ?? "";
    const confirmation = data.get("new_password_confirmation")?.toString() ?? "";

    if (next !== confirmation) {
      setNotice({ kind: "error", message: "New passwords do not match." });
      return;
    }

    setSubmitting(true);
    setNotice(null);
    try {
      const res = await appApi.changePassword({
        current_password: current,
        new_password: next,
        new_password_confirmation: confirmation,
      });
      setNotice({ kind: "success", message: res.message ?? "Password changed." });
      form.reset();
    } catch (err) {
      setNotice({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not change password.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleChangePassword}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field
            label="Current password"
            icon={Key}
            name="current_password"
            type={show ? "text" : "password"}
            trailing={
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Hide password" : "Show password"}
                className="flex h-8 w-8 items-center justify-center rounded-btn text-body transition-colors hover:bg-black/5 hover:text-ink"
              >
                {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            }
          />
          <Field label="New password" icon={Key} name="new_password" type="password" />
          <Field
            label="Confirm new password"
            icon={Key}
            name="new_password_confirmation"
            type="password"
          />
        </div>
        {notice && (
          <div className="mt-6">
            <NoticeBanner notice={notice} />
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-btn bg-subtle px-5 text-base font-medium text-brand-accent transition-colors hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Lock className="h-4 w-4" />
            {submitting ? "Changing…" : "Change password"}
          </button>
        </div>
      </form>

      {/* 2FA */}
      <div className="rounded-2xl border border-line bg-subtle p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-star/10 text-star">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-card-title font-bold text-ink">Two-factor authentication</h3>
              <span className="inline-flex items-center gap-1 rounded-pill bg-star/10 px-2.5 py-1 text-stat-label font-semibold text-star">
                <AlertTriangle className="h-3.5 w-3.5" />
                Not enabled
              </span>
            </div>
            <p className="mt-1 text-small text-body">
              Protect your account with an authenticator app or SMS codes. Required for live API access.
            </p>

            <div className="mt-4 flex w-fit items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-card bg-subtle text-brand">
                <MessageSquare className="h-5 w-5" />
              </span>
              <div>
                <div className="text-base font-semibold text-ink">Email verification</div>
                <div className="text-stat-label text-body">One-time codes to your phone</div>
              </div>
            </div>

            <button
              type="button"
              onClick={onEnable2FA}
              className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-btn bg-brand px-5 text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px"
            >
              <ShieldCheck className="h-4 w-4" />
              Enable 2FA
            </button>
          </div>
        </div>
      </div>

      {/* Delete */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5">
        <div>
          <h3 className="text-card-title font-bold text-red-600">Delete account</h3>
          <p className="text-small text-red-500/80">
            Permanently remove your account and all associated data.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-btn bg-red-500 px-5 text-base font-medium text-white shadow-btn transition-colors hover:bg-red-600"
        >
          <Trash className="h-4 w-4" />
          Delete
        </button>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- team tab */

const INVITE_ROLES: TeamRole[] = ["Admin", "Finance", "Viewer"];

function InviteMemberModal({
  onClose,
  onInvited,
}: {
  onClose: () => void;
  onInvited: () => void;
}) {
  const [role, setRole] = useState<TeamRole>("Viewer");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email")?.toString().trim() ?? "";
    setSubmitting(true);
    setError(null);
    try {
      await appApi.inviteTeamMember({ email, role });
      onInvited();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the invitation.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Invite a team member"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-[480px] rounded-hero bg-white p-8 shadow-glass"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-btn text-body transition-colors hover:bg-black/5 hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-brand text-offwhite shadow-glow">
            <Users className="h-6 w-6" />
          </span>
          <div>
            <h3 className="text-card-title font-bold text-ink">Invite a team member</h3>
            <p className="text-small text-body">They&apos;ll get an email to join your workspace.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-base font-medium text-ink">Email address</label>
            <div className="flex h-14 items-center gap-3 rounded-2xl border border-line bg-subtle px-4 transition-colors focus-within:border-brand focus-within:bg-white">
              <Mail className="h-5 w-5 shrink-0 text-body" />
              <input
                type="email"
                name="email"
                required
                placeholder="teammate@company.com"
                className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-body/60"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-medium text-ink">Role</label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as TeamRole)}
                className="h-14 w-full appearance-none rounded-2xl border border-line bg-subtle px-4 pr-10 text-base text-ink outline-none transition-colors focus:border-brand focus:bg-white"
              >
                {INVITE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-small font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-brand px-6 text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Sending invite…" : "Send invite"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function TeamPanel() {
  const { data, loading, error, refetch } = useApi((signal) => appApi.team(signal));
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removing, setRemoving] = useState<TeamMember | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const members = data ?? [];

  async function confirmRemove() {
    if (!removing) return;
    setRemoveLoading(true);
    setRemoveError(null);
    try {
      await appApi.removeTeamMember(removing.id);
      setRemoving(null);
      refetch();
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : "Could not remove this member.");
    } finally {
      setRemoveLoading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-card-title font-bold text-ink">Team access</h3>
          <p className="text-small text-body">Invite collaborators and control what they can do.</p>
        </div>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="inline-flex h-12 items-center justify-center rounded-btn bg-brand px-6 text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px"
        >
          Invite member
        </button>
      </div>

      <div className="mt-6 border-t border-line">
        {loading ? (
          <LoadingState label="Loading your team…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : members.length === 0 ? (
          <EmptyState message="No team members yet. Invite a collaborator to get started." />
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="flex flex-wrap items-center gap-4 border-b border-line/70 py-5 last:border-0"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pill bg-subtle text-small font-bold text-brand-accent">
                {initialsOf(member.name || member.email)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-base font-semibold text-ink">
                  {member.name || member.email}
                </div>
                <div className="truncate text-small text-body">{member.email}</div>
              </div>
              <span className="inline-flex rounded-pill bg-subtle px-4 py-2 text-small font-medium text-ink">
                {member.role}
              </span>
              <button
                type="button"
                onClick={() => setRemoving(member)}
                disabled={member.role === "Owner"}
                title={member.role === "Owner" ? "The owner can't be removed" : undefined}
                className="text-base font-medium text-red-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {inviteOpen && (
          <InviteMemberModal onClose={() => setInviteOpen(false)} onInvited={refetch} />
        )}
        {removing && (
          <ConfirmDialog
            tone="danger"
            icon={Trash}
            title={`Remove ${removing.name || removing.email}?`}
            description="They'll immediately lose access to this workspace. You can invite them again later."
            confirmLabel="Remove member"
            loadingLabel="Removing…"
            cancelLabel="Keep member"
            loading={removeLoading}
            error={removeError}
            onConfirm={confirmRemove}
            onCancel={() => {
              setRemoving(null);
              setRemoveError(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ page */

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>("Profile");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <motion.div {...fadeUp} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }} className="mt-8">
            <h1 className="text-[34px] font-extrabold tracking-[-1px] text-gradient">
              Account Settings
            </h1>
            <p className="mt-1 text-lead text-body">
              Manage how SprintCheck represents you across the platform.
            </p>
          </motion.div>

          <div className="mt-8 flex flex-col gap-6 lg:flex-row">
            <ProfileCard />

            {/* Right card with tabs */}
            <motion.section
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.12, ease: [0.4, 0, 0.2, 1] }}
              className="min-w-0 flex-1 rounded-panel border border-line bg-white p-6 shadow-glass md:p-8"
            >
              <div className="inline-flex rounded-pill border border-line bg-subtle p-1">
                {TABS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className="relative rounded-pill px-5 py-2 text-base font-medium transition-colors"
                  >
                    {tab === t && (
                      <motion.span
                        layoutId="profile-tab"
                        className="absolute inset-0 rounded-pill bg-white shadow-card"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className={`relative ${tab === t ? "text-ink" : "text-body hover:text-ink"}`}>
                      {t}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-8">
                {tab === "Profile" && <ProfilePanel />}
                {tab === "Business info" && <BusinessPanel />}
                {tab === "Security" && <SecurityPanel onEnable2FA={() => setModalOpen(true)} />}
                {tab === "Team" && <TeamPanel />}
              </div>
            </motion.section>
          </div>

      <AnimatePresence>
        {modalOpen && <TwoFactorModal onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
