import { apiHandler, requireSession } from "@/lib/server/handler";
import * as accountService from "@/lib/server/services/account";

export const POST = apiHandler(async () => {
  const token = requireSession();
  return accountService.markAllNotificationsRead(token);
});
