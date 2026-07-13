import { apiHandler, readJson } from "@/lib/server/handler";
import * as authService from "@/lib/server/services/auth";
import type { SignupPayload } from "@/lib/shared/types";

export const POST = apiHandler(async (request: Request) => {
  const payload = await readJson<SignupPayload>(request);
  return authService.signup(payload);
});
