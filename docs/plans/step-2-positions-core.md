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
