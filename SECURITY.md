# Security and Access Controls

LuxePrizeDraw Ltd maintains this repository and the LuxePrizeDraw Ltd project as proprietary systems.

## Required controls

- Keep the production repository private; do not mirror or publish source without written company approval.
- Give every contributor an individual account and the minimum access required for their role.
- Require multi-factor authentication for source-control, Vercel, domain, email, payment and supplier accounts.
- Protect the default branch: require pull-request review, passing checks and restricted merge permissions; prohibit direct production changes.
- Store credentials only in managed environment variables or the company password manager. Never commit secrets, signing material, customer data or confidential prompts.
- Use distinct development, preview and production credentials. Rotate credentials after an access change or suspected disclosure.
- Maintain encrypted backups and retain a dated release record, screenshot set and deployment history for each material release.
- Remove access immediately when an employee, contractor or supplier no longer needs it; record the date and systems revoked in the company access log.

## Repository safeguards in place

- The project package is marked `UNLICENSED` and the root `LICENSE` reserves rights to LuxePrizeDraw Ltd.
- The IP register, confidentiality policy and third-party asset register are version-controlled under `docs/`.
- The public competition-entry endpoint is fail-closed while the platform is pre-launch.
- Production source maps are protected at the Vercel project level.

## Report a security issue

Do not open a public issue or publish a proof of concept. Report the concern directly to the company’s authorised security contact and include the affected system, reproduction steps, impact and any remediation already taken.
