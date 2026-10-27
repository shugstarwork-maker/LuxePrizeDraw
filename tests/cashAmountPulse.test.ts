import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CashPrizesCarousel } from "../src/components/CashPrizesCarousel";
import { CashCategory, QuickDrawsCategory } from "../src/components/DrawCategories";

test("cash carousel pulses the prize heading and entry fee only", () => {
  const html = renderToStaticMarkup(createElement(CashPrizesCarousel));
  assert.match(html, /class="deck-card__title cash-prize-heading"/);
  assert.match(html, /class="cash-entry-amount">1p</);
  assert.doesNotMatch(html, /cash-entry-amount">£1,000/);
  assert.match(html, /entries &amp; payments disabled/);
  const css = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");
  assert.match(css, /cash-amount-pulse 3s ease-in-out infinite/);
  assert.match(css, /opacity:\.65/);
  assert.match(css, /cash-swell-card:hover :is\(\.cash-prize-heading,\.cash-entry-amount\)/);
  assert.match(css, /cash-swell-card:focus-within :is\(\.cash-prize-heading,\.cash-entry-amount\)/);
  assert.match(css, /prefers-reduced-motion:reduce\) \{[^}]*\.cash-swell-card \.cash-entry-amount/);
  const draws = renderToStaticMarkup(createElement(CashCategory));
  assert.match(draws, /class="deck-card cash-swell-card coverflow-draw"/);
  assert.match(draws, /class="deck-card__title cash-prize-heading"/);
  assert.match(draws, /class="cash-entry-amount">1p</);
  assert.match(draws, /Cash only · preview · entries disabled until licensed/);
  const quick = renderToStaticMarkup(createElement(QuickDrawsCategory));
  assert.doesNotMatch(quick, /cash-prize-heading|cash-entry-amount|cash-swell-card/);
});

test("headline Enter opens the approval-pending catalogue and does not submit an entry", () => {
  const source = readFileSync(new URL("../src/components/FeaturedDraws.tsx", import.meta.url), "utf8");
  assert.match(source, /cta="Enter"/);
  assert.match(source, /navigate\("\/launch-build"\)/);
  assert.match(source, /does not submit an entry or take a payment/);
  assert.match(source, /Entries and payments disabled/);
  assert.doesNotMatch(source, /View draws/);
});
