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

type Field = {
  label: string;
  key: string;
  sample: string;
};

type Endpoint = {
  label: string;
  method: string;
  /** Which API surface the endpoint lives on — mirrors the docs. */
  base: "api" | "sdk";
  path: string;
  /** SDK checks send the raw API key; merchant endpoints send a bearer token. */
  auth: "apikey" | "bearer";
  fields: Field[];
  response: Record<string, unknown>;
};

/*
 * Endpoints, request bodies and response shapes mirror the production API
 * (SprintCheck Postman collection). Responses are still mocked — the sandbox
 * never calls upstream sources.
 */
const ENDPOINTS: Endpoint[] = [
  {
    label: "BVN Check",
    method: "POST",
    base: "sdk",
    path: "/bvn",
    auth: "apikey",
    fields: [
      { label: "Bank Verification Number", key: "number", sample: "22454670613" },
      { label: "Identifier", key: "identifier", sample: "dev@yourapp.com" },
    ],
    response: {
      status: true,
      message: "BVN check initiated",
      data: {
        reference: "36135803-0843-48d6-b8bf-5d47490a6ade",
        identifier: "dev@yourapp.com",
        type: "bvn",
        status: "pending",
        fee: 50,
      },
    },
  },
  {
    label: "NIN Check",
    method: "POST",
    base: "sdk",
    path: "/nin",
    auth: "apikey",
    fields: [
      { label: "National Identification Number", key: "number", sample: "52306459347" },
      { label: "Identifier", key: "identifier", sample: "dev@yourapp.com" },
    ],
    response: {
      status: true,
      message: "NIN check initiated",
      data: {
        reference: "fab0f22b-2948-4c75-9b4d-0f59687d5138",
        identifier: "dev@yourapp.com",
        type: "nin",
        status: "pending",
        fee: 50,
      },
    },
  },
  {
    label: "Voter's Card Check",
    method: "POST",
    base: "sdk",
    path: "/voters",
    auth: "apikey",
    fields: [
      { label: "Voter Identification Number", key: "number", sample: "90F5AE4625505997419" },
      { label: "Identifier", key: "identifier", sample: "dev@yourapp.com" },
    ],
    response: {
      status: true,
      message: "Voter's card check initiated",
      data: {
        reference: "2d9621d1-576c-41a7-8879-83a563d194c8",
        identifier: "dev@yourapp.com",
        type: "voters",
        status: "pending",
        fee: 50,
      },
    },
  },
  {
    label: "Facial Check",
    method: "POST",
    base: "sdk",
    path: "/facial",
    auth: "apikey",
    fields: [
      { label: "Identifier (from a previous check)", key: "identifier", sample: "dev@yourapp.com" },
      { label: "Reference", key: "reference", sample: "order_8821" },
    ],
    response: {
      status: true,
      message: "Facial check initiated",
      data: {
        reference: "order_8821",
        identifier: "dev@yourapp.com",
        type: "facial",
        status: "pending",
        fee: 30,
      },
    },
  },
  {
    label: "Business Name Search",
    method: "POST",
    base: "api",
    path: "/cac/name",
    auth: "bearer",
    fields: [{ label: "Business name", key: "name", sample: "5star" }],
    response: {
      status: true,
      message: "Search Successful",
      data: [
        {
          approved_name: "5STAR AGRO-ENTERPRISE",
          nature_of_business_name: "Sale of Agricultural Produce",
          registration_date: "2016-11-04T11:37:36.853Z",
          rc_number: "2456105",
          id: 3929637,
          classification: "BUSINESS_NAME",
          active: false,
        },
        {
          approved_name: "5STAR-PHONEZ ENT.",
          nature_of_business_name: null,
          registration_date: "2024-08-26T14:46:29.229Z",
          rc_number: "7870835",
          id: 9773599,
          classification: "BUSINESS_NAME",
          active: true,
        },
      ],
    },
  },
];

const API_KEY = "scb_sandbox_demo_xxxxxxxxxxxxxxxx";
/* Same bases as the API reference — merchant surface and SDK identity checks. */
const BASE_URLS = {
  api: "https://api.sprintcheck.megasprintlimited.com.ng/api/v1",
  sdk: "https://api.sprintcheck.megasprintlimited.com.ng/api/sdk",
} as const;

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

function buildCurl(ep: Endpoint, values: Record<string, string>, apiKey: string) {
  const auth = ep.auth === "bearer" ? `Bearer ${apiKey}` : apiKey;
  const body = ep.fields
    .map((f) => `    "${f.key}": "${values[f.key] || f.sample}"`)
    .join(",\n");
  return `curl -X ${ep.method} ${BASE_URLS[ep.base]}${ep.path} \\
  -H "Authorization: ${auth}" \\
  -H "Content-Type: application/json" \\
  -d '{
${body}
  }'`;
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

const sampleValues = (ep: Endpoint) =>
  Object.fromEntries(ep.fields.map((f) => [f.key, f.sample]));

export default function SandboxSection() {
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState<Record<string, string>>(() =>
    sampleValues(ENDPOINTS[0])
  );
  const [apiKey, setApiKey] = useState(API_KEY);
  const [tab, setTab] = useState<"curl" | "response">("curl");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const endpoint = ENDPOINTS[index];
  const curl = buildCurl(endpoint, values, apiKey || API_KEY);
  const responseJson = JSON.stringify(endpoint.response, null, 2);

  function selectEndpoint(i: number) {
    setIndex(i);
    setValues(sampleValues(ENDPOINTS[i]));
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

            {/* API key / merchant token */}
            <label className="flex flex-col gap-2">
              <span className="flex items-center gap-1.5 text-stat-label font-semibold uppercase tracking-[0.06em] text-body">
                <KeyRound className="h-3.5 w-3.5" />
                {endpoint.auth === "bearer" ? "Merchant token" : "API key"}
              </span>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full rounded-btn border border-line bg-surface px-4 py-3 font-mono text-small text-ink shadow-card outline-none transition-colors focus:border-brand-accent"
              />
            </label>

            {/* Request body fields */}
            {endpoint.fields.map((f) => (
              <label key={f.key} className="flex flex-col gap-2">
                <span className="text-stat-label font-semibold uppercase tracking-[0.06em] text-body">
                  {f.label}
                  <span className="ml-1.5 normal-case tracking-normal text-body/60">
                    · {f.key}
                  </span>
                </span>
                <input
                  type="text"
                  value={values[f.key] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [f.key]: e.target.value }))
                  }
                  placeholder={f.sample}
                  className="w-full rounded-btn border border-line bg-surface px-4 py-3 font-mono text-base text-ink shadow-card outline-none transition-colors focus:border-brand-accent"
                />
              </label>
            ))}
            <button
              type="button"
              onClick={() => setValues(sampleValues(endpoint))}
              className="-mt-2 self-start text-small font-medium text-brand-accent transition-colors hover:text-brand"
            >
              Use sample values
            </button>

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
