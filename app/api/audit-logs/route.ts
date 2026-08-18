import { NextResponse } from "next/server";
import { apiHandler, requireSession } from "@/lib/server/handler";
import * as merchantService from "@/lib/server/services/merchant";
import type { AuditLogQuery, AuditSeverity } from "@/lib/shared/types";

export const dynamic = "force-dynamic";

export const GET = apiHandler(async (request: Request) => {
  const token = requireSession();
  const params = new URL(request.url).searchParams;
  const value = (key: string) => params.get(key)?.trim() || undefined;

  // Filtering is done upstream; the service drops anything it doesn't know.
  const query: AuditLogQuery = {
    severity: value("severity") as AuditSeverity | undefined,
    action: value("action"),
    actor: value("actor"),
    from: value("from"),
    to: value("to"),
    search: value("search"),
    perPage: Number(params.get("per_page")) || undefined,
    page: Number(params.get("page")) || undefined,
  };

  return NextResponse.json(await merchantService.getAuditLogs(token, query));
});
