# MyPortfolio: Step 5 Plan - Rebalance Comparison

**Status:** Ready  
**Date:** 2026-07-22  
**Roadmap ref:** `docs/plans/portfolio-roadmap.md` → Step 5

---

## Branch proposal

- `feat/step5-rebalance-comparison`

---

## Objective

Compare the user's real allocation (Step 3) against their target model (Step 4), and surface the difference.

---

## Resolved decisions

Made directly (not via a stop-and-ask round) per explicit instruction to keep moving through this step; each is documented here so it's visible for review rather than silently assumed.

- **Dedicated `/rebalance` page, not a dashboard section.** Matches the established one-concern-per-page pattern (`/positions`, `/dashboard`, `/models`) rather than cramming a fourth concern onto the dashboard. Read-only, so it doesn't violate the dashboard's own "never an editing surface" rule either way — this is purely about not overloading one page.
- **No suggested buy/sell amounts in this step.** The plan already leaned this way ("mentioned as a 'later' refinement"). Confirmed: cost-basis allocation (what Step 3 computes) can *look* overweight/underweight in ways that current market value would contradict — e.g. a position that doubled in value is now genuinely overweight even if its cost-basis % looks fine. Suggesting a trade from stale cost-basis data risks being actively wrong. Real buy/sell suggestions wait for Step 6's live prices.
- **Compares against the user's default model only, on a single currency.** Two things forced this:
  1. Step 4's `isDefault` field exists specifically so *something* always has an unambiguous "the" target — Step 5 uses it rather than adding a model picker.
  2. **A real design gap the plan hadn't named:** Step 3's real allocation is computed *per currency group* (deliberately never blended — see Step 3's resolved decision). Step 4's model targets have **no currency dimension at all** — a model is just `ticker → percent`, full stop. Comparing a per-currency real % against a currency-agnostic target % isn't well-defined the moment a user holds positions in more than one currency; a single set of model percentages can't simultaneously mean "of my USD holdings" and "of my EUR holdings" and "of everything blended" without picking one. Rather than force a choice by converting currencies (needs real exchange rates — Step 6 territory) or awkwardly bolting a currency field onto `ModelAllocation` (a Step 4 schema change this late), **v1 compares against the user's single largest currency group by total invested**, and says so explicitly in the UI when other currencies exist and are excluded. Honest and simple beats silently wrong or silently incomplete.

---

## Scope

In scope:
- Pure diff calculation: actual % vs. target % vs. difference (`actual − target`), `OVERWEIGHT`/`UNDERWEIGHT`/`ON_TARGET` per ticker, computed as the union of tickers appearing in either side (a model ticker the user doesn't own at all is fully `UNDERWEIGHT`; a held ticker absent from the model is fully `OVERWEIGHT`).
- `GET /rebalance` endpoint: the user's default model + their largest currency group's real allocation (reusing Step 3's `calculatePositionsSummary`, not reimplementing it), diffed.
- `/rebalance` page rendering the diff, with an explicit empty state when the user has no default model and a note when other currencies were excluded.

Out of scope:
- Suggested buy/sell amounts (see resolved decisions).
- Multi-currency-aware comparison / currency conversion (needs Step 6).
- A model picker (compares against the default only).

---

## Response contract

```ts
interface RebalanceEntry {
  ticker: string;
  actualPercent: string;
  targetPercent: string;
  differencePercent: string; // actualPercent - targetPercent
  status: 'OVERWEIGHT' | 'UNDERWEIGHT' | 'ON_TARGET';
}

interface RebalanceComparisonResponse {
  modelId: string;
  modelName: string;
  currency: string; // the single currency group used for the comparison
  entries: RebalanceEntry[];
  excludedCurrencies: string[]; // other currencies the user holds but weren't compared
}
```

- No default model → a distinct "no default model" response shape (or `404`-with-a-specific-message — decide the exact contract at T3), rendered as an empty state prompting the user to create one, not a generic error.
- Zero real positions but a default model exists → every entry is `UNDERWEIGHT` at `-targetPercent`, `currency` falls back to the model's... **open question resolved:** with zero positions there's no currency group to pick at all. In that case return `currency: null` and `actualPercent: '0'` for every ticker — decide the exact null-handling at T1/T3, not left ambiguous in the final response contract.

---

## Proposed structure

- `api/src/rebalance/`
  - `rebalance-diff.ts` — pure calculation, reuses `calculatePositionsSummary` from `../positions/positions-summary.ts` rather than recomputing real allocation.
  - `rebalance-diff.spec.ts` — this step's real testing investment (per the original plan's testing note).
  - `rebalance.controller.ts`, `rebalance.service.ts`, `rebalance.module.ts`.
- `web/src/features/rebalance/`
  - `services/`, `hooks/` (read-only — no `list/`/`form/` split needed, there's nothing to create/edit here).
  - `components/` (diff table, empty state).
- `web/src/app/rebalance/page.tsx`.

---

## Step-by-step tasks

### T1 - Pure diff calculation helper — Done

Tasks:
- `rebalance-diff.ts`: `calculateRebalanceDiff(currencySummary: CurrencySummary | null, allocations: ModelAllocationLike[]): RebalanceComparisonInput` — takes the *already-computed* per-currency summary (from `calculatePositionsSummary`, picking the largest group by `totalInvested` at the call site, not inside this function) and the model's allocations, returns the union-of-tickers diff described in the response contract.
- Decimal arithmetic throughout (`differencePercent` is financial data, same rule as everywhere else).
- Handle: ticker in model only (fully underweight), ticker in positions only (fully overweight), ticker in both, `null` currency summary (zero real positions — every entry underweight, actual `'0'`).

Acceptance:
- Pure function compiles, no Prisma/Nest dependency, ready for T2.

**Verification completed:**
- `calculateRebalanceDiff` takes a `CurrencySummary | null` (imported from `positions-summary.ts`, reused rather than recomputed) and `Pick<ModelAllocation, 'ticker' | 'targetPercent'>[]` — no Prisma/Nest dependency, pure and unit-testable.
- Union-of-tickers built from two `Map`s (actual, target), sorted alphabetically for deterministic output; `Prisma.Decimal` throughout (`.minus()`, `.isZero()`, `.isPositive()`) — never a `Number()` roundtrip for the difference itself.
- `npm run build` passes. Manual sanity check confirmed all three cases: a ticker in both (over/underweight math correct), model-only ticker (`VOO`, 0% actual, fully underweight), positions-only ticker (`TSLA`, 0% target, fully overweight), and the `null`-currency zero-positions case (every model ticker fully underweight, `currency: null`).

---

### T2 - Tests for the diff calculation — Done

Tasks:
- The real testing investment for this step, per the original plan's testing note: model-only ticker, positions-only ticker, ticker in both (over/under/on-target), zero real positions, empty model (edge case — should this even be reachable given Step 4 requires ≥1 allocation? confirm and either test or document why not).

Acceptance:
- `cd api && npm test` passes with the new suite covering every edge case above.

**Verification completed:**
- Added `rebalance-diff.spec.ts` — 8 tests: overweight, underweight, exactly-on-target, model-only ticker (fully underweight), positions-only ticker (fully overweight), zero-real-positions (`null` currency, every model ticker underweight), alphabetical sort regardless of input order, and empty-model defensive coverage.
- The empty-model case is documented in its own test name as **not reachable through the real API** (Step 4 requires ≥1 allocation) — included anyway because the pure function itself has no such guarantee and should degrade sensibly if ever called that way, not because it's an expected production path.
- `npm run build`, `npm run lint`, `npm test` → 7 suites, **55/55** (was 47; all 8 new pass).

---

### T3 - Backend endpoint

Tasks:
- `GET /rebalance`, auth-protected, user-scoped.
- `RebalanceService`: fetch the user's default `ModelPortfolio` (with allocations); fetch the user's positions and call `calculatePositionsSummary`; pick the largest currency group by `totalInvested` (or `null` if none); call `calculateRebalanceDiff`; map to the response contract, resolving the no-default-model and zero-currency-groups cases decided in T1.
- No new module coupling beyond importing the plain exported `calculatePositionsSummary` function — `RebalanceModule` doesn't need to import `PositionsModule`/`ModelsModule` as Nest providers, just `PrismaModule`/`AuthModule` like the others.

Acceptance:
- Authenticated request returns a correct, user-scoped diff; a user with no default model gets a clear, distinct response (not a generic error); verified against real data.

---

### T4 - Frontend service + hook

Tasks:
- `rebalance.service.ts` (`getRebalanceComparison()`) + `useRebalanceQuery()`, mirroring the dashboard feature's shape (read-only, single query, no mutations).
- Query key shares the `['positions', ...]` / `['models', ...]` namespaces it actually depends on so edits to either automatically invalidate this view — same reasoning as the dashboard's `['positions', 'summary']` key decision in Step 3.

Acceptance:
- Hook compiles; full exercise happens once T5's page exists.

---

### T5 - Rebalance page

Tasks:
- `/rebalance` page (`ProtectedRoute`): a diff table/list (ticker, actual %, target %, difference, over/under/on-target), an explicit empty state ("no default model yet, create one") linking to `/models/new`, and a note when `excludedCurrencies` is non-empty explaining why those holdings aren't reflected.

Acceptance:
- Renders correctly for: no default model, a default model with zero real positions, a default model with a full real/target comparison, and (if reachable in test data) excluded currencies.

---

### T6 - Verification

Tasks:
- `npm run build`/`lint`/`test` in both packages.
- Full live-browser walkthrough (the discipline that found real bugs in Steps 2, 3, and 4's equivalent tasks): set up a default model and real positions with deliberate over/underweight tickers plus one model-only and one positions-only ticker, confirm the diff is correct, then clean up test data.

Acceptance:
- Definition of done below is met.

---

## Testing note

Per the roadmap's philosophy — this step has the most pure, worth-testing domain logic of the whole roadmap (T2). Skip tests for the page/service/hook layers; they just move already-validated numbers around.

---

## Definition of done

- Diff calculation unit-tested for every edge case in T2.
- `GET /rebalance` returns a correct, user-scoped diff, with a distinct no-default-model case.
- `/rebalance` shows the comparison correctly in the browser, including its empty/excluded-currency states.
- Build/lint/tests pass in both packages.
