import { NextResponse } from "next/server";
import { apiHandler, requireSession } from "@/lib/server/handler";
import * as accountService from "@/lib/server/services/account";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async () => {
  const token = requireSession();
  return NextResponse.json(await accountService.getAccount(token));
});
