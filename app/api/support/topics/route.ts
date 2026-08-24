import { apiHandler } from "@/lib/server/handler";
import * as supportService from "@/lib/server/services/support";

/** Public — the contact form needs topics before anyone has signed in. */
export const GET = apiHandler(async () => {
  return { topics: await supportService.listTopics() };
});
