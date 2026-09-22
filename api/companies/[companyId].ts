import { authorized, CompanyInputError, deleteCompany, getCompany, json, parseCompanyInput, replaceCompany } from "./shared";

type Context = { params: { companyId: string } };

export async function GET(request: Request, { params }: Context) {
  if (!authorized(request)) return json({ error: "Unauthorized." }, 401);
  try {
    const company = await getCompany(params.companyId);
    return company ? json({ company }) : json({ error: "Company not found." }, 404);
  } catch (error) {
    if (error instanceof CompanyInputError) return json({ error: "Invalid company ID." }, 400);
    console.error("Company lookup error:", error);
    return json({ error: "Company records are unavailable." }, 503);
  }
}

export async function PUT(request: Request, { params }: Context) {
  if (!authorized(request)) return json({ error: "Unauthorized." }, 401);
  try {
    const company = await replaceCompany(params.companyId, parseCompanyInput(await request.json()));
    return company ? json({ company }) : json({ error: "Company not found." }, 404);
  } catch (error) {
    if (error instanceof CompanyInputError || error instanceof SyntaxError) return json({ error: "Use a valid company ID and record fields." }, 400);
    console.error("Company update error:", error);
    return json({ error: "Company records are unavailable." }, 503);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  if (!authorized(request)) return json({ error: "Unauthorized." }, 401);
  try {
    return await deleteCompany(params.companyId) ? new Response(null, { status: 204 }) : json({ error: "Company not found." }, 404);
  } catch (error) {
    if (error instanceof CompanyInputError) return json({ error: "Invalid company ID." }, 400);
    console.error("Company deletion error:", error);
    return json({ error: "Company records are unavailable." }, 503);
  }
}
