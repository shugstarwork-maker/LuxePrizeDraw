import { json, recordTrendEvent, writeAuthorized } from "./shared";

export async function POST(request: Request) {
  if (!writeAuthorized(request)) return json({ error: "Unauthorized." }, 401);
  try {
    const input = await request.json();
    await recordTrendEvent(input);
    return json({ recorded: true }, 201);
  } catch {
    return json({ error: "Use a supported supplier, matching category, item name, and event type." }, 400);
  }
}
