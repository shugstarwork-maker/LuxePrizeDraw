# Automatic ticket draw — approval pending

This review migration adds a durable ten-second countdown, frozen paid/free ticket
pool and atomic winner transition. It is not deployed or wired to live entries.
The existing `prize_entries` ledger is reused, not replaced by browser counts.

A trusted worker calls `advance_prize_auto_draw(drawId)` in a transaction. Each
call locks the draw row. At exactly maximum_entries eligible tickets it closes
entry and persists due_at = database time + 10 seconds. Later calls select one
winner using pgcrypto rejection sampling and retain the pool/hash and event.
Retries return DRAWN without rerolling. Refunds or changed eligibility stop the
selection for review. The worker may execute later than ten seconds if delayed;
no system should promise exact-time execution or fabricate a result at zero.

## Required before activation

- Apply the base and new migrations to an isolated database and run real concurrent
  writer/worker tests, rollback tests, retry tests and permission checks.
- All ticket writers and refund/eligibility updates must lock the prize_draws row;
  no current endpoint implements that complete entry workflow. Enforce verified
  account, jurisdiction, consent, payment and cap controls before inserting tickets.
- Lock reviewed rules, equal free-entry treatment, price, ticket cap and winner
  method before opening. Approval must be independently authorized, not a public
  checkbox; approved defaults false and there is no approval API here.
- Provision a least-privilege worker role; grant only necessary function/table
  permissions. Keep approval mutation separate. Restrict direct table writes.
- Deploy a durable worker with retries, monitoring and alerting. No scheduler is
  installed by this PR and no HTTP endpoint invokes selection.
- Expose a sanitized per-draw status API (no entrant identifiers), including server
  time, due_at, verified count, cap and published result. Bind card countdowns to
  that state; zero means awaiting the worker result, not selecting in the browser.
- Reconcile the canonical prize_draw_results audit/verification contract with this
  pgcrypto selection method before activation. This migration retains its own
  auditable result and does not claim the existing seeded method was used.

Until these steps and formal approval are complete, this is backend groundwork,
not an operational automatic draw. No real entry, payment or prize is enabled.
