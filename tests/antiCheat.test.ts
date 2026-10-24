import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ac = await import("../src/lib/antiCheat.ts");
type MoveSample = import("../src/lib/antiCheat.ts").MoveSample;

const mk = (thinkMs: number, engineMatch = false, focusLostBefore = false): MoveSample =>
  ({ at: 0, thinkMs, engineMatch, focusLostBefore });

// ── Module A: move quality ──────────────────────────────────────────────────

test("15+ consecutive engine-best moves flags quality at 45 points", () => {
  const samples = Array.from({ length: 16 }, () => mk(5000, true));
  const r = ac.assessMatch(samples);
  assert.equal(r.modules.quality, 45);
  assert.ok(r.reasons.some((x) => /engine-best/.test(x)));
});

test("human-like mixed play scores zero on quality", () => {
  const samples = [mk(3000, true), mk(4000, false), mk(8000, true), mk(2000, false), mk(6000, true), mk(9000, false)];
  const r = ac.assessMatch(samples);
  assert.equal(r.modules.quality, 0);
});

// ── Module B: move-time analytics ───────────────────────────────────────────

test("mechanical constant pacing (σ < 400ms) scores 40 points", () => {
  const samples = Array.from({ length: 10 }, (_, i) => mk(3200 + (i % 3) * 100)); // ~3.2–3.4s every move
  const r = ac.assessMatch(samples);
  assert.equal(r.modules.timing, 40);
  assert.ok(r.reasons.some((x) => /Mechanical move pacing/.test(x)));
});

test("natural variable pacing scores zero on timing", () => {
  const samples = [mk(800), mk(12000), mk(2500), mk(30000), mk(1500), mk(22000), mk(4000)];
  const r = ac.assessMatch(samples);
  assert.equal(r.modules.timing, 0);
});

test("fewer than 6 samples never flags timing", () => {
  const samples = Array.from({ length: 5 }, () => mk(3000));
  const r = ac.assessMatch(samples);
  assert.equal(r.modules.timing, 0);
});

// ── Module C: focus telemetry ───────────────────────────────────────────────

test("alt-tab before >60% of moves scores 35 points", () => {
  const samples = Array.from({ length: 10 }, (_, i) => mk(4000 + i * 700, false, i < 7));
  const r = ac.assessMatch(samples);
  assert.equal(r.modules.focus, 35);
  assert.ok(r.reasons.some((x) => /alt-tab/.test(x)));
});

// ── Pipeline tiers ──────────────────────────────────────────────────────────

test("tier ladder: clean < 60 ≤ shadow < 75 ≤ match kill; review → hardware ban", () => {
  assert.equal(ac.assessMatch([mk(1000)]).tier, "clean");

  // 9-move engine streak with natural varied pacing → quality 20, timing 0 → clean
  const nearMiss = ac.assessMatch(Array.from({ length: 9 }, (_, i) => mk(1500 + i * 900, true)));
  assert.equal(nearMiss.modules.timing, 0);
  assert.equal(nearMiss.tier, "clean");

  // 9-move streak plus mechanical pacing → 20 + 40 = shadow flag
  const shadow = ac.assessMatch(Array.from({ length: 9 }, (_, i) => mk(3200 + (i % 2) * 50, true)));
  assert.equal(shadow.tier, "shadow_flag");

  const kill = ac.assessMatch(Array.from({ length: 16 }, (_, i) => mk(3200 + (i % 2) * 50, true, i % 2 === 0)));
  assert.ok(kill.score >= ac.RISK_MATCH_KILL);
  assert.equal(kill.tier, "match_kill");

  const banned = ac.assessMatch(Array.from({ length: 16 }, () => mk(3200, true, true)), { confirmedByReview: true });
  assert.equal(banned.tier, "hardware_ban");
});

test("score caps at 100 and tier actions exist for all tiers", () => {
  const r = ac.assessMatch(Array.from({ length: 20 }, () => mk(3000, true, true)));
  assert.ok(r.score <= 100);
  for (const tier of ["clean", "shadow_flag", "match_kill", "hardware_ban"] as const) {
    assert.ok(ac.TIER_ACTIONS[tier].action.length > 0);
  }
});

// ── MatchTelemetry recorder ─────────────────────────────────────────────────

test("telemetry recorder tracks think time and focus loss per move", () => {
  const t = new ac.MatchTelemetry();
  assert.equal(t.movePlayed(), null, "no move before a turn starts");
  t.turnStarted(1000);
  t.focusLost();
  const s = t.movePlayed({}, 4200)!;
  assert.equal(s.thinkMs, 3200);
  assert.equal(s.focusLostBefore, true);
  assert.equal(t.moveCount, 1);
  // focus flag resets per turn
  t.turnStarted(5000);
  const s2 = t.movePlayed({}, 6000)!;
  assert.equal(s2.focusLostBefore, false);
});

// ── Schema + GUI wiring ─────────────────────────────────────────────────────

test("schema has anti-cheat tables wired to users and matches", () => {
  const sql = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");
  for (const table of ["arena_matches", "move_telemetry", "integrity_flags", "hardware_bans"]) {
    assert.match(sql, new RegExp(`create table ${table} `), `missing ${table}`);
  }
  assert.match(sql, /think_ms\s+integer not null/);
  assert.match(sql, /tier in \('clean','shadow_flag','match_kill','hardware_ban'\)/);
  assert.match(sql, /reviewed_by uuid/); // human review gate before hardware ban
});

test("SCHEMA_MAP still mirrors every SQL table", async () => {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: () => {}, removeItem: () => {}, clear: () => {} };
  const v = await import("../src/lib/verification.ts");
  const sql = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");
  const sqlTables = [...sql.matchAll(/create table (\w+) /g)].map((m) => m[1]);
  assert.deepEqual(v.SCHEMA_MAP.map((t) => t.name).sort(), sqlTables.sort());
});

test("warning overlays exist for disconnect, stall, integrity pause, match kill and hardware lock", () => {
  const src = readFileSync(new URL("../src/components/IntegrityWarnings.tsx", import.meta.url), "utf8");
  for (const id of ["warn-disconnect", "warn-stall", "warn-integrity", "warn-match-kill", "warn-hardware-lock"]) {
    assert.match(src, new RegExp(`data-testid="${id}"`));
  }
  assert.match(src, /grace window/i);
  assert.match(src, /server clock never pauses/i);
  assert.match(src, /shadow flag → match kill → hardware ban/);
});

test("arena wires telemetry, stall watch, focus listener and demo triggers", () => {
  const src = readFileSync(new URL("../src/components/SkillGamesArena.tsx", import.meta.url), "utf8");
  assert.match(src, /new MatchTelemetry\(\)/);
  assert.match(src, /visibilitychange/);
  assert.match(src, /STALL_WARNING_SECONDS/);
  assert.match(src, /data-testid="simulate-warning"/);
  assert.match(src, /data-testid="simulate-integrity"/);
  assert.match(src, /<StallWarning secondsLeft=\{stallLeft\}/);
  assert.match(src, /<DisconnectWarning/);
  assert.match(src, /<IntegrityPause/);
  assert.match(src, /<MatchKillNotice/);
  assert.match(src, /<HardwareLockNotice/);
});
