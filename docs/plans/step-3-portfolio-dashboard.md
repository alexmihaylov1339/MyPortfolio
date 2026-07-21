# MyPortfolio: Step 3 Plan - Portfolio Dashboard

**Status:** Complete — all T1-T6 done and verified (build/lint/test in both packages, plus a full live-browser walkthrough across two currencies, four tickers, and a closed position)  
**Date:** 2026-07-21  
**Roadmap ref:** `docs/plans/portfolio-roadmap.md` → Step 3

---

## Branch proposal

- `feat/step3-portfolio-dashboard`

---

## Objective

Turn stored positions into a portfolio summary. No live market prices yet — this step works entirely from cost-basis data already in the `Position` table.

---

## Resolved decisions

- **Currency handling: group by currency, don't blend.** The summary shows separate subtotals per currency (e.g. "USD: $1,200 · EUR: €400") rather than one summed number. Silently adding different currencies together would be a genuinely wrong number — real currency conversion is deferred to when actual exchange rates exist, likely alongside Step 6's market-price work.
- **Calculation location: backend.** A new endpoint computes totals/allocation, following the existing pattern of business logic living in services. This also scales to Step 6 (live market prices/P&L), which must run server-side regardless (an API key can't be exposed to the browser) — doing it server-side now avoids reworking this later.

---

## Scope

In scope:
- Pure calculation helpers: total invested per currency, allocation by ticker within each currency, allocation by broker within each currency, open vs. closed position counts (currency-independent).
- `GET /positions/summary` endpoint, auth-protected, user-scoped.
- `/dashboard` page rendering the summary and linking out to `/positions`.

Out of scope:
- Live market prices and real unrealized P&L (Step 6).
- Currency conversion / a single blended total (deferred, see resolved decision above).
- Any position editing on the dashboard — stays read-only per the roadmap's page-structure decision.
- Model comparison (Step 5).

---

## Proposed structure

- `api/src/positions/`
  - `positions-summary.ts` — pure calculation functions (no Prisma, no NestJS), consuming an array of `Position` rows.
  - `positions-summary.spec.ts` — the real test investment of this step.
  - `positions.controller.ts` / `positions.service.ts` — extended with the new route + a service method that fetches the user's positions and calls the pure helper.
- `web/src/features/dashboard/`
  - `services/dashboard.service.ts` — `getPositionsSummary()`.
  - `hooks/useDashboardSummaryQuery.ts`.
  - `components/` — small presentational pieces (currency group card, allocation list, open/closed counter), composed by the page.
- `web/src/app/dashboard/page.tsx` — replace the current placeholder with the real summary.

---

## Response contract (decide field names now, don't re-litigate per task)

```ts
interface PositionsSummaryResponse {
  currencies: Array<{
    currency: string;
    totalInvested: string; // Decimal-as-string, matches the existing Position response contract
    byTicker: Array<{ ticker: string; invested: string; percent: string }>;
    byBroker: Array<{ broker: string; invested: string; percent: string }>;
  }>;
  positionCounts: { open: number; closed: number };
}
```

- `invested` per position = `quantity × averageBuyPrice`, computed with `Decimal` arithmetic — never `Float` (rule 44a).
- Only `OPEN` positions feed `currencies` (totals/allocation describe what's currently held). `positionCounts` reports both.
- `percent` is each ticker's/broker's share of that *currency group's* total, as a string (e.g. `"33.33"`), not a fraction.

---

## Step-by-step tasks

### T1 - Pure summary calculation helper — Done

Tasks:
- `positions-summary.ts`: `calculatePositionsSummary(positions: Position[]): PositionsSummaryResponse`.
- Group open positions by `currency`. Within each group: sum `invested` (Decimal), compute per-ticker and per-broker subtotals and percentages.
- `positionCounts` counts all positions (open + closed) regardless of currency.
- Handle: zero positions (empty `currencies`, `positionCounts: {open: 0, closed: 0}`), a single position (100% allocation), multiple positions in one currency, multiple currencies (no cross-currency mixing), closed positions excluded from `currencies` but counted in `positionCounts.closed`.

Acceptance:
- Pure function compiles, takes no Prisma/NestJS dependency, ready for T2's tests.

**Verification completed:**
- `calculatePositionsSummary` takes only the Prisma-generated `Position[]` shape (no `PrismaService`, no Nest decorators) — genuinely pure and unit-testable without a database, per rule 56.
- All money math (`invested = quantity.times(averageBuyPrice)`, sums, percentages) uses `Prisma.Decimal` throughout — `.plus()`, `.times()`, `.dividedBy()`, `.comparedTo()` for sorting — never a `Number()`/`Float` roundtrip, per rule 44a. Money values format via `.toFixed(2)`.
- Currency groups are computed independently and never summed together, matching the resolved decision. `byTicker`/`byBroker` sort descending by invested amount (largest holding first) and currencies sort alphabetically — a deterministic, undocumented-until-now presentation choice, recorded here per rule 27.
- `npm run build` and `npm test` (24/24, unchanged — T2 owns the new tests) pass.
- Manual sanity check against realistic multi-currency/multi-broker/mixed-status data confirmed correct output: EUR and USD kept as separate groups (not blended), AAPL/MSFT correctly split 50/50 of the USD total, a closed position excluded from `currencies` but present in `positionCounts.closed`.

---

### T2 - Tests for the summary calculation — Done

Tasks:
- This is the step's real testing investment, per the roadmap's testing philosophy — pure financial calculation with genuine edge cases.
- Cover: zero positions, single position (100%), multiple same-currency positions (percentages correct and sum to ~100%), multiple currencies (grouped, not blended), closed positions excluded from totals but present in counts, Decimal precision (a quantity with several decimal places doesn't lose precision through the calculation).

Acceptance:
- `cd api && npm test` passes with the new suite covering every edge case above.

**Verification completed:**
- Added `positions-summary.spec.ts` — 6 tests, one per edge case listed above, plus an explicit percentage-sums-to-100 check on the multi-position case.
- The Decimal-precision test (`quantity: '10.333333'`, `averageBuyPrice: '3'` → `'31.00'`) is deliberately chosen to fail loudly if a bug ever parsed quantity as an integer or lost precision through a `Number()`/float roundtrip (`'31.00'` vs. a wrongly-truncated `'30.00'`), rather than just re-asserting round-number arithmetic.
- Test fixtures use a small `buildPosition(overrides)` helper (real Prisma-shaped `Position` objects, `Prisma.Decimal` fields) — no mocking needed since the function under test has zero external dependencies.
- `npm run build`, `npm run lint`, `npm test` → 5 suites, **30/30** (was 24; all 6 new pass).

---

### T3 - Backend endpoint — Done

Tasks:
- `GET /positions/summary` on `PositionsController` (auth-protected, `CurrentUser`-scoped) — placed before `GET /positions/:id` in the controller so the literal `summary` path isn't swallowed by the `:id` param route.
- `PositionsService` method fetches the user's positions (all statuses, needed for `positionCounts`) and calls `calculatePositionsSummary`.

Acceptance:
- Authenticated request returns a correct, user-scoped summary; verified against real data (curl, matching the T3-of-Step-2 verification style).

**Verification completed:**
- Added `PositionsService.getSummaryForUser(userId)` (fetches all of the user's positions regardless of status, delegates to `calculatePositionsSummary`) and `PositionsController`'s `GET /positions/summary`, declared before `GET /positions/:id` — confirmed via the boot log that Nest registers `Mapped {/v1/positions/summary, GET}` ahead of `Mapped {/v1/positions/:id, GET}`, so `summary` resolves as a literal path, not the `:id` param.
- `npm run build` and `npm test` (30/30, unchanged — no new unit tests needed here, this route is thin wiring over an already-tested pure function) pass.
- Full live verification against Supabase: zero positions → `{"currencies":[],"positionCounts":{"open":0,"closed":0}}`; created 2 USD-open + 1 EUR-open + 1 USD-closed position → summary correctly grouped EUR/USD separately, 50/50 split for the two USD tickers, `positionCounts: {open: 3, closed: 1}`; unauthenticated request → `401`; a second, unrelated user → sees their own empty summary, not the first user's data (ownership scoping confirmed at the endpoint level, not just via `getOwnedPositionOrThrow` which this route doesn't even call — `getSummaryForUser` scopes by `userId` in the Prisma `where` directly). Test users and their cascaded positions deleted afterward.

---

### T4 - Frontend dashboard service + hook — Done

Tasks:
- `web/src/features/dashboard/services/dashboard.service.ts`: `getPositionsSummary()` via `ManageService` + `getAuthHeaders()`, matching the positions service's pattern.
- `web/src/features/dashboard/hooks/useDashboardSummaryQuery.ts`.

Acceptance:
- Hook compiles; usable from a page (full exercise happens once T5 lands, same deferral pattern used in Step 2).

**Verification completed:**
- Added `dashboard/{constants,services,hooks}` mirroring the `positions` feature's structure and `ManageService`/`getAuthHeaders()` pattern exactly.
- **Deliberate cache-key decision:** `useDashboardSummaryQuery` uses `queryKey: ['positions', 'summary']`, not `['dashboard', 'summary']` — TanStack Query invalidates by key *prefix*, and the existing positions create/update/delete mutations already call `invalidateQueries({ queryKey: ['positions'] })`. Keying the summary under the `positions` namespace means the dashboard automatically refreshes after any position change, with no extra invalidation code needed anywhere. Using a separate `dashboard` namespace would have left the dashboard silently stale after edits — worth recording since it isn't obvious from the file layout (the hook lives in `features/dashboard/` but shares `features/positions/`'s cache namespace on purpose).
- `npx tsc --noEmit`, `npm run lint`, `npm test` (217/217, unchanged — no new tests at this stage, matching Step 2's T4 deferral pattern), `npm run build` all pass.

---

### T5 - Dashboard page — Done

Tasks:
- Replace the placeholder `/dashboard` content: a card per currency (total invested, allocation by ticker, allocation by broker), an open/closed count, and a link to `/positions`.
- Loading/error/empty states (empty = no positions yet, link to `/positions/new`).

Acceptance:
- `/dashboard` renders correctly for a user with positions and for a user with none.

**Verification completed:**
- Added `dashboard/components/{CurrencySummaryCard,PositionCountsSummary,DashboardEmptyState}.tsx`, each a small named state component per rule 25, composed by `web/src/app/dashboard/page.tsx` which stays orchestration-only (hook call + conditional rendering, no inline heavy JSX).
- "Empty" is defined as zero positions ever created (`open === 0 && closed === 0`) — a user with only closed positions gets the counts + a "No open positions right now" line, not the full get-started empty state, since those are different situations.
- `npx tsc --noEmit`, `npm run lint`, `npm test` (217/217, unchanged), `npm run build` all pass.
- **Live-browser check** (lighter than T6's full walkthrough, since these are brand-new components never runtime-exercised before): registered a test user, confirmed the empty state (`DashboardEmptyState` with its CTA) renders correctly with zero positions; created two USD positions (AAPL/REVOLUT, MSFT/IBKR) via the API, reloaded — dashboard correctly showed `2 open · 0 closed`, one `USD` card, total `3000.00 USD`, `AAPL 50.00%` / `MSFT 50.00%` by ticker, `REVOLUT 50.00%` / `IBKR 50.00%` by broker, matching the API response exactly. Test user (and cascaded positions) deleted afterward. Multi-currency verification is T6's job.

---

### T6 - Verification — Done

Tasks:
- `npm run build`/`lint`/`test` in both packages.
- Given Step 2's T6 found two real bugs invisible to type-checking, repeat that discipline here: a full live-browser walkthrough — create positions across at least two currencies and two tickers, confirm the dashboard's grouping/percentages/counts are actually correct, then clean up test data.

Acceptance:
- Definition of done below is met.

**Verification completed:**
- `npm run build`, `npm run lint`, `npm test` clean in both packages: api 30/30, web 217/217.
- Full live-browser walkthrough via the real UI (not curl, unlike T3's endpoint check) — registered a user, logged in through the actual `/login` form, then created 4 positions through the real `/positions/new` form: `AAPL`/`REVOLUT`/`USD` (open), `MSFT`/`IBKR`/`USD` (open), `VOO`/`REVOLUT`/`EUR`/ETF (open), `TSLA`/`IBKR`/`USD` (created directly as `CLOSED`, exercising the same-request `closedAt` requirement live). `/dashboard` then showed, exactly matching hand-calculated expectations: `3 open · 1 closed`; an `EUR` card (`800.00 EUR`, `VOO 100.00%`/`REVOLUT 100.00%`); a `USD` card (`3000.00 USD`, `AAPL 50.00%`/`MSFT 50.00%` by ticker, `REVOLUT 50.00%`/`IBKR 50.00%` by broker); `TSLA` correctly absent from both currency cards but reflected in the closed count; currencies sorted alphabetically. This also confirms T4's cache-key decision works end-to-end — navigating from `/positions` (right after creating a position) to `/dashboard` showed immediately-fresh data, not a stale pre-creation cache. Test user (and cascaded positions) deleted afterward.
- Two unrelated environment hiccups worked around during this session, not product bugs: a manually-typed JWT in `localStorage` turned out invalid (switched to logging in through the real form instead, which is more representative anyway) and `computer.left_click` intermittently didn't register on a couple of buttons in this browser tab (worked around with `form.requestSubmit()` via `javascript_tool`, the same reliable technique used in Step 2's T6).

---

## Testing note

Reminder from the roadmap: this is the step where thorough testing genuinely pays off (T2). Skip tests for the dashboard page/components themselves — they just render what T1/T2 already validated.

---

## Definition of done

- Calculation helper unit-tested for every edge case in T2.
- `GET /positions/summary` returns correct, user-scoped, currency-grouped data.
- `/dashboard` shows correct totals/allocation for a user's actual positions, verified live in the browser.
- Build/lint/tests pass in both packages.
