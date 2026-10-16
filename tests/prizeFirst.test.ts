import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CashPrizesCarousel } from "../src/components/CashPrizesCarousel";

test("cash prizes have unobscured imagery separate from readable details", () => {
  const html = renderToStaticMarkup(createElement(CashPrizesCarousel));
  assert.match(html, /class="prize-first-card__image"\/><div class="prize-first-card__details">/);
  assert.ok(!html.includes("bg-gradient-to-r from-black"));
  assert.match(html, /prize-first-card__value/);
  assert.match(html, /Preview only/);
});
