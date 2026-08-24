import { apiHandler, requireSession } from "@/lib/server/handler";
import * as supportService from "@/lib/server/services/support";

export const GET = apiHandler(
  async (_request: Request, { params }: { params: { id: string } }) => {
    const token = requireSession();
    return supportService.getTicket(token, params.id);
  },
);
