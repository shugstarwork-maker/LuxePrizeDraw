import { authorized, createCompanyRecord, isInvalidResult, json, listCompanyRecords, validateCompanyRecord, COMPANY_STATUSES, type CompanyStatus } from "./shared";

function statusFilter(url: string): { status?: CompanyStatus } | null {
  const status = new URL(url).searchParams.get("status");
  if (!status) return {};
  const upper = status.toUpperCase() as CompanyStatus;
  return (COMPANY_STATUSES as readonly string[]).includes(upper) ? { status: upper } : null;
}

export async function GET(request: Request) {
  if (!authorized(request)) return json({ error: "Unauthorized." }, 401);
  try {
    const filter = statusFilter(request.url);
    if (!filter) return json({ error: `status must be one of ${COMPANY_STATUSES.join(", ")}.` }, 400);
    return json({ records: await listCompanyRecords(filter) });
  } catch {
    return json({ error: "Company records store is unavailable." }, 500);
  }
}

export async function POST(request: Request) {
  if (!authorized(request)) return json({ error: "Unauthorized." }, 401);
  try {
    const parsed = validateCompanyRecord(await request.json());
    if (isInvalidResult(parsed)) {
      return json({ error: "Invalid company record.", details: parsed.errors }, 400);
    }
    return json({ record: await createCompanyRecord(parsed.value) }, 201);
  } catch {
    return json({ error: "Invalid company record." }, 400);
  }
}
