import { NextResponse } from "next/server";
import { apiHandler, requireSession } from "@/lib/server/handler";
import * as merchantService from "@/lib/server/services/merchant";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async () => {
  const token = requireSession();
  return NextResponse.json(await merchantService.getPricing(token));
});
