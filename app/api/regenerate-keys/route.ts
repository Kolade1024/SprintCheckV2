import { apiHandler, requireSession } from "@/lib/server/handler";
import * as merchantService from "@/lib/server/services/merchant";

export const PUT = apiHandler(async () => {
  const token = requireSession();
  return merchantService.regenerateKeys(token);
});
