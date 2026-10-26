import test from "node:test";
import assert from "node:assert/strict";
import { newChess, playChess } from "../src/games/chess.ts";

test("threefold repetition is a draw", () => {
  let m = newChess();
  const shuffle = [["g1", "f3"], ["g8", "f6"], ["f3", "g1"], ["f6", "g8"]] as const;
  for (let round = 0; round < 2; round++) for (const [from, to] of shuffle) m = playChess(m, from, to);
  assert.equal(m.status, "draw", "start position reached a third time");
});

test("a normal game keeps playing and records the last move", () => {
  let m = newChess();
  m = playChess(m, "e2", "e4");
  assert.equal(m.status, "playing");
  assert.deepEqual(m.lastMove, { from: "e2", to: "e4" });
});

test("fool's mate is checkmate for black", () => {
  let m = newChess();
  for (const [f, t] of [["f2", "f3"], ["e7", "e5"], ["g2", "g4"], ["d8", "h4"]] as const) m = playChess(m, f, t);
  assert.equal(m.status, "black_won");
});

test("chess page shows rules, a move list and a named result", async () => {
  const { readFileSync } = await import("node:fs");
  const arena = readFileSync(new URL("../src/components/GamesArena.tsx", import.meta.url), "utf8");
  assert.match(arena, /<CasinoRulesSheet game="chess"/);
  assert.match(arena, /className="luxe-chess-moves"/);
  assert.match(arena, /wins \$\{.*"on time" : "by checkmate"\}/);
  assert.match(arena, /luxe-chess-square--check/);
});
