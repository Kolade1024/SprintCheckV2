import { NextResponse } from "next/server";
import { apiHandler, readJson, requireSession } from "@/lib/server/handler";
import * as supportService from "@/lib/server/services/support";

export const dynamic = "force-dynamic";

/** Authenticated — a merchant's own tickets. */
export const GET = apiHandler(async (request: Request) => {
  const token = requireSession();
  const page = Number(new URL(request.url).searchParams.get("page")) || 1;
  return NextResponse.json(await supportService.listMyTickets(token, page));
});

/** Public — the marketing contact form posts here. */
export const POST = apiHandler(async (request: Request) => {
  const body = await readJson(request);
  const { ticket, message } = await supportService.submitTicket({
    fullname: body.fullname,
    email: body.email,
    company: body.company,
    topic_id: body.topic_id,
    message: body.message,
  });
  return NextResponse.json({ ticket, message }, { status: 201 });
});
