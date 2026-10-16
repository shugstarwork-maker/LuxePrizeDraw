import { neon } from '@neondatabase/serverless';
import crypto from 'node:crypto';
export function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } }); }
export function store() {
  if (!process.env.LAUNCH_BUILD_DATABASE_URL) throw new Error('STORE_UNAVAILABLE');
  return neon(process.env.LAUNCH_BUILD_DATABASE_URL);
}
export function workerAuthorized(req: Request) {
  const secret = process.env.TICKET_DRAW_WORKER_SECRET;
  if (!secret) return false;
  const a = Buffer.from(req.headers.get('authorization') || '');
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
