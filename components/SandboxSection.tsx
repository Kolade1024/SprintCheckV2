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
  /**
   * Format the live endpoint enforces. Used only to drive the sandbox's mocked
   * error path, so a malformed value returns the API's validation envelope
   * instead of a success payload.
   */
  rule?: { valid: (value: string) => boolean; message: string };
};

/** Identity numbers the API requires as a fixed-length digit string. */
const exactDigits = (count: number, label: string): Field["rule"] => ({
  valid: (value) => new RegExp(`^\\d{${count}}$`).test(value),
  message: `The ${label} must be exactly ${count} digits.`,
});

type Endpoint = {
  label: string;
  method: string;
  /** Which API surface the endpoint lives on — mirrors the docs. */
  base: keyof typeof BASE_URLS;
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
    label: "Verify BVN",
    method: "POST",
    base: "api",
    path: "/bvn",
    auth: "apikey",
    fields: [
      {
        label: "Bank Verification Number",
        key: "number",
        sample: "22454670613",
        rule: exactDigits(11, "BVN"),
      },
      { label: "Identifier", key: "identifier", sample: "dev@yourapp.com" },
    ],
    response: {
      success: 1,
      message: "Verified Successfully",
      data: {
        firstName: "SA*****",
        lastName: "OD*****",
        middleName: "AD*****",
        dateOfBirth: "12-Dec-1996",
        phoneNumber1: "0816*******",
        gender: "Male",
        stateOfOrigin: "Osun State",
        bvn: "2245********",
        base64Image: "/9j/4AAQSkZJRgABAQEAYABgAAD...",
      },
    },
  },
  {
    label: "Verify NIN",
    method: "POST",
    base: "api",
    path: "/nin",
    auth: "apikey",
    fields: [
      {
        label: "National Identification Number",
        key: "number",
        sample: "52306459347",
        rule: exactDigits(11, "NIN"),
      },
      { label: "Identifier", key: "identifier", sample: "dev@yourapp.com" },
    ],
    response: {
      success: 1,
      message: "Verified Successfully",
      data: {
        firstname: "SA*****",
        middlename: "AD*****",
        surname: "OD*****",
        telephoneno: "0816*******",
        nin: "5230********",
        gender: "m",
        birthdate: "12-12-1996",
        state_of_origin: "Osun",
        photo: "/9j/4AAQSkZJRgABAQEAYABgAAD...",
      },
    },
  },
  {
    label: "Verify Voter's Card",
    method: "POST",
    base: "api",
    path: "/voters",
    auth: "apikey",
    fields: [
      {
        label: "Voter Identification Number",
        key: "number",
        sample: "90F5AE4625505997419",
        rule: {
          // VINs are alphanumeric rather than fixed-length digits.
          valid: (value) => /^[A-Za-z0-9]{9,25}$/.test(value),
          message: "The VIN must be 9–25 letters or digits.",
        },
      },
      { label: "Identifier", key: "identifier", sample: "dev@yourapp.com" },
    ],
    response: {
      success: 1,
      message: "Verified Successfully",
      data: {
        fullName: "Bl****** Aanuoluwapo Afolabi",
        gender: "F",
        occupation: "STUDENT",
        state: "OYO",
        lga: "IBADAN NORTH EAST",
        address: "E7/1207 YI**, IBADAN, IBADAN NORTH EAST, OYO",
        vin: "90F5A***************",
        country: "NG",
        photo: "/9j/4AAQSkZJRgABAQEAYABgAAD...",
      },
    },
  },
  {
    label: "Face Detection",
    method: "POST",
    base: "api",
    path: "/face",
    auth: "apikey",
    fields: [
      { label: "Image (Base64)", key: "image", sample: "base64_encoded_image" },
    ],
    response: {
      success: 1,
      message: "Face Detected Successfully",
      data: {
        face_locations: [
          {
            age: 31,
            dominant_race: "black",
            dominant_gender: "Man",
            dominant_emotion: "happy",
            face_confidence: 0.99,
          },
        ],
        faces_detected: 1,
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
    // Merchant surface (bearer token) — envelope is `{ status: true, … }`,
    // per the BFF upstream contract, not the SDK's `success: 1`.
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
  // Only the SDK surface (API-key auth) signs the body: HMAC-SHA512 of the
  // whitespace-stripped body keyed with your encryption key, in the `signature`
  // header. Merchant routes (bearer token) don't carry it.
  const signatureHeader =
    ep.auth === "apikey" ? `  -H "signature: <hmac_sha512_of_body>" \\\n` : "";
  return `curl -X ${ep.method} ${BASE_URLS[ep.base]}${ep.path} \\
  -H "Authorization: ${auth}" \\
  -H "Content-Type: application/json" \\
${signatureHeader}  -d '{
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

/** Credential and body fields that must carry a value before a request is valid. */
function emptyFields(ep: Endpoint, values: Record<string, string>, apiKey: string) {
  const missing = ep.fields.filter((f) => !(values[f.key] ?? "").trim()).map((f) => f.key);
  if (!apiKey.trim()) missing.unshift("authorization");
  return missing;
}

/**
 * Field-level errors for values that are present but malformed. The sandbox
 * previously answered "Verified Successfully" no matter what was typed; this
 * drives the mocked error path so it mirrors the real API's 422 instead.
 */
function formatErrors(ep: Endpoint, values: Record<string, string>) {
  const errors: Record<string, string[]> = {};
  for (const field of ep.fields) {
    const value = (values[field.key] ?? "").trim();
    if (value && field.rule && !field.rule.valid(value)) {
      errors[field.key] = [field.rule.message];
    }
  }
  return errors;
}

/**
 * Error envelopes differ by surface, same as production: the SDK routes answer
 * `success: 0` while the merchant (bearer) routes answer `status: false`.
 */
function errorResponse(ep: Endpoint, errors: Record<string, string[]>) {
  const message = "The given data was invalid.";
  return ep.auth === "bearer"
    ? { status: false, message, errors }
    : { success: 0, message, errors };
}

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

  // Empty required fields block the request outright; malformed ones are let
  // through so the sandbox can demonstrate the API's validation response.
  const missing = emptyFields(endpoint, values, apiKey);
  const invalid = formatErrors(endpoint, values);
  const rejected = Object.keys(invalid).length > 0;
  const responseJson = JSON.stringify(
    rejected ? errorResponse(endpoint, invalid) : endpoint.response,
    null,
    2,
  );

  function selectEndpoint(i: number) {
    setIndex(i);
    setValues(sampleValues(ENDPOINTS[i]));
    setSent(false);
    setTab("curl");
  }

  function sendRequest() {
    if (missing.length > 0) return;
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
                  aria-invalid={invalid[f.key] ? true : undefined}
                  aria-describedby={invalid[f.key] ? `sandbox-error-${f.key}` : undefined}
                  className={`w-full rounded-btn border bg-surface px-4 py-3 font-mono text-base text-ink shadow-card outline-none transition-colors ${
                    invalid[f.key]
                      ? "border-red-400 focus:border-red-500"
                      : "border-line focus:border-brand-accent"
                  }`}
                />
                {invalid[f.key] && (
                  <span id={`sandbox-error-${f.key}`} className="text-small text-red-600">
                    {invalid[f.key][0]} Sending returns the API&apos;s 422.
                  </span>
                )}
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
              disabled={missing.length > 0}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-brand text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <Play className="h-4 w-4" />
              Send request
            </button>

            {missing.length > 0 && (
              <p role="status" className="-mt-2 text-small text-body">
                Fill in every field to send a request
                <span className="text-body/70">
                  {" — missing "}
                  {missing.join(", ")}
                </span>
                .
              </p>
            )}

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

              {tab === "response" && sent && (
                <span
                  className={`rounded-[6px] px-2 py-0.5 font-mono text-[12px] font-semibold ${
                    rejected ? "bg-red-500/15 text-red-400" : "bg-success/15 text-success"
                  }`}
                >
                  {rejected ? "422 Unprocessable" : "200 OK"}
                </span>
              )}

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
