# MyPortfolio: Step 5 Plan - Rebalance Comparison

**Status:** Proposed (future)  
**Date:** 2026-07-21  
**Roadmap ref:** `docs/plans/portfolio-roadmap.md` → Step 5

---

## Branch proposal

- `feat/step5-rebalance-comparison`

---

## Objective

Compare the user's real allocation (Step 3) against their target model (Step 4), and surface the difference.

---

## Scope

In scope:
- Pure diff calculation: actual % vs. target % vs. difference, overweight/underweight flags per ticker.
- A `/rebalance` page or dashboard section showing the diff.

Out of scope (until this step is actually picked up and re-scoped):
- Suggested buy/sell amounts — mentioned in the original product discussion as a "later" refinement even within this step; confirm scope before building.
- Anything involving live market prices unless that separate step has landed first.

---

## Dependencies

Needs Step 2 (real positions), Step 3 (real allocation calculation), and Step 4 (target model) all stable first. Do not start this step early — the diff logic is only meaningful once both sides of the comparison are trustworthy.

---

## Testing note

This is the step with the most pure, worth-testing domain logic in the whole roadmap: the diff/overweight-underweight calculation has real edge cases (ticker in model but not owned, ticker owned but not in model, zero total value). Test the calculation thoroughly; skip tests for the page that renders it.

---

## Definition of done (draft)

- Diff calculation is unit-tested for its edge cases.
- The comparison is visible somewhere in the UI (exact placement — dedicated page vs. dashboard section — to be decided when this step starts).
