import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HudTracker, HUD_STORAGE_KEY, pfrPct, showdownWinPct, styleTag, vpipPct } from '../src/lib/pokerHud';

const players = () => ([
  { id: 'you', name: 'You', sittingOut: false, folded: false },
  { id: 'bot-0', name: 'Ruby C.', sittingOut: false, folded: false },
  { id: 'bot-1', name: 'Marcus B.', sittingOut: true, folded: false },
]);

const preflop = () => ({ players: players(), stage: 'preflop', handOver: false, winners: [] as { id: string }[] });

test('handStart counts only seated-in players', () => {
  const hud = new HudTracker();
  hud.handStart(preflop());
  assert.equal(hud.statsFor('You').hands, 1);
  assert.equal(hud.statsFor('Ruby C.').hands, 1);
  assert.equal(hud.statsFor('Marcus B.').hands, 0); // sitting out
});

test('VPIP and PFR count preflop calls and raises once per hand', () => {
  const hud = new HudTracker();
  hud.handStart(preflop());
  const s = preflop();
  hud.recordAction(s, 'you', 'call');
  hud.recordAction(s, 'you', 'call'); // duplicate same hand — still once
  hud.recordAction(s, 'bot-0', 'raise');
  hud.recordAction(s, 'bot-0', 'raise');
  hud.recordAction({ ...s, stage: 'flop' }, 'you', 'raise'); // postflop — ignored
  assert.equal(vpipPct(hud.statsFor('You')), 100);
  assert.equal(pfrPct(hud.statsFor('You')), 0);
  assert.equal(vpipPct(hud.statsFor('Ruby C.')), 100);
  assert.equal(pfrPct(hud.statsFor('Ruby C.')), 100);
  hud.handStart(preflop()); // new hand resets per-hand dedupe
  hud.recordAction(preflop(), 'you', 'fold');
  assert.equal(hud.statsFor('You').hands, 2);
  assert.equal(vpipPct(hud.statsFor('You')), 50);
});

test('showdown stats only count river-complete hands, folders excluded', () => {
  const hud = new HudTracker();
  hud.handStart(preflop());
  const ended = {
    players: [
      { id: 'you', name: 'You', sittingOut: false, folded: false },
      { id: 'bot-0', name: 'Ruby C.', sittingOut: false, folded: true },
    ],
    stage: 'showdown', handOver: true, board: [1, 2, 3, 4, 5], winners: [{ id: 'you' }],
  };
  hud.handEnd(ended as never);
  assert.equal(hud.statsFor('You').showdowns, 1);
  assert.equal(hud.statsFor('You').showdownWins, 1);
  assert.equal(showdownWinPct(hud.statsFor('You')), 100);
  assert.equal(hud.statsFor('Ruby C.').showdowns, 0); // folded before showdown
  hud.handEnd({ ...ended, board: [1, 2, 3] } as never); // not a showdown
  assert.equal(hud.statsFor('You').showdowns, 1);
});

test('persistence round-trips through JSON and corrupt storage is ignored', () => {
  const hud = new HudTracker();
  hud.handStart(preflop());
  hud.recordAction(preflop(), 'you', 'raise');
  const restored = new HudTracker(hud.toJSON());
  assert.equal(restored.statsFor('You').vpipHands, 1);
  const fresh = new HudTracker('{not json');
  assert.equal(fresh.statsFor('You').hands, 0);
});

test('style tag waits for a sample then reads the stats', () => {
  const hud = new HudTracker();
  assert.equal(styleTag(hud.statsFor('Nobody')).label, 'Reading…');
  for (let i = 0; i < 6; i++) { hud.handStart(preflop()); hud.recordAction(preflop(), 'you', 'raise'); }
  assert.equal(styleTag(hud.statsFor('You')).label, 'Loose cannon');
});

test('table seats open the Smart HUD and copy carries the no-trackers stance', () => {
  const source = readFileSync(new URL('../src/components/LuxePokerLeague.tsx', import.meta.url), 'utf8');
  const card = readFileSync(new URL('../src/components/PokerSmartHud.tsx', import.meta.url), 'utf8');
  assert.match(source, /setHudSeat\(\{ id: p\.id, name: p\.name/);
  assert.match(source, /HUD_STORAGE_KEY/);
  assert.match(source, /tap a seat for Smart HUD/);
  assert.match(card, /VPIP/);
  assert.match(card, /PFR/);
  assert.match(card, /Third-party tracking software is banned/);
  assert.equal(HUD_STORAGE_KEY, 'luxe-poker-hud');
});
