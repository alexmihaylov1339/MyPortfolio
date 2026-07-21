# MyPortfolio: Step 6 Plan - Market Prices & Real P&L

**Status:** Proposed (future)  
**Date:** 2026-07-21  
**Roadmap ref:** `docs/plans/portfolio-roadmap.md` → Step 6

---

## Branch proposal

- `feat/step6-market-prices`

---

## Objective

Fetch and cache current market prices for open positions, so the dashboard (Step 3) can show real unrealized P&L and current value instead of cost-basis-only totals.

---

## Scope

In scope:
- Pick and integrate one free-tier price API behind a single backend service (swappable later).
- Cache prices — avoid a live API call on every dashboard load and avoid hitting rate limits.
- Extend dashboard calculations: current value and unrealized P&L (in currency and %), per-position and portfolio-level.

Out of scope:
- Historical price charts.
- Crypto price support — a separate feed (e.g. CoinGecko), only if/when crypto positions are added per the original `AssetType` note.
- Real-time streaming — periodic refresh is enough for a personal tracker.

---

## Working choice: price provider

**Twelve Data** — free tier: 800 requests/day, 8 requests/minute. More usable for a portfolio app checking several tickers than Alpha Vantage's free tier (now down to 25 requests/day), and a simpler response shape than Finnhub for basic quote lookups.

Isolate the provider behind one backend service/interface so switching later — if free-tier limits become a real problem — doesn't touch any caller.

---

## Proposed structure

- `api/src/market-prices/`
  - `market-prices.service.ts` — calls the provider, maps its response to an internal shape.
  - a caching layer (see below).
  - `market-prices.module.ts`
- Extend the Step 3 positions/dashboard summary calculation to accept current prices and compute unrealized P&L.

---

## Caching approach (decide at task time)

Two options:
- **(a) Simple short-TTL cache inside the service** (in-memory) — good enough for a single-user, mostly-local app.
- **(b) A `PriceCache` Prisma table** (`ticker`, `price`, `currency`, `fetchedAt`) — needed only if the app moves to always-on hosting and requires a shared cache across restarts.

Start with (a); revisit (b) only if the deployment model changes.

---

## Rate-limit handling

- Never fetch on every dashboard render — fetch once per cache TTL window (e.g. 15 minutes) and reuse.
- Batch ticker lookups where the provider supports it, instead of one request per position.
- If the API call fails or the rate limit is hit, fall back to the last cached price (or cost basis if no cache exists yet) rather than breaking the dashboard.

---

## Dependencies

Needs Step 3 (portfolio dashboard, cost-basis calculations) landed first — this step extends those calculations with a live price input rather than replacing them.

---

## Testing note

The unrealized P&L calculation (current value − cost basis, per position and aggregated) is pure, real domain logic — test it thoroughly against a fixed/mocked price input. Do not test the actual HTTP call to the price provider; mock it at the service boundary.

---

## Open decisions to resolve when this step is picked up

- Confirm Twelve Data's free-tier limits haven't changed since this plan was written; re-evaluate Finnhub if they have.
- Cache TTL and mechanism (in-memory vs. `PriceCache` table).
- Closed positions don't need live prices — only open ones; confirm the summary calculation already excludes them (it should, per Step 3).
- API key storage: new env var in `api/.env.example` (e.g. `TWELVE_DATA_API_KEY`).

---

## Definition of done (draft)

- Dashboard shows current value and unrealized P&L using live prices, with a graceful fallback when the provider is unavailable.
- P&L calculation is unit-tested against a fixed price input.
- No dashboard load results in more than one price-provider call per cached ticker within the TTL window.
