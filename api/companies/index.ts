import { authorized, CompanyInputError, createCompany, json, listCompanies, parseCompanyInput } from "./shared";

export async function GET(request: Request) {
  if (!authorized(request)) return json({ error: "Unauthorized." }, 401);
  try {
    return json({ companies: await listCompanies() });
  } catch (error) {
    console.error("Company list error:", error);
    return json({ error: "Company records are unavailable." }, 503);
  }
}

export async function POST(request: Request) {
  if (!authorized(request)) return json({ error: "Unauthorized." }, 401);
  try {
    return json({ company: await createCompany(parseCompanyInput(await request.json())) }, 201);
  } catch (error) {
    if (error instanceof CompanyInputError || error instanceof SyntaxError) return json({ error: "Use valid company record fields." }, 400);
    console.error("Company creation error:", error);
    return json({ error: "Company records are unavailable." }, 503);
  }
}
