import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const page = readFileSync(new URL("../src/components/WelcomePage.tsx", import.meta.url), "utf8");

test("welcome plays the trailer muted and inline, with a sound toggle", () => {
  assert.match(page, /src="\/trailer\.mp4"/);
  assert.match(page, /muted loop playsInline/);
  assert.match(page, /aria-pressed=\{!muted\}/);
});

test("no public folder shadows the /welcome route (express.static would 301 it to /welcome/)", () => {
  assert.ok(!existsSync(new URL("../public/welcome", import.meta.url)));
  for (const m of page.matchAll(/"\/(welcome-media\/[^"]+)"/g)) assert.ok(existsSync(new URL(`../public/${m[1]}`, import.meta.url)), `missing ${m[1]}`);
});
