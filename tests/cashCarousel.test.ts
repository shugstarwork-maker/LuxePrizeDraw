import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CASH_DRAW_PROPOSALS, CashPrizesCarousel, formatCashEntry } from '../src/components/CashPrizesCarousel';

test('cash carousel has 22 unique proposals spanning 1p to £10 with cash prizes from £1,000', () => {
  assert.equal(CASH_DRAW_PROPOSALS.length, 22);
  assert.equal(new Set(CASH_DRAW_PROPOSALS.map(draw => draw.id)).size, 22);
  assert.equal(CASH_DRAW_PROPOSALS[0].entryPence, 1);
  assert.equal(CASH_DRAW_PROPOSALS.at(-1)?.entryPence, 1000);
  CASH_DRAW_PROPOSALS.forEach((draw, index) => {
    assert.ok(Number.isInteger(draw.entryPence));
    assert.ok(draw.entryPence >= 1 && draw.entryPence <= 1000);
    assert.ok(draw.valueGBP >= 1000);
    if (index) assert.ok(draw.entryPence > CASH_DRAW_PROPOSALS[index - 1].entryPence);
  });
});

test('entry labels clearly distinguish pennies and pounds', () => {
  assert.equal(formatCashEntry(1), '1p');
  assert.equal(formatCashEntry(55), '55p');
  assert.equal(formatCashEntry(100), '£1');
  assert.equal(formatCashEntry(165), '£1.65');
  assert.equal(formatCashEntry(1000), '£10');
});

test('homepage cash carousel discloses pending approval and never offers checkout', () => {
  const html = renderToStaticMarkup(createElement(CashPrizesCarousel));
  assert.match(html, /22 proposed cash draws/);
  assert.match(html, /Approval pending/);
  assert.match(html, /entries and payments remain disabled/);
  assert.match(html, /Proposed entry/);
  assert.doesNotMatch(html, /Entry from 1p draw preview|<form|Buy now|Enter now/);
});
