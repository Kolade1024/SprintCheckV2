"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { ComponentType } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/dashboard/AsyncState";
import {
  Car,
  ClipboardList,
  CreditCard,
  FaceId,
  FingerScan,
  Globe,
  Search,
  type IconProps,
} from "@/components/icons";
import { appApi } from "@/lib/client/endpoints";
import { useApi } from "@/lib/client/useApi";
import type { PricingService } from "@/lib/shared/types";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

/* ------------------------------------------------------------------ helpers */

/** Picks a representative icon from the service name/category. */
function iconFor(service: PricingService): ComponentType<IconProps> {
  const key = `${service.name} ${service.category}`.toLowerCase();
  if (key.includes("nin")) return CreditCard;
  if (key.includes("passport") || key.includes("country")) return Globe;
  if (key.includes("driver") || key.includes("license")) return Car;
  if (key.includes("voter")) return ClipboardList;
  if (key.includes("face") || key.includes("liveness") || key.includes("biometric"))
    return FaceId;
  return FingerScan;
}

/* ------------------------------------------------------------------ page */

export default function PricingPage() {
  const { data, loading, error, refetch } = useApi((signal) => appApi.pricing(signal));
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");

  const services = useMemo(() => data ?? [], [data]);

  // Build the tab list from the categories the API actually returns.
  const tabs = useMemo(() => {
    const categories = Array.from(new Set(services.map((s) => s.category).filter(Boolean)));
    return ["All", ...categories];
  }, [services]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((s) => {
      const byTab = tab === "All" || s.category === tab;
      const bySearch = !q || s.name.toLowerCase().includes(q);
      return byTab && bySearch;
    });
  }, [services, tab, query]);

  return (
    <>
      <motion.div {...fadeUp} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }} className="mt-8">
        <h1 className="text-[34px] font-extrabold tracking-[-1px] text-gradient">Pricing</h1>
        <p className="mt-1 text-lead text-body">
          Check verification costs before you build them into your flows.
        </p>
      </motion.div>

      <motion.section
        {...fadeUp}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        className="mt-8 rounded-panel border border-line bg-white p-6 shadow-glass md:p-7"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-card-title font-bold text-ink">Verification services</h2>
            <p className="text-small text-body">{filtered.length} services available</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-pill border border-line bg-subtle p-1">
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className="relative rounded-pill px-4 py-1.5 text-small font-medium transition-colors"
                >
                  {tab === t && (
                    <motion.span
                      layoutId="pricing-tab"
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

            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services…"
                aria-label="Search services"
                className="h-10 w-[220px] rounded-btn border border-line bg-white pl-10 pr-3 text-small text-ink outline-none transition-colors placeholder:text-body/70 focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingState label="Loading pricing…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : services.length === 0 ? (
          <EmptyState message="No pricing information is available for your account yet." />
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="border-b border-line text-left text-stat-label uppercase tracking-wide text-body">
                  <th className="pb-3 font-medium">Service</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Country</th>
                  <th className="pb-3 text-right font-medium">Cost</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const Icon = iconFor(s);
                  return (
                    <tr
                      key={`${s.name}-${s.category}`}
                      className="border-b border-line/70 last:border-0 transition-colors hover:bg-subtle/50"
                    >
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-subtle text-brand">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-semibold text-ink">{s.name}</span>
                              {s.popular && (
                                <span className="rounded-pill bg-brand px-2 py-0.5 text-[11px] font-semibold text-offwhite">
                                  Popular
                                </span>
                              )}
                            </div>
                            <div className="text-stat-label text-body">Per Verification</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="inline-flex rounded-pill bg-subtle px-2.5 py-1 text-stat-label font-medium text-brand-accent">
                          {s.category}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-base text-body">{s.country}</td>
                      <td className="py-4 text-right">
                        <div className="text-card-title font-extrabold tracking-[-0.5px] text-ink">
                          ₦{s.cost.toLocaleString("en-US")}
                        </div>
                        <div className="text-stat-label text-body">Per Verification</div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-small text-body">
                      No services match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.section>
    </>
  );
}
