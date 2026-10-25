#!/usr/bin/env python3
"""LuxePrizeDraw — anti-cheat telemetry load simulator.

Fires concurrent match-telemetry sessions at POST /api/telemetry/report:
a field of honest UK players plus a seeded pack of simulated cheaters
(engine users, robotic pacers, focus-switchers). Watch the server log flag
MATCH_KILL / SHADOW_FLAG rows in real time, then verify with:

    curl -s $BASE_URL/api/telemetry/recent | python3 -m json.tool

Usage:
    pip install aiohttp
    python3 scripts/telemetry-sim.py            # 200 sessions
    python3 scripts/telemetry-sim.py --sessions 500 --concurrency 40
"""
from __future__ import annotations

import argparse
import asyncio
import random
import time

import aiohttp

# ── Step 2: point this at the active live UK staging/production endpoint ────
BASE_URL = "https://luxeprizedraw-production.up.railway.app"
# BASE_URL = "http://localhost:3000"  # local prod build

GAMES = ["chess", "draughts", "connect4"]


def honest_player(rng: random.Random) -> dict:
    """Human-like: low engine match, noisy move pacing, no focus games."""
    return {
        "userId": f"usr_{rng.choice(['harriet', 'dex', 'wren', 'piper', 'joss', 'nel'])}_{rng.randint(10, 99)}",
        "game": rng.choice(GAMES),
        "engineMatchPct": round(rng.uniform(18, 48), 1),
        "moveTimeStdDevMs": round(rng.uniform(700, 2100), 0),
        "appFocusLostCount": rng.choice([0, 0, 0, 1]),
    }


def engine_cheater(rng: random.Random) -> dict:
    """Stockfish-in-the-window pattern: near-perfect match, metronome pacing."""
    return {
        "userId": f"usr_{rng.choice(['marcus', 'onyx', 'silas', 'vex'])}_{rng.randint(10, 99)}",
        "game": rng.choice(GAMES),
        "engineMatchPct": round(rng.uniform(88, 99), 1),
        "moveTimeStdDevMs": round(rng.uniform(120, 290), 0),
        "appFocusLostCount": rng.randint(2, 9),
    }


def robotic_pacer(rng: random.Random) -> dict:
    """Bot-like fixed cadence, moderate engine match → shadow-flag territory."""
    return {
        "userId": f"usr_{rng.choice(['ruby', 'otto', 'kestrel'])}_{rng.randint(10, 99)}",
        "game": rng.choice(GAMES),
        "engineMatchPct": round(rng.uniform(55, 74), 1),
        "moveTimeStdDevMs": round(rng.uniform(240, 420), 0),
        "appFocusLostCount": rng.randint(0, 3),
    }


async def fire(session: aiohttp.ClientSession, payload: dict) -> tuple[int, dict]:
    try:
        async with session.post(f"{BASE_URL}/api/telemetry/report", json=payload, timeout=aiohttp.ClientTimeout(total=15)) as res:
            return res.status, await res.json()
    except Exception as exc:  # network blip — report, don't crash the loop
        return 0, {"error": str(exc)}


async def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sessions", type=int, default=200)
    ap.add_argument("--concurrency", type=int, default=25)
    ap.add_argument("--cheater-ratio", type=float, default=0.12, help="fraction of sessions that cheat")
    args = ap.parse_args()

    rng = random.Random(42)
    pool: list[dict] = []
    for _ in range(args.sessions):
        roll = rng.random()
        if roll < args.cheater_ratio * 0.6:
            pool.append(engine_cheater(rng))
        elif roll < args.cheater_ratio:
            pool.append(robotic_pacer(rng))
        else:
            pool.append(honest_player(rng))

    print(f"▶ Firing {len(pool)} telemetry sessions at {BASE_URL} (concurrency {args.concurrency})")
    started = time.perf_counter()
    sem = asyncio.Semaphore(args.concurrency)
    counts = {"match_kill": 0, "shadow_flag": 0, "clean": 0, "rejected": 0, "error": 0}

    async with aiohttp.ClientSession() as session:
        async def worker(p: dict) -> None:
            async with sem:
                status, body = await fire(session, p)
                tier = body.get("tier")
                if status == 201 and tier in counts:
                    counts[tier] += 1
                    if tier != "clean":
                        print(f"  🚩 {tier.upper():11s} {p['userId']:<18} {p['game']:<9} risk={body.get('riskScore')}")
                elif status == 400:
                    counts["rejected"] += 1
                else:
                    counts["error"] += 1

        await asyncio.gather(*(worker(p) for p in pool))

    elapsed = time.perf_counter() - started
    print(f"\n✔ Done in {elapsed:.1f}s — {counts['match_kill']} MATCH_KILL · {counts['shadow_flag']} SHADOW_FLAG · "
          f"{counts['clean']} clean · {counts['rejected']} rejected · {counts['error']} transport errors")
    print(f"  Verify: curl -s {BASE_URL}/api/telemetry/recent | python3 -m json.tool")


if __name__ == "__main__":
    asyncio.run(main())
