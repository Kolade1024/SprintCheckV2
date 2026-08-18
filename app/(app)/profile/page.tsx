"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppData } from "@/lib/client/AppDataProvider";
import { appApi } from "@/lib/client/endpoints";
import { useApi } from "@/lib/client/useApi";
import { EmptyState, ErrorState, LoadingState } from "@/components/dashboard/AsyncState";
import Avatar from "@/components/dashboard/Avatar";
import CodeInput from "@/components/dashboard/CodeInput";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import Select from "@/components/dashboard/Select";
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

/** Upstream caps uploads at a few MB; mirror that before spending a request. */
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

function ProfileCard() {
  const { summary, account, refresh } = useAppData();
  const user = summary?.user;
  const name = account?.name || user?.name || "Your account";
  const email = account?.email || user?.email || "";
  const business = user?.business;
  const fileInput = useRef<HTMLInputElement>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoNotice, setPhotoNotice] = useState<Notice | null>(null);

  const twoFactorOn = account?.twoFactorEnabled ?? false;

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset immediately so re-picking the same file still fires a change.
    event.target.value = "";
    if (!file) return;

    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoNotice({ kind: "error", message: "That image is larger than 4MB." });
      return;
    }

    setPhotoBusy(true);
    setPhotoNotice(null);
    try {
      await appApi.uploadProfilePhoto(file);
      setPhotoNotice({ kind: "success", message: "Photo updated." });
      refresh();
    } catch (err) {
      setPhotoNotice({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not upload that photo.",
      });
    } finally {
      setPhotoBusy(false);
    }
  }

  async function removePhoto() {
    setPhotoBusy(true);
    setPhotoNotice(null);
    try {
      await appApi.removeProfilePhoto();
      setPhotoNotice({ kind: "success", message: "Photo removed." });
      refresh();
    } catch (err) {
      setPhotoNotice({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not remove your photo.",
      });
    } finally {
      setPhotoBusy(false);
    }
  }

  const stats: { label: string; value: ReactNode }[] = [
    {
      label: "Role",
      value: <span className="font-semibold text-ink">{account?.roleLabel || "—"}</span>,
    },
    {
      label: "Member since",
      value: (
        <span className="font-semibold text-ink">{memberSince(user?.created_at)}</span>
      ),
    },
    {
      label: "2FA",
      value: twoFactorOn ? (
        <span className="inline-flex items-center gap-1 rounded-pill bg-success/10 px-2.5 py-1 text-stat-label font-semibold text-success">
          <ShieldCheck className="h-3.5 w-3.5" />
          On
        </span>
      ) : (
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
          <Avatar
            name={name}
            src={account?.profilePhotoUrl}
            letters={2}
            className="h-28 w-28 shadow-glow ring-4 ring-white"
            textClassName="text-[32px] font-bold"
          />
          <button
            type="button"
            aria-label="Change photo"
            disabled={photoBusy}
            onClick={() => fileInput.current?.click()}
            className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-pill bg-brand text-offwhite ring-4 ring-white transition-transform hover:scale-105 disabled:opacity-60"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>

        <h2 className="mt-5 text-card-title font-bold text-ink">{name}</h2>
        <p className="text-small text-body">{email}</p>

        <span className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-subtle px-3 py-1.5 text-small font-medium text-brand-accent">
          <BadgeCheck className="h-4 w-4" />
          {business?.name || "Your business"}
        </span>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
      />

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          disabled={photoBusy}
          onClick={() => fileInput.current?.click()}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-btn bg-subtle text-small font-medium text-brand-accent transition-colors hover:bg-brand/10 disabled:opacity-60"
        >
          <Camera className="h-4 w-4" />
          {photoBusy ? "Working…" : "Upload"}
        </button>
        <button
          type="button"
          disabled={photoBusy || !account?.profilePhotoUrl}
          onClick={removePhoto}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-btn text-small font-medium text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash className="h-4 w-4" />
          Remove
        </button>
      </div>

      {photoNotice && (
        <div className="mt-3 text-center">
          <NoticeBanner notice={photoNotice} />
        </div>
      )}

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

/**
 * Both directions of 2FA use the same shape: the server emails a 6-digit code
 * and we trade it for the state change. Enabling starts the code with
 * /two-factor/enable, disabling rotates one with /two-factor/resend.
 */
function TwoFactorModal({
  mode,
  onClose,
  onDone,
}: {
  mode: "enable" | "disable";
  onClose: () => void;
  onDone: () => void;
}) {
  const { account } = useAppData();
  const email = account?.email ?? "";
  const enabling = mode === "enable";

  const [code, setCode] = useState("");
  const [sending, setSending] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const requested = useRef(false);

  // Ask for the code as soon as the modal opens (guarded against StrictMode's
  // double-effect, since the endpoint is rate limited).
  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    const send = enabling ? appApi.enableTwoFactor() : appApi.resendTwoFactorCode();
    send
      .then((res) => setNotice({ kind: "success", message: res.message }))
      .catch((err: unknown) =>
        setNotice({
          kind: "error",
          message: err instanceof Error ? err.message : "Could not send a code.",
        }),
      )
      .finally(() => setSending(false));
  }, [enabling]);

  async function resend() {
    setSending(true);
    setNotice(null);
    try {
      const res = await appApi.resendTwoFactorCode();
      setNotice({ kind: "success", message: res.message });
    } catch (err) {
      setNotice({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not resend the code.",
      });
    } finally {
      setSending(false);
    }
  }

  async function submit() {
    if (code.length !== 6 || submitting) return;
    setSubmitting(true);
    setNotice(null);
    try {
      const res = enabling
        ? await appApi.verifyTwoFactor(code)
        : await appApi.disableTwoFactor(code);
      setNotice({ kind: "success", message: res.message });
      onDone();
      onClose();
    } catch (err) {
      setNotice({
        kind: "error",
        message: err instanceof Error ? err.message : "That code didn't work.",
      });
      setCode("");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={submitting ? undefined : onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={enabling ? "Enable two-factor authentication" : "Disable two-factor authentication"}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-[520px] rounded-hero bg-white p-8 shadow-glass"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-btn text-body transition-colors hover:bg-black/5 hover:text-ink disabled:opacity-40"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-card text-offwhite shadow-glow ${
              enabling ? "bg-brand" : "bg-red-500"
            }`}
          >
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h3 className="text-card-title font-bold text-ink">
              {enabling ? "Set up two-factor auth" : "Turn off two-factor auth"}
            </h3>
            <p className="text-small text-body">
              {enabling ? "Takes about 60 seconds." : "Confirm it's really you."}
            </p>
          </div>
        </div>

        <p className="mt-6 text-base text-body">
          {email ? (
            <>
              Enter the 6-digit code we sent to{" "}
              <span className="font-medium text-ink">{email}</span>.
            </>
          ) : (
            "Enter the 6-digit code we sent to your account email."
          )}
        </p>

        <div className="mt-5">
          <CodeInput
            value={code}
            onChange={setCode}
            onComplete={submit}
            disabled={submitting}
            autoFocus
          />
        </div>

        {notice && (
          <div className="mt-5 text-center">
            <NoticeBanner notice={notice} />
          </div>
        )}

        <div className="mt-7 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={resend}
            disabled={sending || submitting}
            className="inline-flex h-12 items-center justify-center rounded-btn bg-subtle px-6 text-base font-medium text-brand-accent transition-colors hover:bg-brand/10 disabled:opacity-60"
          >
            {sending ? "Sending…" : "Resend"}
          </button>
          <button
            type="button"
            disabled={code.length !== 6 || submitting}
            onClick={submit}
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-btn px-6 text-base font-medium text-offwhite shadow-glow transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${
              enabling ? "bg-brand" : "bg-red-500"
            }`}
          >
            {submitting ? "Verifying…" : enabling ? "Verify" : "Turn off"}
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
  const countries = useApi((signal) => appApi.countries(signal));
  const [country, setCountry] = useState(business?.country ?? "");

  // The business record arrives after first paint, so seed the select once it's in.
  useEffect(() => setCountry(business?.country ?? ""), [business?.country]);

  const countryOptions = useMemo(() => {
    const options = (countries.data ?? []).map((c) => ({ value: c.name, label: c.name }));
    // Keep a stored value that isn't in the list (legacy free-text) selectable
    // rather than silently blanking it on the next save.
    if (country && !options.some((o) => o.value === country)) {
      options.unshift({ value: country, label: country });
    }
    return options;
  }, [countries.data, country]);

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
        country,
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
        <div className="flex flex-col gap-2">
          <span className="text-base font-medium text-ink">Country</span>
          <Select
            size="lg"
            tone="subtle"
            ariaLabel="Country"
            value={country}
            onChange={setCountry}
            options={countryOptions}
            placeholder={countries.loading ? "Loading countries…" : "Select a country"}
          />
        </div>
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

function SecurityPanel({ onManage2FA }: { onManage2FA: (mode: "enable" | "disable") => void }) {
  const { account, refresh } = useAppData();
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deletionNotice, setDeletionNotice] = useState<Notice | null>(null);

  const twoFactorOn = account?.twoFactorEnabled ?? false;
  const deletionPending = account?.deletionStatus === "pending";

  async function cancelDeletion() {
    setCancelling(true);
    setDeletionNotice(null);
    try {
      const res = await appApi.cancelAccountDeletion();
      setDeletionNotice({ kind: "success", message: res.message });
      refresh();
    } catch (err) {
      setDeletionNotice({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not cancel the deletion.",
      });
    } finally {
      setCancelling(false);
    }
  }

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
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-card ${
              twoFactorOn ? "bg-success/10 text-success" : "bg-star/10 text-star"
            }`}
          >
            {twoFactorOn ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-card-title font-bold text-ink">Two-factor authentication</h3>
              {twoFactorOn ? (
                <span className="inline-flex items-center gap-1 rounded-pill bg-success/10 px-2.5 py-1 text-stat-label font-semibold text-success">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Enabled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-pill bg-star/10 px-2.5 py-1 text-stat-label font-semibold text-star">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Not enabled
                </span>
              )}
            </div>
            <p className="mt-1 text-small text-body">
              {twoFactorOn
                ? "Signing in asks for a one-time code emailed to you."
                : "Add a second step at sign-in with one-time codes emailed to you."}
            </p>

            <div className="mt-4 flex w-fit items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-card bg-subtle text-brand">
                <MessageSquare className="h-5 w-5" />
              </span>
              <div>
                <div className="text-base font-semibold text-ink">Email verification</div>
                <div className="text-stat-label text-body">
                  One-time codes to {account?.email || "your account email"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onManage2FA(twoFactorOn ? "disable" : "enable")}
              className={`mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-btn px-5 text-base font-medium transition-transform hover:-translate-y-px ${
                twoFactorOn
                  ? "border border-line bg-white text-red-500 hover:bg-red-50"
                  : "bg-brand text-offwhite shadow-glow"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              {twoFactorOn ? "Disable 2FA" : "Enable 2FA"}
            </button>
          </div>
        </div>
      </div>

      {/* Delete */}
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        {deletionPending ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-card-title font-bold text-red-600">Deletion scheduled</h3>
              <p className="text-small text-red-500/80">
                This account is scheduled for deletion on{" "}
                {formatDeletionDate(account?.deletionScheduledAt)}. Cancel any time before then.
              </p>
            </div>
            <button
              type="button"
              onClick={cancelDeletion}
              disabled={cancelling}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-btn bg-white px-5 text-base font-medium text-red-600 shadow-btn transition-colors hover:bg-red-100 disabled:opacity-60"
            >
              {cancelling ? "Cancelling…" : "Keep my account"}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-card-title font-bold text-red-600">Delete account</h3>
              <p className="text-small text-red-500/80">
                Schedules deletion after a 30-day grace period. Reversible until then.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-btn bg-red-500 px-5 text-base font-medium text-white shadow-btn transition-colors hover:bg-red-600"
            >
              <Trash className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}
        {deletionNotice && (
          <div className="mt-4">
            <NoticeBanner notice={deletionNotice} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {deleteOpen && (
          <DeleteAccountModal
            onClose={() => setDeleteOpen(false)}
            onScheduled={(message) => {
              setDeletionNotice({ kind: "success", message });
              refresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function formatDeletionDate(iso: string | null | undefined): string {
  if (!iso) return "the scheduled date";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "the scheduled date";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

/** Password-confirmed deletion request — upstream 422s on a wrong password. */
function DeleteAccountModal({
  onClose,
  onScheduled,
}: {
  onClose: () => void;
  onScheduled: (message: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await appApi.requestAccountDeletion(password);
      onScheduled(res.message);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not schedule the deletion.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={submitting ? undefined : onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Delete account"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-[460px] rounded-hero bg-white p-7 shadow-glass"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-red-50 text-red-500">
            <Trash className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-card-title font-bold text-ink">Delete this account?</h3>
            <p className="mt-1 text-small text-body">
              We&apos;ll schedule it for deletion in 30 days. You keep full access until then and
              can cancel from this page at any point.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="delete-password" className="text-base font-medium text-ink">
              Confirm your password
            </label>
            <div className="flex h-14 items-center gap-3 rounded-2xl border border-line bg-subtle px-4 transition-colors focus-within:border-brand focus-within:bg-white">
              <Lock className="h-5 w-5 shrink-0 text-body" />
              <input
                id="delete-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-small font-medium text-red-600">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center rounded-btn bg-subtle px-5 text-base font-medium text-ink transition-colors hover:bg-black/5 disabled:opacity-60"
            >
              Keep account
            </button>
            <button
              type="submit"
              disabled={submitting || !password}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-btn bg-red-500 px-5 text-base font-medium text-white shadow-btn transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Scheduling…" : "Schedule deletion"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* --------------------------------------------------------------- team tab */

/** Upstream validates these lowercase; the label is presentation only. */
const INVITE_ROLES: { value: TeamRole; label: string; hint: string }[] = [
  { value: "admin", label: "Admin", hint: "Full access, including team and keys" },
  { value: "finance", label: "Finance", hint: "Wallet, billing and pricing" },
  { value: "viewer", label: "Viewer", hint: "Read-only access" },
];

function InviteMemberModal({
  onClose,
  onInvited,
}: {
  onClose: () => void;
  onInvited: () => void;
}) {
  const [role, setRole] = useState<TeamRole>("viewer");
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
            <span className="text-base font-medium text-ink">Role</span>
            <Select
              size="lg"
              tone="subtle"
              ariaLabel="Role"
              value={role}
              onChange={(next) => setRole(next as TeamRole)}
              options={INVITE_ROLES}
            />
            <p className="text-stat-label text-body">
              {INVITE_ROLES.find((r) => r.value === role)?.hint}
            </p>
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
              {member.status === "invited" && (
                <span className="inline-flex rounded-pill bg-star/10 px-3 py-1.5 text-stat-label font-semibold text-star">
                  {member.statusLabel}
                </span>
              )}
              <span className="inline-flex rounded-pill bg-subtle px-4 py-2 text-small font-medium text-ink">
                {member.isOwner ? "Owner" : member.roleLabel}
              </span>
              <button
                type="button"
                onClick={() => setRemoving(member)}
                disabled={member.isOwner}
                title={member.isOwner ? "The owner can't be removed" : undefined}
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
  const { refresh } = useAppData();
  const [tab, setTab] = useState<Tab>("Profile");
  const [twoFactorMode, setTwoFactorMode] = useState<"enable" | "disable" | null>(null);

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
                {tab === "Security" && <SecurityPanel onManage2FA={setTwoFactorMode} />}
                {tab === "Team" && <TeamPanel />}
              </div>
            </motion.section>
          </div>

      <AnimatePresence>
        {twoFactorMode && (
          <TwoFactorModal
            mode={twoFactorMode}
            onClose={() => setTwoFactorMode(null)}
            onDone={refresh}
          />
        )}
      </AnimatePresence>
    </>
  );
}
