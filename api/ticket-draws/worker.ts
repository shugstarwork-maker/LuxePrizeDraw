import { json, store, workerAuthorized } from './shared';
// Trusted durable scheduler only. Public status reads never select a winner.
export async function POST(req: Request) {
  if (!workerAuthorized(req)) return json({ error: 'unauthorized' }, 401);
  if (process.env.TICKET_DRAWS_ENABLED !== 'true') return json({ error: 'approval_pending' }, 423);
  try {
    const sql = store();
    const draws = await sql`SELECT a.draw_id FROM prize_auto_draws a JOIN prize_draws d ON d.id=a.draw_id
      WHERE a.approved AND a.winning_entry_id IS NULL AND d.status IN ('OPEN','CLOSED') ORDER BY a.due_at NULLS LAST LIMIT 50`;
    const results = [];
    for (const draw of draws) {
      try {
        const rows = await sql`SELECT advance_prize_auto_draw(${draw.draw_id}) AS state`;
        results.push({ drawId: draw.draw_id, state: rows[0].state });
      } catch { results.push({ drawId: draw.draw_id, state: 'REVIEW_REQUIRED' }); }
    }
    return json({ results });
  } catch { return json({ error: 'ticket_store_unavailable' }, 503); }
}
