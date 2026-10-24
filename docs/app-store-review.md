# App Store / Google Play Review Compliance Text

Status: **draft** — for submission alongside the review-mode build.

## Review mode switch

The app ships with a remote-config flag (`review_mode`, Firebase Remote Config
at launch; locally `?review=1`). While ON, the build presented to reviewers is a
100% free-play social games app: no purchase flow, no prize references, no
redemption store. The flag and its UI effects are implemented in
`src/lib/reviewMode.ts`.

## Reviewer notes (paste into App Store Connect / Play Console)

> LuxePrizeDraw is a free-to-play social games app. In the build under review,
> all content is free: casual poker, chess, draughts and Connect Four are played
> with virtual chips that have no monetary value, cannot be purchased, and
> cannot be exchanged for cash, goods, or any item of value.
>
> There are no loot boxes, no randomized items for purchase, and no gambling
> mechanics. No real-money transactions of any kind exist in this build.
>
> Demo account: not required — all features are accessible without sign-in.
>
> Region: United Kingdom only.

## If asked about future prize features

> A future update may introduce skill-based prize competitions compliant with
> the UK Gambling Act 2005 free-entry rules and the Voluntary Code of Good
> Practice for Prize Draw Operators: every prize entry route will have an
> equally prominent free entry route, all players will be verified 18+ via an
> approved identity provider before any prize or payout, and card purchases
> will be capped at £250 per calendar month. That functionality is fully
> disabled in this build and would be submitted for re-review before release.

## Checklist before submission

- [ ] `review_mode` ON — verify Rewards tab, 🎟 balances, /redeem, prize
      tables and "Prize" wording are all hidden (automated: tests assert the
      gating hooks).
- [ ] Screenshots captured from a review-mode build only.
- [ ] Privacy policy URL live and matches data actually collected (review-mode
      build collects none).
- [ ] Age rating declared consistently (17+ simulated-gambling-adjacent themes
      avoided; card games shown as social play).
- [ ] After approval: flip `review_mode` OFF only when legal sign-off for the
      UK prize mechanics is in hand.
