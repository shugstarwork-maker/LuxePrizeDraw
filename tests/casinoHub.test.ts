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
