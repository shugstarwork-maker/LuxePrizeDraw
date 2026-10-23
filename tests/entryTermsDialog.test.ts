import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const car = readFileSync(new URL('../src/components/PrestigeCarsDraws.tsx', import.meta.url), 'utf8');
const houses = readFileSync(new URL('../src/components/GardenSummerHouseDraws.tsx', import.meta.url), 'utf8');
const veno = readFileSync(new URL('../src/components/VenoScorpDraws.tsx', import.meta.url), 'utf8');
const dialog = readFileSync(new URL('../src/components/EntryTermsDialog.tsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const category = readFileSync(new URL('../src/components/CategoryDrawCarousel.tsx', import.meta.url), 'utf8');

test('all three partner carousels open the entry terms dialog from the entry-fee button', () => {
  for (const src of [car, houses, veno]) {
    assert.match(src, /EntryTermsDialog/);
    assert.match(src, /cta=\{[a-z]+\.entry\} onCta=\{\(\) => setEntering\(/);
    assert.match(src, /Entry" \}, \{ value: "Pending", label: "Draw date"/);
  }
});

test('car carousel has 3 cars with values and entry fees', () => {
  for (const [name, value, entry] of [['Audi R8 V10 Plus', '£120,000', '£5 entry'], ['Nissan GT-R Prestige', '£85,000', '£3 entry'], ['Porsche 911 Carrera S', '£105,000', '£4 entry']] as const) {
    assert.ok(car.includes(name), name); assert.ok(car.includes(value), value); assert.ok(car.includes(entry), entry);
  }
});

test('summer house carousel has 3 builds at 3 prices and 3 entry fees', () => {
  for (const [name, value, entry] of [['The Contempora', '£15,000', '£2 entry'], ['The Pavilion', '£25,000', '£3 entry'], ['The Grand Retreat', '£40,000', '£5 entry']] as const) {
    assert.ok(houses.includes(name), name); assert.ok(houses.includes(value), value); assert.ok(houses.includes(entry), entry);
  }
});

test('Veno Scorp carousel has 3 bundles at 3 prices and 3 entry fees', () => {
  for (const [name, value, entry] of [['Starter Rig Bundle', '£1,200', '£1 entry'], ['Pro Battlestation Bundle', '£2,800', '£2 entry'], ['Ultimate Creator Suite', '£5,500', '£3 entry']] as const) {
    assert.ok(veno.includes(name), name); assert.ok(veno.includes(value), value); assert.ok(veno.includes(entry), entry);
  }
});

test('dialog shows terms summary, final enter button with fee, and stays pre-launch honest', () => {
  assert.match(dialog, /Draw terms — summary/);
  assert.match(dialog, /Enter this draw — \{prize\.entry\}/);
  assert.match(dialog, /free postal entry route/);
  assert.match(dialog, /No payment is taken today/);
  assert.match(dialog, /Read the full terms/);
});

test('both new sections mount on the draws page', () => {
  assert.match(app, /<GardenSummerHouseDraws \/>/);
  assert.match(app, /<VenoScorpDraws \/>/);
});

test('gaming packages category carousel opens the same entry terms dialog from the fee button', () => {
  assert.match(category, /EntryTermsDialog/);
  assert.match(category, /parsedCategory === "Gaming Packages"/);
  assert.match(category, /cta=\{isGaming \? `\$\{tier\.entry\} entry` : undefined\}/);
  assert.match(category, /onCta=\{isGaming \? \(\) => \{ play\("ticketSelect"\); setEntering\(/);
  assert.match(category, /partner: "Veno Scorp"/);
  assert.match(category, /\{entering && <EntryTermsDialog prize=\{entering\} onClose=\{\(\) => setEntering\(null\)\} \/>\}/);
});
