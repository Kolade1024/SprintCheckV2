"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle, Check, ChevronDown } from "./icons";

const INPUT =
  "h-12 w-full rounded-btn border border-line bg-white px-4 text-base text-ink shadow-card outline-none transition-colors placeholder:text-body/60 focus:border-brand focus:ring-2 focus:ring-brand/20";

const TOPICS = [
  "General enquiry",
  "Sales & pricing",
  "Technical support",
  "Partnerships",
];

type Status = "idle" | "submitting" | "done";

/**
 * Custom listbox replacing a native <select> so the control matches the rest
 * of the UI. Keyboard support: ↑/↓ to move, Enter/Space to choose, Esc to
 * close; closes on outside click. Mirrors the sandbox endpoint picker.
 */
function TopicSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => TOPICS.indexOf(value));
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setActive(TOPICS.indexOf(value));
    listRef.current?.focus();
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelectorAll("li")
      [active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function choose(i: number) {
    onChange(TOPICS[i]);
    setOpen(false);
  }

  function onButtonKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => Math.min(a + 1, TOPICS.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby="topic-label"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onButtonKeyDown}
        className={`flex h-12 w-full items-center justify-between gap-2 rounded-btn border bg-white px-4 text-left text-base text-ink shadow-card outline-none transition-colors ${
          open ? "border-brand ring-2 ring-brand/20" : "border-line hover:border-brand/60"
        }`}
      >
        {value}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-body transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={`topic-opt-${active}`}
          onKeyDown={onListKeyDown}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-64 overflow-auto rounded-card border border-line bg-white p-1.5 shadow-glass outline-none"
        >
          {TOPICS.map((topic, i) => {
            const selected = topic === value;
            return (
              <li
                key={topic}
                id={`topic-opt-${i}`}
                role="option"
                aria-selected={selected}
                onClick={() => choose(i)}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-btn px-3 py-2.5 text-base ${
                  i === active ? "bg-brand/10 text-ink" : "text-body"
                }`}
              >
                {topic}
                {selected && <Check className="h-4 w-4 shrink-0 text-brand-accent" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [topic, setTopic] = useState(TOPICS[0]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // No backend is wired yet — acknowledge locally so the form is usable.
    // Swap this for a POST to your contact endpoint when it's ready.
    setStatus("submitting");
    await new Promise((r) => setTimeout(r, 700));
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-hero border border-line bg-white p-10 text-center shadow-glass">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle className="h-7 w-7" />
        </span>
        <h2 className="text-card-title font-bold text-ink">Message sent</h2>
        <p className="max-w-[360px] text-base text-body">
          Thanks for reaching out. Our team will get back to you within one
          business day.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-2 text-small font-medium text-brand-accent transition-colors hover:text-brand"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-hero border border-line bg-white p-6 shadow-glass md:p-8"
    >
      {/* Custom dropdown value travels with the form for a future backend. */}
      <input type="hidden" name="topic" value={topic} />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-small font-medium text-ink">
            Full name
          </label>
          <input id="name" name="name" required placeholder="Ada Obi" className={INPUT} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-small font-medium text-ink">
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            className={INPUT}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="company" className="text-small font-medium text-ink">
            Company{" "}
            <span className="font-normal text-body/60">(optional)</span>
          </label>
          <input id="company" name="company" placeholder="Acme Lending" className={INPUT} />
        </div>
        <div className="flex flex-col gap-1.5">
          <span id="topic-label" className="text-small font-medium text-ink">
            Topic
          </span>
          <TopicSelect value={topic} onChange={setTopic} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-small font-medium text-ink">
          How can we help?
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell us a bit about what you're building and the verifications you need."
          className="w-full resize-y rounded-btn border border-line bg-white px-4 py-3 text-base text-ink shadow-card outline-none transition-colors placeholder:text-body/60 focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-brand px-6 text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {status === "submitting" ? (
          "Sending…"
        ) : (
          <>
            Send message
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="text-stat-label text-body">
        By submitting this form you agree to be contacted about your enquiry.
      </p>
    </form>
  );
}
