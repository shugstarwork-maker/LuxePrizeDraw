# Daily streaks

Collecting the daily free-play chips on back-to-back days builds a streak. The first collection of each day plays a short full-screen celebration: the flame lights, the day count rolls up, the week's check-ins light one by one, and the chips count up.

Free-play chips only. Nothing here touches Karma Coinz, draw entries or cash, and the on-screen copy says so ("Free-play chips only. No cash value.").

## How days are counted

- The server counts. `claimDaily` in `api/wallet.ts` keeps `streak` and `bestStreak` on the wallet record next to `dailyDay`, so the browser cannot invent or edit a streak.
- A day is a **UTC calendar day** (the same day the daily chips already use). Collecting on consecutive UTC days adds one; skipping a whole day starts again at one; collecting twice in a day changes nothing.
- A wallet saved before streaks existed counts as a one-day streak and carries on from there.
- The rules live in `src/lib/streak.ts` (no DOM, no clock) and are shared by the server and the browser.
- Every seventh day in a row is a Perfect Week. `PERFECT_WEEK_BONUS_CHIPS` in `api/wallet.ts` is the extra chips paid on those days. It is **0**, so a Perfect Week is celebrated but pays nothing extra. Changing it is a real change to the free-play economy: the test in `tests/streak.test.ts` that pins it to 0 has to be changed with it.

## What the player sees

| Streak | Flame |
| --- | --- |
| 1-2 | Spark |
| 3-6 | Flame (embers, two orbiting sparks) |
| 7-29 | Blaze |
| 30-99 | Inferno (rays) |
| 100+ | Legend (crown) |

Beats and their sounds (existing sound effects, off unless the player turned sound on): flame lights (`levelUp`), today's check-in stamps (`chipDrop`), Perfect Week (`jackpotReveal`), chips count up (`coinWin`).

- Tap anywhere (or press Escape) while it plays to jump to the finished picture. Continue appears when the scene is done and is the only way out apart from Escape.
- Reduced-motion players get the finished picture straight away with nothing moving.
- Screen readers get a one-line summary (`role="status"`) and the dialog is labelled.

## Where it plays

`claimDailyChips()` in `src/lib/cardTableServer.ts` is what the lounges already call. When the server says the claim was granted and sent a streak, it announces it (`src/lib/streakEvents.ts`). `StreakCelebrationHost`, mounted once in `src/App.tsx`, plays it over whichever screen the player is on. The lounges did not need to change. A server that has not been updated yet sends no streak, and nothing plays.

## Checking it without waiting for a new day

Open any page with `?streakPreview=N` (a whole number from 1 to 9999), for example `/?streakPreview=7` for a Perfect Week or `/?streakPreview=303`. It plays as a labelled preview, collects nothing and never calls the server.

## Changing it

- `src/components/streakScene.ts` builds the markup and runs the timeline (`STREAK_TIMELINE`, in milliseconds). `src/components/streakCelebration.css` holds every look and movement and reads those times as `--t-*` variables, so the two files change together. `tests/streak.test.ts` fails if a class or variable in one is missing from the other.
- `src/components/StreakCelebration.tsx` is the thin React wrapper (sound, keyboard, scroll lock, closing). It must never set `className` from state: the scene adds `is-ready` and `is-skipped` to that element directly and React would wipe them.
- Anything that plays once is excluded from the skipped state; anything that loops carries the `streak__loop` class so the flame stays alive after a skip.
- The overlay sits at `z-index: 1650`, above the poker tables (1000-1600) and below the integrity warnings (1700 and up).

All artwork (flame, medallion, crown, chips) is drawn in code for this project.
