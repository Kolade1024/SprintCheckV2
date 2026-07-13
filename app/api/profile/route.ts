import { apiHandler, readJson, requireSession } from "@/lib/server/handler";
import * as merchantService from "@/lib/server/services/merchant";
import type { UpdateProfilePayload } from "@/lib/shared/types";

export const PUT = apiHandler(async (request: Request) => {
  const token = requireSession();
  const payload = await readJson<UpdateProfilePayload>(request);
  return merchantService.updateProfile(token, payload);
});
