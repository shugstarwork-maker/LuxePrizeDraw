import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LuxuryHolidaysSection } from "../src/components/LuxuryHolidaysSection";

const cities = [
  "paris",
  "london-suite",
  "new-york",
  "dubai",
  "tokyo",
  "milan",
  "rome",
  "singapore",
  "monaco",
];

test("each holiday card is a different major city with its own film", () => {
  for (const city of cities) {
    assert.ok(existsSync(new URL(`../public/draw-art/holidays/${city}.jpg`, import.meta.url)), `${city}.jpg`);
    assert.ok(existsSync(new URL(`../public/draw-art/holidays/${city}.mp4`, import.meta.url)), `${city}.mp4`);
  }
  const html = renderToStaticMarkup(createElement(LuxuryHolidaysSection));
  const srcs = [...html.matchAll(/src="(\/draw-art\/holidays\/[^"]+\.mp4)"/g)].map((match) => match[1]);
  assert.deepEqual(srcs, cities.map((city) => `/draw-art/holidays/${city}.mp4`));
  assert.equal(new Set(srcs).size, srcs.length);
  for (const city of cities) assert.match(html, new RegExp(`poster="/draw-art/holidays/${city}\\.jpg"`));
  assert.doesNotMatch(html, /<video[^>]*holiday-cine\.mp4/);
  assert.doesNotMatch(html, /maldives|ibiza|santorini|mykonos/i);
  assert.doesNotMatch(html, /images\.unsplash\.com/);
  assert.match(html, /data-shared-reel="\/draw-art\/holiday-cine\.mp4"/);

  const tiers = readFileSync(new URL("../src/components/CategoryDrawCarousel.tsx", import.meta.url), "utf8");
  for (const city of cities) {
    assert.ok(tiers.includes(`/draw-art/holidays/${city}.jpg`), city);
    assert.ok(tiers.includes(`/draw-art/holidays/${city}.mp4`), city);
  }
  assert.match(tiers, /holidayVideos\[tierIndex\]/);
  assert.doesNotMatch(tiers, /Luxe Holidays": \[[^\]]+unsplash/s);
  const platform = readFileSync(new URL("../src/components/PrizePlatform.tsx", import.meta.url), "utf8");
  assert.match(platform, /image: "\/draw-art\/holidays\/paris\.jpg"/);
  assert.doesNotMatch(platform, /holiday-cine\.mp4/);
});
