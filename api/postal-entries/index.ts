import { authorized, createPostalEntry, isInvalidResult, json, listPostalEntries, toCSV, validatePostalEntry, POSTAL_STATUSES, type PostalStatus } from "./shared";

export async function GET(request: Request) {
  if (!authorized(request)) return json({ error: "Unauthorized." }, 401);
  try {
    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status");
    const filter = statusParam
      ? (POSTAL_STATUSES as readonly string[]).includes(statusParam.toUpperCase())
        ? { status: statusParam.toUpperCase() as PostalStatus }
        : null
      : {};
    if (!filter) return json({ error: `status must be one of ${POSTAL_STATUSES.join(", ")}.` }, 400);
    const entries = await listPostalEntries(filter);
    if (url.searchParams.get("format") === "csv") {
      return new Response(toCSV(entries), { headers: { "content-type": "text/csv; charset=utf-8", "cache-control": "no-store" } });
    }
    return json({ entries });
  } catch {
    return json({ error: "Postal entries store is unavailable." }, 500);
  }
}

export async function POST(request: Request) {
  if (!authorized(request)) return json({ error: "Unauthorized." }, 401);
  try {
    const parsed = validatePostalEntry(await request.json());
    if (isInvalidResult(parsed)) return json({ error: "Invalid postal entry.", details: parsed.errors }, 400);
    return json({ entry: await createPostalEntry(parsed.value) }, 201);
  } catch {
    return json({ error: "Invalid postal entry." }, 400);
  }
}
