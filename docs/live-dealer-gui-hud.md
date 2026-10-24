# Live-Dealer GUI & HUD Architecture (Reference)

Status: research reference only. LuxePrizeDraw is pre-launch — no live dealing,
real-money play, or broadcast operation exists today. This document records how
established live-dealer platforms connect a physical card table to a digital
interface, as design context for how Luxe tables and prize draws could be
presented if a live-dealer format is ever pursued after legal approval.

## Core principle

Instead of using a computer-generated Random Number Generator (RNG) to simulate
a deck of cards, a real human dealer sits at a real physical table inside a
dedicated broadcast studio or a land-based casino floor. Every card outcome the
player sees originates from a physical deal, captured and digitised in real
time.

## 1. The video stream & HUD overlay

- **Video feed.** Multiple high-definition cameras stream the human dealer
  shuffling, cutting, and dealing physical cards in real time.
- **HUD GUI.** Superimposed over the video feed is a digital user interface.
  The player's screen shows interactive digital chips, betting fields (for
  example "Hit", "Stand", or specific side bets), and information panels
  displaying current balance and past game statistics.

## 2. Optical Character Recognition (OCR) tech

The technology connecting the physical cards to the digital interface relies on
OCR:

- Every playing card carries micro-markings or distinct visual elements read by
  a camera built into the dealer's shoe (the box housing the decks).
- As the dealer pulls a physical card out and lays it down, the OCR software
  instantly scans the suit and rank.
- Within milliseconds the system translates that physical card into digital
  data on the player's HUD — displaying the running total and enabling the
  relevant UI buttons for that game state.

## 3. The live interaction loop

- **Chat box.** Players type messages into a standard GUI live-chat window.
- **Dealer monitor.** In front of the real-world dealer is a large touchscreen
  monitor displaying player names, active bets, and the live chat feed.
- **Real-time responses.** The dealer reads player messages and responds out
  loud to the camera, talking directly to players by name while dealing the
  next hand.

## Relevance to LuxePrizeDraw

- **Trust positioning.** A physically dealt, camera-verified card stream is the
  industry answer to RNG scepticism — the same consumer-trust problem our
  provably fair, publicly verifiable draw record addresses for prize draws.
- **HUD convergence.** The live-dealer HUD pattern (stats overlaid on the
  action, one tap away) matches the direction of our in-app table HUD thinking:
  transparent, identical information for every participant.
- **Compliance first.** Any live-dealer format is gambling-regulated territory.
  It could only be explored after the competition rules are legally approved
  and with explicit regulatory advice; it is out of scope for the current
  pre-launch, free-to-play platform.
- **Draw presentation idea.** The studio-stream concept transfers cleanly to
  prize draws: a live-streamed, physically conducted ticket draw (real drum or
  real deck selection on camera) would be a strong public-verifiability signal
  for the headline draws once entries legally open.

## Related documents

- `AUTOMATIC_TICKET_DRAW.md` — the current provably fair draw design.
- `LAUNCH_AND_ACCESS_CONTROL_REGISTER.md` — what is gated pre-launch.
