import CopyButton from "./CopyButton";
import { highlightJson } from "./highlight";

export default function JsonPanel({
  title,
  json,
  footnote,
  tone = "success",
}: {
  title: string;
  json: string;
  footnote?: string;
  tone?: "success" | "error";
}) {
  return (
    <div className="overflow-hidden rounded-card border border-white/10 bg-code-bg shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-code-bar px-3 py-2">
        <span className="flex items-center gap-2 pl-1 font-mono text-[11px] text-code-comment">
          <span
            className={`h-1.5 w-1.5 rounded-full ${tone === "success" ? "bg-success" : "bg-[#e04444]"}`}
            aria-hidden="true"
          />
          {title}
        </span>
        <CopyButton text={json} />
      </div>
      <pre className="no-scrollbar max-h-[420px] overflow-auto p-4 font-mono text-[12.5px] leading-[1.7]">
        <code>{highlightJson(json)}</code>
      </pre>
      {footnote ? (
        <p className="border-t border-white/10 px-4 py-2 font-mono text-[10.5px] text-code-comment">
          {footnote}
        </p>
      ) : null}
    </div>
  );
}
