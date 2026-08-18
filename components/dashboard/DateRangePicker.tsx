"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "@/components/icons";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/**
 * `YYYY-MM-DD` ⇄ Date helpers built from local date parts. `new Date("2026-08-18")`
 * parses as UTC and lands on the previous day for anyone behind it, which would
 * silently shift the filter range for users in WAT.
 */
function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
}

function toISODate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Monday-first grid covering `month`, padded with adjacent days (6 weeks). */
function buildMonthGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const leading = (first.getDay() + 6) % 7; // getDay() is Sunday-first
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - leading);
  return Array.from({ length: 42 }, (_, i) =>
    new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  );
}

function formatShort(date: Date, withYear: boolean): string {
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

/**
 * One control for a from/to date range, replacing a pair of `<input type="date">`
 * (unstylable, and rendered differently by every browser). Click a start day
 * then an end day; presets cover the common ranges. Values are ISO
 * `YYYY-MM-DD` strings, or "" when unset.
 */
export default function DateRangePicker({
  from,
  to,
  onChange,
  ariaLabel = "Date range",
  placeholder = "Any dates",
  align = "left",
  className = "",
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  ariaLabel?: string;
  placeholder?: string;
  /** Anchor the popover's right edge — use near the right of a container. */
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<Date | null>(null);
  /** Set while a start day is chosen and we're waiting for the end day. */
  const [pendingStart, setPendingStart] = useState<Date | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const fromDate = useMemo(() => parseISODate(from), [from]);
  const toDate = useMemo(() => parseISODate(to), [to]);

  const [month, setMonth] = useState<Date>(() => {
    const base = fromDate ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  useEffect(() => {
    if (!open) return;
    const base = fromDate ?? new Date();
    setMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setPendingStart(null);
    setHovered(null);
  }, [open, fromDate]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const days = useMemo(() => buildMonthGrid(month), [month]);
  const today = new Date();

  function pick(date: Date) {
    if (!pendingStart) {
      setPendingStart(date);
      onChange(toISODate(date), "");
      return;
    }
    // Second click closes the range, flipping the ends if picked backwards.
    const [start, end] = pendingStart <= date ? [pendingStart, date] : [date, pendingStart];
    onChange(toISODate(start), toISODate(end));
    setPendingStart(null);
    setOpen(false);
  }

  function applyPreset(days: number) {
    const end = startOfDay(new Date());
    onChange(toISODate(addDays(end, -(days - 1))), toISODate(end));
    setPendingStart(null);
    setOpen(false);
  }

  function applyThisMonth() {
    const now = new Date();
    onChange(
      toISODate(new Date(now.getFullYear(), now.getMonth(), 1)),
      toISODate(startOfDay(now)),
    );
    setPendingStart(null);
    setOpen(false);
  }

  function clear() {
    onChange("", "");
    setPendingStart(null);
    setHovered(null);
  }

  // While picking, preview the range the hovered day would produce.
  const previewStart = pendingStart ?? fromDate;
  const previewEnd = pendingStart ? hovered : toDate;

  function inRange(date: Date): boolean {
    if (!previewStart || !previewEnd) return false;
    const [lo, hi] =
      previewStart <= previewEnd ? [previewStart, previewEnd] : [previewEnd, previewStart];
    const day = startOfDay(date).getTime();
    return day > startOfDay(lo).getTime() && day < startOfDay(hi).getTime();
  }

  const sameYear = fromDate && toDate && fromDate.getFullYear() === toDate.getFullYear();
  const label = fromDate
    ? toDate
      ? `${formatShort(fromDate, !sameYear)} – ${formatShort(toDate, true)}`
      : `From ${formatShort(fromDate, true)}`
    : placeholder;

  return (
    <div ref={rootRef} className="relative">
      <div
        className={`flex h-10 items-center gap-2 rounded-btn border bg-white pl-3 pr-2 transition-colors ${
          open ? "border-brand ring-2 ring-brand/20" : "border-line hover:border-brand/60"
        } ${className}`}
      >
        <button
          type="button"
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left text-small outline-none"
        >
          <Calendar className="h-4 w-4 shrink-0 text-body" />
          <span className={`truncate ${fromDate ? "text-ink" : "text-body/70"}`}>{label}</span>
        </button>
        {fromDate && (
          <button
            type="button"
            aria-label="Clear dates"
            onClick={clear}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-btn text-body transition-colors hover:bg-black/5 hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div
          role="dialog"
          aria-label={ariaLabel}
          className={`absolute top-[calc(100%+6px)] z-30 w-[248px] rounded-card border border-line bg-white p-2.5 shadow-glass ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="flex flex-wrap gap-1 pb-2">
            {[
              { label: "7 days", onClick: () => applyPreset(7) },
              { label: "30 days", onClick: () => applyPreset(30) },
              { label: "This month", onClick: applyThisMonth },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={preset.onClick}
                className="rounded-pill bg-subtle px-2.5 py-1 text-stat-label font-medium text-brand-accent transition-colors hover:bg-brand/10"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-1 border-t border-line pt-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              className="flex h-6 w-6 items-center justify-center rounded-btn text-body transition-colors hover:bg-subtle hover:text-ink"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-stat-label font-semibold text-ink">
              {MONTHS[month.getMonth()]} {month.getFullYear()}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              className="flex h-6 w-6 items-center justify-center rounded-btn text-body transition-colors hover:bg-subtle hover:text-ink"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-1 grid grid-cols-7" onMouseLeave={() => setHovered(null)}>
            {WEEKDAYS.map((day, i) => (
              <span
                key={`${day}-${i}`}
                className="flex h-6 items-center justify-center text-[10px] font-medium text-body/60"
              >
                {day}
              </span>
            ))}

            {days.map((date) => {
              const inMonth = date.getMonth() === month.getMonth();
              const isStart = previewStart != null && sameDay(date, previewStart);
              const isEnd = previewEnd != null && sameDay(date, previewEnd);
              const isEdge = isStart || isEnd;
              const between = inRange(date);
              const isToday = sameDay(date, today);

              return (
                <button
                  key={date.getTime()}
                  type="button"
                  onClick={() => pick(date)}
                  onMouseEnter={() => setHovered(date)}
                  aria-current={isToday ? "date" : undefined}
                  aria-pressed={isEdge}
                  className={`flex h-7 items-center justify-center text-[11px] transition-colors ${
                    isEdge
                      ? "rounded-btn bg-brand font-semibold text-offwhite"
                      : between
                        ? "bg-brand/10 text-ink"
                        : inMonth
                          ? "rounded-btn text-ink hover:bg-subtle"
                          : "rounded-btn text-body/40 hover:bg-subtle"
                  } ${isToday && !isEdge ? "font-bold text-brand-accent" : ""}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-1 flex items-center justify-between border-t border-line pt-1.5">
            <span className="text-[10px] text-body/70">
              {pendingStart ? "Pick an end date" : "Pick a start date"}
            </span>
            {fromDate && (
              <button
                type="button"
                onClick={clear}
                className="rounded-btn px-1.5 py-0.5 text-stat-label font-medium text-body transition-colors hover:bg-subtle hover:text-ink"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
