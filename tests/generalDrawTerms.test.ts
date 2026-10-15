import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { TermsPage } from '../src/components/TermsPage';
import { DrawDetailsPanel } from '../src/components/DrawDetailsPanel';

test('shared terms disclose draft status and material draw protections', () => {
  const html = renderToStaticMarkup(createElement(TermsPage));
  for (const text of ['General terms for all draws', 'draft-2026-10-15', 'not effective entry rules', 'Luxe Prize Draw Ltd', 'Northern Ireland', 'first- or second-class', 'same chance per entry', 'Low ticket sales', 'statutory rights', 'UK GDPR', 'complaints', 'Bitcoin prize with cash alternative']) assert.ok(html.includes(text), text);
  assert.match(html, /no approved postal address/);
  assert.match(html, /Payments remain disabled/);
  assert.match(html, /verifiably random results/);
  assert.match(html, /normally be delivered within 30 days/);
  assert.match(html, /Simple|simple trivia/);
});

test('terms navigation points to rendered sections', () => {
  const html = renderToStaticMarkup(createElement(TermsPage));
  const links = [...html.matchAll(/href="#([^"]+)"/g)];
  assert.equal(links.length, 13);
  for (const [, id] of links) assert.ok(html.includes(`id="${id}"`), id);
});

test('shared draw details and all routed pages expose terms links', () => {
  const html = renderToStaticMarkup(createElement(DrawDetailsPanel));
  assert.match(html, /href="\/terms"/);
  assert.match(html, /free-entry requirements/);
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(app, /\{page\}<footer[^]*href="\/terms"/);
});

test('company details are shown without approving the office for postal entry', () => {
  const html = renderToStaticMarkup(createElement(TermsPage));
  for (const text of ['SC888447', '40 Donaldson Avenue, Stevenston, KA20 4EJ', 'not an approved postal-entry address', 'not been independently verified']) assert.ok(html.includes(text), text);
  assert.match(html, /href="mailto:director@luxeprizedraw.com"/);
  assert.match(html, /no approved postal address/);
});
