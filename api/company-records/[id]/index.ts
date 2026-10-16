import { authorized, deleteCompanyRecord, getCompanyRecord, isInvalidResult, isValidId, json, replaceCompanyRecord, validateCompanyRecord } from "../shared";

function recordId(url: string) {
  const id = new URL(url).pathname.split("/").filter(Boolean).pop() || "";
  return isValidId(id) ? id : null;
}

export async function GET(request: Request) {
  if (!authorized(request)) return json({ error: "Unauthorized." }, 401);
  const id = recordId(request.url);
  if (!id) return json({ error: "A valid record id is required." }, 400);
  const record = await getCompanyRecord(id);
  return record ? json({ record }) : json({ error: "Company record not found." }, 404);
}

export async function PUT(request: Request) {
  if (!authorized(request)) return json({ error: "Unauthorized." }, 401);
  const id = recordId(request.url);
  if (!id) return json({ error: "A valid record id is required." }, 400);
  try {
    const parsed = validateCompanyRecord(await request.json());
    if (isInvalidResult(parsed)) {
      return json({ error: "Invalid company record.", details: parsed.errors }, 400);
    }
    const record = await replaceCompanyRecord(id, parsed.value);
    return record ? json({ record }) : json({ error: "Company record not found." }, 404);
  } catch {
    return json({ error: "Invalid company record." }, 400);
  }
}

export async function DELETE(request: Request) {
  if (!authorized(request)) return json({ error: "Unauthorized." }, 401);
  const id = recordId(request.url);
  if (!id) return json({ error: "A valid record id is required." }, 400);
  return (await deleteCompanyRecord(id)) ? json({ deleted: true }) : json({ error: "Company record not found." }, 404);
}
