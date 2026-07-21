# Frontend Patterns

## Mandatory Rules

1. Pages/components must not call API functions or services directly.
2. API calls must be executed through dedicated feature hooks (e.g. `web/src/features/*/hooks/*`).
3. Services must use `ManageService` for all HTTP request execution.
4. Use `useQuery` / `useMutation` from TanStack Query inside feature hooks for data fetching and mutations.
5. Use `FormBuilder` every time a form is needed in the project.
6. Prefer small components instead of large page files. Reuse is beneficial, but readability and separation of responsibilities come first even for feature-local single-use components.
6a. Prefer feature-based folder architecture for all frontend work. Organise by owning feature/page flow first, not by broad technical type.
7. Extract a custom hook when page/component logic includes orchestration concerns such as query handling, derived state, submit flows, event coordination, modal state, or other non-trivial UI logic.
8. Follow SOLID, but do not force abstractions where a simpler solution is clearer. Prefer practical SOLID over theoretical purity.
9. Prefer clarity over aggressive DRY. Duplicate small, stable code when abstraction would make the flow harder to understand.
10. Reuse already existing project building blocks before creating new ones: components, hooks, helpers, utils, and services.
11. Avoid repeated ad-hoc inline type/value checks. When checks appear in multiple places or affect readability, extract shared helper/type-guard functions.
12. Form `FieldConfig[]` definitions must be placed in dedicated feature hooks/constants files, not created inline in page/component bodies.
13. Do not hardcode API endpoints or app routes in components/hooks; use centralized constants/builders.
14. Prefer `interface` for object-shape contracts (props, payloads, DTO-like models). Use `type` for unions, intersections, mapped/conditional types, and utility aliases.
15. When editing any non-test frontend file during a planned task, check whether the touched file is over 150 lines or mixes concerns. If there is a clear, convenient split, refactor it into smaller feature-local files while preserving behavior.
16. Enabled buttons must use pointer cursor affordance. Disabled buttons must not use pointer cursor and must keep an explicit disabled affordance.
17. Always use `web/src/shared/components/FormBuilder/` for any form. Never build an ad-hoc form shell when `FormBuilder` fits the task.
17a. Colocate components, hooks, mappers, feature constants, small feature types, and tests with the feature they primarily serve.
17b. Favor high cohesion over broad shared folders. Move code to `shared/` only when it is a stable primitive or is truly reused across multiple features.
17c. Keep coupling low between features. Do not import another feature's deep internals when a small public API, shared helper, or explicit service boundary would be cleaner.

## Additional Rules

18. Keep business logic out of presentational components; components should focus on rendering and user interaction.
19. Derive values instead of storing duplicated state. Do not put in state anything that can be computed from props, query data, or other state.
20. Keep side effects isolated:

- use hooks for React side effects
- use services for API communication
- use helpers/utils for pure transformations

21. One file should have one primary responsibility. A page should not be treated as a single responsibility if it also contains detailed rendering sections, data mapping, validation, and orchestration together; split those concerns into dedicated files.
22. Avoid prop drilling when it makes components harder to maintain; extract composition patterns, feature hooks, or context only when it clearly improves clarity.
23. Feature hooks should expose a small, stable API to pages/components and hide service/query implementation details, normalization, and orchestration logic so pages stay thin.
24. Query hooks must return normalized UI-friendly data when useful, so pages/components stay simple.
25. Define explicit loading, error, empty, and success states for every async screen, and avoid long inline conditional JSX branches by extracting named state components or render helpers when the screen becomes complex.
26. Do not transform API response shapes repeatedly in components; centralize mapping in hooks, adapters, or mappers.
27. Do not embed magic numbers/strings in UI logic, validation rules, limits, or statuses. Define every threshold or label as a named constant. When the same value is shared across multiple files, define it once in the feature's constants file and import it — never copy the literal.
27a. Use intention-revealing variable names at every scope. Single-letter names are acceptable only for standard loop counters (`i`, `j`). Abbreviations and short aliases must be expanded to their full meaning (`positionRow` not `posRow`, `response` not `res`) unless the full name adds no information.
27b. Do not use non-null assertions (`!`) when TypeScript already infers a non-nullable type. Assertions suppress errors silently; prefer a runtime guard, optional chaining, or restructuring the code so the type is naturally non-optional.
27c. Format money/quantity/percentage values through one shared helper (e.g. `shared/utils/money.ts`), never ad-hoc `toFixed()` or scattered `Intl.NumberFormat` calls in components. A formatting bug fixed in one place must fix every screen showing that number.
28. Event handlers and local functions must use intention-revealing names (`handleSubmit`, `handlePositionDelete`, `mapPositionToRow`) instead of vague names (`onClickFn`, `processData`).
29. Do not create inline objects/functions in JSX when it hurts readability or causes unnecessary rerenders in shared/heavy components.
30. Memoization is not default. Use `useMemo` / `useCallback` only when there is a clear render-stability or expensive-computation reason.
31. Shared helpers must stay generic. If logic is feature-specific, keep it inside the feature instead of polluting global utils.
31a. When introducing a new frontend capability, prefer a small feature-local folder over extending unrelated generic folders.
32. Prefer feature-level types/models close to the feature. Move types to shared locations only when truly reused across multiple features.
33. Validation rules, default form values, and field configs should be centralized per feature, not scattered across components.
34. Avoid boolean explosion in component APIs. When a component starts needing many flags, consider composition or splitting the component.
35. Do not couple UI text, routes, permissions, and business rules directly inside components; extract them into appropriate feature constants/configuration.
36. New reusable abstractions require proof of reuse or a clear near-term use case. Do not over-abstract too early.
37. Keep calculation/mapping logic (allocation percentages, portfolio totals, money formatting) pure and framework-free, so it's cheap to test when it's worth testing.
38. Add a test only for pure calculation/mapping logic with real branching (e.g. allocation percentage edge cases, currency formatting) and for bug-fix regressions. Skip tests for component rendering, page composition, TanStack Query hook wrappers, and CRUD-only flows — they mirror the framework and churn on every refactor.
39. Leave code easier to change than you found it: improve naming, remove dead code, and reduce nesting when touching an area.

## Imports

40. Group imports in the following order (top → bottom):

- external libraries (react, next, third-party packages)
- shared/core modules (e.g. common components, hooks, utils)
- feature-specific modules (same feature folder)
- services (if separate layer)
- configs/constants
- styles (last)

41. Always keep imports sorted alphabetically within each group.

42. Separate each import group with a single empty line.

43. Avoid deep relative paths (`../../../`); use aliases when available (`@/`, `@shared/`).

44. Do not import from another feature's internal files directly; expose a public API (index file) if sharing is needed.

## Formatting

45. Follow Prettier formatting rules; do not manually format code beyond readability improvements.

46. Use empty lines to separate logical blocks (data setup, handlers, rendering), not every statement.

47. Avoid excessive vertical spacing; prioritize readable grouping over rigid spacing rules.

48. Keep component bodies visually structured:

- hooks
- derived values
- handlers
- return

49. Structure React components in this order:

- imports
- component definition
- hooks (queries, state)
- derived values (useMemo, computed data)
- handlers (callbacks)
- render (return)

## Decomposition Rules

50. Pages must be orchestration-first. They should compose feature hooks and smaller feature components, not contain large rendering sections or business logic.

51. Pages must not directly implement large sections such as forms, tables, filters, summary panels, dialogs, sidebars, or multi-step state blocks inline. Extract these into feature-level components.

52. Components do not need to be reused across the app to deserve extraction. Prefer feature-local components over large page/component files.

53. Extract a custom hook when a component starts handling a mix of query state, derived values, event handlers, modal state, submit flows, or other orchestration logic that reduces readability.

54. If a component renders more than 2 distinct visual sections, split those sections into smaller components unless keeping them together is clearly simpler.

55. If JSX contains nested conditional rendering for loading, error, empty, and success states, extract named state components or render helpers.

56. If a file mixes rendering, mapping, validation, and orchestration logic, split it immediately so each file has one primary responsibility.

57. Response mapping beyond trivial property access must live in feature hooks, adapters, or mappers, not in page components.

58. Single-use extraction is encouraged when it improves readability. Reuse is a bonus, not a requirement.

59. Prefer several small feature-local files over one large "smart" page/component.
60. Design folders the same way as files: one folder should have one clear feature or sub-feature responsibility.
61. If a feature starts needing multiple tightly related files, prefer a colocated feature folder over spreading those files across global component/hook/helper directories.

## Decision Order

When implementing a feature, apply decisions in this order:

1. SOLID and simplicity first.
2. Prefer feature ownership, colocation, high cohesion, and low coupling.
3. Use feature hooks + `ManageService` for data flow.
4. Use `FormBuilder` for forms.
5. Split into reusable components/hooks where it improves readability.
6. Prefer existing helpers/utils first; add new shared helpers when checks repeat.
7. Prefer route/endpoint constants instead of inline path strings.

## Review Checklist

Before submitting code, verify:

- new work follows feature ownership first and is not scattered across unrelated generic folders
- components/hooks/mappers/tests are colocated with their owning feature unless they are truly shared
- no unnecessary deep cross-feature imports were introduced
- data fetching is done only through feature hooks (using TanStack Query)
- forms use `FormBuilder`
- touched non-test files over 150 lines were checked for a clear, safe split
- page/component files stay focused and reasonably small
- page files are orchestration-focused and not overloaded with detailed section rendering
- large forms/tables/filters/dialogs were extracted into feature components
- loading/error/empty/success UI is not buried in long inline JSX branches
- single-use feature-local components/hooks were extracted where it improves readability
- mapping/validation/orchestration are not mixed together in page files
- loading/error/empty states are covered
- no duplicated response mapping is spread across the UI
- routes/endpoints/constants are centralized
- reused logic is extracted only when it truly improves maintainability
- naming is clear and intention-revealing
- tests were added for touched pure calculation/mapping logic or bug-fix regressions (not for component rendering or CRUD wiring)

## Anti-Patterns to Avoid

- Large page components that fetch data, map API responses, define field configs, manage modal state, handle submit flows, and render multiple sections in one file
- Keeping form, table, filter, dialog, and summary markup together in a single page component
- Delaying extraction until reuse is proven, even when the current file is already hard to scan

## Enforcement Intent

These patterns are the default for all new code and refactors unless a documented exception is approved in the related plan/task.
