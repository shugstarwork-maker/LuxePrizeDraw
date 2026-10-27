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

Copy `.env.example` if you need local account or database settings. The local dev server stays open so you can work. A production process (`NODE_ENV=production`, which the Docker image sets) does not serve the catalogue until `SITE_ACCESS_CODE` is set on the host. Render should keep `/health` as its health check. Add `SITE_ACCESS_CODE` in the service environment, save, and redeploy, then enter that code on the private page. Do not commit the code.
