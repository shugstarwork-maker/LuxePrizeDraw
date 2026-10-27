import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StreakBolt } from "../src/components/StreakBolt";

test("hand streak bolt renders a decorative full-screen strike", () => {
  const html = renderToStaticMarkup(createElement(StreakBolt, { onDone: () => {} }));
  assert.match(html, /class="streak-bolt" aria-hidden="true"/);
  assert.match(html, /<polygon/);
});

test("poker wins trigger the bolt from a three-hand streak", () => {
  const source = readFileSync(new URL("../src/components/LuxePokerLeague.tsx", import.meta.url), "utf8");
  assert.match(source, /if \(stats\.streak \+ 1 >= 3\) setStreakBolt/);
  assert.match(source, /<div key=\{streakBolt\}><StreakBolt/);
});

test("the bolt is hidden for reduced motion", () => {
  const css = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");
  assert.match(css, /prefers-reduced-motion: reduce\) \{ \.streak-bolt \{ display:none; \} \}/);
});
