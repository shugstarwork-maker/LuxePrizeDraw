import { authorized, json, prepareDigests, previewSensitiveRoutesDisabled } from "./shared";

export async function GET(request: Request) {
  if (previewSensitiveRoutesDisabled()) return json({ error: "Unavailable in preview deployments." }, 404);
  if (!authorized(request)) return json({ error: "Unauthorized." }, 401);
  try {
    return json(await prepareDigests());
  } catch (error) {
    console.error("Supplier trend digest error:", error);
    return json({ error: "Trend digest preparation is unavailable." }, 503);
  }
}
