import { apiHandler, readJson, requireSession } from "@/lib/server/handler";
import * as merchantService from "@/lib/server/services/merchant";
import type { InviteTeamMemberPayload } from "@/lib/shared/types";

export const POST = apiHandler(async (request: Request) => {
  const token = requireSession();
  const payload = await readJson<InviteTeamMemberPayload>(request);
  return merchantService.inviteTeamMember(token, payload);
});
