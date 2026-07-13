import { apiHandler, requireSession } from "@/lib/server/handler";
import * as merchantService from "@/lib/server/services/merchant";

export const DELETE = apiHandler(async (_request: Request, { params }: { params: { id: string } }) => {
  const token = requireSession();
  return merchantService.removeTeamMember(token, params.id);
});
