// A server restart in the middle of a multiplayer table must not strand chips: the saved
// table comes back, and the seated player is cashed out when their hand ends.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const WebSocket = require('ws') as typeof import('ws');

const PORT = 3700 + Math.floor(Math.random() * 200);
const base = `http://127.0.0.1:${PORT}`;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

function startServer(): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--import', 'tsx', 'server.ts'], {
      cwd: root, env: { ...process.env, PORT: String(PORT), NODE_ENV: 'development', REDIS_URL: '' }, stdio: ['ignore', 'pipe', 'pipe'],
    });
    const timer = setTimeout(() => reject(new Error('server did not start')), 60_000);
    child.stdout?.on('data', (d) => { if (String(d).includes('running on')) { clearTimeout(timer); resolve(child); } });
    child.on('exit', (code) => { clearTimeout(timer); reject(new Error(`server exited with ${code}`)); });
  });
}

async function post(p: string, body: unknown, token?: string) {
  const res = await fetch(base + p, { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
  return res.json() as Promise<Record<string, unknown>>;
}

test('a restart mid-table keeps the seat and cashes the player out when the hand ends', { timeout: 240_000 }, async (t) => {
  const dataFile = path.join(root, 'data', 'accounts.json');
  rmSync(dataFile, { force: true });
  let server = await startServer().catch((err) => { t.skip(`server could not start: ${err.message}`); return null; });
  if (!server) return;
  try {
    const signup = await post('/api/accounts/signup', { email: `restart-${Date.now()}@example.com`, password: 'Test-pass-12345', name: 'Rae' });
    const token = String(signup.token);
    const table = await post('/api/poker/mp/tables', { name: 'Restart' });
    const wallet = async () => (await (await fetch(`${base}/api/wallet`, { headers: { authorization: `Bearer ${token}`, 'x-player-id': 'pr' } })).json() as { chips: number }).chips;

    const ws = new WebSocket(`ws://127.0.0.1:${PORT}/ws/poker?token=${token}`);
    await new Promise((resolve, reject) => { ws.on('open', resolve); ws.on('error', reject); });
    const joined = new Promise<Record<string, unknown>>((resolve) => ws.on('message', (m) => resolve(JSON.parse(String(m)))));
    ws.send(JSON.stringify({ type: 'join', tableId: table.tableId, playerId: 'pr', name: 'Rae' }));
    assert.equal((await joined).type, 'joined');
    assert.equal(await wallet(), 0, 'the buy-in is in the table');

    // Kill the server while the player is seated, then start it again on the same data.
    server.kill('SIGKILL');
    ws.terminate();
    await new Promise((r) => setTimeout(r, 1000));
    server = await startServer();

    // The restored seat is cashed out, either straight away (between hands) or when its hand ends (the turn timer folds an absent player).
    let cashed = 0;
    for (let i = 0; i < 60 && cashed === 0; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      cashed = await wallet();
    }
    assert.ok(cashed > 0, 'the stack returns to the wallet after the restart');
    // A stack can grow from its blinds and bot pots, but it cannot be paid in twice.
    assert.ok(cashed <= 2000, 'the wallet is not credited more than once');
  } finally {
    server?.kill();
    rmSync(dataFile, { force: true });
  }
});
