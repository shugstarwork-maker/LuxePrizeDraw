import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HeadlinePrizeChoice, HEADLINE_CHOICES } from '../src/components/HeadlinePrizeChoice';
test('prize selector exposes two clear preview alternatives and no entitlement', () => {
 const html=renderToStaticMarkup(createElement(HeadlinePrizeChoice));
 assert.match(html,/₿ Bitcoin/); assert.match(html,/£ Cash/);
 assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1);
 assert.match(html,/Nothing is saved/); assert.match(html,/no entry, purchase or prize entitlement/);
 assert.match(HEADLINE_CHOICES.cash.description,/£100,000 cash/);
 assert.match(HEADLINE_CHOICES.bitcoin.description,/£100,000 of Bitcoin/);
});
