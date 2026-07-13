import { apiHandler, readJson } from "@/lib/server/handler";
import * as authService from "@/lib/server/services/auth";

export const POST = apiHandler(async (request: Request) => {
  const { email } = await readJson(request);
  return authService.forgotPassword(email);
});
