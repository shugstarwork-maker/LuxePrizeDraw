import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { classifyHand, highlightCaption, loadHighlights, recordHighlight, saveHighlights } from '../src/lib/pokerHighlights';
import { trophyCase, checkTrophyUnlocks, awardBracelet, loadTrophyStore } from '../src/lib/pokerTrophies';

// minimal localStorage stub for node
const store = new Map<string, string>();
(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
};

const portal = readFileSync(new URL('../src/components/PlayerPortal.tsx', import.meta.url), 'utf8');
const league = readFileSync(new URL('../src/components/LuxePokerLeague.tsx', import.meta.url), 'utf8');
const trophyRoom = readFileSync(new URL('../src/components/TrophyRoom.tsx', import.meta.url), 'utf8');
const feed = readFileSync(new URL('../src/components/HighlightsFeed.tsx', import.meta.url), 'utf8');

test('highlights classify big wins, bad beats and bluffs correctly', () => {
  assert.equal(classifyHand({ won: true, pot: 800, wentToShowdown: true, handLabel: 'a flush' })?.type, 'big-win');
  assert.equal(classifyHand({ won: false, pot: 500, wentToShowdown: true })?.type, 'bad-beat');
  assert.equal(classifyHand({ won: true, pot: 250, wentToShowdown: false })?.type, 'bluff');
  assert.equal(classifyHand({ won: true, pot: 120, wentToShowdown: true }), null); // small pot — no clip
  assert.equal(classifyHand({ won: false, pot: 900, wentToShowdown: false }), null); // folded early — no clip
});

test('highlights round-trip through storage and stay trimmed', () => {
  store.clear();
  recordHighlight({ type: 'big-win', handNumber: 7, table: 'Bronze League Table', pot: 600, board: ['K♠'], yourCards: ['A♠', 'A♥'], note: 'Biggest win', season: 1, week: '2026-W43' });
  const list = loadHighlights();
  assert.equal(list.length, 1);
  assert.equal(list[0].type, 'big-win');
  for (let i = 0; i < 40; i++) recordHighlight({ type: 'bluff', handNumber: i, table: 'T', pot: 250, board: [], yourCards: [], note: 'n', season: 1, week: 'w' });
  assert.equal(loadHighlights().length, 30); // rolling cap
  saveHighlights([]);
  assert.equal(loadHighlights().length, 0);
});

test('highlight captions carry the share text with honesty line', () => {
  const cap = highlightCaption({ id: 'x', type: 'bad-beat', handNumber: 3, table: 'Silver League Table', pot: 450, board: ['7♦', '2♣'], yourCards: ['Q♠', 'J♠'], note: 'Bad beat — lost at showdown.', at: 1, season: 2, week: 'w' });
  assert.match(cap, /BAD BEAT/);
  assert.match(cap, /Silver League Table/);
  assert.match(cap, /Season 2/);
  assert.match(cap, /no cash value/);
});

test('trophy case unlocks tiers by season and bracelets once', () => {
  store.clear();
  const fresh = checkTrophyUnlocks(2, 3); // reached Gold in season 3
  assert.deepEqual(fresh, ['tier-bronze', 'tier-silver', 'tier-gold']);
  assert.equal(checkTrophyUnlocks(2, 4).length, 0); // no double unlock
  assert.equal(awardBracelet(2, 3), true);
  assert.equal(awardBracelet(2, 4), false); // once only
  const c = trophyCase();
  const gold = c.find((t) => t.id === 'tier-gold');
  assert.ok(gold?.earned && gold.season === 3);
  assert.ok(c.find((t) => t.id === 'bracelet-gold')?.earned);
  assert.equal(c.find((t) => t.id === 'tier-diamond')?.earned, false);
  assert.equal(Object.keys(loadTrophyStore()).length, 4);
});

test('trophy room renders 3D case with earned and locked slots', () => {
  assert.match(trophyRoom, /trophy-case/);
  assert.match(trophyRoom, /perspective\(900px\)/);
  assert.match(trophyRoom, /League trophies/);
  assert.match(trophyRoom, /Championship bracelets/);
  assert.match(trophyRoom, /never cash prizes/);
});

test('highlights feed renders timeline with share and honest footer', () => {
  assert.match(feed, /Bad beat timeline/);
  assert.match(feed, /Share clip/);
  assert.match(feed, /navigator\.share/);
  assert.match(feed, /TikTok or Instagram/);
  assert.match(feed, /no cash value/);
});

test('portal mounts trophy room and highlights feed; league clips and unlocks', () => {
  assert.match(portal, /<TrophyRoom \/>/);
  assert.match(portal, /<HighlightsFeed \/>/);
  assert.match(league, /classifyHand\(\{ won: Boolean\(mine\)/);
  assert.match(league, /recordHighlight\(\{/);
  assert.match(league, /checkTrophyUnlocks\(mv\.tierIndex, season\)/);
  assert.match(league, /awardBracelet\(mv\.tierIndex, season\)/);
});
