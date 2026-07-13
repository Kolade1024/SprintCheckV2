import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/shared/constants";

/**
 * Server-side guard for the authenticated app shell. Users without a session
 * cookie are bounced to sign-in before any page code runs; the BFF still
 * verifies the token upstream on every request, so this is UX, not security.
 */
export function middleware(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE)) {
    const signIn = new URL("/signin", request.url);
    return NextResponse.redirect(signIn);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/verification/:path*",
    "/history/:path*",
    "/billing/:path*",
    "/developers/:path*",
    "/pricing/:path*",
    "/audit-log/:path*",
    "/profile/:path*",
  ],
};
