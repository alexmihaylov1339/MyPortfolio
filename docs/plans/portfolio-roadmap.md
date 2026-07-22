# MyPortfolio: Product Roadmap

**Status:** Living document — steps are refined in detail as their turn comes up.  
**Date:** 2026-07-21

---

## Product intent

### Terminology

- **`Position`** is the model name for an open (or previously open) investment: "I bought 10 shares of AAPL, so I have a *position* in AAPL." Not `Holding`, not `Trade` — a `Trade` would be an individual buy/sell action, which this app does not track; positions are entered manually with their already-known average price.

### Money and quantities

- Every monetary and quantity field (`averageBuyPrice`, `quantity`, target percentages, etc.) uses Prisma `Decimal`, never `Float` — floating point silently corrupts financial math. See `docs/architecture/backend-patterns.md` → Prisma And Data Access.

### Pages

The app is not one all-in-one editing screen. Four surfaces, each with one job:

- **`/dashboard`** — read-only portfolio summary: total value, total P&L, allocation, (later) model comparison. Links out to the editing pages; must never become an editing surface itself.
- **`/positions`** — manage what the user actually owns: add/edit/delete positions, filter open/closed.
- **`/models`** — manage target/model portfolios (e.g. AAPL 20%, MSFT 20%, VOO 40%, Cash 20%).
- **`/rebalance`** (future) — compare real vs. model allocation: overweight/underweight, suggested buy/sell.

### Testing philosophy

As a solo developer paying per token, tests are written only when they're cheap and would catch a real mistake — not for coverage numbers:

- **Always test:** pure financial/domain calculations (P&L, average cost, allocation %, portfolio totals, rebalance diffs) and bug-fix regressions.
- **Skip by default:** component render tests, page tests, TanStack Query hook wrappers, CRUD-only wiring — they mirror the framework and break on every refactor instead of catching real bugs.

Full rules: `docs/architecture/backend-patterns.md` → Testing, `docs/architecture/frontend-patterns.md` → Testing.

---

## Step-by-step roadmap

| Step | Name | Status | Branch | Plan |
|---|---|---|---|---|
| 1 | Project Foundations & Auth | Done | built directly on `main` | `step-1-project-foundations.md` |
| 2 | Positions Core | Done | `feat/step2-positions-core` | `step-2-positions-core.md` |
| 3 | Portfolio Dashboard | Done | `feat/step3-portfolio-dashboard` | `step-3-portfolio-dashboard.md` |
| 4 | Model Portfolio | Done | `feat/step4-model-portfolio` | `step-4-model-portfolio.md` |
| 5 | Rebalance Comparison | Proposed (future) | `feat/step5-rebalance-comparison` | `step-5-rebalance-comparison.md` |
| 6 | Market Prices & Real P&L | Proposed (future) | `feat/step6-market-prices` | `step-6-market-prices.md` |

Branch convention: `feat/step<N>-<slug>` (no hyphen between `step` and the number). Step 1 was foundational scaffolding built directly on `main`; from Step 2 onward, each step gets its own branch.

### Step 2: Positions Core

**Objective:** Let the user record and manage what they actually own.

**Deliverables:** `Position` Prisma model (user-scoped, `Decimal` money fields) + migration; user-scoped CRUD API; `/positions` page with form and list.

**Why now:** everything downstream (dashboard, models, rebalance) is computed from positions — nothing else can start without this.

**Exit criteria:** a logged-in user can add, edit, close, and delete a position, and only ever sees their own.

### Step 3: Portfolio Dashboard

**Objective:** Turn stored positions into a portfolio summary.

**Deliverables:** pure calculation helpers (total invested, allocation by ticker/broker, open vs. closed counts) and a `/dashboard` page rendering them, linking to `/positions`.

**Why now:** the dashboard is the app's front door; it should work as soon as positions exist, before market-price P&L is available.

**Deferred:** live market prices and real P&L — needs an external price feed, tracked as a later step once Steps 2–5 are stable.

### Step 4: Model Portfolio

**Objective:** Let the user define a target allocation.

**Deliverables:** `ModelPortfolio` + `ModelAllocation` Prisma models; `/models` page to create/edit a model and its ticker/percent rows.

**Why now:** rebalance (Step 5) needs a target to compare against.

### Step 5: Rebalance Comparison (future)

**Objective:** Compare real vs. target allocation.

**Deliverables:** pure diff calculation (actual % vs target % vs difference, overweight/underweight) and a `/rebalance` surface showing it, later with suggested buy/sell amounts.

**Why later:** depends on both Step 2 (real data) and Step 4 (target data) being stable first.

### Step 6: Market Prices & Real P&L (future)

**Objective:** replace cost-basis-only totals with real current value and unrealized P&L.

**Deliverables:** one free-tier price API (working choice: Twelve Data) integrated behind a single swappable service, with caching and rate-limit-safe fallback; dashboard extended with current value and unrealized P&L.

**Why later:** the dashboard (Step 3) already works from cost basis alone; this is a refinement layered on top once positions and the dashboard calculations are stable.

---

## Why keep this roadmap in the repo

- **Single source of truth** for page structure, terminology, and money-handling rules, so future steps — and future AI sessions — don't re-litigate decisions already made.
- **Continuity for a team of one**: this document plus the architecture pattern docs let a fresh session (or you, months later) pick up exactly where things left off.
