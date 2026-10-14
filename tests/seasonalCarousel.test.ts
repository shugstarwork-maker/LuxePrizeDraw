import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StormBackdrop } from "../src/components/StormBackdrop";
import { RollingCardCarousel } from "../src/components/RollingCardCarousel";

test("seasonal backdrop replaces rain with snow while preserving money and sleigh", () => {
  const html = renderToStaticMarkup(createElement(StormBackdrop, { theme: "money" }));
  assert.ok(html.includes('aria-hidden="true"'));
  assert.ok(html.includes('seasonal-snow'));
  assert.ok(html.includes('santa-flight'));
  assert.ok(html.includes('money-rain--money'));
  assert.ok(!html.includes('lightning-backdrop__rain'));
});

test("tier selection controls the centred coverflow card", () => {
  const html = renderToStaticMarkup(createElement(RollingCardCarousel<string>, {
    items: ["first", "second", "third"], getKey: item => item,
    renderItem: item => createElement("p", null, item), label: "test", activeIndex: 1,
    onActiveChange: () => {},
  }));
  assert.match(html, /aria-hidden="false"[^>]*><p>second<\/p>/);
  assert.equal((html.match(/inert=""/g) || []).length, 2);
});
