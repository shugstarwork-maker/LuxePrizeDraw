import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import { LaunchCatalogue, LaunchCategoryShowcase, LaunchGauge, LaunchDrawCard, launchTicketTarget } from '../src/components/LaunchShowcase';
import { SEED_DRAWS, publicDraw } from '../api/launch-build';

const draws = SEED_DRAWS.map(draw => publicDraw(draw));

test('showcase groups all uploaded proposals and exposes accessible filters', () => {
  const html = renderToStaticMarkup(createElement(LaunchCatalogue, { draws }));
  for (const label of ['Cash draws', 'Luxury holidays', 'Experiences draws']) assert.ok(html.includes(`${label} showcase`));
  assert.equal((html.match(/class="launch-card"/g) || []).length, 11);
  assert.equal((html.match(/aria-pressed="true"/g) || []).length, 1);
  assert.equal((html.match(/aria-pressed="false"/g) || []).length, 3);
  assert.doesNotMatch(html, /Live draws|0%|NaN|TICKETS SOLD|<form|type="date"/);
  assert.match(html, /Verified sales unavailable/);
  const buttons = html.match(/<button[^>]*class="launch-button"[^>]*>/g) || [];
  assert.equal(buttons.length, 14);
  assert.ok(buttons.every(button => button.includes('disabled')));
});

test('unknown sales use an unavailable gauge, never a numeric progress value', () => {
  const html = renderToStaticMarkup(createElement(LaunchGauge));
  assert.equal((html.match(/<line /g) || []).length, 48);
  assert.match(html, /aria-label="Verified sales unavailable"/);
  assert.doesNotMatch(html, /aria-valuenow|0%|stroke-dasharray/);
});

test('single and empty showcases handle navigation and paused state safely', () => {
  assert.equal(renderToStaticMarkup(createElement(LaunchCategoryShowcase, { items: [], label: 'Empty' })), '');
  const html = renderToStaticMarkup(createElement(LaunchCategoryShowcase, { items: [{ ...draws[0], paused: true }], label: 'Cash' }));
  assert.match(html, /1 of 1: £1,000 Cash Prize/);
  assert.match(html, /Previous Cash draw" disabled/);
  assert.match(html, /Next Cash draw" disabled/);
  assert.match(html, />Paused<\/button>/);
  assert.match(html, /aria-current="true"/);
});

test('gold HUD styles are scoped, responsive, and reduce motion', () => {
  const css = fs.readFileSync(new URL('../src/components/launchShowcase.css', import.meta.url), 'utf8');
  assert.match(css, /--launch-gold: #d4af37/);
  assert.match(css, /minmax\(min\(100%,340px\),1fr\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.doesNotMatch(css, /(^|\n)(body|:root|button|h1|\.card)\s*\{/);
});


test('catalogue and carousel targets are tickets while entry prices remain GBP', () => {
  for (const Component of [LaunchDrawCard, LaunchCategoryShowcase]) {
    const html = renderToStaticMarkup(createElement(Component, Component === LaunchDrawCard
      ? { draw: draws[0] } : { items: [draws[0]], label: 'Cash' }));
    assert.match(html, /Ticket target <b>4,000 tickets<\/b>/);
    assert.match(html, /Proposed entry <b>£2\.00<\/b>/);
    assert.doesNotMatch(html, /Target <b>£|Ticket target <b>£/);
  }
});

test('ticket targets round up using integer pennies without changing revenue thresholds', () => {
  assert.equal(launchTicketTarget({ target: 60, price: .1 }), 600);
  assert.equal(launchTicketTarget({ target: 16000, price: 3 }), 5334);
  assert.equal(launchTicketTarget({ target: .07, price: .01 }), 7);
  assert.equal(launchTicketTarget({ target: 500000, price: 10 }), 50000);
  for (const draw of draws) {
    const tickets = launchTicketTarget(draw);
    const price = Math.round(draw.price * 100), target = Math.round(draw.target * 100);
    assert.ok(tickets * price >= target);
    assert.ok((tickets - 1) * price < target);
  }
  assert.equal(SEED_DRAWS.find(draw => draw.id === 'dubai')!.target, 16000);
});


test('cash proposals start at £1,000 and removed small draws are absent', () => {
  const removed = ['cash10', 'cash25', 'cash50', 'cash100', 'cash250', 'cash500'];
  assert.ok(SEED_DRAWS.every(draw => !removed.includes(draw.id)));
  assert.equal(SEED_DRAWS.find(draw => draw.cat === 'Cash')!.id, 'cash1000');
  const html = renderToStaticMarkup(createElement(LaunchCatalogue, { draws }));
  for (const value of [10, 25, 50, 100, 250, 500]) assert.ok(!html.includes(`£${value} Cash Prize`));
  assert.match(html, /£1,000 Cash Prize/);
});
