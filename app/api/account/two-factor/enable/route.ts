import { apiHandler, requireSession } from "@/lib/server/handler";
import * as accountService from "@/lib/server/services/account";

/** Step 1 of enabling 2FA — emails a code. Nothing changes until it's verified. */
export const POST = apiHandler(async () => {
  const token = requireSession();
  return accountService.enableTwoFactor(token);
});
