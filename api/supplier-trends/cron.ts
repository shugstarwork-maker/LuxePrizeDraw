import { authorized, json, prepareDigests } from "./shared";

export async function GET(request: Request) {
  if (!authorized(request)) return json({ error: "Unauthorized." }, 401);
  try {
    return json(await prepareDigests());
  } catch (error) {
    console.error("Supplier trend digest error:", error);
    return json({ error: "Trend digest preparation is unavailable." }, 503);
  }
}
