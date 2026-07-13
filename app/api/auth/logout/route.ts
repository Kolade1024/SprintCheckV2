import { apiHandler } from "@/lib/server/handler";
import { destroySession } from "@/lib/server/session";

/**
 * The merchant API has no server-side logout endpoint (only the admin API
 * does), so signing out means dropping the session cookie.
 */
export const POST = apiHandler(async () => {
  destroySession();
  return { message: "Signed out" };
});
