import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GoldCoinRain } from "../src/components/GoldCoinRain";
import { CashCategory } from "../src/components/DrawCategories";

test("cash cards carry a gold coin rain layer under the title bar", () => {
  const html = renderToStaticMarkup(createElement(GoldCoinRain));
  assert.equal((html.match(/<span/g) ?? []).length, 18);
  assert.match(html, /class="gold-coin-rain" aria-hidden="true"/);
  const draws = renderToStaticMarkup(createElement(CashCategory));
  assert.equal((draws.match(/class="gold-coin-rain"/g) ?? []).length, 22);
  const deck = readFileSync(new URL("../src/components/DeckCard.tsx", import.meta.url), "utf8");
  assert.match(deck, /\{backdrop\}\n {4}<\/div>|\{backdrop\}\n {6}<\/div>/);
});
