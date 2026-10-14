import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AudioProvider } from "../src/audio/AudioProvider";
import { LuxePokerLeague } from "../src/components/LuxePokerLeague";
import { NeonGameLobby } from "../src/components/NeonGameLobby";

test("casino featured and selection cards share the wallet shell without cash-out messaging", () => {
  const html = renderToStaticMarkup(createElement(NeonGameLobby));
  assert.equal((html.match(/class="luxe-wallet-card /g) || []).length, 4);
  assert.ok(html.includes("Play now"));
  assert.ok(html.includes("Coming soon"));
  assert.ok(html.includes("No deposits, cash prizes, or cash-out"));
});

test("poker tables and reward cards share the shell and preserve demo entry labels", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: () => null } });
  try {
    const html = renderToStaticMarkup(createElement(AudioProvider, null, createElement(LuxePokerLeague)));
    // The existing default lobby shows two starter tables and three reward cards.
    assert.equal((html.match(/class="luxe-wallet-card /g) || []).length, 5);
    assert.ok(html.includes("Take seat"));
    assert.ok(html.includes("Virtual chips only"));
    assert.ok(html.includes("no cash value"));
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});
