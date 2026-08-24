"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle } from "./icons";
import Select from "@/components/dashboard/Select";
import { appApi } from "@/lib/client/endpoints";
import type { SupportTopic } from "@/lib/shared/types";

const INPUT =
  "h-12 w-full rounded-btn border border-line bg-white px-4 text-base text-ink shadow-card outline-none transition-colors placeholder:text-body/60 focus:border-brand focus:ring-2 focus:ring-brand/20";

const MAX_MESSAGE = 5000;

/** Same address the rest of the contact page publishes. */
const CONTACT_EMAIL = "info@megasprintlimited.com.ng";

type Status = "idle" | "submitting" | "done";
type TopicsState =
  | { status: "loading" }
  | { status: "ready"; topics: SupportTopic[] }
  | { status: "unavailable" };

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [topics, setTopics] = useState<TopicsState>({ status: "loading" });
  const [topicId, setTopicId] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Topics come from the API rather than a hardcoded list: they carry the
  // topic_id the ticket endpoint validates against, and those ids differ
  // between environments.
  useEffect(() => {
    const controller = new AbortController();

    appApi
      .supportTopics(controller.signal)
      .then(({ topics: list }) => {
        if (controller.signal.aborted) return;
        if (list.length === 0) {
          // Nothing to pick, and topic_id is required — better to say the form
          // is unavailable than to let someone write a message that can't send.
          setTopics({ status: "unavailable" });
          return;
        }
        setTopics({ status: "ready", topics: list });
        setTopicId(String(list[0].id));
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (controller.signal.aborted) return;
        setTopics({ status: "unavailable" });
      });

    return () => controller.abort();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (topics.status !== "ready") return;

    const data = new FormData(e.currentTarget);
    setError(null);
    setStatus("submitting");

    try {
      await appApi.submitSupportTicket({
        fullname: data.get("name")?.toString().trim() ?? "",
        email: data.get("email")?.toString().trim() ?? "",
        company: data.get("company")?.toString().trim() || undefined,
        topic_id: Number(topicId),
        message: data.get("message")?.toString().trim() ?? "",
      });
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send your message. Try again.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-hero border border-line bg-white p-10 text-center shadow-glass">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle className="h-7 w-7" />
        </span>
        <h2 className="text-card-title font-bold text-ink">Message sent</h2>
        <p className="max-w-[360px] text-base text-body">
          Thanks for reaching out — we&apos;ve emailed you a confirmation. Our
          team will get back to you within one business day.
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

  if (topics.status === "unavailable") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-hero border border-line bg-white p-10 text-center shadow-glass">
        <h2 className="text-card-title font-bold text-ink">Form unavailable</h2>
        <p className="max-w-[400px] text-base text-body">
          We can&apos;t load enquiry topics right now, so this form can&apos;t be
          submitted. Please email us directly and we&apos;ll pick it up.
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="mt-1 text-small font-medium text-brand-accent transition-colors hover:text-brand"
        >
          {CONTACT_EMAIL}
        </a>
      </div>
    );
  }

  const loading = topics.status === "loading";
  const options = topics.status === "ready"
    ? topics.topics.map((t) => ({ value: String(t.id), label: t.name }))
    : [];

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-hero border border-line bg-white p-6 shadow-glass md:p-8"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-small font-medium text-ink">
            Full name
          </label>
          <input id="name" name="name" required maxLength={255} placeholder="Ada Obi" className={INPUT} />
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
            maxLength={255}
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
          <input id="company" name="company" maxLength={255} placeholder="Acme Lending" className={INPUT} />
        </div>
        <div className="flex flex-col gap-1.5">
          <span id="topic-label" className="text-small font-medium text-ink">
            Topic
          </span>
          {loading ? (
            <div
              className="h-12 w-full animate-pulse rounded-btn border border-line bg-subtle"
              aria-label="Loading topics"
            />
          ) : (
            <Select
              ariaLabel="Topic"
              value={topicId}
              onChange={setTopicId}
              options={options}
            />
          )}
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
          maxLength={MAX_MESSAGE}
          placeholder="Tell us a bit about what you're building and the verifications you need."
          className="w-full resize-y rounded-btn border border-line bg-white px-4 py-3 text-base text-ink shadow-card outline-none transition-colors placeholder:text-body/60 focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      {error && (
        <p className="text-small font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting" || loading}
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
