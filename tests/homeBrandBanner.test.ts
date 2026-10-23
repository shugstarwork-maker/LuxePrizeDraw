import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, existsSync } from 'node:fs';
import { HomeBrandBanner } from '../src/components/HomeBrandBanner';
test('homepage renders the brief-built HomePage; banner stays on the draws page', () => {
  const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.ok(source.includes('path === "/" ? <HomePage />'));
  assert.ok(source.includes('<HomeBrandBanner /><FeaturedDraws />'));
  const html = renderToStaticMarkup(createElement(HomeBrandBanner));
  assert.match(html, /home-luxe-banner.png/); assert.match(html, /Approval pending/);
  assert.ok(existsSync(new URL('../public/prizes/home-luxe-banner.png', import.meta.url)));
});
