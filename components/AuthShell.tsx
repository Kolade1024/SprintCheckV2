"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type InputHTMLAttributes,
} from "react";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff, Lock, type IconProps } from "@/components/icons";

/**
 * Shared scaffolding for the auth flow (sign in, sign up, forgot / reset
 * password, verify code). Mirrors the glassmorphic card + radial-glow
 * treatment used on the hero, so every step feels part of the same product.
 */

const INPUT_BASE =
  "h-12 w-full rounded-btn border border-line bg-white text-base text-ink shadow-card outline-none transition-colors placeholder:text-body/60 focus:border-brand focus:ring-2 focus:ring-brand/20";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Use a wider card — handy for multi-column forms like sign up. */
  wide?: boolean;
}) {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = spotlightRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let frame = 0;
    function onMove(e: PointerEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el!.style.setProperty("--x", `${e.clientX}px`);
        el!.style.setProperty("--y", `${e.clientY}px`);
        el!.style.opacity = "1";
      });
    }
    function onLeave() {
      el!.style.opacity = "0";
    }

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background radial glows over white — mirrors the hero treatment */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 85% 15%, rgba(166,114,255,0.22) 0%, rgba(166,114,255,0) 60%), radial-gradient(50% 40% at 5% 85%, rgba(75,72,238,0.16) 0%, rgba(75,72,238,0) 60%)",
        }}
      />

      {/* Gradient spotlight that follows the cursor */}
      <div
        ref={spotlightRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 opacity-0 transition-opacity duration-500 ease-smooth motion-reduce:hidden"
        style={{
          background:
            "radial-gradient(360px circle at var(--x, 50%) var(--y, 50%), rgba(118,59,241,0.18) 0%, rgba(75,72,238,0.10) 35%, rgba(118,59,241,0) 70%)",
        }}
      />

      <div className="container-x flex min-h-screen items-center py-12">
        <div className={`mx-auto w-full ${wide ? "max-w-[600px]" : "max-w-[460px]"}`}>
          <div className="animate-fade-up rounded-hero border border-white/60 bg-white/70 p-8 shadow-glass backdrop-blur-md motion-reduce:animate-none md:p-10">
            <a
              href="/"
              className="mb-8 inline-flex"
              aria-label="SprintCheck home"
            >
              <Image
                src="/logo-sprintcheck.png"
                alt="SprintCheck"
                width={71}
                height={46}
                priority
                className="h-10 w-auto"
              />
            </a>

            <div className="flex flex-col gap-2">
              <h1 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.5px] text-ink md:text-[32px]">
                {title}
              </h1>
              <p className="text-base text-body">{subtitle}</p>
            </div>

            {children}
          </div>

          {footer && (
            <div className="mt-6 text-center text-small text-body">{footer}</div>
          )}
        </div>
      </div>
    </main>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ComponentType<IconProps>;
  /** Optional element rendered to the right of the label (e.g. "Forgot?"). */
  action?: React.ReactNode;
  /** Extra classes on the field wrapper, e.g. grid column spans. */
  wrapperClassName?: string;
  /** Field-level validation message shown beneath the input. */
  error?: string;
};

/** Red-state overrides applied to the input when the field has an error. */
const INPUT_ERROR =
  "border-red-500 focus:border-red-500 focus:ring-red-500/20";

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id ? `${id}-error` : undefined} className="text-small font-medium text-red-600" role="alert">
      {message}
    </p>
  );
}

export function TextField({
  label,
  icon: Icon,
  action,
  id,
  wrapperClassName = "",
  error,
  ...props
}: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-small font-medium text-ink">
          {label}
        </label>
        {action}
      </div>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-body" />
        )}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error && id ? `${id}-error` : undefined}
          className={`${INPUT_BASE} ${Icon ? "pl-11" : "px-4"} pr-4 ${error ? INPUT_ERROR : ""}`}
          {...props}
        />
      </div>
      <FieldError id={id} message={error} />
    </div>
  );
}

export function PasswordField({
  label,
  action,
  id,
  wrapperClassName = "",
  error,
  ...props
}: Omit<FieldProps, "icon">) {
  const [show, setShow] = useState(false);
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-small font-medium text-ink">
          {label}
        </label>
        {action}
      </div>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-body" />
        <input
          id={id}
          type={show ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error && id ? `${id}-error` : undefined}
          className={`${INPUT_BASE} pl-11 pr-11 ${error ? INPUT_ERROR : ""}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-btn text-body transition-colors hover:bg-black/5 hover:text-ink"
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      <FieldError id={id} message={error} />
    </div>
  );
}

export function SubmitButton({
  loading,
  loadingText,
  children,
  className = "",
}: {
  loading?: boolean;
  loadingText: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-brand px-6 text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 ${className}`}
    >
      {loading ? (
        loadingText
      ) : (
        <>
          {children}
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}
