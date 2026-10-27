import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { CASINO_GAMES, CASINO_PATHS } = await import("../src/components/CasinoPage.tsx");
const dock = readFileSync(new URL("../src/components/MobileDock.tsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");

test("one Casino button replaces the separate Games and Poker buttons", () => {
  assert.match(dock, /\{ href: "\/casino", label: "Casino"/);
  assert.ok(!dock.includes('label: "Games"') && !dock.includes('label: "Poker"'));
  assert.match(app, /path === "\/casino" \? <><CasinoPage \/>/);
});

test("every card and board game is on the casino carousel and routes somewhere real", () => {
  const ids = CASINO_GAMES.map((g) => g.id);
  for (const id of ["holdem", "blackjack", "brag", "chess", "connect4", "draughts"]) assert.ok(ids.includes(id), `missing ${id}`);
  for (const g of CASINO_GAMES) {
    const path = g.href.split("?")[0];
    assert.ok(app.includes(`path === "${path}"`), `${g.title} links to ${path}, which has no route`);
    assert.ok(CASINO_PATHS.includes(path), `${path} should highlight the Casino button`);
  }
});

test("casino deep links into board games go through sitDown, so they count as games played", () => {
  const lounge = readFileSync(new URL("../src/components/ChallengeLounge.tsx", import.meta.url), "utf8");
  assert.match(lounge, /sitDown\(requested as ChallengeGameId\)/);
  assert.match(lounge, /useState<"welcome" \| "lobby" \| ChallengeGameId>\("welcome"\)/);
});

test("casino welcome gate uses the Luxe gold treatment and hero artwork", () => {
  const page = readFileSync(new URL("../src/components/CasinoPage.tsx", import.meta.url), "utf8");
  assert.match(page, /casino-welcome/);
  assert.match(page, /Welcome to/);
  assert.match(page, /\/games\/casino-welcome-hero\.jpg/);
  assert.match(page, /Featured table/);
  const css = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");
  assert.match(css, /\.casino-welcome-rays::before/);
  assert.match(css, /\.casino-welcome-rule/);
});

test("every draw carousel card carries a cinematic promo video in the app-trailer style", () => {
  const featured = readFileSync(new URL("../src/components/FeaturedDraws.tsx", import.meta.url), "utf8");
  const cats = readFileSync(new URL("../src/components/DrawCategories.tsx", import.meta.url), "utf8");
  const hols = readFileSync(new URL("../src/components/LuxuryHolidaysSection.tsx", import.meta.url), "utf8");
  const tiers = readFileSync(new URL("../src/components/CategoryDrawCarousel.tsx", import.meta.url), "utf8");
  // tall cards restored — no wide banner variant remains
  for (const src of [featured, cats, hols, tiers]) assert.doesNotMatch(src, /deck-card--banner/);
  assert.ok((cats.match(/video=/g) || []).length >= 5, "category draw cards keep their videos");
  assert.match(featured, /car-luxe-gt-cine\.mp4/);
  assert.match(featured, /featured-bitcoin-cine\.mp4/);
  assert.match(featured, /featured-ferrari-cine\.mp4/);
  assert.match(featured, /featured-gold-cine\.mp4/);
  assert.match(hols, /holiday-cine\.mp4/);
  assert.match(tiers, /videos: Record<Category, string>/);
  assert.match(tiers, /video=\{parsedCategory === "Luxe Holidays" \? undefined : videos\[parsedCategory\]\}/);
  assert.match(tiers, /holiday-cine\.mp4/);
});
