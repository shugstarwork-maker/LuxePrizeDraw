// Transactional email via Resend (https://resend.com). Off unless RESEND_API_KEY and
// MAIL_FROM are set; callers treat a false return as "email unavailable".
// Operational alerts go to ALERT_EMAIL and are throttled per subject.

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

export async function sendEmail(msg: { to: string; subject: string; text: string; html?: string }): Promise<boolean> {
  if (!emailConfigured()) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: process.env.MAIL_FROM, to: [msg.to], subject: msg.subject, text: msg.text, html: msg.html }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) console.error(`[mailer] Resend rejected email (${r.status})`);
    return r.ok;
  } catch (err) {
    console.error("[mailer] send failed:", err instanceof Error ? err.message : err);
    return false;
  }
}

const ALERT_INTERVAL_MS = 60 * 60 * 1000;
const lastAlert = new Map<string, number>();

/** Log an operational problem and email ALERT_EMAIL, at most once an hour per subject. */
export function alertOps(subject: string, detail: string): void {
  console.error(`[alert] ${subject}: ${detail}`);
  const to = process.env.ALERT_EMAIL;
  const now = Date.now();
  if (!to || now - (lastAlert.get(subject) ?? 0) < ALERT_INTERVAL_MS) return;
  lastAlert.set(subject, now);
  void sendEmail({ to, subject: `[LuxePrizeDraw alert] ${subject}`, text: `${detail}\n\nTime: ${new Date(now).toISOString()}\nFurther alerts with this subject are paused for an hour.` });
}
