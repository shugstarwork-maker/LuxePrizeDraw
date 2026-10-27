import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { indicativeTicketTarget } from "../src/lib/drawProgress";
import { CashCategory } from "../src/components/DrawCategories";
import { DeckCard } from "../src/components/DeckCard";

test("ticket targets use whole pennies and round up", () => {
  assert.equal(indicativeTicketTarget(60, 0.1), 600);
  assert.equal(indicativeTicketTarget(8000, 2), 4000);
  assert.equal(indicativeTicketTarget(10.01, 0.1), 101);
  assert.equal(indicativeTicketTarget(60, 0), 0);
});

test("cash cards show the cover count and say it is not a confirmed cap", () => {
  const html = renderToStaticMarkup(createElement(CashCategory));
  assert.match(html, /0 of 100,000 tickets/);
  assert.match(html, /Indicative target, not a confirmed entry cap/);
  assert.match(html, /entries are not open/);
});

test("cards without a target keep a sold count and no cap disclaimer", () => {
  const html = renderToStaticMarkup(createElement(DeckCard, { title: "Preview", progress: { sold: 0 } }));
  assert.match(html, /0 tickets sold/);
  assert.doesNotMatch(html, /confirmed entry cap/);
});
