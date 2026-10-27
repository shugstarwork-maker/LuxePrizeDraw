import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LuxuryHolidaysSection } from "../src/components/LuxuryHolidaysSection";

const stills = [
  "paris.jpg",
  "monaco.jpg",
  "maldives.jpg",
  "new-york.jpg",
  "milan.jpg",
  "london-bridge.jpg",
  "london-suite.jpg",
  "ibiza.jpg",
  "santorini.jpg",
  "mykonos.jpg",
];

test("each holiday destination has its own cinematic still, not the shared villa film", () => {
  for (const file of stills) {
    assert.ok(existsSync(new URL(`../public/draw-art/holidays/${file}`, import.meta.url)), file);
  }
  const html = renderToStaticMarkup(createElement(LuxuryHolidaysSection));
  const srcs = [...html.matchAll(/src="(\/draw-art\/holidays\/[^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(srcs, [
    "/draw-art/holidays/paris.jpg",
    "/draw-art/holidays/monaco.jpg",
    "/draw-art/holidays/maldives.jpg",
    "/draw-art/holidays/new-york.jpg",
    "/draw-art/holidays/milan.jpg",
    "/draw-art/holidays/london-bridge.jpg",
    "/draw-art/holidays/ibiza.jpg",
    "/draw-art/holidays/santorini.jpg",
    "/draw-art/holidays/mykonos.jpg",
  ]);
  assert.equal(new Set(srcs).size, srcs.length);
  assert.notEqual(srcs[2], srcs[6]);
  assert.doesNotMatch(html, /<video[^>]*holiday-cine\.mp4/);
  assert.doesNotMatch(html, /images\.unsplash\.com/);
  assert.match(html, /data-shared-reel="\/draw-art\/holiday-cine\.mp4"/);

  const tiers = readFileSync(new URL("../src/components/CategoryDrawCarousel.tsx", import.meta.url), "utf8");
  for (const file of stills.filter((name) => name !== "ibiza.jpg")) assert.ok(tiers.includes(`/draw-art/holidays/${file}`), file);
  assert.ok(html.includes("/draw-art/holidays/ibiza.jpg"));
  assert.doesNotMatch(tiers, /Luxe Holidays": \[[^\]]+unsplash/s);
  const platform = readFileSync(new URL("../src/components/PrizePlatform.tsx", import.meta.url), "utf8");
  assert.match(platform, /image: "\/draw-art\/holidays\/maldives\.jpg"/);
  assert.doesNotMatch(platform, /holiday-cine\.mp4/);
});
