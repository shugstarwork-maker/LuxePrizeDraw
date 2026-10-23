# Game UI Middleware — Research Notes

Owner-supplied reference for the LuxePrizeDraw games UI direction.
Captured 2026-10-24.

| Middleware | Tech stack | Strengths | Shipped in |
|---|---|---|---|
| **NoesisGUI** | XAML / C# / C++ | Deep, vector-based HUDs and cross-platform layout rendering | Baldur's Gate 3, Senua's Saga: Hellblade II |
| **Coherent Labs Gameface** | HTML5 / CSS / JavaScript | Web developers transition to gaming; highly dynamic UI animations | Civilization VII, Spider-Man 2, World of Tanks |

## Relevance to LuxePrizeDraw

- The app's games (Luxe Poker League, card lounges, challenge games) are already
  built on the **Gameface model** — HTML5/CSS/JavaScript UI over a game engine —
  which means every screen is also portable to a native game client later via
  Coherent Gameface without rewriting the interface.
- If a native desktop/console client ever happens, **NoesisGUI** is the
  vector-HUD alternative for the C++/C# route (Unreal/Unity).
- Current in-game UI patterns aligned with AAA practice:
  - Smart HUD (tap-a-seat stats) — the GGPoker-style built-in HUD
  - Landscape-only fullscreen table with overlay action dock
  - Cinematic layer (film grain, vignette, light beams, letterbox reveals)
