import { apiHandler, readJson, requireSession } from "@/lib/server/handler";
import * as accountService from "@/lib/server/services/account";

export const POST = apiHandler(async (request: Request) => {
  const token = requireSession();
  const { code } = await readJson(request);
  return accountService.verifyTwoFactor(token, code);
});
