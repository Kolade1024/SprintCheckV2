import { apiHandler, readJson, requireSession } from "@/lib/server/handler";
import * as merchantService from "@/lib/server/services/merchant";

export const POST = apiHandler(async (request: Request) => {
  const token = requireSession();
  const { bvn } = await readJson(request);
  return merchantService.generateAccount(token, bvn);
});
