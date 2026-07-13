import { apiHandler, readJson } from "@/lib/server/handler";
import * as authService from "@/lib/server/services/auth";

export const POST = apiHandler(async (request: Request) => {
  const { email, code } = await readJson(request);
  return authService.verifyResetCode(email, code);
});
