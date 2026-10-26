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
