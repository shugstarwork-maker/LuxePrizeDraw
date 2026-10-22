import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('seat denial is displayed before lounge cards with exact chip requirement', () => {
  const s = readFileSync(new URL('../src/components/LuxePokerLeague.tsx', import.meta.url), 'utf8');
  assert.match(s, /role="alert"/);
  assert.match(s, /setSeatError\(message\)/);
  assert.match(s, /needs \$\{table\.buyIn\.toLocaleString\(\)\} free-play chips/);
  assert.match(s, /collect free daily chips/);
});

test('merge repair retains exactly one lobby branch and current poker features', () => {
  const s = readFileSync(new URL('../src/components/LuxePokerLeague.tsx', import.meta.url), 'utf8');
  assert.equal((s.match(/if \(screen === "lobby"\)/g) || []).length, 1);
  for (const feature of ['salon-selection', 'PlayerTurnRing', 'winner={potWinner}', 'pokerActionSound', 'poker-landscape-gate']) assert.ok(s.includes(feature));
});
