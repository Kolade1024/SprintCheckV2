import { apiHandler, readJson, requireSession } from "@/lib/server/handler";
import * as merchantService from "@/lib/server/services/merchant";

export const POST = apiHandler(async (request: Request) => {
  const token = requireSession();
  const { webhook_url } = await readJson(request);
  return merchantService.updateWebhook(token, webhook_url);
});
