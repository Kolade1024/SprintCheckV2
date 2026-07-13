import type { VerificationLog } from "./types";

/**
 * Pure bucketing logic for the dashboard's verification-activity chart.
 * Kept out of the component so it can be unit-tested and reused.
 */

export const ACTIVITY_RANGES = ["7D", "30D", "90D"] as const;
export type ActivityRange = (typeof ACTIVITY_RANGES)[number];

export interface ActivityBucket {
  label: string;
  verified: number;
  failed: number;
}

export interface ActivitySeries {
  buckets: ActivityBucket[];
  /** Nice-rounded axis maximum (always > 0 so bars can be scaled). */
  max: number;
  /** Gridline values, descending from `max` to 0 (rendered top → bottom). */
  ticks: number[];
  isEmpty: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const TICK_COUNT = 5; // 4 intervals → max is rounded up to a multiple of 4

type RangeConfig = {
  days: number;
  bucketCount: number;
  label: (bucketStart: Date) => string;
};

const RANGE_CONFIG: Record<ActivityRange, RangeConfig> = {
  "7D": {
    days: 7,
    bucketCount: 7,
    label: (d) => d.toLocaleDateString(undefined, { weekday: "short" }),
  },
  "30D": {
    days: 30,
    bucketCount: 6, // 5-day buckets
    label: (d) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  },
  "90D": {
    days: 90,
    bucketCount: 6, // 15-day buckets
    label: (d) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  },
};

/** Rounds up to a multiple of (TICK_COUNT - 1) so every gridline is an integer. */
function niceMax(rawMax: number): number {
  const intervals = TICK_COUNT - 1;
  return Math.max(intervals, Math.ceil(rawMax / intervals) * intervals);
}

export function buildActivitySeries(
  logs: VerificationLog[],
  range: ActivityRange,
): ActivitySeries {
  const { days, bucketCount, label } = RANGE_CONFIG[range];
  const bucketMs = (days / bucketCount) * DAY_MS;

  // Window ends "now" and starts `days` ago, aligned to the start of that day
  // so a 7D view covers today plus the six previous full days.
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const windowStart = startOfToday.getTime() - (days - 1) * DAY_MS;

  const buckets: ActivityBucket[] = Array.from({ length: bucketCount }, (_, i) => ({
    label: label(new Date(windowStart + i * bucketMs)),
    verified: 0,
    failed: 0,
  }));

  let total = 0;
  for (const log of logs) {
    const t = new Date(log.createdAt).getTime();
    if (Number.isNaN(t) || t < windowStart) continue;
    const index = Math.min(Math.floor((t - windowStart) / bucketMs), bucketCount - 1);
    if (log.status === "successful") buckets[index].verified += 1;
    else buckets[index].failed += 1;
    total += 1;
  }

  const rawMax = buckets.reduce((m, b) => Math.max(m, b.verified, b.failed), 0);
  const max = niceMax(rawMax);
  const step = max / (TICK_COUNT - 1);
  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => max - i * step);

  return { buckets, max, ticks, isEmpty: total === 0 };
}
