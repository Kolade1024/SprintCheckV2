import type { ReactNode } from "react";

/**
 * Minimal JSON tokenizer for the docs' response panels. Returns spans styled
 * with the code-window palette from tailwind.config.ts.
 */
export function highlightJson(json: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re =
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = re.exec(json)) !== null) {
    if (match.index > last) {
      out.push(
        <span key={key++} className="text-code-punct">
          {json.slice(last, match.index)}
        </span>
      );
    }
    if (match[1] !== undefined) {
      if (match[2]) {
        out.push(
          <span key={key++} className="text-code-fn">
            {match[1]}
          </span>,
          <span key={key++} className="text-code-punct">
            {match[2]}
          </span>
        );
      } else {
        out.push(
          <span key={key++} className="text-code-string">
            {match[1]}
          </span>
        );
      }
    } else if (match[3] !== undefined) {
      out.push(
        <span key={key++} className="text-code-keyword">
          {match[3]}
        </span>
      );
    } else if (match[4] !== undefined) {
      out.push(
        <span key={key++} className="text-code-keyword">
          {match[4]}
        </span>
      );
    }
    last = re.lastIndex;
  }
  if (last < json.length) {
    out.push(
      <span key={key++} className="text-code-punct">
        {json.slice(last)}
      </span>
    );
  }
  return out;
}
