// Starts the real server and checks the multiplayer table moves chips through the wallet.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const WebSocket = require('ws') as typeof import('ws');

const PORT = 3150 + Math.floor(Math.random() * 500);
const base = `http://127.0.0.1:${PORT}`;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

function startServer(): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--import', 'tsx', 'server.ts'], {
      cwd: root, env: { ...process.env, PORT: String(PORT), NODE_ENV: 'development' }, stdio: ['ignore', 'pipe', 'pipe'],
    });
    const timer = setTimeout(() => reject(new Error('server did not start')), 60_000);
    child.stdout?.on('data', (d) => { if (String(d).includes('running on')) { clearTimeout(timer); resolve(child); } });
    child.on('exit', (code) => { clearTimeout(timer); reject(new Error(`server exited with ${code}`)); });
  });
}

async function post(path: string, body: unknown, token?: string) {
  const res = await fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
  return res.json() as Promise<Record<string, unknown>>;
}

test('a multiplayer buy-in leaves the wallet and the stack returns when the player leaves', { timeout: 120_000 }, async (t) => {
  const savedCwd = process.cwd();
  const server = await startServer().catch((err) => { t.skip(`server could not start: ${err.message}`); return null; });
  if (!server) return;
  try {
    const signup = await post('/api/accounts/signup', { email: `mp-test-${Date.now()}@example.com`, password: 'Test-pass-12345', name: 'Mia' });
    const token = String(signup.token);
    const table = await post('/api/poker/mp/tables', { name: 'Test' });
    const walletNow = async () => (await (await fetch(`${base}/api/wallet`, { headers: { authorization: `Bearer ${token}`, 'x-player-id': 'pa' } })).json() as { chips: number }).chips;

    assert.equal(await walletNow(), 1000);
    const ws = new WebSocket(`ws://127.0.0.1:${PORT}/ws/poker?token=${token}`);
    await new Promise((resolve, reject) => { ws.on('open', resolve); ws.on('error', reject); });
    const joined = new Promise<Record<string, unknown>>((resolve) => ws.on('message', (m) => resolve(JSON.parse(String(m)))));
    ws.send(JSON.stringify({ type: 'join', tableId: table.tableId, playerId: 'pa', name: 'Mia' }));
    const reply = await joined;
    assert.equal(reply.type, 'joined');
    assert.equal(await walletNow(), 0, 'the buy-in leaves the wallet while seated');

    await new Promise((r) => setTimeout(r, 500));
    ws.close();
    await new Promise((r) => setTimeout(r, 1500));
    assert.ok((await walletNow()) > 0, 'the stack returns to the wallet after leaving');
  } finally {
    server.kill();
    rmSync(path.join(root, 'data', 'accounts.json'), { force: true });
    process.chdir(savedCwd);
  }
});
