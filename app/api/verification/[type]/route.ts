import { NextResponse } from "next/server";
import { apiHandler, readJson, requireSession } from "@/lib/server/handler";
import * as merchantService from "@/lib/server/services/merchant";
import { UpstreamError } from "@/lib/server/upstream";
import type { CacLookupType } from "@/lib/shared/types";

/**
 * One controller for the five Merchant > Verification lookups. The `type`
 * segment selects the service function; each is billed per successful call
 * upstream, so nothing here retries.
 */

type LookupHandler = (token: string, body: Record<string, unknown>) => Promise<unknown>;

const LOOKUPS: Record<CacLookupType, LookupHandler> = {
  name: (token, body) => merchantService.cacNameSearch(token, body.name),
  profile: (token, body) => merchantService.cacProfileSearch(token, body.number),
  directors: (token, body) => merchantService.cacDirectorsLookup(token, body.biz_id),
  shareholders: (token, body) => merchantService.cacShareholdersLookup(token, body.biz_id),
  tin: (token, body) => merchantService.cacTinSearch(token, body.number),
};

function isLookupType(type: string): type is CacLookupType {
  return type in LOOKUPS;
}

export const POST = apiHandler(
  async (request: Request, { params }: { params: { type: string } }) => {
    const token = requireSession();
    if (!isLookupType(params.type)) {
      throw new UpstreamError(`Unknown verification type "${params.type}".`, 404);
    }
    const body = await readJson(request);
    return NextResponse.json(await LOOKUPS[params.type](token, body));
  },
);
