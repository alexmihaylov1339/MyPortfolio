# Backend Patterns

## Mandatory Rules

1. Controllers must stay thin. They should parse request input, call validation helpers/DTOs, delegate to services, and map HTTP responses.
2. Business rules must live in services or pure helpers, not in controllers.
3. Prisma access must go through `PrismaService`; do not instantiate ad-hoc Prisma clients.
4. Prefer feature modules with clear ownership (`auth`, `positions`, `portfolios`) instead of cross-cutting "god services."
4a. Prefer feature-based folder architecture for all backend work. Group files by owning domain/feature first, not by broad technical type.
5. Validate request input at the module boundary. DTOs + validation helpers must reject invalid input before service logic runs.
6. Prefer explicit return shapes from services for non-trivial flows. Do not rely on loose inference for core business methods.
7. Reuse existing project building blocks before creating new ones: services, validators, helpers, type guards, DTOs, and constants.
8. Follow SOLID, but do not force abstractions where a simpler service/helper split is clearer. Prefer practical SOLID over theoretical purity.
9. Prefer clarity over aggressive DRY. Duplicate small, stable code when abstraction would make backend behavior harder to understand.
10. Avoid repeated ad-hoc inline checks. When checks repeat or affect readability, extract shared helpers/type guards.
11. Do not let one backend file accumulate unrelated responsibilities. If a file starts mixing orchestration, persistence, access control, mapping, queueing, or side effects, split it before it becomes hard to scan.
12. Keep services and helpers small enough that a new teammate can read the whole file without jumping across many unrelated concerns. As a rule of thumb, if a backend file starts feeling "too big," extract the next cohesive responsibility immediately instead of waiting for reuse pressure.
13. Prefer `interface` for object-shape contracts used across files. Use `type` for unions, intersections, mapped/conditional types, and small local aliases.
14. Every schema change must be accompanied by the matching Prisma migration.
15. Do not put scheduling, ownership, or persistence rules inside DTO files. DTO files define input shape and validation only.
16. Use intention-revealing names for service methods and helpers (`getPositionsByUserId`, `calculatePortfolioBalance`, `validatePositionInput`) instead of vague names.
17. When editing any non-test backend file during a planned task, check whether the touched file is over 150 lines or mixes concerns. If there is a clear, convenient split, refactor it into smaller service/helper/access/mapping files while preserving behavior.
17a. Colocate backend files that change together inside the owning feature/module: controller, service, DTOs, mappers, access helpers, constants, and tests should live near the feature they serve.
17b. Favor high cohesion over broad shared folders. Move backend logic into shared/common only when it is truly reused across multiple feature modules.
17c. Keep coupling low between backend features. Do not reach into another module's deep internals when a small exported helper, explicit service boundary, or shared contract would be cleaner.

17d. A module's `@Module({ exports: [...] })` array is its public API — the backend equivalent of a frontend feature's root `index.ts` barrel. Only export what other modules are meant to consume (e.g. a service), never providers that exist purely for the module's own internal use. Import the owning module (not a bare relative path to its service file) so consumption always goes through the declared `exports`, not an accidental deep reach.

## Additional Rules

18. One file should have one clear responsibility. If a file starts mixing HTTP concerns, persistence, validation, mapping, or response shaping, split it.
19. Keep pure transformations pure. If logic can be deterministic and side-effect free, move it into helpers and test it there.
20. Services should orchestrate persistence and domain rules; helpers should handle reusable pure calculations.
21. Prefer feature-local helpers first. Move logic into shared/common only when it is truly reused across multiple modules.
21a. When introducing a new backend capability, prefer a small feature-local subfolder over expanding unrelated generic folders.
22. Avoid leaking Prisma model shapes directly through controllers when a stable API shape matters. Serialize or map when needed.
23. Prefer explicit `null` / `false` / typed result contracts from services over throwing generic errors for expected not-found paths.
24. Use framework exceptions intentionally:
- `BadRequestException` for invalid input that passed transport but failed validation/business constraints
- `UnauthorizedException` / guards for auth failures
- `ForbiddenException` for ownership/permission failures
- `NotFoundException` when the requested resource does not exist
- `ConflictException` for uniqueness/state conflicts
25. Keep error messages clear and stable. Do not return raw Prisma/internal errors to API consumers.
26. When persistence logic becomes multi-step and must remain consistent, use Prisma transactions.
27. Prefer deterministic ordering in list/query endpoints. Always decide and document sort order.
28. Do not embed magic numbers/strings in business rules. Use named constants for thresholds, limits, and statuses. When the same value is needed in more than one file, define it once in the feature's `*-constants.ts` and import it everywhere.
29. When time is part of the business logic (e.g. trade date, dividend date), use UTC-safe calculations.
30. For domain rules with future configurability, isolate the source of truth behind one helper/config module instead of scattering constants.
31a. Use intention-revealing variable names at every scope. Single-letter names are acceptable only for standard loop counters (`i`, `j`). Abbreviations must be expanded (`positionRow` not `posRow`, `response` not `res`) unless the full name adds no information.
31b. Do not use non-null assertions (`!`) when TypeScript already infers a non-nullable type. Use a runtime guard or restructure the code so the type is naturally non-optional.
31. Prefer additive, focused migrations. Avoid mixing unrelated schema changes into one migration.
32. Leave touched backend code easier to change than you found it: improve naming, reduce nesting, remove dead branches, tighten types, and split oversized files.

## Controllers

33. Controllers should do, in order:
- receive params/query/body
- validate/normalize input
- call one service method
- translate service result into HTTP response

34. Controllers should not:
- contain Prisma queries
- compute financial calculations
- perform repeated serialization logic inline
- duplicate validation logic that already exists in DTO helpers

35. Route handlers must use clear HTTP semantics:
- `GET` for reads
- `POST` for creates/actions
- `PUT` for full updates
- `PATCH` for partial updates
- `DELETE` for deletes

36. Use explicit route/query DTOs for params and query strings instead of parsing raw values repeatedly in controllers.

## Services

37. Services are the main home for backend business behavior.
38. Service methods should have stable, intention-revealing names based on domain actions, not transport actions.
39. When a service returns API-facing data, keep the mapping consistent in one place.
40. For non-trivial response objects, create local return types or interfaces rather than returning loosely typed object literals.
41. Prefer small private helpers inside a service before extracting a new shared helper file.
42. If a service starts mixing unrelated responsibilities, split it by domain concern.
43. If a service is growing because it now owns access lookup, persistence side effects, and response shaping, extract those concerns into sibling helper modules.

## Prisma And Data Access

44. Keep Prisma queries explicit:
- select only the fields needed when possible
- include relations intentionally
- define ordering explicitly
- avoid hidden behavior through overly broad includes

44a. Use Prisma `Decimal` for monetary and quantity fields (position quantities, prices, allocation percentages) — never `Float`, which introduces rounding errors in financial math. Convert to `string` at the API response boundary; parse/format only through dedicated money helpers, not ad-hoc `Number()`/`toFixed()` calls.

45. Centralize serialization/mapping when Prisma relation shapes are not the same as API contract shapes.
46. Do not let controllers build Prisma `where/orderBy/include` objects inline.
47. Prefer schema constraints for invariant data rules where possible:
- unique keys
- indexes
- foreign keys
- relation cascades

48. When changing Prisma schema:
- update `schema.prisma`
- add/adjust the migration
- regenerate Prisma client
- run schema validation/tests

## Validation

49. Keep validation logic close to the feature:
- DTOs in feature `dto/`
- validation helpers in feature validation files
- shared helpers only for reusable low-level checks
50. Validation should be deterministic and testable.
51. Prefer rejecting invalid state before hitting the database when the rule is clear at input time.
52. When database confirmation is still required (e.g. position ownership), validate in the service as a second layer.

## Testing

As a solo-developer project, testing is opt-in by value, not a coverage target. Write a test only when it is cheap to write and would catch a real mistake.

53. Always write focused unit tests for pure financial/domain calculation helpers (P&L, average cost, allocation percentages, portfolio totals, rebalance diffs). These are the core value of the product — a wrong number here silently misreports the user's money.
54. Always add a regression test when fixing a real bug, pinning down the exact scenario that broke.
55. Do not write tests for CRUD service methods that only orchestrate Prisma calls, controller route wiring, DTO validation happy paths, or persistence plumbing with no branching logic. These mirror the framework, not the domain, and churn on every refactor.
56. When a service mixes pure calculation with persistence, extract the calculation into a pure helper so it can be tested without a database or mocks.
57. Keep test data small and intention-revealing. Avoid giant fixtures when a tiny explicit object is clearer.

## Imports

58. Group imports in the following order (top → bottom):

- external libraries
- Prisma/Nest shared framework modules
- shared/core modules
- feature-specific modules
- local types/constants/helpers

59. Keep imports sorted alphabetically within each group.
60. Separate import groups with a single empty line.
61. Avoid deep relative paths when a stable project alias or cleaner local path is available.

## Formatting

62. Follow Prettier formatting rules; do not manually fight the formatter.
63. Use empty lines to separate logical blocks: input validation, persistence lookup, domain decision, return mapping.
64. Keep service methods visually structured:
- validation/guard clauses
- prerequisite fetches
- business decision logic
- persistence writes
- response mapping

65. Keep files readable over compact. Break long conditions, object literals, and assertions when clarity improves.

## Decision Order

When implementing backend work, apply decisions in this order:

1. Correct domain behavior first.
2. Keep controllers thin and push logic into services/helpers.
3. Reuse existing validators/helpers/services before adding new ones.
4. Keep Prisma access explicit and schema-aligned.
5. Add a test only when the change touches financial/domain calculation logic or fixes a bug — see Testing.
6. Keep migrations in sync with schema changes.

## Review Checklist

Before submitting backend code, verify:
- new work follows feature ownership first and is not scattered across unrelated generic folders
- colocated backend files remain near the feature they serve unless there is true multi-feature reuse
- coupling between modules stayed low and no deep cross-feature reach-through was introduced
- controllers stay thin
- touched non-test files over 150 lines were checked for a clear, safe split
- service methods own the business logic
- request validation is explicit and tested where needed
- Prisma queries have intentional `select/include/orderBy`
- API responses are stable and clearly shaped
- no raw internal/database errors leak to clients
- migrations and schema are aligned
- tests were added for touched financial/domain calculations or bug-fix regressions (not for CRUD/plumbing)

## Enforcement Intent

These patterns are the default for all new backend code and refactors unless a documented exception is approved in the related plan/task.
