# MyPortfolio: Step 2 Plan - Positions Core

**Status:** Ready  
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

### T3 - Positions CRUD contract

Tasks:
- Routes: `POST /positions`, `GET /positions` (optional `status` filter), `GET /positions/:id`, `PATCH /positions/:id`, `DELETE /positions/:id`.
- DTOs + validation helpers in `positions/dto/`: required fields, enum membership, `closedAt` required only when `status = CLOSED`, decimal string parsing for `quantity`/`averageBuyPrice`.
- Service scopes every query by `userId` from `CurrentUser`; a position belonging to another user resolves as `404`, not `403` (don't confirm the row exists).
- Define the response contract explicitly: `Decimal` fields serialize to `string` in the API response (Prisma `Decimal` does not serialize cleanly through default JSON) — map this once in the service, not per-route.

Acceptance:
- Full CRUD works via authenticated requests.
- A user cannot read/edit/delete another user's position.

---

### T4 - Frontend positions service + hooks

Tasks:
- `positions.service.ts` using `ManageService`, mirroring the shape of `features/auth/services/auth.service.ts`.
- Feature hooks: `usePositionsQuery`, `useCreatePositionMutation`, `useUpdatePositionMutation`, `useDeletePositionMutation`.
- Constants for endpoints and broker/assetType/status option lists — no magic strings in components.

Acceptance:
- Hooks compile and are usable from a page; no component fetches directly.

---

### T5 - Position form

Tasks:
- Build via `FormBuilder` (mandatory per frontend patterns) — one form, reused for both create and edit via `initialValues`.
- Fields: broker (select), ticker (text), name (text, optional), assetType (select), quantity (number), averageBuyPrice (number), currency (text or select), status (select, default `OPEN`), openedAt (date), closedAt (date, shown/required only when status is `CLOSED`).

Acceptance:
- Create and edit both route through the same form component.

---

### T6 - Positions list + page

**Open decision — resolve before starting this task, don't invent a default:** Step 1 deliberately deferred porting Memora's shared `Grid` component "until tabular data is needed" — this is that moment. Two options: (a) port `Grid` now for the positions list, or (b) ship a minimal table for this step and port `Grid` later once more tabular surfaces exist (dashboard, models). Ask before building.

Tasks:
- `/positions` page (`ProtectedRoute`): renders the list, open/closed filter, "Add position" action.
- `/positions/new` and `/positions/[id]/edit` as dedicated routes (not modal/inline edit — matches the auth pages' pattern).
- Delete with a confirmation step.

Acceptance:
- A logged-in user can view, add, edit, close, and delete positions end-to-end in the browser.

---

### T7 - Tests (only where they earn their keep)

Tasks:
- Step 2 is CRUD + form plumbing, not calculation — per the roadmap's testing philosophy, default to **no new component/hook/service tests**.
- Exception: if a DTO/validation helper has real branching (e.g. the `closedAt`-required-when-`CLOSED` rule, decimal parsing), add one small focused unit test for that helper.

Acceptance:
- `npm --prefix api test` and `npm --prefix web test` still pass; no tests added purely for coverage.

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
