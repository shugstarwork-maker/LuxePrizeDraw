import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../src/components/LuxePokerLeague.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");

test("gate visibility is driven by live width-vs-height truth, not CSS orientation alone", () => {
  assert.match(src, /window\.innerHeight > window\.innerWidth/);
  assert.match(src, /addEventListener\("resize", apply\)/);
  assert.match(src, /addEventListener\("orientationchange", apply\)/);
  assert.match(src, /classList\.toggle\("luxury-portrait", portrait\)/);
});

test("turning landscape clears any dismissal automatically", () => {
  assert.match(src, /if \(!portrait\) document\.querySelectorAll\("\.poker-gate-dismissed"\)/);
});

test("the gate can never lock a player out of a live hand", () => {
  assert.match(src, /Keep playing in portrait/);
  assert.match(src, /rotate-gate-dismiss/);
  assert.match(css, /\.poker-gate-dismissed \.poker-landscape-gate \{ display:none !important/);
  assert.match(css, /\.poker-gate-dismissed \.poker-playing-wrap \{ visibility:visible !important/);
});

test("no unconditional CSS orientation gate remains — portrait alone cannot black-screen the table", () => {
  // The old unconditional block: @media (orientation: portrait) { gate { display:flex } }
  assert.doesNotMatch(css, /@media \(orientation: portrait\)/);
  assert.doesNotMatch(css, /@media \(orientation:portrait\)[^}]*landscape-gate \{ display:flex/);
});

test("both table screens (single-player and multiplayer) use the shared dismissible gate", () => {
  assert.equal(src.match(/<RotateGate onBack=/g)?.length, 2);
});
