import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow: string;
  /** Leading (dark) part of the heading. */
  title: string;
  /** Trailing words rendered in the purple→indigo gradient accent. */
  accent?: string;
  subtitle?: ReactNode;
  align?: "center" | "left";
  className?: string;
}

/**
 * Reusable section header: small purple eyebrow, an H2 whose trailing words
 * use the brand gradient, and an optional muted subtitle.
 */
export default function SectionHeading({
  eyebrow,
  title,
  accent,
  subtitle,
  align = "center",
  className = "",
}: SectionHeadingProps) {
  const alignment =
    align === "center" ? "items-center text-center mx-auto" : "items-start text-left";

  return (
    <div className={`flex max-w-prose flex-col gap-4 ${alignment} ${className}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="text-balance text-[32px] font-extrabold leading-[1.1] tracking-[-1px] text-ink md:text-h2">
        {title}
        {accent ? (
          <>
            {" "}
            <span className="text-gradient">{accent}</span>
          </>
        ) : null}
      </h2>
      {subtitle ? (
        <p className="max-w-prose text-base text-body md:text-lead">{subtitle}</p>
      ) : null}
    </div>
  );
}
