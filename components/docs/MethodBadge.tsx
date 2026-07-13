import type { Method } from "@/lib/docs/spec";

const STYLES: Record<Method, string> = {
  GET: "bg-[#0e9f6e]/10 text-[#067a53] dark:bg-[#0e9f6e]/15 dark:text-[#4ade80]",
  POST: "bg-[#2e90fa]/10 text-[#175cd3] dark:bg-[#2e90fa]/15 dark:text-[#8ab6ff]",
  PUT: "bg-[#dc6803]/10 text-[#b54708] dark:bg-[#dc6803]/15 dark:text-[#f5b169]",
  DELETE: "bg-[#e04444]/10 text-[#b42318] dark:bg-[#e04444]/15 dark:text-[#f89090]",
};

export default function MethodBadge({
  method,
  size = "md",
}: {
  method: Method;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-md font-mono font-semibold uppercase tracking-wide ${STYLES[method]} ${
        size === "sm" ? "h-[18px] w-11 text-[10px]" : "h-6 px-2 text-[11px]"
      }`}
    >
      {method}
    </span>
  );
}
