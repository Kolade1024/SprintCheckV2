"use client";

import { useRef, useState, type ComponentType, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
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
  X,
  type IconProps,
} from "@/components/icons";

const TABS = ["Profile", "Business info", "Security"] as const;
type Tab = (typeof TABS)[number];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

/* --------------------------------------------------------------- field UI */

function Field({
  label,
  icon: Icon,
  defaultValue,
  type = "text",
  trailing,
}: {
  label: string;
  icon: ComponentType<IconProps>;
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
  defaultValue,
}: {
  label: string;
  icon?: ComponentType<IconProps>;
  defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-2 md:col-span-2">
      <label className="text-base font-medium text-ink">{label}</label>
      <div className="flex gap-3 rounded-2xl border border-line bg-subtle px-4 py-3.5 transition-colors focus-within:border-brand focus-within:bg-white">
        {Icon && <Icon className="mt-0.5 h-5 w-5 shrink-0 text-body" />}
        <textarea
          rows={3}
          defaultValue={defaultValue}
          className="min-w-0 flex-1 resize-none bg-transparent text-base text-ink outline-none"
        />
      </div>
    </div>
  );
}

function SaveButton({ children = "Save profile" }: { children?: ReactNode }) {
  return (
    <div className="mt-8 flex justify-end">
      <button
        type="button"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-brand px-6 text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px"
      >
        <Save className="h-4 w-4" />
        {children}
      </button>
    </div>
  );
}

/* --------------------------------------------------------------- profile card */

function ProfileCard() {
  const stats: { label: string; value: ReactNode }[] = [
    { label: "Plan", value: <span className="font-semibold text-ink">Growth</span> },
    { label: "Member since", value: <span className="font-semibold text-ink">Mar 2024</span> },
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
            OE
          </div>
          <button
            type="button"
            aria-label="Change photo"
            className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-pill bg-brand text-offwhite ring-4 ring-white transition-transform hover:scale-105"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>

        <h2 className="mt-5 text-card-title font-bold text-ink">odejnmi emmanuel</h2>
        <p className="text-small text-body">odejinmpromise@gmail.com</p>

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
  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label="Your name" icon={User} defaultValue="odejnmi emmanuel" />
        <Field label="Phone number" icon={Phone} defaultValue="08168192858" />
        <Field label="Email address" icon={Mail} type="email" defaultValue="odejinmiemmanuel@gmail.com" />
        <Field label="Country" icon={Globe} defaultValue="Nigeria" />
        <TextAreaField label="About" defaultValue="Product engineer building delightful fintech experiences." />
      </div>
      <SaveButton />
    </div>
  );
}

function BusinessPanel() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label="Business name" icon={Building2} defaultValue="odejnmi emmanuel" />
        <Field label="RC number" icon={BadgeCheck} defaultValue="odejnmi emmanuel" />
        <Field label="Website" icon={Globe} defaultValue="odejnmi emmanuel" />
        <Field label="Support email" icon={Headset} defaultValue="odejnmi emmanuel" />
        <TextAreaField label="Registered address" icon={MapPin} defaultValue="Product engineer building delightful fintech experiences." />
      </div>
      <SaveButton />
    </div>
  );
}

function SecurityPanel({ onEnable2FA }: { onEnable2FA: () => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field
            label="Current password"
            icon={Key}
            type={show ? "text" : "password"}
            defaultValue="supersecret12"
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
          <Field label="New password" icon={Key} type="password" />
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-btn bg-subtle px-5 text-base font-medium text-brand-accent transition-colors hover:bg-brand/10"
          >
            <Lock className="h-4 w-4" />
            Change password
          </button>
        </div>
      </div>

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

/* ------------------------------------------------------------------ page */

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>("Profile");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#fbfbfe]">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1200px] px-5 py-6 md:px-8">
          <Topbar />

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
              </div>
            </motion.section>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && <TwoFactorModal onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
