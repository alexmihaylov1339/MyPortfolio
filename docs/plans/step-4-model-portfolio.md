# MyPortfolio: Step 4 Plan - Model Portfolio

**Status:** Ready  
**Date:** 2026-07-22  
**Roadmap ref:** `docs/plans/portfolio-roadmap.md` → Step 4

---

## Branch proposal

- `feat/step4-model-portfolio`

---

## Objective

Let the user define a target allocation — independent of their real positions until Step 5 compares them.

---

## Resolved decisions

- **Multiple model portfolios per user, one marked default.** Matches the schema already sketched (`isDefault`). Step 5 needs a model to compare against, and `isDefault` is exactly that signal. A user's very first model is always forced default (no UX dead-end of zero defaults); creating/updating a model with `isDefault: true` unsets the previous default in the same transaction.
- **Inline allocation rows, one form.** A model portfolio is treated as an aggregate: `ModelPortfolio` + all of its `ModelAllocation` rows are created and edited together in one request/one form, not through separate per-row endpoints or pages. This needs a repeating-row-group UI capability `FormBuilder` doesn't have today — resolved at T6, mirroring how Step 2's T5 added `DateField` when a real gap showed up.

---

## Scope

In scope:
- `ModelPortfolio` + `ModelAllocation` Prisma models, user-scoped, `ModelAllocation` always created/updated/deleted as part of its parent.
- Backend CRUD: create/list/get/update/delete a model portfolio, allocations replaced wholesale on update (not merged).
- `/models`, `/models/new`, `/models/[id]/edit` pages: create/edit a model with inline ticker/percent rows, validating the rows sum to exactly 100% before save.

Out of scope:
- Comparing a model against real positions (Step 5).
- A dedicated "set as default" one-click action distinct from editing `isDefault` on the model form (can be added later if the UX turns out to need it).

---

## Schema

```prisma
model ModelPortfolio {
  id          String   @id @default(cuid())
  userId      String
  name        String
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  allocations ModelAllocation[]

  @@index([userId])
}

model ModelAllocation {
  id               String  @id @default(cuid())
  modelPortfolioId String
  ticker           String
  targetPercent    Decimal

  modelPortfolio   ModelPortfolio @relation(fields: [modelPortfolioId], references: [id], onDelete: Cascade)

  @@index([modelPortfolioId])
  @@unique([modelPortfolioId, ticker])
}
```

- `targetPercent` is `Decimal` (rule 44a) — percentages are financial data too.
- `@@unique([modelPortfolioId, ticker])` — a ticker can't appear twice in the same model; validated with a clear error before it ever hits this constraint.
- Add `models ModelPortfolio[]` to `User`.

---

## Response contract

```ts
interface ModelAllocationResponse {
  id: string;
  ticker: string;
  targetPercent: string; // Decimal-as-string, matches Position's contract
}

interface ModelPortfolioResponse {
  id: string;
  name: string;
  isDefault: boolean;
  allocations: ModelAllocationResponse[];
  createdAt: string;
  updatedAt: string;
}
```

- `POST /models` / `PATCH /models/:id` both accept `{ name, isDefault?, allocations: [{ ticker, targetPercent }] }` — on update, `allocations` (if present) wholesale-replaces the existing rows in a transaction; omitting it leaves rows untouched (partial-update semantics, matching `Position`'s `PATCH`).
- Validation: `name` required; at least one allocation row; each row's `ticker` required/normalized-uppercase, `targetPercent` a positive decimal string; no duplicate tickers within one request; **all rows' `targetPercent` must sum to exactly `100`** (no tolerance — these are user-typed target numbers, not calculated ones, so silently rounding would hide the user's own input mistake, e.g. `33.33 + 33.33 + 33.33 = 99.99`, not `100`).
- `isDefault` exclusivity (at most one default per user) is a service-layer invariant, not expressible as a Prisma unique constraint without a Postgres partial index — enforced in a transaction, not left to chance.

---

## Proposed structure

- `api/src/models/`
  - `models.controller.ts`, `models.service.ts`, `models.module.ts`
  - `models-errors.ts`, `models-validation.ts`, `models-validation.spec.ts`
  - `models.helpers.ts` (response mapping, mirrors `positions.helpers.ts`)
  - `dto/{create-model.dto.ts, update-model.dto.ts}`
- `web/src/features/models/`
  - `constants/`, `services/`
  - `list/{hooks,components}/`
  - `form/{hooks,components}/`
- `web/src/app/models/page.tsx`, `models/new/page.tsx`, `models/[id]/edit/page.tsx`

---

## Step-by-step tasks

### T1 - Prisma `ModelPortfolio` + `ModelAllocation` models + migration

Tasks:
- Add both models and the `User.models` relation per the schema above.
- Generate and apply the migration (same offline-diff + port-6543 workaround as prior steps — port 5432 stays blocked on this network).

Acceptance:
- `prisma validate` passes; migration applied to Supabase; `npx prisma generate` succeeds; both relations compile.

---

### T2 - Backend models module scaffolding

Tasks:
- `ModelsModule`, registered in `app.module.ts`, imports `AuthModule` for the guard (mirrors `PositionsModule`).
- One guarded route to prove wiring, extended into the full contract in T3 (mirrors positions' T2/T3 split).

Acceptance:
- App builds and boots with the module wired; unauthenticated requests to `/models` return `401`.

---

### T3 - Backend CRUD contract

Tasks:
- Routes: `POST /models`, `GET /models`, `GET /models/:id`, `PATCH /models/:id`, `DELETE /models/:id`.
- DTOs + `models-validation.ts`: required fields, at least one allocation row, no duplicate tickers, positive-decimal `targetPercent`, rows sum to exactly `100`.
- Service: ownership-scoped (404 not 403, matching `positions.service.ts`'s `getOwnedPositionOrThrow` pattern); `isDefault` exclusivity enforced via `prisma.$transaction` (unset any other default for this user before/while setting the new one); a user's first model is forced `isDefault: true` regardless of the request body; allocations wholesale-replaced (delete + recreate) in the same transaction on update.
- Response mapping in `models.helpers.ts`: `targetPercent` and `Position`-style dates stringified explicitly, same pattern as `toPositionResponse`.

Acceptance:
- Full CRUD works via authenticated requests; a user cannot read/edit/delete another user's model; creating a second model with `isDefault: true` correctly unsets the first; deleting the default model leaves the user with no default (no automatic re-assignment — that's a UX nicety, not a correctness requirement, and out of scope here).

---

### T4 - Tests for validation and the default-exclusivity invariant

Tasks:
- `models-validation.spec.ts`: percentages-sum-to-100 (exact, including the `33.33×3` non-100 case), duplicate-ticker rejection, empty-allocations rejection, positive-decimal validation — mirrors `positions-validation.spec.ts`'s structure and depth.
- A focused test (service-level, not full e2e) for the `isDefault` exclusivity invariant: creating a second default model unsets the first. This is real, easy-to-silently-break domain logic (Step 5 depends on exactly one default existing), not CRUD plumbing — worth testing per the roadmap's philosophy even though it's not money math.

Acceptance:
- `cd api && npm test` passes with the new suite covering every case above.

---

### T5 - Frontend models service + hooks

Tasks:
- `models.service.ts` via `ManageService` + `getAuthHeaders()`, mirroring `positions.service.ts`.
- Hooks split `list/` (query + delete) vs `form/` (create + update), mirroring positions' T4/T6 split. Include a single-model fetch hook now (unlike positions, where it was deferred to T6/edit) since this step's edit form needs it from day one and there's no reason to re-defer a pattern already proven.

Acceptance:
- Hooks compile; full exercise happens once T7's pages land.

---

### T6 - Model form with inline allocation rows

Tasks:
- **Resolve the repeating-row-group gap before building**, don't guess: either (a) extend `FormBuilder` with a new repeatable-group field type, or (b) build a bespoke `AllocationRowsEditor` component that sits next to `FormBuilder` (`FormBuilder` handles `name`/`isDefault`, the editor handles the ticker/percent rows, both submitted together via a shared wrapping form/state) — decide at task time based on how much of `FormBuilder`'s internals (uncontrolled `defaultValue` extraction via `FormData`) would need to change for (a) to work cleanly.
- Live running total of entered percentages so the user sees "sums to 100%" feedback before submitting, not just after a rejected request.
- One form reused for create and edit via `initialValues`, matching `PositionForm`'s pattern.

Acceptance:
- Create and edit both route through the same form; adding/removing a row updates the running total live.

---

### T7 - Models list + page

Tasks:
- `/models` page (`ProtectedRoute`): list of the user's models (name, default badge, ticker count), "Add model" action, edit/delete per row.
- `/models/new`, `/models/[id]/edit` as dedicated routes, matching the positions pages' pattern.
- Delete with confirmation (same `window.confirm` approach as positions — no `Grid`/`ConfirmationModal` yet, same reasoning as Step 2's T6 decision).

Acceptance:
- A logged-in user can view, add, edit, and delete model portfolios end-to-end in the browser.

---

### T8 - Verification

Tasks:
- `npm run build`/`lint`/`test` in both packages.
- Full live-browser walkthrough (the discipline that found real bugs in both Step 2's and Step 3's equivalent tasks): create a model with 3+ allocation rows summing to 100%, confirm the default-exclusivity behavior by creating a second default model, edit an existing model's rows, delete a model, then clean up test data.

Acceptance:
- Definition of done below is met.

---

## Testing note

Per the roadmap's lean philosophy: test the percentage-sum/duplicate-ticker validation and the default-exclusivity invariant (T4) — both are real domain rules with genuine branching. Skip tests for CRUD services, controllers, component rendering, and the list/form pages themselves.

---

## Definition of done

- `ModelPortfolio`/`ModelAllocation` live in Supabase; migration recorded.
- Full CRUD API, user-scoped, auth-protected, with working default-exclusivity.
- `/models` pages work end-to-end in the browser, verified live (not just via curl).
- Build/lint/tests pass in both packages.
