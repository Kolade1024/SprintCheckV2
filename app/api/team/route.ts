import { NextResponse } from "next/server";
import { apiHandler, readJson, requireSession } from "@/lib/server/handler";
import * as merchantService from "@/lib/server/services/merchant";
import type { InviteTeamMemberPayload } from "@/lib/shared/types";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async () => {
  const token = requireSession();
  return NextResponse.json(await merchantService.getTeam(token));
});

export const POST = apiHandler(async (request: Request) => {
  const token = requireSession();
  const payload = await readJson<InviteTeamMemberPayload>(request);
  return merchantService.inviteTeamMember(token, payload);
});
