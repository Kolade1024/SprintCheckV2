import { apiHandler, readJson, requireSession } from "@/lib/server/handler";
import * as accountService from "@/lib/server/services/account";

export const POST = apiHandler(async (request: Request) => {
  const token = requireSession();
  const { password } = await readJson(request);
  return accountService.requestAccountDeletion(token, password);
});

export const DELETE = apiHandler(async () => {
  const token = requireSession();
  return accountService.cancelAccountDeletion(token);
});
