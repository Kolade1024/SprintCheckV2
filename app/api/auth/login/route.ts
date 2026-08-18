import { apiHandler, readJson } from "@/lib/server/handler";
import * as authService from "@/lib/server/services/auth";
import { createSession } from "@/lib/server/session";

export const POST = apiHandler(async (request: Request) => {
  const { email, password, remember } = await readJson(request);
  const { token, twoFactorRequired, message } = await authService.login(email, password);

  // 2FA accounts get no token yet — the client collects the emailed code and
  // finishes at /api/auth/two-factor, which is where the session starts.
  if (token) createSession(token, remember === true);

  return { message, twoFactorRequired };
});
