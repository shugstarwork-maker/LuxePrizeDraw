import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const shell = readFileSync(new URL("../src/components/GameHudShell.tsx", import.meta.url), "utf8");
const arena = readFileSync(new URL("../src/components/SkillGamesArena.tsx", import.meta.url), "utf8");
const boards = readFileSync(new URL("../src/components/GamesArena.tsx", import.meta.url), "utf8");

test("HUD shell mirrors the poker chrome: top bar, avatars, dynamic disclaimer", () => {
  assert.match(shell, /data-testid="hud-topbar"/);
  assert.match(shell, /data-testid="hud-balance"/);
  assert.match(shell, /data-testid=\{`hud-avatar-\$\{side\}`\}/);
  assert.match(shell, /side: "left" \| "right"/);
  assert.match(shell, /<HudAvatar player=\{players\[0\]\} side="left" \/>/);
  assert.match(shell, /<HudAvatar player=\{players\[1\]\} side="right" \/>/);
  assert.match(shell, /data-testid="hud-disclaimer"/);
  // the legal line is dynamic game state + the constant protections
  assert.match(shell, /\{stateLabel\} · Free-play · No cash value/);
});

test("all three boards report turn, move number and status via onState", () => {
  const handlers = boards.match(/onState\?\.\(\{ turn:/g) ?? [];
  assert.equal(handlers.length, 3, "chess, draughts and connect four must each report state");
  assert.match(boards, /export type BoardState = \{ turn: "a" \| "b"; moveNumber: number/);
  // chess additionally reports both clocks
  assert.match(boards, /clockA: clock\.w, clockB: clock\.b/);
  // draughts derives move number from halfMoves
  assert.match(boards, /Math\.floor\(state\.halfMoves \/ 2\) \+ 1/);
  // connect four derives it from moves played
  assert.match(boards, /moveNumber: state\.moves\.length \+ 1/);
});

test("arena wraps boards in the HUD shell with wallet balance and rating", () => {
  assert.match(arena, /<GameHudShell/);
  assert.match(arena, /coins wallet · arena rating/);
  assert.match(arena, /onState=\{setBoardState\}/);
  assert.match(arena, /stateLabelFor\(game, boardState\)/);
});

test("disclaimer copy is dynamic per game state", () => {
  assert.match(arena, /`Move \$\{s\.moveNumber\} · \$\{mover\} to move`/);
  assert.match(arena, /`Draw after move \$\{s\.moveNumber - 1\}`/);
  assert.match(arena, /`Decided on move \$\{s\.moveNumber - 1\}`/);
});

test("avatars light up on the active player's turn and show chess clocks", () => {
  assert.match(arena, /active: s\?\.turn === "a"/);
  assert.match(arena, /active: s\?\.turn === "b"/);
  assert.match(arena, /stat: clockA/);
  assert.match(shell, /shadow-\[0_0_18px_rgba\(252,211,77,\.45\)\]/); // active ring glow
});
