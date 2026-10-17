# Third-Party Software and Asset Register

**Project:** LuxePrizeDraw Ltd platform
**Owner of original platform work:** LuxePrizeDraw Ltd
**Review date:** 24 September 2026

This register records direct software dependencies and identified externally hosted assets. It is not a substitute for supplier terms or a licence review. The lockfile is the source of truth for exact package versions and transitive dependencies.

## Direct software dependencies

| Package | Locked version | Declared licence |
| --- | ---: | --- |
| `@neondatabase/serverless` | 1.1.0 | MIT |
| `@tailwindcss/vite` | 4.3.3 | MIT |
| `@types/canvas-confetti` | 1.9.0 | MIT |
| `@upstash/redis` | 1.38.4 | MIT |
| `@vitejs/plugin-react` | 5.2.0 | MIT |
| `ai` | 7.0.107 | Apache-2.0 |
| `canvas-confetti` | 1.9.4 | ISC |
| `chess.js` | 1.4.0 | BSD-2-Clause |
| `dotenv` | 17.4.2 | BSD-2-Clause |
| `express` | 4.22.3 | MIT |
| `lucide-react` | 0.546.0 | ISC |
| `motion` | 12.43.0 | MIT |
| `react` | 19.3.0 | MIT |
| `react-dom` | 19.3.0 | MIT |
| `vite` | 6.4.3 | MIT |

## Externally hosted and supplier materials

| Material | Source | Status before release | Evidence to retain |
| --- | --- | --- | --- |
| Web fonts | Google Fonts (`Plus Jakarta Sans`, `Outfit`, `JetBrains Mono`) | Confirm applicable font terms and privacy implications | Terms reviewed, date and approver |
| Editorial and promotional images | Unsplash image URLs in `src/` | Confirm each use complies with the applicable Unsplash licence and any third-party rights | Asset URL, source, date checked and any attribution decision |
| Partner names, logos, listings and campaign content | Partner-controlled sources | Use only with documented permission or an approved agreement | Signed permission or agreement reference |
| Music, audio, stock graphics and video | Any asset added to `public/` or external CDN | Do not publish until licence scope covers commercial web use | Supplier, asset ID, licence, purchase record and expiry/renewal date |

## Maintenance procedure

1. Review this file and `package-lock.json` for every release that changes dependencies or public assets.
2. Add the package, version, licence and approval record before merging a new dependency.
3. Retain full licence texts, supplier terms, receipts and signed permissions in the controlled company archive—not this repository when confidential.
4. Escalate any copyleft, custom, unknown or incompatible licence to legal review before production use.

## Owner-supplied lower cash carousel image

- Asset: `public/prizes/lower-cash-notes.jpg`, uploaded 16 October 2026.
- Usage: homepage cash carousel prizes £1,000–£10,000 inclusive.
- Owner confirmed permission to use the supplied image in this conversation.
- Image retained as supplied, including visible watermark; no watermark removed.
- Permission is owner-reported, not independently verified. Retain the underlying
  licence evidence in the restricted company asset archive, not this repository.

## Owner-supplied higher cash carousel image

- Asset: `public/prizes/higher-cash-notes.jpg`, uploaded 16 October 2026.
- Usage: homepage cash carousel prizes above £10,000 (£12,500–£250,000).
- Source: owner supplied the screenshot and requested this usage; underlying
  licence evidence has not been independently verified. Retain it in the restricted
  company asset archive before commercial release.
- Image retained as supplied; no marks or image content removed.

## Owner-created poker lounge reference

- `public/prizes/original-poker-lounge.png`: supplied by the owner as their created
  design and explicitly requested for the lounge. Retained as provided.
- Live controls overlay the artwork; free-play/no-cash-value disclosures qualify
  the artwork's reward wording. No real reward or cash-out is enabled.
- Retain creation/licensing evidence in the restricted asset archive.

## Owner-supplied original poker table

- `public/games/luxe-poker-table.png`: original full-resolution artwork supplied
  by the owner on 16 October 2026 for the playable free-play poker table.
- Retained uncropped; actual pot/stage remain separate live UI. Decorative chips,
  seats and cards in the image are scenery, not authoritative game state.
- Retain underlying creation/licensing evidence in the restricted asset archive.

## Recorded poker-chip collision sound

- Asset: `public/audio/poker-chips-0942.mp3`, supplied by the owner on 17 October 2026.
- Source: https://bigsoundbank.com/poker-chips-s0942.html
- Title: Poker Chips; author: Clarisse; sound ID: 0942.
- Source page explicitly lists CC0/public-domain-equivalent licensing, commercial
  app use and redistribution allowed, attribution optional. Verified 17 October 2026.
- Used for chipDrop (Raise/Call) and chipStack (collection) with opt-in/mute/volume.
- Binary retained as uploaded. Actual listening and target-device playback remain
  unverified; no claim is made that automated checks judge audio quality.

## Homepage Luxe brand header

`public/prizes/home-luxe-banner.png` was supplied by the owner for placement above
headline prize previews. Retained uncropped. The pictured vehicle is illustrative,
not proof of a confirmed prize or supplier relationship. Retain rights evidence
in the restricted company asset archive.
