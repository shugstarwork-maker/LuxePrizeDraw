import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BitcoinCoinRain } from '../src/components/BitcoinCoinRain';
test('coin rain is bounded decorative Bitcoin coins with pause control', () => {
 const html=renderToStaticMarkup(createElement(BitcoinCoinRain));
 assert.equal((html.match(/<span/g)||[]).length,18);
 assert.match(html,/aria-hidden="true"/); assert.match(html,/Pause coins/); assert.match(html,/₿/);
});
