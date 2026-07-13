"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import DetailModal, { DetailCard, DetailRow } from "@/components/dashboard/DetailModal";
import { LoadingState } from "@/components/dashboard/AsyncState";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CheckCircle,
  Download,
  Search,
  Users,
  Wallet,
  XCircle,
} from "@/components/icons";
import { appApi } from "@/lib/client/endpoints";
import { useApi } from "@/lib/client/useApi";
import { exportCsv, exportExcel, type ExportRow } from "@/lib/client/export";
import type { CacBusinessMatch, CacLookupType } from "@/lib/shared/types";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

/* ------------------------------------------------------------------ config */

type LookupConfig = {
  label: string;
  pricingCode: string;
  inputLabel: string;
  placeholder: string;
  hint: string;
  run: (value: string) => Promise<unknown>;
};

const LOOKUPS: Record<CacLookupType, LookupConfig> = {
  name: {
    label: "Business Name",
    pricingCode: "CAC_BY_NAME",
    inputLabel: "Business name",
    placeholder: "e.g. 5star Agro",
    hint: "Search the CAC register by business name.",
    run: (v) => appApi.cacNameSearch(v),
  },
  profile: {
    label: "Business Profile",
    pricingCode: "CAC_PROFILE",
    inputLabel: "RC / BN number",
    placeholder: "e.g. RC1234567 or BN987654",
    hint: "Full company profile by registration number.",
    run: (v) => appApi.cacProfileSearch(v),
  },
  directors: {
    label: "Directors",
    pricingCode: "CAC_DIRECTORS",
    inputLabel: "Business ID",
    placeholder: "e.g. 90009",
    hint: "Directors of a company — get the business ID from a name search.",
    run: (v) => appApi.cacDirectorsLookup(Number(v)),
  },
  shareholders: {
    label: "Shareholders",
    pricingCode: "CAC_SHAREHOLDERS",
    inputLabel: "Business ID",
    placeholder: "e.g. 90009",
    hint: "Shareholders of a company — get the business ID from a name search.",
    run: (v) => appApi.cacShareholdersLookup(Number(v)),
  },
  tin: {
    label: "TIN",
    pricingCode: "TIN",
    inputLabel: "TIN number",
    placeholder: "e.g. 87656789-9876",
    hint: "Verify a Tax Identification Number.",
    run: (v) => appApi.cacTinSearch(v),
  },
};

const LOOKUP_ORDER: CacLookupType[] = ["name", "profile", "directors", "shareholders", "tin"];

/* ----------------------------------------------------------------- helpers */

function prettifyKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/** Flattens a lookup result into spreadsheet rows for CSV/Excel export. */
function buildExportRows(result: LookupResult): ExportRow[] {
  if (result.type === "name") {
    return (result.data as CacBusinessMatch[]).map((m) => ({
      "Business ID": m.id,
      "Business Name": m.approvedName,
      "RC Number": m.rcNumber,
      Classification: m.classification,
      "Nature of Business": m.natureOfBusiness ?? "",
      Registered: formatDate(m.registrationDate),
      Status: m.active === null ? "" : m.active ? "Active" : "Inactive",
      Address: m.address ?? "",
      City: m.city ?? "",
      State: m.state ?? "",
      Email: m.email ?? "",
    }));
  }
  const records = Array.isArray(result.data) ? result.data : [result.data];
  return records
    .filter((r) => r && typeof r === "object")
    .map((record) =>
      Object.fromEntries(
        Object.entries(record as Record<string, unknown>).map(([key, value]) => [
          prettifyKey(key),
          value === null || value === undefined
            ? ""
            : typeof value === "object"
              ? JSON.stringify(value)
              : (value as string | number | boolean),
        ]),
      ),
    );
}

/* ----------------------------------------------------------- detail modal */

/**
 * What the click-to-open modal renders: a title, the record's flat fields,
 * and one section per nested list (e.g. a profile's directors/shareholders).
 */
type SelectedSection = { title: string; fields: [string, string][] };
type SelectedRecord = { title: string; fields: [string, string][]; sections: SelectedSection[] };

/** "Directors" → "Director", "share_holders" → "Share Holder". */
function singularize(label: string): string {
  return label.length > 3 && /s$/i.test(label) ? label.slice(0, -1) : label;
}

function flattenFields(record: Record<string, unknown>): [string, string][] {
  return Object.entries(record).map(([key, value]) => [prettifyKey(key), formatValue(value)]);
}

function matchToSelected(m: CacBusinessMatch): SelectedRecord {
  return {
    title: m.approvedName || "Business record",
    sections: [],
    fields: [
      ["Business Name", m.approvedName || "—"],
      ["Business ID", String(m.id)],
      ["RC Number", m.rcNumber || "—"],
      ["Classification", m.classification || "—"],
      ["Nature of Business", m.natureOfBusiness ?? "—"],
      ["Registered", formatDate(m.registrationDate)],
      ["Status", m.active === null ? "—" : m.active ? "Active" : "Inactive"],
      ["Address", m.address ?? "—"],
      ["City", m.city ?? "—"],
      ["State", m.state ?? "—"],
      ["Email", m.email ?? "—"],
    ],
  };
}

function recordToSelected(record: Record<string, unknown>, fallbackTitle: string): SelectedRecord {
  const entries = Object.entries(record);
  const titleEntry = entries.find(
    ([key, value]) => /name/i.test(key) && typeof value === "string" && value.trim(),
  );

  const fields: [string, string][] = [];
  const sections: SelectedSection[] = [];

  for (const [key, value] of entries) {
    const label = prettifyKey(key);

    // Nested lists of objects (directors, shareholders, …) become their own
    // sections — one card per item — instead of an unreadable JSON blob.
    if (Array.isArray(value) && value.some((v) => v && typeof v === "object")) {
      const items = value.filter((v) => v && typeof v === "object") as Record<string, unknown>[];
      items.forEach((item, i) => {
        sections.push({
          title: items.length > 1 ? `${singularize(label)} ${i + 1}` : singularize(label),
          fields: flattenFields(item),
        });
      });
      if (items.length === 0) fields.push([label, "—"]);
      continue;
    }

    // A nested object becomes a single section.
    if (value && typeof value === "object" && !Array.isArray(value)) {
      sections.push({ title: label, fields: flattenFields(value as Record<string, unknown>) });
      continue;
    }

    fields.push([label, formatValue(value)]);
  }

  return {
    title: titleEntry ? String(titleEntry[1]) : fallbackTitle,
    fields,
    sections,
  };
}

/* ----------------------------------------------------------- result blocks */

/**
 * Compact summary cards for lookups without a documented shape — a title and
 * a short field preview; the full record opens in the detail modal on click.
 */
function RecordResult({
  data,
  lookupLabel,
  onSelect,
}: {
  data: unknown;
  lookupLabel: string;
  onSelect: (selected: SelectedRecord) => void;
}) {
  const records = Array.isArray(data) ? data : [data];
  const nonEmpty = records.filter(
    (r) => r && typeof r === "object" && Object.keys(r as object).length > 0,
  ) as Record<string, unknown>[];

  if (nonEmpty.length === 0) {
    return (
      <p className="py-8 text-center text-small text-body">
        No records found for this lookup.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {nonEmpty.map((record, i) => {
        const selected = recordToSelected(record, `${lookupLabel} record ${i + 1}`);
        const preview = selected.fields
          .filter(([, value]) => value !== "—" && value !== selected.title)
          .slice(0, 3);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(selected)}
            className="group flex flex-col gap-3 rounded-2xl border border-line bg-subtle/50 p-5 text-left transition-colors hover:border-brand hover:bg-white"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-base font-semibold text-ink">{selected.title}</span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-body transition-colors group-hover:text-brand" />
            </div>
            <div className="flex flex-col gap-1.5">
              {preview.map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-3">
                  <span className="text-stat-label text-body">{label}</span>
                  <span className="truncate text-small font-medium text-ink">{value}</span>
                </div>
              ))}
            </div>
            <span className="text-stat-label font-medium text-brand-accent">
              View all{" "}
              {selected.fields.length +
                selected.sections.reduce((n, s) => n + s.fields.length, 0)}{" "}
              fields
            </span>
          </button>
        );
      })}
    </div>
  );
}

function NameSearchResults({
  matches,
  onDrillDown,
  onSelect,
}: {
  matches: CacBusinessMatch[];
  onDrillDown: (type: "directors" | "shareholders", bizId: number) => void;
  onSelect: (selected: SelectedRecord) => void;
}) {
  if (matches.length === 0) {
    return (
      <p className="py-8 text-center text-small text-body">
        No businesses matched that name. Try a shorter or different spelling.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse">
        <thead>
          <tr className="border-b border-line text-left text-stat-label uppercase tracking-wide text-body">
            <th className="pb-3 font-medium">Business</th>
            <th className="pb-3 font-medium">RC number</th>
            <th className="pb-3 font-medium">Registered</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 text-right font-medium">Drill down</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m) => (
            <tr
              key={m.id}
              onClick={() => onSelect(matchToSelected(m))}
              className="cursor-pointer border-b border-line/70 last:border-0 transition-colors hover:bg-subtle/50"
            >
              <td className="py-4 pr-4">
                <div className="text-base font-semibold text-ink">{m.approvedName}</div>
                <div className="text-stat-label text-body">
                  {m.natureOfBusiness || m.classification || "—"} · ID {m.id}
                </div>
              </td>
              <td className="py-4 pr-4 font-mono text-small text-body">{m.rcNumber || "—"}</td>
              <td className="py-4 pr-4 text-small text-body">{formatDate(m.registrationDate)}</td>
              <td className="py-4 pr-4">
                {m.active === null ? (
                  <span className="text-small text-body">—</span>
                ) : m.active ? (
                  <span className="inline-flex items-center gap-1.5 rounded-pill bg-success/10 px-2.5 py-1 text-stat-label font-medium text-success">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-pill bg-ink/5 px-2.5 py-1 text-stat-label font-medium text-body">
                    <XCircle className="h-3.5 w-3.5" />
                    Inactive
                  </span>
                )}
              </td>
              <td className="py-4 text-right">
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDrillDown("directors", m.id);
                    }}
                    className="inline-flex items-center gap-1 rounded-pill bg-subtle px-3 py-1.5 text-stat-label font-medium text-brand-accent transition-colors hover:bg-brand/10"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Directors
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDrillDown("shareholders", m.id);
                    }}
                    className="inline-flex items-center gap-1 rounded-pill bg-subtle px-3 py-1.5 text-stat-label font-medium text-brand-accent transition-colors hover:bg-brand/10"
                  >
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Shareholders
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ page */

type LookupResult = { type: CacLookupType; data: unknown };

export default function VerificationPage() {
  const pricing = useApi((signal) => appApi.pricing(signal));
  const [type, setType] = useState<CacLookupType>("name");
  const [value, setValue] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [selected, setSelected] = useState<SelectedRecord | null>(null);

  const config = LOOKUPS[type];

  const costByCode = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of pricing.data ?? []) map.set(s.code, s.cost);
    return map;
  }, [pricing.data]);

  const cost = costByCode.get(config.pricingCode);
  const walletError = error?.toLowerCase().includes("wallet") ?? false;

  function switchType(next: CacLookupType) {
    setType(next);
    setValue("");
    setError(null);
  }

  async function runLookup(lookupType: CacLookupType, input: string) {
    setRunning(true);
    setError(null);
    try {
      const data = await LOOKUPS[lookupType].run(input);
      setResult({ type: lookupType, data });
    } catch (err) {
      setError(err instanceof Error ? err.message : "The lookup failed. Try again.");
    } finally {
      setRunning(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!value.trim() || running) return;
    runLookup(type, value.trim());
  }

  function drillDown(nextType: "directors" | "shareholders", bizId: number) {
    setType(nextType);
    setValue(String(bizId));
    runLookup(nextType, String(bizId));
  }

  return (
    <>
      <motion.div {...fadeUp} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }} className="mt-8">
        <h1 className="text-[34px] font-extrabold tracking-[-1px] text-gradient">Verification</h1>
        <p className="mt-1 text-lead text-body">
          Run CAC and TIN lookups.
        </p>
      </motion.div>

      {/* Lookup form */}
      <motion.section
        {...fadeUp}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        className="mt-8 rounded-panel border border-line bg-white p-6 shadow-glass md:p-7"
      >
        <div className="inline-flex flex-wrap rounded-[10px] md:rounded-pill border border-line bg-subtle p-1">
          {LOOKUP_ORDER.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => switchType(t)}
              className="relative rounded-pill px-4 py-1.5 text-small font-medium transition-colors"
            >
              {type === t && (
                <motion.span
                  layoutId="verification-tab"
                  className="absolute inset-0 rounded-pill bg-white shadow-card"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className={`relative ${type === t ? "text-ink" : "text-body hover:text-ink"}`}>
                {LOOKUPS[t].label}
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="lookup-value" className="text-base font-medium text-ink">
              {config.inputLabel}
            </label>
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-btn border border-line bg-subtle px-4 py-3.5 transition-colors focus-within:border-brand focus-within:bg-white">
                <Search className="h-5 w-5 shrink-0 text-body" />
                <input
                  id="lookup-value"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={config.placeholder}
                  inputMode={type === "directors" || type === "shareholders" ? "numeric" : "text"}
                  className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-body/60"
                />
              </div>
              <button
                type="submit"
                disabled={running || !value.trim()}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-brand px-6 text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {running ? "Searching…" : `Run lookup${cost !== undefined ? ` · ₦${cost.toLocaleString("en-US")}` : ""}`}
              </button>
            </div>
            <p className="text-small text-body">
              {config.hint}
              {cost !== undefined && (
                <span className="text-body/80">
                  {" "}
                  Each successful lookup is charged ₦{cost.toLocaleString("en-US")} to your wallet.
                </span>
              )}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3"
            >
              <p className="text-small font-medium text-red-600">{error}</p>
              {walletError && (
                <Link
                  href="/billing"
                  className="inline-flex items-center gap-1.5 rounded-pill bg-white px-3.5 py-1.5 text-small font-medium text-brand-accent shadow-card transition-colors hover:bg-brand/10"
                >
                  <Wallet className="h-4 w-4" />
                  Top up wallet
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          )}
        </form>
      </motion.section>

      {/* Results */}
      {(running || result) && (
        <motion.section
          {...fadeUp}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="mt-6 rounded-panel border border-line bg-white p-6 shadow-glass md:p-7"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-card bg-subtle text-brand">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-card-title font-bold text-ink">
                {result ? `${LOOKUPS[result.type].label} results` : "Running lookup…"}
              </h2>
              <p className="text-small text-body">
                {result && Array.isArray(result.data)
                  ? `${result.data.length} record${result.data.length === 1 ? "" : "s"} returned`
                  : ""}
              </p>
            </div>

            {result && !running && buildExportRows(result).length > 0 && (
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    exportCsv(buildExportRows(result), `${LOOKUPS[result.type].label} results`)
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-btn bg-subtle px-4 text-small font-medium text-brand-accent transition-colors hover:bg-brand/10"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </button>
                <button
                  type="button"
                  onClick={() =>
                    exportExcel(
                      buildExportRows(result),
                      `${LOOKUPS[result.type].label} results`,
                      LOOKUPS[result.type].label,
                    )
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-btn bg-subtle px-4 text-small font-medium text-brand-accent transition-colors hover:bg-brand/10"
                >
                  <Download className="h-4 w-4" />
                  Excel
                </button>
              </div>
            )}
          </div>

          <div className="mt-6">
            {running ? (
              <LoadingState label="searching…" />
            ) : result?.type === "name" ? (
              <NameSearchResults
                matches={result.data as CacBusinessMatch[]}
                onDrillDown={drillDown}
                onSelect={setSelected}
              />
            ) : result ? (
              <RecordResult
                data={result.data}
                lookupLabel={LOOKUPS[result.type].label}
                onSelect={setSelected}
              />
            ) : null}
          </div>
        </motion.section>
      )}

      <AnimatePresence>
        {selected && (
          <DetailModal ariaLabel={selected.title} onClose={() => setSelected(null)}>
            <h3 className="text-card-title font-bold text-ink">{selected.title}</h3>
            {selected.fields.length > 0 && (
              <DetailCard>
                {selected.fields.map(([label, value], i) => (
                  <DetailRow key={`${label}-${i}`} label={label} value={value} />
                ))}
              </DetailCard>
            )}
            {selected.sections.map((section, si) => (
              <div key={`${section.title}-${si}`} className="flex flex-col gap-2">
                <h4 className="text-small font-semibold uppercase tracking-wide text-body">
                  {section.title}
                </h4>
                <DetailCard>
                  {section.fields.map(([label, value], i) => (
                    <DetailRow key={`${label}-${i}`} label={label} value={value} />
                  ))}
                </DetailCard>
              </div>
            ))}
          </DetailModal>
        )}
      </AnimatePresence>
    </>
  );
}
