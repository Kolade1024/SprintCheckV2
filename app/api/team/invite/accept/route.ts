import { apiHandler, readJson } from "@/lib/server/handler";
import * as merchantService from "@/lib/server/services/merchant";
import type { AcceptInvitePayload } from "@/lib/shared/types";

/** Public — the invited teammate has no session until they finish signing up. */
export const POST = apiHandler(async (request: Request) => {
  const payload = await readJson<AcceptInvitePayload>(request);
  return merchantService.acceptTeamInvite(payload);
});
