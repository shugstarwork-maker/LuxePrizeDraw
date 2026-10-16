import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ticketTarget, ticketProgress, countdownSeconds } from '../src/lib/ticketProgress';
import { GET } from '../api/ticket-draws/status';
import { POST } from '../api/ticket-draws/worker';

test('ticket targets round up using pennies, and only verified counts fill progress', () => {
  assert.equal(ticketTarget(6000, .01), 600000);
  assert.equal(ticketTarget(32000, .35), 91429);
  assert.equal(ticketTarget(100, 0), null);
  assert.equal(ticketProgress(null, 100), null);
  assert.equal(ticketProgress(50, 100), 50);
  assert.equal(ticketProgress(100, 100), 100);
  assert.equal(ticketProgress(101, 100), 100);
  assert.equal(ticketProgress(-1, 100), null);
});
test('countdown uses persisted deadline, clamps 10 to 0, and never chooses a winner', () => {
  const due = '2026-10-16T21:00:10Z';
  const start = Date.parse('2026-10-16T21:00:00Z');
  for (let i = 0; i <= 10; i++) assert.equal(countdownSeconds(due, start + i * 1000), 10-i);
  assert.equal(countdownSeconds(due, start + 20000), 0);
  assert.equal(countdownSeconds('invalid', start), null);
});
test('pending approval exposes no sales and worker fails closed without store access', async () => {
  const enabled = process.env.TICKET_DRAWS_ENABLED;
  const secret = process.env.TICKET_DRAW_WORKER_SECRET;
  delete process.env.TICKET_DRAWS_ENABLED;
  process.env.TICKET_DRAW_WORKER_SECRET = 'test-worker-only';
  try {
    const response = await GET(new Request('https://example.test/api/ticket-draws/status?drawId=cash-preview-1p'));
    const body = await response.json();
    assert.equal(body.state, 'APPROVAL_PENDING');
    assert.equal(body.tickets, null);
    assert.equal(body.dueAt, null);
    assert.equal((await POST(new Request('https://example.test', { method: 'POST' }))).status, 401);
    assert.equal((await POST(new Request('https://example.test', { method: 'POST', headers: { authorization: 'Bearer test-worker-only' } }))).status, 423);
  } finally {
    if (enabled === undefined) delete process.env.TICKET_DRAWS_ENABLED; else process.env.TICKET_DRAWS_ENABLED = enabled;
    if (secret === undefined) delete process.env.TICKET_DRAW_WORKER_SECRET; else process.env.TICKET_DRAW_WORKER_SECRET = secret;
  }
});
