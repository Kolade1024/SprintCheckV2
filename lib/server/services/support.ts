import { mapPageMeta, mapSupportTicket, mapSupportTopic, mapTicketReply } from "@/lib/server/mappers";
import { queryString, upstream, UpstreamError } from "@/lib/server/upstream";
import type {
  SupportTicket,
  SupportTicketPage,
  SupportTopic,
  TicketReply,
} from "@/lib/shared/types";

/**
 * Support tickets.
 *
 * Two of these routes are public — listing topics and submitting a ticket —
 * because the contact form on the marketing site uses them before anyone has
 * signed in. The rest are bearer-authenticated and upstream scopes them to the
 * caller's own tickets by email.
 */

type Raw = Record<string, unknown>;

const APIKEY = { kind: "apiKey" } as const;
const bearer = (token: string) => ({ kind: "bearer", token }) as const;

const MAX_MESSAGE = 5000;

function required(value: unknown, field: string, max = 255): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new UpstreamError(`${field} is required.`, 422);
  if (text.length > max) {
    throw new UpstreamError(`${field} must be ${max} characters or fewer.`, 422);
  }
  return text;
}

/* -------------------------------------------------------------- public */

export async function listTopics(): Promise<SupportTopic[]> {
  const res = await upstream<{ data?: Raw[] }>("/support-topics", { auth: APIKEY });
  return (res.data ?? []).map(mapSupportTopic);
}

/**
 * Public submission — this is what the contact form posts to. Upstream emails
 * the customer a confirmation, notifies admins, and rate-limits to 10/min.
 */
export async function submitTicket(input: {
  fullname: unknown;
  email: unknown;
  company?: unknown;
  topic_id: unknown;
  message: unknown;
}): Promise<{ ticket: SupportTicket; message: string }> {
  // Validated in the order the fields appear in the form, so the first error
  // the user sees is the first field they'd need to fix.
  const fullname = required(input.fullname, "Full name");

  const email = required(input.email, "Email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new UpstreamError("Enter a valid email address.", 422);
  }

  const topicId = Number(input.topic_id);
  if (!Number.isInteger(topicId) || topicId <= 0) {
    throw new UpstreamError("Choose a topic for your enquiry.", 422);
  }

  const message = required(input.message, "Message", MAX_MESSAGE);
  const company = typeof input.company === "string" ? input.company.trim() : "";

  const res = await upstream<{ data?: Raw; message?: string }>("/support-tickets", {
    method: "POST",
    auth: APIKEY,
    body: {
      fullname,
      email,
      topic_id: topicId,
      message,
      ...(company ? { company: company.slice(0, 255) } : {}),
    },
  });

  return {
    ticket: mapSupportTicket(res.data ?? {}),
    message: res.message ?? "Your enquiry has been submitted successfully.",
  };
}

/* -------------------------------------------------------- authenticated */

export async function listMyTickets(token: string, page = 1): Promise<SupportTicketPage> {
  const res = await upstream<{ data?: Raw[]; meta?: Raw }>(
    `/support-tickets${queryString({ page, per_page: 15 })}`,
    { auth: bearer(token) },
  );
  const items = (res.data ?? []).map(mapSupportTicket);
  return { items, meta: mapPageMeta(res.meta, items.length) };
}

/** Upstream 404s when the ticket isn't the caller's, so ownership is enforced there. */
export async function getTicket(token: string, id: string): Promise<SupportTicket> {
  const res = await upstream<{ data?: Raw }>(`/support-tickets/${ticketId(id)}`, {
    auth: bearer(token),
  });
  return mapSupportTicket(res.data ?? {});
}

export async function listReplies(token: string, id: string): Promise<TicketReply[]> {
  const res = await upstream<{ data?: Raw[] }>(`/support-tickets/${ticketId(id)}/replies`, {
    auth: bearer(token),
  });
  return (res.data ?? []).map(mapTicketReply);
}

export async function replyToTicket(
  token: string,
  id: string,
  message: unknown,
): Promise<{ reply: TicketReply; message: string }> {
  const res = await upstream<{ data?: Raw; message?: string }>(
    `/support-tickets/${ticketId(id)}/replies`,
    {
      method: "POST",
      auth: bearer(token),
      body: { message: required(message, "Reply", MAX_MESSAGE) },
    },
  );
  return {
    reply: mapTicketReply(res.data ?? {}),
    message: res.message ?? "Reply sent successfully.",
  };
}

/** Ticket ids are integers upstream; reject anything else before building a URL. */
function ticketId(value: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new UpstreamError("That ticket could not be found.", 404);
  }
  return id;
}
