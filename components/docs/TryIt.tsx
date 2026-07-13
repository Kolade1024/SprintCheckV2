"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Param } from "@/lib/docs/spec";
import { highlightJson } from "./highlight";
import { Play } from "@/components/icons";

type Props = {
  method: string;
  /** Base URL + path with {param} placeholders. */
  urlTemplate: string;
  params: Param[];
  /** The example response shown when the simulated request completes. */
  responseJson: string;
  responseStatus: number;
};

type RunState = { phase: "idle" } | { phase: "sending" } | { phase: "done"; ms: number };

export default function TryIt({ method, urlTemplate, params, responseJson, responseStatus }: Props) {
  const editable = params.filter((p) => p.in !== "body" || p.name !== "image");
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(params.map((p) => [p.name, p.example ?? ""]))
  );
  const [run, setRun] = useState<RunState>({ phase: "idle" });
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const url = useMemo(() => {
    let u = urlTemplate;
    for (const p of params.filter((p) => p.in === "path")) {
      u = u.replace(`{${p.name}}`, values[p.name] || `{${p.name}}`);
    }
    const qs = params
      .filter((p) => p.in === "query" && values[p.name])
      .map((p) => `${p.name}=${encodeURIComponent(values[p.name])}`)
      .join("&");
    return qs ? `${u}?${qs}` : u;
  }, [urlTemplate, params, values]);

  const send = () => {
    if (run.phase === "sending") return;
    setRun({ phase: "sending" });
    const latency = 420 + Math.round(Math.random() * 480);
    timer.current = setTimeout(() => setRun({ phase: "done", ms: latency }), latency);
  };

  return (
    <section aria-label="Test this endpoint" className="overflow-hidden rounded-card border border-line bg-subtle/60">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-small font-semibold text-ink">Test this endpoint</h3>
          <p className="text-[12px] text-body">
            Simulated run — returns the example payload without calling the live API.
          </p>
        </div>
        <button
          type="button"
          onClick={send}
          disabled={run.phase === "sending"}
          className="inline-flex h-9 items-center gap-2 rounded-btn bg-brand px-4 text-small font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
        >
          <Play className="h-3.5 w-3.5" />
          {run.phase === "sending" ? "Verifying…" : "Send request"}
        </button>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* Resolved URL */}
        <p className="no-scrollbar overflow-x-auto whitespace-nowrap rounded-md border border-line bg-surface px-3 py-2 font-mono text-[12px] text-ink">
          <span className="mr-2 font-semibold text-brand-accent">{method}</span>
          {url}
        </p>

        {/* Inputs */}
        {editable.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {editable.map((p) => (
              <label key={p.name} className="flex min-w-0 flex-col gap-1">
                <span className="flex items-baseline gap-1.5 font-mono text-[11px] text-body">
                  {p.name}
                  {p.required ? <span className="text-[#b54708] dark:text-[#f5b169]">*</span> : null}
                  <span className="text-body/50">· {p.in}</span>
                </span>
                <input
                  value={values[p.name] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [p.name]: e.target.value }))}
                  placeholder={p.example ?? p.type}
                  className="h-9 rounded-md border border-line bg-surface px-3 font-mono text-[12.5px] text-ink outline-none transition-colors placeholder:text-body/40 focus:border-brand dark:focus:border-brand-accent"
                />
              </label>
            ))}
          </div>
        ) : null}

        {/* Result */}
        {run.phase !== "idle" ? (
          <div className="overflow-hidden rounded-card border border-white/10 bg-code-bg">
            <div className="flex items-center gap-3 border-b border-white/10 bg-code-bar px-3 py-2 font-mono text-[11px]">
              {run.phase === "sending" ? (
                <span className="flex items-center gap-2 text-code-comment">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-star" aria-hidden="true" />
                  Waiting for response…
                </span>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-success/15 px-2 py-0.5 font-semibold text-success">
                    {responseStatus} {responseStatus === 201 ? "Created" : "OK"}
                  </span>
                  <span className="text-code-comment">{run.ms} ms · simulated</span>
                </>
              )}
            </div>
            {run.phase === "done" ? (
              <pre className="no-scrollbar max-h-[360px] overflow-auto p-4 font-mono text-[12.5px] leading-[1.7]">
                <code>{highlightJson(responseJson)}</code>
              </pre>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
