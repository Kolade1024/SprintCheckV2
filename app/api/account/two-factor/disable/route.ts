import { apiHandler, readJson, requireSession } from "@/lib/server/handler";
import * as accountService from "@/lib/server/services/account";

/**
 * Two-step: no `code` in the body emails an OTP, a `code` completes the
 * disable. The service decides which step it is.
 */
export const POST = apiHandler(async (request: Request) => {
  const token = requireSession();
  const { code } = await readJson(request);
  return accountService.disableTwoFactor(token, code);
});
