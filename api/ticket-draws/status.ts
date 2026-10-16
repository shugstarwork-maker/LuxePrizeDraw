import { json, store } from './shared';
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('drawId');
  if (!id || !/^[a-zA-Z0-9_-]{1,100}$/.test(id)) return json({ error: 'invalid_draw' }, 400);
  if (process.env.TICKET_DRAWS_ENABLED !== 'true') return json({ approvalStatus: 'pending', state: 'APPROVAL_PENDING', tickets: null, target: null, dueAt: null, serverTime: Date.now() });
  try {
    const sql = store();
    const rows = await sql`SELECT d.maximum_entries, d.status, a.approved, a.due_at, a.drawn_at,
      (SELECT count(*)::int FROM prize_entries e LEFT JOIN prize_payments p ON p.id=e.payment_id
       WHERE e.draw_id=d.id AND e.status IN ('ELIGIBLE','WINNER') AND
       (e.route='FREE' OR (p.payment_status='SUCCEEDED' AND p.draw_id=e.draw_id AND p.account_id=e.account_id))) AS tickets,
      extract(epoch from clock_timestamp()) * 1000 AS server_time
      FROM prize_draws d JOIN prize_auto_draws a ON a.draw_id=d.id WHERE d.id=${id}`;
    if (!rows.length) return json({ error: 'no_draw' }, 404);
    const r = rows[0];
    if (!r.approved) return json({ approvalStatus: 'pending', state: 'APPROVAL_PENDING', tickets: null, target: null, dueAt: null, serverTime: Number(r.server_time) });
    return json({ approvalStatus: 'approved', state: r.drawn_at ? 'DRAWN' : r.due_at ? 'COUNTDOWN' : r.status === 'OPEN' ? 'SELLING' : 'CLOSED', tickets: Number(r.tickets), target: r.maximum_entries, dueAt: r.due_at, serverTime: Number(r.server_time), resultRecorded: Boolean(r.drawn_at) });
  } catch { return json({ error: 'ticket_store_unavailable' }, 503); }
}
