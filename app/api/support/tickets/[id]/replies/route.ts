import { NextResponse } from "next/server";
import { apiHandler, readJson, requireSession } from "@/lib/server/handler";
import * as supportService from "@/lib/server/services/support";

export const GET = apiHandler(
  async (_request: Request, { params }: { params: { id: string } }) => {
    const token = requireSession();
    return { replies: await supportService.listReplies(token, params.id) };
  },
);

export const POST = apiHandler(
  async (request: Request, { params }: { params: { id: string } }) => {
    const token = requireSession();
    const { message } = await readJson(request);
    const result = await supportService.replyToTicket(token, params.id, message);
    return NextResponse.json(result, { status: 201 });
  },
);
