# LuxePrizeDraw

Pre-launch site for LuxePrizeDraw Ltd. Prize catalogues, free-play lounges and the approval-pending launch build are visible. Paid entries, prize payouts and safeguarding claims stay switched off until the server-side launch evidence is in place.

## Run locally

Requires Node.js 20 or 22.

```bash
npm ci
npm run dev
```

The app listens on port 3000 unless `PORT` is set. Production build:

```bash
npm run build
npm start
```

`npm test` runs the unit tests. `npm run verify` also typechecks, runs the ticket-database check and builds.

Copy `.env.example` if you need local account or database settings. The public preview works without those secrets.
