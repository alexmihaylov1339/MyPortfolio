# MyPortfolio: Step 2 Plan - Positions Core

**Status:** Complete — all T1-T7 done and verified (build/lint/test in both packages, plus a full live-browser walkthrough of create/edit/close/filter/sort)  
**Date:** 2026-07-21  
**Roadmap ref:** `docs/plans/portfolio-roadmap.md` → Step 2

---

## Branch proposal

- `feat/step2-positions-core`

---

## Objective

Let the user record and manage what they actually own: add, edit, close, and delete stock/ETF positions, each scoped to the authenticated user.

---

## Scope

In scope:
- `Position` Prisma model + enums (`Broker`, `PositionStatus`, `AssetType`) + migration.
- Backend `positions` module: user-scoped CRUD, auth-protected.
- Frontend positions service/hooks, `/positions` page, add/edit form, list.

Out of scope:
- Portfolio totals/allocation calculations (Step 3).
- Model portfolios (Step 4).
- Live market prices / real P&L (later step).
- Trade-level history (buys/sells over time) — a position stores the *current* average price the user already knows from their broker, not a computed one.

---

## Proposed structure

- `api/src/positions/`
  - `positions.controller.ts`
  - `positions.service.ts`
  - `positions.module.ts`
  - `positions.helpers.ts` (mapping/ownership helpers, if the service grows)
  - `dto/`
- `web/src/features/positions/`
  - `services/positions.service.ts`
  - `list/hooks/`, `list/components/`
  - `form/hooks/`, `form/components/` (shared by create + edit)
  - `constants/` (endpoints, broker/assetType/status option lists)
- `web/src/app/positions/page.tsx`, `web/src/app/positions/new/page.tsx`, `web/src/app/positions/[id]/edit/page.tsx`

---

## Step-by-step tasks

### T1 - Prisma `Position` model + migration — Done

Tasks:
- Add enums: `Broker` (`REVOLUT`, `IBKR`), `PositionStatus` (`OPEN`, `CLOSED`), `AssetType` (`STOCK`, `ETF`).
- Add `Position` model: `id`, `userId`, `broker`, `ticker`, `name?`, `assetType`, `quantity` (`Decimal`), `averageBuyPrice` (`Decimal`), `currency` (default `"USD"`), `status`, `openedAt`, `closedAt?`, `createdAt`, `updatedAt`. Relation to `User` with `onDelete: Cascade`. Indexes: `[userId]`, `[userId, status]`, `[userId, ticker]`.
- Add `positions Position[]` to `User`.
- Generate the migration. **Note:** this network drops Postgres port 5432 (see `step-1-project-foundations.md` network note) — reuse the offline `prisma migrate diff --from-schema-datamodel ... --to-schema-datamodel ...` + apply-over-6543 + manual `_prisma_migrations` bookkeeping workflow documented there.

Acceptance:
- `prisma validate` passes; migration applied to Supabase; `User` ↔ `Position` relation compiles; `npx prisma generate` succeeds.

**Verification completed:**
- `prisma validate` → schema valid.
- Migration `20260721000000_add_position` generated offline via `prisma migrate diff --from-schema-datamodel /tmp/schema-before.prisma --to-schema-datamodel prisma/schema.prisma --script` (the from/to-datamodel form needs no DB connection, unlike `--from-migrations` + `--shadow-database-url`, which hung against the pgbouncer pooler and had to be abandoned).
- Applied over port 6543 with a `pg` client and recorded in `_prisma_migrations` (checksum-matched), same workaround as the Step 1 init migration. `Position` table confirmed live in Supabase alongside `User` and `_prisma_migrations`.
- `npx prisma generate` succeeded; `p.position.findMany` and `p.user.findMany` both resolve on the generated client.
- `npm run build` and `npm test` (7/7) pass in `api/` with the new model in place.

---

### T2 - Backend positions module scaffolding — Done

Tasks:
- Create `PositionsModule`, register it in `app.module.ts`.
- Every route uses the existing `AuthGuard` + `CurrentUser` decorator from the auth module — no new auth mechanism.

Acceptance:
- App builds and boots with the module wired.
- Unauthenticated requests to any `/positions` route return `401`.

**Verification completed:**
- Added `api/src/positions/{positions.service.ts, positions.controller.ts, positions.module.ts}`. Service has one method so far, `findAllForUser(userId)`, scoped by `userId` via Prisma `where` — a real, useful seed rather than a throwaway stub, extended by T3 into the full CRUD contract rather than replaced.
- Controller applies `@UseGuards(AuthGuard)` at the class level (same pattern as `AuthController`'s protected routes) and reads the user via the existing `@CurrentUser()` decorator — no new auth mechanism introduced.
- `PositionsModule` imports `AuthModule` to resolve `AuthGuard`'s `JwtService` dependency (mirrors how `AuthGuard` is already provided/exported there); registered in `app.module.ts`.
- `npm run build` passes.
- Booted the built app: `RoutesResolver` logs `PositionsController {/v1/positions}` and `Mapped {/v1/positions, GET} route`. `GET /v1/positions` with no `Authorization` header returns `401 {"message":"Missing Bearer token", ...}`. Health endpoint still reports `db: connected`.

---

### T3 - Positions CRUD contract — Done

Tasks:
- Routes: `POST /positions`, `GET /positions` (optional `status` filter), `GET /positions/:id`, `PATCH /positions/:id`, `DELETE /positions/:id`.
- DTOs + validation helpers in `positions/dto/`: required fields, enum membership, `closedAt` required only when `status = CLOSED`, decimal string parsing for `quantity`/`averageBuyPrice`.
- Service scopes every query by `userId` from `CurrentUser`; a position belonging to another user resolves as `404`, not `403` (don't confirm the row exists).
- Define the response contract explicitly: `Decimal` fields serialize to `string` in the API response (Prisma `Decimal` does not serialize cleanly through default JSON) — map this once in the service, not per-route.

Acceptance:
- Full CRUD works via authenticated requests.
- A user cannot read/edit/delete another user's position.

**Verification completed:**
- Added `positions/dto/{create-position,update-position,list-positions}.dto.ts` (plain interfaces — shape only), `positions-errors.ts`, `positions-validation.ts` (mirrors `auth-validation.ts`'s pattern of exported validate functions throwing `BadRequestException`), and `positions.helpers.ts` (`toPositionResponse` — explicit `.toString()` on both `Decimal` fields and ISO strings on all `Date` fields, called once from the service, mirrors `auth.helpers.ts`'s `publicUser`).
- Service (`positions.service.ts`) implements `findAllForUser` (optional status filter), `findOneForUser`, `create`, `update`, `remove`, all routed through a private `getOwnedPositionOrThrow` that throws `NotFoundException` — not `ForbiddenException` — when a position doesn't exist *or* belongs to another user, so non-owners can't distinguish the two cases.
- Controller stays thin: parses params/query/body, calls the matching `validate*` function, delegates to the service, no Prisma access.
- Known simplification (documented here, not silently decided): the "`closedAt` required when `status = CLOSED`" rule is enforced per-request on `PATCH` — if the payload sets `status: CLOSED`, that same payload must include `closedAt`, even if the record already has one from a prior close. Re-closing a previously-closed-then-reopened position requires resending `closedAt`. Acceptable for T3's scope; revisit only if it causes real friction.
- `npm run build`, `npm run lint`, `npm test` (7/7) all pass.
- Full live smoke test against Supabase with two real users (created via `/auth/register`, deleted after): invalid broker → `400`; `CLOSED` without `closedAt` → `400`; valid create → `200` with `quantity`/`averageBuyPrice` as strings, `ticker` uppercased; list → array with the item; owner `GET /:id` → `200`; non-owner `GET /:id` → `404 "Position not found"`; non-owner `PATCH` → `404`; owner `PATCH` (quantity) → `200` updated; close without `closedAt` → `400`; close with `closedAt` → `200`, `status: CLOSED`; `?status=OPEN` → `[]`; `?status=CLOSED` → the item; non-owner `DELETE` → `404`; owner `DELETE` → `204`; subsequent `GET` → `404`.

---

### T4 - Frontend positions service + hooks — Done

Tasks:
- `positions.service.ts` using `ManageService`, mirroring the shape of `features/auth/services/auth.service.ts`.
- Feature hooks: `usePositionsQuery`, `useCreatePositionMutation`, `useUpdatePositionMutation`, `useDeletePositionMutation`.
- Constants for endpoints and broker/assetType/status option lists — no magic strings in components.

Acceptance:
- Hooks compile and are usable from a page; no component fetches directly.

**Verification completed:**
- Added `positions/constants/{endpoints,options}.ts`, `positions/services/positions.service.ts` (five functions: `listPositions`, `getPosition`, `createPosition`, `updatePosition`, `deletePosition`, all through `ManageService` + the existing `getAuthHeaders()` helper rather than manually threading a token like the auth service does — positions is always behind `ProtectedRoute`, so this is simpler and still consistent).
- Hooks placed per the plan's proposed structure — `list/hooks/` (`usePositionsQuery`, `useDeletePositionMutation`) and `form/hooks/` (`useCreatePositionMutation`, `useUpdatePositionMutation`) — each with an `index.ts` public API, matching how `features/auth/login/hooks/` etc. are colocated.
- All mutations invalidate the `['positions']` query key on success so the list stays fresh after create/update/delete.
- A single-position fetch hook (needed by T6's edit page to prefill `initialValues`) was deliberately **not** added here — it's out of T4's listed scope and belongs to T6 where it's actually consumed.
- `npx tsc --noEmit`, `npm run lint`, `npm test` (214/214), and `npm run build` all pass. No page yet imports these hooks (that's T6), so "usable from a page" is proven by clean isolated compilation now and will be fully exercised once T6 lands.

---

### T5 - Position form — Done

Tasks:
- Build via `FormBuilder` (mandatory per frontend patterns) — one form, reused for both create and edit via `initialValues`.
- Fields: broker (select), ticker (text), name (text, optional), assetType (select), quantity (number), averageBuyPrice (number), currency (text or select), status (select, default `OPEN`), openedAt (date), closedAt (date, shown/required only when status is `CLOSED`).

Acceptance:
- Create and edit both route through the same form component.

**Verification completed:**
- **Extended the shared `FormBuilder`, not worked around it:** the field-type union had no `date` option (`text`/`email`/`password`/`number`/`textarea`/`select`/`checkbox`/`radio`), so `openedAt`/`closedAt` had no way to render as real date inputs. Added `DateField` (mirrors `TextField`'s exact structure/styling, `type="date"` input) and wired it into `fields/index.ts`, `fields/types.ts`, `fields/Field.tsx`'s switch, and `FormBuilder/types.ts`'s `FieldType`/`FieldConfig` unions. This is a shared building block gap, not a positions-specific concern — any future date field in the app benefits.
- **Conditional `closedAt` visibility** without adding an `onChange`-per-field escape hatch to `FormBuilder` itself: `PositionForm` tracks `status` in local state and wraps `<FormBuilder>` in a `<div onChange={...}>` — the native `change` event from the internal `<select name="status">` bubbles up through React's synthetic event system to that ancestor regardless of component boundaries, so no `FormBuilder` API change was needed. `usePositionFormFields(status)` (in `form/hooks/`) returns the field list and only appends the `closedAt` field (marked `required`) when `status === 'CLOSED'`.
- `PositionForm` (`form/components/`) takes `mode: 'create' | 'edit'`, an optional `positionId`, and `initialValues`; calls the matching T4 mutation hook internally and navigates to `/positions` (added to `APP_ROUTES` — also needed by T6) on success.
- Added `CURRENCY_OPTIONS` (USD/EUR/GBP) to `positions/constants/options.ts` — currency is a select, not free text, to avoid inconsistent codes.
- **Scope decision, documented not silently assumed:** `PositionForm`'s `initialValues` prop expects already form-ready values (dates as `YYYY-MM-DD`, not the API's full ISO datetime strings) — mapping a fetched `Position` into that shape is left to T6, which is the first task that actually fetches one. This mirrors T4's decision to defer the single-position query hook to T6.
- `npx tsc --noEmit`, `npm run lint`, `npm test` (214/214), `npm run build` all pass. No page renders `PositionForm` yet (T6), so full interactive/browser verification (including the conditional `closedAt` behavior) happens once T6 wires up `/positions/new` and `/positions/[id]/edit`.

---

### T6 - Positions list + page — Done

**Open decision — resolved by user before starting:** chose (b) — a minimal positions-specific table now (not Memora's `Grid`), to avoid pulling in `Grid` + its `ConfirmationModal`/`Modal` dependencies (~600 lines, not yet in this repo) before a second tabular surface (Step 3 dashboard, Step 4 models) actually proves reuse. Revisit when that second surface is built.

Tasks:
- `/positions` page (`ProtectedRoute`): renders the list, open/closed filter, "Add position" action.
- `/positions/new` and `/positions/[id]/edit` as dedicated routes (not modal/inline edit — matches the auth pages' pattern).
- Delete with a confirmation step.

Acceptance:
- A logged-in user can view, add, edit, close, and delete positions end-to-end in the browser.

**Verification completed:**
- Added `list/components/{PositionsTable,PositionsFilter}.tsx` (client-side sort by clicking a column header, open/closed filter buttons), `list/hooks/useDeletePositionWithConfirmation.ts` (`window.confirm` + delete mutation — no styled modal, since that's exactly the Grid/ConfirmationModal complexity the open decision chose to defer), `form/hooks/usePositionQuery.ts` and `form/positionFormValues.ts` (the single-position fetch + Position→form-values mapper deferred from T4/T5, now needed by the edit page), and the three pages: `web/src/app/positions/page.tsx`, `.../positions/new/page.tsx`, `.../positions/[id]/edit/page.tsx`.
- `npx tsc --noEmit`, `npm run lint`, `npm test` (214/214), `npm run build` all pass (all three new routes registered, `/positions/[id]/edit` correctly built as dynamic).
- **Full real-browser verification** (Chrome, both dev servers live against Supabase) — this caught two genuine bugs that no amount of type-checking or curl testing would have surfaced:
  1. **`FormBuilder.tsx` (shared component):** `startTransition(async () => { await onSubmit(values); ... })` never handled a rejected `onSubmit`. Every existing consumer (`LoginForm`, `RegisterForm`, `UpdateAccountForm`) uses `mutation.mutate()` with `onSuccess`, so this was latent until `PositionForm` became the first consumer to `await mutation.mutateAsync(...)` inside `onSubmit`. A rejection left `isPending` stuck forever — the submit button showed "Loading..." permanently with no error, and no path back to a usable form. Fixed by wrapping the awaited call in try/catch inside `FormBuilder`'s transition, so `isPending` always resolves and `form.reset()` is correctly skipped on failure (previously, a first attempt at fixing this only in `PositionForm` masked the rejection from `FormBuilder`, which caused `form.reset()` to wipe the user's input on a *failed* submission — reverted once the real fix location was found).
  2. **`PositionForm.tsx`:** `FormBuilder`'s `NumberField` extraction converts values to a JS `number` at runtime (`quantity`, `averageBuyPrice`), but the API's Decimal fields require strings (per T3's response-contract decision) — sending a JSON number instead of a string tripped the backend's `isPositiveDecimalString` check, correctly rejecting the request with `400 Quantity must be a positive number`. Fixed by coercing both fields to `String(...)` in `mapFormValuesToPositionInput`.
- With both fixes, walked the full flow live in the browser: create a position (`REVOLUT`/`AAPL`/qty `10.5`/price `150.25`) → list shows it correctly formatted (`150.25 USD`, `OPEN`) → Edit → form correctly prefilled from the fetched position (date fields truncated to `YYYY-MM-DD` via `toPositionFormValues`) → changed status to `CLOSED` → `closedAt` field appeared, required, correctly left blank rather than defaulting to "today" (the position may have actually closed earlier) → filled and saved → list shows `CLOSED` → `Open` filter shows only the still-open position → `Closed` filter shows only this one → column-header sort verified on `Quantity`. Delete's confirmation dialog was not clicked through the UI (a real `window.confirm()` blocks the browser-automation session per tooling guidance), but the mutation wiring is the same pattern already verified end-to-end via T3's authenticated CRUD curl tests.
- Test positions and their DB rows were deleted after verification; ad-hoc dev servers started for this test were stopped afterward.
- Encountered and worked around, in the browser-automation environment itself (not product bugs): a stray dev-server process from earlier in this session had been silently serving stale/conflicting state on the same ports, and the TanStack Query Devtools panel occluded/intercepted clicks on part of the form when left open. Both were resolved by killing stray processes and closing the panel before the final clean verification pass above.

---

### T7 - Tests (only where they earn their keep) — Done

Tasks:
- Step 2 is CRUD + form plumbing, not calculation — per the roadmap's testing philosophy, default to **no new component/hook/service tests**.
- Exception: if a DTO/validation helper has real branching (e.g. the `closedAt`-required-when-`CLOSED` rule, decimal parsing), add one small focused unit test for that helper.

Acceptance:
- `npm --prefix api test` and `npm --prefix web test` still pass; no tests added purely for coverage.

**Verification completed:**
- **Backend — `api/src/positions/positions-validation.spec.ts` (new, 17 tests):** exercises exactly the branching the plan called out — `closedAt`-required-when-`CLOSED` on both create and update, positive-decimal-string parsing (`0`, `-5`, `abc`, `''` all rejected), broker/status enum validation, and the list-query status filter. No tests added for the service (Prisma CRUD), controller (route wiring), or `positions.helpers.ts` (pure serialization, not calculation) — plumbing, per policy.
- **Frontend — two regression tests for the two real bugs T6's browser verification found and fixed, per the testing philosophy's "always add a regression test when fixing a real bug" rule:**
  - `FormBuilder.test.tsx`: added a case asserting a rejected `onSubmit` leaves the submit button enabled (not stuck on "Loading...") and does not clear the form — pins down the exact `startTransition`/rejection bug found live in Chrome.
  - `mapFormValuesToPositionInput.test.ts` (new file — extracted the function out of `PositionForm.tsx` into its own module specifically so it's testable without rendering the component, per the "extract calculation into a pure helper" pattern): asserts `quantity`/`averageBuyPrice` are coerced to strings even when handed a JS `number` (the exact shape `FormBuilder`'s `NumberField` produces), plus a small check that empty-string optional fields normalize to `undefined`.
- No tests added for `PositionsTable`/`PositionsFilter` rendering, the query/mutation hooks, or the three new pages — component rendering and CRUD wiring, per policy.
- `cd api && npm run build && npm test` → 4 suites, **24/24 tests** passing (up from 7; all 17 new).
- `cd web && npx tsc --noEmit && npm run lint && npm test && npm run build` → 16 suites, **217/217 tests** passing (up from 214; 3 new), lint clean, build clean.

---

## Risks and mitigations

Risk: building `Grid` now expands scope unpredictably.  
Mitigation: T6's decision is made explicitly before work starts, and stays a single focused sub-task either way.

Risk: `Decimal` serialization mismatches between Prisma, the JSON API, and form inputs.  
Mitigation: contract decided once in T3 (stringify at the response boundary) and reused, not re-decided per route.

---

## Definition of done

- `Position` model live in Supabase; migration recorded in `_prisma_migrations`.
- Full CRUD API, user-scoped, auth-protected.
- `/positions` page with add/edit/delete/filter working in the browser.
- Build/lint/tests pass in both `api/` and `web/`.

---

## Suggested commit sequence

1. `feat(api): add Position model and migration`
2. `feat(api): add positions module with user-scoped CRUD`
3. `feat(web): add positions service and query hooks`
4. `feat(web): add position form with FormBuilder`
5. `feat(web): add positions page with list and filters`
6. `test(api): add unit tests for position validation helpers` (only if T7 finds something worth testing)
7. `docs(plans): close step-2 positions core`
