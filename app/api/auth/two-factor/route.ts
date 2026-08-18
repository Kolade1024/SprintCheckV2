import { apiHandler, readJson } from "@/lib/server/handler";
import * as authService from "@/lib/server/services/auth";
import { createSession } from "@/lib/server/session";

/**
 * Second login step for 2FA accounts. Same contract as /auth/login: the token
 * goes straight into the httpOnly cookie and never reaches the browser.
 */
export const POST = apiHandler(async (request: Request) => {
  const { email, code, remember } = await readJson(request);
  const { token, message } = await authService.verifyLoginTwoFactor(email, code);
  createSession(token, remember === true);
  return { message };
});
