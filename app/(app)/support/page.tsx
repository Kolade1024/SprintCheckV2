"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EmptyState, ErrorState, LoadingState } from "@/components/dashboard/AsyncState";
import { ArrowLeft, ChevronLeft, ChevronRight, Headset, MessageSquare } from "@/components/icons";
import { appApi } from "@/lib/client/endpoints";
import type { SupportTicket, SupportTicketStatus, TicketReply } from "@/lib/shared/types";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const MAX_REPLY = 5000;

/* ------------------------------------------------------------------ helpers */

function formatTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const STATUS_STYLES: Record<SupportTicketStatus, { cls: string; dot: string; label: string }> = {
  open: { cls: "bg-brand/10 text-brand-accent", dot: "bg-brand-accent", label: "Open" },
  in_progress: { cls: "bg-star/10 text-star", dot: "bg-star", label: "In progress" },
  resolved: { cls: "bg-success/10 text-success", dot: "bg-success", label: "Resolved" },
  closed: { cls: "bg-body/10 text-body", dot: "bg-body", label: "Closed" },
};

function StatusBadge({ status }: { status: SupportTicketStatus }) {
  const { cls, dot, label } = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-stat-label font-semibold ${cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------ ticket detail */

function TicketDetail({ ticket, onBack }: { ticket: SupportTicket; onBack: () => void }) {
  const [replies, setReplies] = useState<TicketReply[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generation, setGeneration] = useState(0);

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    setLoading(true);
    setError(null);

    appApi
      .supportTicketReplies(ticket.id, controller.signal)
      .then(({ replies: list }) => {
        if (cancelled) return;
        setReplies(list);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled || (err instanceof DOMException && err.name === "AbortError")) return;
        setError(err instanceof Error ? err.message : "Couldn't load replies.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [ticket.id, generation]);

  async function sendReply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const message = draft.trim();
    if (!message) return;

    setSendError(null);
    setSending(true);
    try {
      await appApi.replyToSupportTicket(ticket.id, message);
      setDraft("");
      setGeneration((g) => g + 1);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Couldn't send your reply.");
    } finally {
      setSending(false);
    }
  }

  // Closed tickets are read-only upstream, so don't offer a composer that fails.
  const canReply = ticket.status !== "closed";

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex w-fit items-center gap-1.5 text-small font-medium text-brand-accent transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        All tickets
      </button>

      <div className="flex flex-col gap-3 border-b border-line pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-card-title font-bold text-ink">
            {ticket.topic?.name ?? "Enquiry"}{" "}
            <span className="font-normal text-body">#{ticket.id}</span>
          </h2>
          <StatusBadge status={ticket.status} />
        </div>
        <p className="text-stat-label text-body">
          Opened {formatTime(ticket.createdAt)}
          {ticket.company ? ` · ${ticket.company}` : ""}
        </p>
      </div>

      {/* Original message, then the thread. */}
      <article className="flex flex-col gap-2 rounded-panel border border-line bg-subtle/60 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-small font-semibold text-ink">{ticket.fullname}</span>
          <span className="text-stat-label text-body">{formatTime(ticket.createdAt)}</span>
        </div>
        <p className="whitespace-pre-wrap text-base text-body">{ticket.message}</p>
      </article>

      {loading ? (
        <LoadingState label="Loading replies…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setGeneration((g) => g + 1)} />
      ) : replies && replies.length > 0 ? (
        <div className="flex flex-col gap-4">
          {replies.map((reply) => {
            const fromAdmin = reply.senderType === "admin";
            return (
              <article
                key={reply.id}
                className={`flex flex-col gap-2 rounded-panel border p-5 ${
                  fromAdmin
                    ? "border-brand/20 bg-brand/[0.04]"
                    : "border-line bg-white"
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-small font-semibold text-ink">
                    {reply.senderName}
                    {fromAdmin && (
                      <span className="ml-2 rounded-pill bg-brand/10 px-2 py-0.5 text-stat-label font-semibold text-brand-accent">
                        SprintCheck
                      </span>
                    )}
                  </span>
                  <span className="text-stat-label text-body">{formatTime(reply.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap text-base text-body">{reply.message}</p>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState message="No replies yet. We'll email you when our team responds." />
      )}

      {canReply ? (
        <form onSubmit={sendReply} className="flex flex-col gap-3 border-t border-line pt-6">
          <label htmlFor="reply" className="text-small font-medium text-ink">
            Add a reply
          </label>
          <textarea
            id="reply"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            maxLength={MAX_REPLY}
            placeholder="Type your reply…"
            className="w-full resize-y rounded-btn border border-line bg-white px-4 py-3 text-base text-ink shadow-card outline-none transition-colors placeholder:text-body/60 focus:border-brand focus:ring-2 focus:ring-brand/20"
          />

          {sendError && (
            <p className="text-small font-medium text-red-600" role="alert">
              {sendError}
            </p>
          )}

          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-btn bg-brand px-5 text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {sending ? "Sending…" : "Send reply"}
          </button>
        </form>
      ) : (
        <p className="border-t border-line pt-6 text-small text-body">
          This ticket is closed. Start a new enquiry from the contact page if you
          need more help.
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------- page */

export default function SupportPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<SupportTicket | null>(null);

  const [tickets, setTickets] = useState<SupportTicket[] | null>(null);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generation, setGeneration] = useState(0);

  const reload = useCallback(() => setGeneration((g) => g + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    setLoading(true);
    setError(null);

    appApi
      .supportTickets(page, controller.signal)
      .then((result) => {
        if (cancelled) return;
        setTickets(result.items);
        setLastPage(result.meta.lastPage);
        setTotal(result.meta.total);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled || (err instanceof DOMException && err.name === "AbortError")) return;
        setError(err instanceof Error ? err.message : "Couldn't load your tickets.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [page, generation]);

  return (
    <>
      <motion.div {...fadeUp} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }} className="mt-8">
        <h1 className="text-[34px] font-extrabold tracking-[-1px] text-gradient">Support</h1>
        <p className="mt-1 text-lead text-body">
          Your enquiries and our replies, in one thread.
        </p>
      </motion.div>

      <motion.section
        {...fadeUp}
        transition={{ duration: 0.5, delay: 0.12, ease: [0.4, 0, 0.2, 1] }}
        className="mt-8 rounded-panel border border-line bg-white p-6 shadow-glass md:p-7"
      >
        {selected ? (
          <TicketDetail ticket={selected} onBack={() => setSelected(null)} />
        ) : loading ? (
          <LoadingState label="Loading your tickets…" />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : tickets && tickets.length > 0 ? (
          <>
            <div className="flex flex-col gap-3">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelected(ticket)}
                  className="flex flex-col gap-2 rounded-panel border border-line bg-white p-5 text-left transition-colors hover:border-brand/30 hover:bg-subtle/50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-base font-semibold text-ink">
                      {ticket.topic?.name ?? "Enquiry"}{" "}
                      <span className="font-normal text-body">#{ticket.id}</span>
                    </span>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <p className="line-clamp-2 text-small text-body">{ticket.message}</p>
                  <div className="flex items-center gap-4 text-stat-label text-body">
                    <span>{formatTime(ticket.createdAt)}</span>
                    {ticket.repliesCount !== null && ticket.repliesCount > 0 && (
                      <span className="inline-flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {ticket.repliesCount}{" "}
                        {ticket.repliesCount === 1 ? "reply" : "replies"}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {lastPage > 1 && (
              <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-5">
                <span className="text-stat-label text-body">
                  Page {page} of {lastPage} · {total} total
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    aria-label="Previous page"
                    className="flex h-9 w-9 items-center justify-center rounded-btn border border-line text-body transition-colors hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    disabled={page >= lastPage}
                    aria-label="Next page"
                    className="flex h-9 w-9 items-center justify-center rounded-btn border border-line text-body transition-colors hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-subtle text-brand-accent">
              <Headset className="h-6 w-6" />
            </span>
            <p className="max-w-[420px] text-small text-body">
              You haven&apos;t raised any support tickets yet.
            </p>
            <a
              href="/contact"
              className="text-small font-medium text-brand-accent transition-colors hover:text-brand"
            >
              Start an enquiry
            </a>
          </div>
        )}
      </motion.section>
    </>
  );
}
