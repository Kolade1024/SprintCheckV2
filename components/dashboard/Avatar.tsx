"use client";

/**
 * Account avatar: the uploaded profile photo when there is one, falling back
 * to initials. The photo URL is a presigned link that rotates hourly, so it
 * always comes from a fresh /account load rather than being cached anywhere.
 */

function initialsOf(name: string, letters: 1 | 2): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  const first = parts[0][0] ?? "";
  if (letters === 1) return first.toUpperCase();
  return (first + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function Avatar({
  name,
  src,
  className = "h-9 w-9",
  textClassName = "text-small font-bold",
  letters = 1,
}: {
  name: string | undefined;
  src: string | null | undefined;
  /** Sizing classes — the shape is always a circle. */
  className?: string;
  textClassName?: string;
  /** 1 for compact chips, 2 for the large profile card. */
  letters?: 1 | 2;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className={`shrink-0 rounded-pill object-cover ${className}`}
      />
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-pill bg-brand text-offwhite ${className} ${textClassName}`}
    >
      {initialsOf(name ?? "", letters)}
    </span>
  );
}
