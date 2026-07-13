import { apiHandler, readJson } from "@/lib/server/handler";
import * as authService from "@/lib/server/services/auth";

export const POST = apiHandler(async (request: Request) => {
  const { email, code, password } = await readJson(request);
  return authService.resetPassword(email, code, password);
});
