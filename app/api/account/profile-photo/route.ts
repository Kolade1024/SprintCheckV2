import { apiHandler, requireSession } from "@/lib/server/handler";
import * as accountService from "@/lib/server/services/account";
import { UpstreamError } from "@/lib/server/upstream";

/**
 * The only multipart route in the BFF: the browser posts a FormData with an
 * `image` field and the file is streamed on to the upstream API unchanged.
 */
export const POST = apiHandler(async (request: Request) => {
  const token = requireSession();
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw new UpstreamError("Choose an image to upload.", 422);
  }
  return accountService.uploadProfilePhoto(token, form.get("image"));
});

export const DELETE = apiHandler(async () => {
  const token = requireSession();
  return accountService.removeProfilePhoto(token);
});
