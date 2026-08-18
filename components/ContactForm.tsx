"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle } from "./icons";
import Select from "@/components/dashboard/Select";

const INPUT =
  "h-12 w-full rounded-btn border border-line bg-white px-4 text-base text-ink shadow-card outline-none transition-colors placeholder:text-body/60 focus:border-brand focus:ring-2 focus:ring-brand/20";

const TOPICS = [
  "General enquiry",
  "Sales & pricing",
  "Technical support",
  "Partnerships",
].map((topic) => ({ value: topic, label: topic }));

type Status = "idle" | "submitting" | "done";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [topic, setTopic] = useState(TOPICS[0].value);

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
          <Select
            ariaLabel="Topic"
            value={topic}
            onChange={setTopic}
            options={TOPICS}
          />
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
