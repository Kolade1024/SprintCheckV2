import { NextResponse } from "next/server";
import { apiHandler, requireSession } from "@/lib/server/handler";
import * as accountService from "@/lib/server/services/account";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (request: Request) => {
  const token = requireSession();
  const page = Number(new URL(request.url).searchParams.get("page")) || 1;
  return NextResponse.json(await accountService.getNotifications(token, page));
});
