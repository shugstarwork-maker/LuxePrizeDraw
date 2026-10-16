# Uploaded launch server integration

The owner-supplied `server.js` catalogue is merged into the existing React/Express
application and a standalone Vercel API, rather than replacing either server.
Open `/launch-build` from the homepage's proposed catalogue link.

## Available now

- All 17 uploaded cash, holiday, experience and Bitcoin-or-cash proposals, including
  their original proposed prices, grades and revenue targets.
- `GET /api/launch-build?action=config` and `?action=draws` return public preview
  data without secrets or entrant information. Unconnected sales are `null`, not zero.
- Protected `GET ?action=admin/state`, `POST ?action=admin/proofs` with
  `{key,ok,note}`, and `POST ?action=admin/draws/{id}/pause` or `/resume` with `{}`.
  These use a dedicated bearer token and durable SQL control/audit records.
- The page has a memory-only password input for admin review notes and pause controls.
  It does not save credentials in localStorage or URLs. Clear the session after use.

## Provisioning (not performed by this PR)

1. Use a dedicated Neon/Postgres database; apply `database/launch_build.sql`.
2. Configure `LAUNCH_BUILD_DATABASE_URL` and `LAUNCH_BUILD_ADMIN_TOKEN` as protected
   server-side environment variables in the intended Vercel environment. Never
   use a `VITE_` prefix. Use separate preview and production databases and tokens.
3. Redeploy and verify an admin update, audit record, and reload against the database.
   Without configuration the public catalogue works, but administration fails closed.
   If a configured store fails, reads return 503 rather than hiding saved controls.

Review notes and control changes are committed atomically with their audit record.
No runtime filesystem or mutable process-global business state is used.

## Deliberately not activated

The uploaded proposal's multipliers differ from the app's `prizeUnlock` model.
They remain explicitly labelled proposals, not new approved economics. No existing
prize card, entry limit enforcement, sales ledger or economics policy is overwritten.

The uploaded auto-paid demo checkout, self-exclusion-by-email, local JSON storage,
postal ticket issuance, and random winner issuance are not imported. They bypass
verified-account controls, durable entry accounting or the existing draw audit.
`POST ?action=checkout`, `self-exclude`, and authenticated `admin/draws/{id}/draw`
return 423 and do not write anything. No setting, proof checkbox, `LAUNCH_MODE`,
or uploaded `ADMIN_TOKEN` enables those routes. There is no new Stripe webhook.
Existing membership checkout and signed webhook behavior remain untouched.

Use the protected `/postal-intake` workflow for slip records; it does not issue an
entry. `admin/postal` returns a pointer there, not a second entry ledger. Public
configuration maps the existing evidence environment variables without exposing
values; stored review notes do not change these evidence signals or grant approval.
Real entry acceptance, verified-account self-exclusion, provider-backed payment
controls and winner issuance need a separate compliance-reviewed implementation.

## Verification

Local tests cover the catalogue, secret-free preview data, missing-store behavior,
authorization, input validation, locked money/entry routes, and rendered disclosures.
Database-backed writes require the provisioning and smoke check above. No production
configuration, database or live payment provider is modified by this integration.
