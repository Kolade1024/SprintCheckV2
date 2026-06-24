"use client";

import { useEffect, useRef, useState } from "react";
import {
  Terminal,
  ChevronDown,
  KeyRound,
  Play,
  Copy,
  Zap,
  Check,
  FlaskConical,
  Gauge,
  Webhook,
} from "./icons";
import type { SVGProps } from "react";

type Endpoint = {
  label: string;
  method: string;
  path: string;
  fieldLabel: string;
  bodyKey: string;
  sample: string;
  response: Record<string, unknown>;
};

const ENDPOINTS: Endpoint[] = [
  {
    label: "BVN Verification",
    method: "POST",
    path: "/v1/identity/bvn",
    fieldLabel: "Bank Verification Number",
    bodyKey: "bvn",
    sample: "22212345678",
    response: {
      status: "verified",
      first_name: "Ada",
      last_name: "Okafor",
      date_of_birth: "1990-04-12",
      phone: "0803*****21",
      confidence: 0.99,
    },
  },
  {
    label: "NIN Verification",
    method: "POST",
    path: "/v1/identity/nin",
    fieldLabel: "National Identity Number",
    bodyKey: "nin",
    sample: "70123456789",
    response: {
      status: "verified",
      first_name: "Chidi",
      last_name: "Eze",
      gender: "male",
      confidence: 0.98,
    },
  },
  {
    label: "Phone Verification",
    method: "POST",
    path: "/v1/identity/phone",
    fieldLabel: "Phone Number",
    bodyKey: "phone",
    sample: "08031234567",
    response: {
      status: "verified",
      carrier: "MTN",
      line_type: "mobile",
      confidence: 0.97,
    },
  },

];

const API_KEY = "sk_sandbox_demo_xxxxxxxxxxxxx";

const FEATURES: {
  title: string;
  description: string;
  Icon: (p: SVGProps<SVGSVGElement>) => JSX.Element;
}[] = [
    {
      title: "Realistic test data",
      description:
        "Sandbox returns the same shape as production, including edge cases and error codes.",
      Icon: FlaskConical,
    },
    {
      title: "Zero rate limits",
      description:
        "Hammer the sandbox while you build. We'll only meter you in production.",
      Icon: Gauge,
    },
    {
      title: "Live webhooks",
      description:
        "Trigger webhook events from the sandbox to test your back-office in real time.",
      Icon: Webhook,
    },
  ];

function buildCurl(ep: Endpoint, value: string) {
  return `curl -X ${ep.method} https://api.sprintcheck.io${ep.path} \\
  -H "Authorization: Bearer ${API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{ "${ep.bodyKey}": "${value}" }'`;
}

function EndpointSelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (i: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(value);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  // On open: sync the highlight to the selection and focus the list for keys
  useEffect(() => {
    if (!open) return;
    setActive(value);
    listRef.current?.focus();
    listRef.current?.querySelectorAll("li")[value]?.scrollIntoView({
      block: "nearest",
    });
  }, [open, value]);

  // Keep the highlighted option in view while arrow-keying through the list
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelectorAll("li")[active]?.scrollIntoView({
      block: "nearest",
    });
  }, [open, active]);

  function choose(i: number) {
    onChange(i);
    setOpen(false);
  }

  function onButtonKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => Math.min(a + 1, ENDPOINTS.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onButtonKeyDown}
        className={`flex w-full items-center justify-between gap-2 rounded-btn border bg-surface px-4 py-3 text-left text-base text-ink shadow-card outline-none transition-colors ${open ? "border-brand-accent" : "border-line hover:border-brand-accent/60"
          }`}
      >
        {ENDPOINTS[value].label}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-body transition-transform ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={`endpoint-opt-${active}`}
          onKeyDown={onListKeyDown}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-64 overflow-auto rounded-card border border-line bg-surface p-1.5 shadow-glass outline-none"
        >
          {ENDPOINTS.map((ep, i) => {
            const selected = i === value;
            return (
              <li
                key={ep.path}
                id={`endpoint-opt-${i}`}
                role="option"
                aria-selected={selected}
                onClick={() => choose(i)}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-btn px-3 py-2.5 text-base ${i === active ? "bg-brand/10 text-ink" : "text-body"
                  }`}
              >
                <span className="flex flex-col">
                  <span className="font-medium text-ink">{ep.label}</span>
                  <span className="font-mono text-small text-body">
                    {ep.method} {ep.path}
                  </span>
                </span>
                {selected && (
                  <Check className="h-4 w-4 shrink-0 text-brand-accent" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function SandboxSection() {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState(ENDPOINTS[0].sample);
  const [tab, setTab] = useState<"curl" | "response">("curl");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const endpoint = ENDPOINTS[index];
  const curl = buildCurl(endpoint, value || endpoint.sample);
  const responseJson = JSON.stringify(endpoint.response, null, 2);

  function selectEndpoint(i: number) {
    setIndex(i);
    setValue(ENDPOINTS[i].sample);
    setSent(false);
    setTab("curl");
  }

  function sendRequest() {
    setSent(true);
    setTab("response");
  }

  async function copyCode() {
    const text = tab === "response" && sent ? responseJson : curl;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <section id="sandbox" className="relative overflow-hidden bg-surface">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px]"
        style={{
          background:
            "radial-gradient(50% 60% at 80% 20%, rgba(166,114,255,0.18) 0%, rgba(166,114,255,0) 60%), radial-gradient(40% 50% at 10% 10%, rgba(75,72,238,0.12) 0%, rgba(75,72,238,0) 60%)",
        }}
      />

      <div className="container-x pt-32 md:pt-40 lg:pt-44">
        {/* Hero */}
        <div className="mx-auto flex max-w-[760px] flex-col items-center gap-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-white/70 px-[13.33px] py-[5.33px] shadow-glass backdrop-blur-sm">
            <Terminal className="h-3.5 w-3.5 text-brand-accent" />
            <span className="text-stat-label font-medium text-body">
              Interactive API Sandbox
            </span>
          </span>

          <h1 className="text-balance text-[30px] font-extrabold leading-[1.05] tracking-[-1.5px] text-ink sm:text-[56px] lg:text-[55px]">
            Try the SprintCheck API <span className="text-gradient">live</span>
          </h1>

          <p className="max-w-[640px] text-lead text-body">
            Pick an endpoint, send a test request and inspect the JSON response —
            no signup required. Sandbox returns deterministic, realistic data so
            you can build with confidence.
          </p>
        </div>

        {/* Interactive area */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,400px)_1fr]">
          {/* Request panel */}
          <div className="flex flex-col gap-5 rounded-hero border border-line bg-surface p-6 shadow-glass">
            <div className="flex items-center justify-between">
              <h2 className="text-card-title font-bold text-ink">Request</h2>
              <span className="rounded-pill bg-brand/10 px-3 py-1 text-stat-label font-semibold text-brand-accent">
                Sandbox
              </span>
            </div>

            {/* Endpoint select */}
            <label className="flex flex-col gap-2">
              <span className="text-stat-label font-semibold uppercase tracking-[0.06em] text-body">
                Endpoint
              </span>
              <EndpointSelect value={index} onChange={selectEndpoint} />
              <span className="flex items-center gap-2">
                <span className="rounded-[6px] bg-success/15 px-2 py-0.5 font-mono text-[12px] font-semibold text-success">
                  {endpoint.method}
                </span>
                <span className="font-mono text-small text-body">
                  {endpoint.path}
                </span>
              </span>
            </label>

            {/* API key */}
            <label className="flex flex-col gap-2">
              <span className="flex items-center gap-1.5 text-stat-label font-semibold uppercase tracking-[0.06em] text-body">
                <KeyRound className="h-3.5 w-3.5" />
                API Key
              </span>
              <input
                type="text"
                defaultValue={API_KEY}
                className="w-full rounded-btn border border-line bg-surface px-4 py-3 font-mono text-small text-ink shadow-card outline-none transition-colors focus:border-brand-accent"
              />
            </label>

            {/* Dynamic field */}
            <label className="flex flex-col gap-2">
              <span className="text-stat-label font-semibold uppercase tracking-[0.06em] text-body">
                {endpoint.fieldLabel}
              </span>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-btn border border-line bg-surface px-4 py-3 font-mono text-base text-ink shadow-card outline-none transition-colors focus:border-brand-accent"
              />
              <button
                type="button"
                onClick={() => setValue(endpoint.sample)}
                className="self-start text-small font-medium text-brand-accent transition-colors hover:text-brand"
              >
                Use sample value
              </button>
            </label>

            <button
              type="button"
              onClick={sendRequest}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-brand text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px"
            >
              <Play className="h-4 w-4" />
              Send request
            </button>

            <p className="flex items-start gap-2 rounded-card bg-subtle p-4 text-small text-body">
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
              Sandbox responses are mocked and never hit upstream sources. Use
              production keys to verify real customers.
            </p>
          </div>

          {/* Code window */}
          <div className="overflow-hidden rounded-hero border border-white/10 bg-code-bg shadow-glass">
            <div className="flex items-center justify-between gap-3 px-4 pt-4">
              <div className="flex gap-1 rounded-pill bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setTab("curl")}
                  className={`rounded-pill px-4 py-1.5 text-small font-medium transition-colors ${tab === "curl"
                    ? "bg-white text-ink"
                    : "text-code-comment hover:text-code-text"
                    }`}
                >
                  cURL
                </button>
                <button
                  type="button"
                  onClick={() => sent && setTab("response")}
                  disabled={!sent}
                  className={`rounded-pill px-4 py-1.5 text-small font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${tab === "response"
                    ? "bg-white text-ink"
                    : "text-code-comment hover:text-code-text"
                    }`}
                >
                  Response
                </button>
              </div>

              <button
                type="button"
                onClick={copyCode}
                className="inline-flex items-center gap-1.5 rounded-btn bg-white/5 px-3 py-1.5 text-small font-medium text-code-comment transition-colors hover:bg-white/10 hover:text-code-text"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <pre className="min-h-[320px] overflow-x-auto px-6 py-5 font-mono text-[13px] leading-[1.7] text-code-text lg:min-h-[560px]">
              <code>{tab === "response" && sent ? responseJson : curl}</code>
            </pre>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-6 grid grid-cols-1 gap-6 pb-20 md:grid-cols-3 lg:pb-24">
          {FEATURES.map(({ title, description, Icon }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-card border border-line bg-surface p-6 shadow-card"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-brand/10 text-brand-accent">
                <Icon className="h-5 w-5" />
              </span>
              <p className="text-base font-semibold text-ink">{title}</p>
              <p className="text-small text-body">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
