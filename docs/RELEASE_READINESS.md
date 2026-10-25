# Release baseline and gates

Status: **approval pending — not a real-money release**.

## Baseline

The baseline for this work is main commit 32e0897 (merged ticket flow PR #226).
The separately reviewed branding PR must not be silently bundled into backend work.
Run `npm ci` then `npm run verify`. This runs TypeScript checks, unit/API tests,
isolated PostgreSQL-compatible migration/settlement tests and the application build.
No live payment credentials or production database are required for these checks.
The review workflow is installed at .github/workflows/review.yml and runs `npm run verify` on every pull request and on pushes to main. Making it a required check is a branch-protection setting a repository administrator still has to enable.
Workflow execution depends on repository Actions settings and available allowance;
this change does not buy runner capacity or configure branch protection.

## Release evidence — all outstanding unless a reviewer records proof

- [ ] Independent human/code review and QA approval for each implementation PR.
- [ ] Required status checks and branch protection enabled in repository settings.
- [ ] Isolated preview database, separate provider test keys and test-only identities.
- [ ] Encrypted production backup with restricted access, retention and restore drill.
- [ ] Migration reviewed with rollback/forward-recovery procedure and row counts.
- [ ] Production-role permission tests and concurrent transaction/overselling tests.
- [ ] Authenticated entrants; individual administrator roles and revocation tests.
- [ ] Reviewed UK/Republic of Ireland skill model, rules and territory gating.
- [ ] Payment-provider acceptance and signed test payment/refund reconciliation.
- [ ] Durable scheduling and one recorded result across crashes/retries.
- [ ] Mobile/browser accessibility and route-parity checks.
- [ ] Alerts, incident owner, reconciliation runbook and data-retention process.

Passing automated checks is not legal approval, independent QA or confirmation
that external providers/database migrations are configured.

## Database change process

1. Inventory databases, owners, schemas, row counts, permissions and consumers using
   authorized provider access. Do not dump customer data into Git or build artifacts.
2. Create a provider-supported encrypted backup/snapshot and record its reference
   in the restricted operational register (not public source). Restore to an isolated
   database and compare schema/counts before relying on that backup.
3. Test additive migration and application compatibility with old and new schemas.
   Prefer expand/contract releases; never drop ticket/audit/result data to roll back.
4. For the existing automatic-ticket migration, rollback means stop the worker and
   disable ticket operation first. Preserve pool, result and event tables. Do not
   reopen closed draws or delete results. Forward-fix under review when needed.
5. Deploy a reviewed preview, run independent QA, then obtain explicit production
   change approval. Retain previous deployment and rollback instructions.

No backup or restore drill has been performed by this baseline change. Database
access, provider resources and any paid work require separately scoped approval.

## Workstream boundaries

- UI PR: components/styles only; preserve source values and pending notices.
- Identity PR: authenticated sessions, roles and tests; no payment activation.
- Ledger PR: additive migrations and atomic ticket writers with integration tests.
- Payments PR: test adapters/webhooks; no live credentials or real charges.
- Draw PR: scheduler/results and fault tests; depends on reviewed ledger contract.
- Independent QA/security PR: tests/review evidence; do not self-approve implementation.

No specialist delegation tools are available in the current assistant session.
Independent review must be performed by another reviewer; do not represent the
implementing assistant's own tests as independent approval.
