import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LuxeDealer } from "../src/components/LuxeDealer";

test("dealer renders win and loss moods without blocking table input", () => {
  for (const [mood, line] of [["win", "Magnifique"], ["lose", "sympathies"]] as const) {
    const html = renderToStaticMarkup(React.createElement(LuxeDealer, { stage: "showdown", active: false, mood }));
    assert.ok(html.includes(line));
    assert.ok(html.includes("pointer-events-none"));
    assert.ok(html.includes("Vex Delacroix"));
  }
});

test("dealer prompts the active player", () => {
  const html = renderToStaticMarkup(React.createElement(LuxeDealer, { stage: "flop", active: true, mood: "idle" }));
  assert.ok(html.includes("Your move."));
});
