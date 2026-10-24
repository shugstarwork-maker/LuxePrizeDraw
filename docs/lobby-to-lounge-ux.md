# Lobby-to-Lounge UX Pipeline (Reference)

Status: design reference only. LuxePrizeDraw is pre-launch and free-to-play —
no real entries, payments, or regulated gaming. This document records a
lobby → lounge → table UX architecture for the card/poker side of the platform,
with notes on how each idea maps to what exists in the app today.

Primary platform: **mobile-first** (the live app already gates poker tables to
landscape phone play). All layouts below assume a phone landscape canvas that
degrades gracefully to portrait with a rotate prompt, then scale up to desktop.

## 1. The macro flow: "Lobby-to-Lounge" pipeline

A simple 3-step hierarchical flow avoids "analysis paralysis" and never buries
the start button:

```
[ Player Dashboard / Profile ]
            │
            ▼
[ The Game Lounge Hub ] ──► Filter by: Cash / Tournament / League Season
            │
            ▼
[ Game Lobby / Table Selection ] ──► Quick Seat vs. Manual Table Choose
```

- **Home Dashboard.** Player statistics (League Rank, Total Chips, Recent Form)
  on the left 1/3 of the screen; the remaining 2/3 is an immediate, highly
  visual gateway to the Game Lounges.
- **Lounge split.** Divide lounges by game type with distinct visual themes —
  for example Texas Hold'em (professional/sporting), Blackjack (classic casino
  felt), 3-Card Brag (pub/underground).
- **"Quick Seat" trigger.** Never make a user manually browse tables if they
  just want to play. Every lounge carries a prominent "Quick Play" / "Auto-Seat"
  button that drops them into the next available seat matching their bankroll.

### Current mapping (post-rollback state)

| Reference idea | In the app today |
| --- | --- |
| Dashboard stats strip | Portal page has rank/progress; not yet on the poker welcome screen |
| Lounge hub | Luxe Lounges lobby exists (welcome → lobby → table flow kept by request) |
| Quick Seat | Not present — an auto-seat flow was built once and reverted on request; revisit only with explicit approval |
| Game-type themes | Poker only; no Blackjack or Brag lounges yet |

## 2. The micro HUD: unified 3-game layout

A **Three-Zone Grid** keeps the core structure identical across games while
only the contextual buttons change — this builds muscle memory.

### Zone A — The Dynamic Center (the action)

- **The felt:** live video stream or digital table graphic.
- **Card placement:**
  - Hold'em: community cards dead center; player cards in front of their avatar.
  - Blackjack: dealer hand top-center; player hand(s) bottom-center with clear
    "split" separation.
  - 3-Card Brag: three distinct cards dealt facedown/faceup in the center area.

### Zone B — The Persistent Frame (the HUD)

These elements never move, regardless of game:

- **Top Left:** table info & league standings (blind levels, timer, table
  min/max).
- **Bottom Left:** persistent chat box / live dealer feed toggles.
- **Top Right:** menu / settings / leaderboard shortcuts.
- **Bottom Right:** player profile mini-card (seat bankroll, active bet).

### Zone C — The Contextual Action Panel (the GUI buttons)

Bottom center/right; buttons morph completely with game state:

| Texas Hold'em | Blackjack | 3-Card Brag |
| --- | --- | --- |
| Fold (Red) | Stand (Red) | Fold (Red) |
| Check / Call (Blue) | Hit (Green) | Play / Call (Blue) |
| Bet / Raise (Green) | Double / Split (Yellow) | See / Blind Raise (Orange) |
| Bet sizing wheel/slider | Insurance pop-up toggle | "Play Blind" toggle switch |

## 3. League-structure UX adjustments

If structured as a league, the layout must surface competitive stakes
continuously:

- **Tournament ticker.** A slim, non-intrusive banner at the very top of the
  table HUD: Players Remaining | Next Blind Level in XX:XX | Current Bubble
  Position.
- **Bounty visual.** For bounty formats, a target/crosshair icon directly on
  the bountied player's avatar in the HUD.
- **Post-game summary flow.** Never kick a busted/finished player straight to
  the main menu — transition to a dedicated "League Impact" screen showing:
  1. Points earned this session.
  2. Updated position on the global leaderboard.
  3. A direct CTA: "Spectate Final Table" or "Join Next Lounge".

## Notes for LuxePrizeDraw

- **Orientation decision is made:** mobile-first, tables landscape-only (the
  current portrait gate stays). Portrait remains for lobby/dashboard browsing.
- **Zone B frame** aligns with the existing persistent bottom nav and audio
  controls — keep HUD chrome in fixed corners so it never collides with the
  table canvas.
- **Zone C colour language** (red = surrender, blue = neutral/call, green =
  commit) should be adopted as a cross-game standard before any second game
  lounge ships.
- **League Impact screen** is the natural landing point for the existing
  leaderboard data already surfaced in the Portal.
- **Compliance:** all of the above applies to the free-to-play league only.
  Anything resembling real-money staking stays gated until legal approval.

## Related documents

- `live-dealer-gui-hud.md` — how physical dealing connects to a digital HUD.
- `LAUNCH_AND_ACCESS_CONTROL_REGISTER.md` — what is gated pre-launch.
