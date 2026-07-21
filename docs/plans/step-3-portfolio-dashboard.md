# MyPortfolio: Step 3 Plan - Portfolio Dashboard

**Status:** Proposed  
**Date:** 2026-07-21  
**Roadmap ref:** `docs/plans/portfolio-roadmap.md` → Step 3

---

## Branch proposal

- `feat/step3-portfolio-dashboard`

---

## Objective

Turn stored positions into a portfolio summary. No live market prices yet — this step works entirely from cost-basis data already in the `Position` table.

---

## Scope

In scope:
- Pure calculation helpers: total invested, allocation by ticker, allocation by broker, open vs. closed position counts.
- `/dashboard` page rendering those numbers and linking out to `/positions`.

Out of scope:
- Live market prices and real unrealized P&L (needs an external price feed — a later step once this one and Step 4/5 are stable).
- Any position editing on the dashboard — it stays read-only per the roadmap's page-structure decision.
- Model comparison (Step 5).

---

## Proposed structure

- `api/src/positions/` (extend, don't duplicate): a `positions.summary.ts` (or similar) pure-calculation helper module, called by a new `GET /positions/summary` endpoint — or compute client-side from the already-fetched positions list if that's simpler and avoids a second round trip. **Open decision:** resolve at task time based on how large the positions list realistically gets.
- `web/src/features/dashboard/` — hooks + components consuming positions data and the calculation helpers.

---

## Deliverables (to be broken into T-tasks when this step starts)

- Total invested (sum of `quantity × averageBuyPrice` across open positions, currency-aware or single-currency for v1 — decide at task time).
- Allocation by ticker and by broker (percentages).
- Open vs. closed counts.
- `/dashboard` page assembling the above, with a link to `/positions`.

---

## Testing note

This step is where the lean testing philosophy actually applies: the calculation helpers (totals, allocation percentages) are pure functions with real edge cases (zero positions, single position, rounding) — write focused unit tests for them. Skip tests for the page/components that just render the numbers.

---

## Open decisions to resolve when this step is picked up

- Single-currency v1 vs. multi-currency totals (positions can already record different currencies per Step 2).
- Whether allocation/summary math runs server-side (new endpoint) or client-side (derived from the existing positions list).

---

## Definition of done (draft)

- Calculation helpers unit-tested for the real edge cases.
- `/dashboard` shows correct totals/allocation for a user's actual positions.
- Build/lint/tests pass in both packages.
