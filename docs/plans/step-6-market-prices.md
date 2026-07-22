# MyPortfolio: Step 6 Plan - Market Prices & Real P&L

**Status:** Ready  
**Date:** 2026-07-22  
**Roadmap ref:** `docs/plans/portfolio-roadmap.md` → Step 6

---

## Branch proposal

- `feat/step6-market-prices`

---

## Objective

Fetch and cache current market prices for open positions, so the dashboard can show real **unrealized** P&L and current value alongside the existing cost-basis totals (Step 3), without breaking that existing view.

---

## Confirmed provider details (re-verified 2026-07-22, not assumed from the original 2026-07-21 research)

- **Free tier still 800 requests/day, 8/minute** — unchanged since this was first researched.
- **Endpoint:** `GET https://api.twelvedata.com/price?symbol={TICKER}&apikey={KEY}` → `{"price": "200.99001"}`. 1 API credit per symbol per call.
- **No confirmed multi-symbol/batch support** on this endpoint (a separate `/advanced/batch-requests` feature exists but its exact contract wasn't fully accessible via docs fetch, and isn't needed — see Rate-limit handling below). **Decided: individual `/price` calls per unique ticker**, not batched.

---

## What YOU need to do (user action, blocks T3's live verification)

1. Sign up for a free account at twelvedata.com and grab an API key from the dashboard. (This is an account-creation step — I can't do it on your behalf.)
2. Add it to `api/.env` yourself as `TWELVE_DATA_API_KEY=...` (same pattern as Step 1's Supabase credentials — don't paste the key into chat).

Everything else in this step can proceed without the key; only the live-provider verification (part of T3, and all of T7) is blocked until it's in place.

---

## Scope

In scope:
- `MarketPricesService`: fetches a ticker's price from Twelve Data, cached with a TTL, isolated behind a swappable interface (rule already established: don't couple callers to the specific provider).
- A pure P&L calculation: for **open** positions only, per currency group (never blended, same rule as Steps 3/5), current value and unrealized P&L in currency and %. Positions whose price couldn't be fetched (and have no usable cache) show as unavailable, not silently wrong.
- A new `GET /positions/pnl` endpoint and dashboard section showing it **alongside**, not replacing, the existing cost-basis cards.

Out of scope:
- Historical price charts, real-time streaming (WebSocket) — the free tier's WebSocket isn't needed for a periodically-refreshed personal dashboard.
- Crypto price support (separate feed, e.g. CoinGecko, only if crypto positions are ever added).
- Realized P&L for closed positions — **the schema doesn't track a sale price** (`Position` has `averageBuyPrice` only, no exit price), so realized P&L literally cannot be computed with the current data model. This step is unrealized P&L for open positions only; closed positions are excluded entirely, same as Step 3's cost-basis summary.

---

## Resolved decisions

- **Caching: simple in-memory, `Map`-based, in `MarketPricesService` itself** (option (a) from the original draft) — a single-user, mostly-local app doesn't need a `PriceCache` Prisma table yet; revisit only if the deployment model changes to something where the process restarts frequently enough for an in-memory cache to matter.
- **TTL: 15 minutes.** A personal portfolio dashboard doesn't need fresher-than-that pricing, and it keeps daily usage far under the 800-request cap even with a couple dozen tickers.
- **No explicit rate limiter beyond the cache.** Requests only happen on a dashboard load for tickers not already cached-and-fresh; for a single-user app this can't realistically approach 8/minute. Documented here rather than built, to avoid over-engineering a token-bucket for traffic that doesn't exist.
- **New endpoint, not an extension of `GET /positions/summary`.** Keeps Step 3's existing, already-verified endpoint completely unchanged (no risk of regressing it), and follows the same "own Prisma queries, reuse pure functions, don't couple modules together" pattern `RebalanceModule` already established in Step 5. The dashboard page calls both endpoints and renders cost-basis (existing) and live P&L (new) as separate sections.
- **Fallback on fetch failure:** stale cache if any exists, else the position shows as price-unavailable (`currentPrice`/`currentValue`/`unrealizedPnl` all `null`) — never silently substitutes cost basis as if it were a current price.

---

## Response contract

```ts
interface PositionPnl {
  positionId: string;
  ticker: string;
  quantity: string;
  averageBuyPrice: string;
  currentPrice: string | null;
  currentValue: string | null;
  unrealizedPnl: string | null;
  unrealizedPnlPercent: string | null;
}

interface CurrencyPnlSummary {
  currency: string;
  totalCurrentValue: string; // sum over positions with a known price only
  totalUnrealizedPnl: string;
  positions: PositionPnl[];
}

interface PortfolioPnlResponse {
  currencies: CurrencyPnlSummary[];
}
```

---

## Proposed structure

- `api/src/market-prices/`
  - `market-prices.service.ts` — Twelve Data client + in-memory TTL cache, `getPrice(ticker)` / `getPrices(tickers[])`.
  - `portfolio-pnl.ts` — pure calculation, mirrors `positions-summary.ts`'s shape and style.
  - `portfolio-pnl.spec.ts` — this step's real testing investment.
  - `market-prices.controller.ts`, `market-prices.module.ts`.
- `web/src/features/dashboard/` (extend, don't duplicate) — a new hook/service function for the P&L endpoint, a new `CurrencyPnlCard`-style component rendered alongside the existing `CurrencySummaryCard`.

---

## Step-by-step tasks

### T1 - Pure P&L calculation helper — Done

Tasks:
- `portfolio-pnl.ts`: `calculatePortfolioPnl(positions: Position[], prices: Map<string, Prisma.Decimal | null>): PortfolioPnlResponse`.
- Only `OPEN` positions. Grouped by currency (reuse the same grouping approach as `positions-summary.ts`, don't diverge).
- A position with `prices.get(ticker) == null` (or missing from the map) produces `currentPrice`/`currentValue`/`unrealizedPnl`/`unrealizedPnlPercent` all `null` — excluded from the currency's totals, not treated as zero.
- `Decimal` arithmetic throughout.

Acceptance:
- Pure function compiles, no Prisma/Nest/HTTP dependency, ready for T2.

**Verification completed:**
- `calculatePortfolioPnl` takes only `Position[]` and a `Map<string, Prisma.Decimal | null>` — no Prisma service, no HTTP, no Nest dependency, genuinely pure.
- `npm run build` passes. Manual sanity check confirmed: a gain (`AAPL`, +50%), a loss (`TSLA`, -33.33%), an unpriced position (`MSFT`, all fields `null`, correctly excluded from `totalCurrentValue`/`totalUnrealizedPnl`), and a closed position (`GOOG`, excluded entirely — not even present in the response).

---

### T2 - Tests for the P&L calculation

Tasks:
- The real testing investment for this step, per the roadmap's philosophy: gain (current > average buy), loss (current < average buy), break-even, price unavailable (excluded from totals, not zeroed), multiple currencies (never blended), closed positions excluded entirely, zero open positions.

Acceptance:
- `cd api && npm test` passes with the new suite covering every edge case above.

---

### T3 - `MarketPricesService` (Twelve Data client + cache)

Tasks:
- `getPrice(ticker)`: check the in-memory cache (15-minute TTL); on a miss or expiry, call Twelve Data's `/price` endpoint; on fetch failure, fall back to a stale cache entry if one exists, else return `null`.
- `getPrices(tickers[])`: dedupes tickers, calls `getPrice` for each (no batch endpoint used, per the resolved decision).
- The actual HTTP call is mocked in any unit test, not exercised for real — per the plan's original testing note. **Live verification against the real API is blocked on the user's `TWELVE_DATA_API_KEY`.**

Acceptance:
- Compiles and boots without a key present (the service simply returns `null` prices / logs a clear error if the env var is missing, rather than crashing the app). Live-price correctness verified once the key exists (T7).

---

### T4 - Backend endpoint

Tasks:
- `GET /positions/pnl`, auth-protected, user-scoped, in a new `MarketPricesModule` — imports only `AuthModule`, fetches the user's open positions directly via `PrismaService`, gets prices via `MarketPricesService`, calls `calculatePortfolioPnl`.
- `GET /positions/summary` (Step 3) stays completely untouched.

Acceptance:
- Authenticated request returns a correct, user-scoped P&L response; a position whose ticker fails to price shows as unavailable, not a broken response; verified against real data once the API key exists.

---

### T5 - Frontend service + hook

Tasks:
- Add `getPortfolioPnl()` to the dashboard feature's service (or a small `market-prices.service.ts` alongside it) + `usePortfolioPnlQuery()`.
- Same `staleTime`/cache-key reasoning as the rest of the dashboard — this is a dashboard-only concern, no other feature depends on it.

Acceptance:
- Hook compiles; full exercise once T6's UI exists.

---

### T6 - Dashboard P&L section

Tasks:
- Extend `/dashboard` with a P&L section per currency, rendered **alongside** the existing cost-basis `CurrencySummaryCard`s, not replacing them: current value, unrealized P&L (currency + %), and a clear "price unavailable" indicator per position where applicable.
- Loading/error states independent of the existing cost-basis section (a P&L fetch failure shouldn't blank out the already-working cost-basis view).

Acceptance:
- Dashboard shows both cost-basis and live P&L sections correctly; a P&L failure degrades gracefully without breaking the rest of the page.

---

### T7 - Verification

Tasks:
- `npm run build`/`lint`/`test` in both packages.
- Full live-browser walkthrough **with a real Twelve Data API key**: positions with a genuine current gain, a genuine loss, and (if practical to simulate) a ticker Twelve Data can't price, confirming the dashboard reflects all three correctly, then clean up test data.

Acceptance:
- Definition of done below is met.

---

## Testing note

Per the roadmap's philosophy: T2's P&L calculation is the real investment here — pure, real financial-domain logic with genuine edge cases. `MarketPricesService`'s HTTP call is mocked in tests, never exercised for real in the suite; its actual correctness is confirmed live in T7, with a real key, in the browser — the same discipline that's caught real bugs in every step so far.

---

## Definition of done

- P&L calculation unit-tested for every edge case in T2.
- `GET /positions/pnl` returns correct, user-scoped, currency-grouped unrealized P&L, live-verified with a real API key.
- `/dashboard` shows current value and unrealized P&L alongside the existing cost-basis view, with graceful degradation on price-fetch failure.
- Build/lint/tests pass in both packages.
