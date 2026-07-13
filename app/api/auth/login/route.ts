import { apiHandler, readJson } from "@/lib/server/handler";
import * as authService from "@/lib/server/services/auth";
import { createSession } from "@/lib/server/session";

export const POST = apiHandler(async (request: Request) => {
  const { email, password, remember } = await readJson(request);
  const { token, message } = await authService.login(email, password);
  // The upstream token lives only in an httpOnly cookie — never in the body.
  createSession(token, remember === true);
  return { message };
});
