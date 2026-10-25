import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const server = readFileSync(new URL("../server.ts", import.meta.url), "utf8");
const sim = readFileSync(new URL("../scripts/telemetry-sim.py", import.meta.url), "utf8");

test("telemetry report endpoint validates the anti_cheat_telemetry_logs shape", () => {
  assert.match(server, /app\.post\("\/api\/telemetry\/report"/);
  assert.match(server, /app\.get\("\/api\/telemetry\/recent"/);
  assert.match(server, /engineMatchPct/);
  assert.match(server, /moveTimeStdDevMs/);
  assert.match(server, /appFocusLostCount/);
  assert.match(server, /usr_\[a-z0-9_\]/);          // same userId contract as postal AMOE
  assert.match(server, /Malformed telemetry payload/);
});

test("kill threshold stays in sync with idx_telemetry_high_risk (>= 75)", () => {
  assert.match(server, /TELEMETRY_KILL_THRESHOLD = 75/);
  assert.match(server, /score >= TELEMETRY_KILL_THRESHOLD \? "match_kill" : score >= 50 \? "shadow_flag" : "clean"/);
});

test("non-clean telemetry is flagged to the server log in real time", () => {
  assert.match(server, /console\.warn\(`\[anti-cheat\]/);
  assert.match(server, /row\.tier !== "clean"/);
});

test("simulator targets the live endpoint and exercises all three risk profiles", () => {
  assert.match(sim, /BASE_URL = "https:\/\/luxeprizedraw-production\.up\.railway\.app"/);
  assert.match(sim, /def honest_player/);
  assert.match(sim, /def engine_cheater/);
  assert.match(sim, /def robotic_pacer/);
  assert.match(sim, /\/api\/telemetry\/report/);
  assert.match(sim, /aiohttp/);
});
