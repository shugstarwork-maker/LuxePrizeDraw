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
  assert.match(html, /Do not send postal entries now: no draw is open for entry/);
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
  assert.match(html, /Do not send postal entries now: no draw is open for entry/);
});

test('all prize categories and seasonal schedules preserve draft launch gates', () => {
  const html = renderToStaticMarkup(createElement(TermsPage));
  for (const text of ['R8, MK4 and R32', 'Gaming bundles over £2,000', 'Fixed cash prizes up to £100,000', '12-calendar-month', '25 December 2026 at 21:00 GMT', '31 December 2026 at 21:00 GMT', '22:00 GMT', 'one winner per draw', 'cap, not an automatic 30% fee', '66.5%', '£6,650', '£7,600', 'Serenity Soul CIC', 'does not by itself establish registered-charity status', 'meaning of “unlimited” remains unconfirmed']) assert.ok(html.includes(text), text);
  assert.match(html, /no minimum guarantee is confirmed/);
  assert.match(html, /no sales-based extension/);
  assert.match(html, /final postal instructions and processing rules still require approval/);
});

test('corrected business address omits unconfirmed postcode and does not authorize postal entry', () => {
  const html = renderToStaticMarkup(createElement(TermsPage));
  assert.match(html, /18 Factory Place, Saltcoats/);
  assert.match(html, /Postcode to be added/);
  assert.match(html, /approval pending/);
  assert.doesNotMatch(html, /17–18 Factory Place|KA21 5LZ/);
  assert.match(html, /This is separate from the registered office/);
  assert.match(html, /Do not send postal entries now: no draw is open for entry/);
  assert.doesNotMatch(html, /postal-entry address is still unconfirmed|no approved postal address/);
});
