"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "@/components/icons";

export interface SelectOption {
  value: string;
  label: string;
  /** Optional second line under the label. */
  hint?: string;
}

/**
 * Custom listbox used in place of every native <select> so dropdowns match the
 * rest of the UI (native ones can't be styled consistently across browsers).
 *
 * Keyboard: ↑/↓ and Home/End move, Enter/Space choose, Esc closes, Tab closes
 * and moves on. Typing jumps to the first option starting with those letters.
 * Closes on outside click.
 */
export default function Select({
  value,
  onChange,
  options,
  ariaLabel,
  placeholder = "Select…",
  size = "md",
  tone = "surface",
  drop = "down",
  align = "left",
  className = "",
  menuClassName = "",
  renderValue,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel?: string;
  placeholder?: string;
  /** Heights match the inputs they sit beside: filter bars, marketing forms, modal fields. */
  size?: "sm" | "md" | "lg";
  /** `subtle` matches the filled fields used inside modals. */
  tone?: "surface" | "subtle";
  /** Open upwards when the control sits near the bottom of the page. */
  drop?: "down" | "up";
  align?: "left" | "right";
  className?: string;
  menuClassName?: string;
  /** Override how the chosen option is displayed in the trigger. */
  renderValue?: (option: SelectOption | undefined) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ query: "", at: 0 });
  const id = useId();

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  // On open, highlight the current selection and take focus for key handling.
  useEffect(() => {
    if (!open) return;
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    listRef.current?.focus();
  }, [open, selectedIndex]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelectorAll("li")[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function choose(index: number) {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => Math.min(a + 1, options.length - 1));
        return;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
        return;
      case "Home":
        e.preventDefault();
        setActive(0);
        return;
      case "End":
        e.preventDefault();
        setActive(options.length - 1);
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        return;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        return;
      case "Tab":
        setOpen(false);
        return;
    }

    // Type-ahead: successive letters within a second extend the same query.
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const now = Date.now();
      const query =
        (now - typeahead.current.at < 1000 ? typeahead.current.query : "") + e.key.toLowerCase();
      typeahead.current = { query, at: now };
      const match = options.findIndex((o) => o.label.toLowerCase().startsWith(query));
      if (match >= 0) setActive(match);
    }
  }

  const sizing = {
    sm: "h-10 rounded-btn px-3 text-small font-medium",
    md: "h-12 rounded-btn px-4 text-base shadow-card",
    lg: "h-14 rounded-2xl px-4 text-base",
  }[size];

  // Filled fields lighten to white on focus, matching the inputs beside them.
  const surface = tone === "subtle" && !open ? "bg-subtle" : "bg-white";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
        className={`flex w-full items-center justify-between gap-2 border text-left text-ink outline-none transition-colors ${sizing} ${surface} ${
          open ? "border-brand ring-2 ring-brand/20" : "border-line hover:border-brand/60"
        } ${className}`}
      >
        <span className={`truncate ${selected ? "" : "text-body/70"}`}>
          {renderValue ? renderValue(selected) : (selected?.label ?? placeholder)}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-body transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel}
          aria-activedescendant={`${id}-opt-${active}`}
          onKeyDown={onListKeyDown}
          className={`no-scrollbar absolute z-30 max-h-64 min-w-full overflow-auto rounded-card border border-line bg-white p-1.5 shadow-glass outline-none ${
            drop === "up" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"
          } ${align === "right" ? "right-0" : "left-0"} ${menuClassName}`}
        >
          {options.map((option, i) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => choose(i)}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-btn px-3 py-2.5 text-small ${
                  i === active ? "bg-brand/10 text-ink" : "text-body"
                }`}
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium text-ink">{option.label}</span>
                  {option.hint && (
                    <span className="truncate text-stat-label text-body">{option.hint}</span>
                  )}
                </span>
                {isSelected && <Check className="h-4 w-4 shrink-0 text-brand-accent" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
