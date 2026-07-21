---
name: step-task-executor
description: Execute one roadmap step task end-to-end from a plan file (e.g., "Do Step 2 T3"), including implementation, plan status update, verification summary, and a high-quality commit message.
---

# Step Task Executor

Use this skill when the user asks to execute a roadmap task like:
- "do T3"
- "continue with next T"
- "do Step 2 T6"
- "finish this task and give me commit message"

For MyPortfolio, this skill is an implementation workflow, not broad brainstorming. It should turn the current roadmap into concrete, verified changes while preserving the repo's architecture rules and shared UI building blocks.

> Adapted from Memora's own `.claude/commands/step-task-executor.md`. Claude Code commands are per-repo, so this is a reworded copy for MyPortfolio's product and patterns, not a shared file — keep both in sync by hand if the *process* (not the product content) needs to change in both repos.

## Inputs to resolve first

Identify, from user message + open files:
- step file path (for example `docs/plans/step-2-positions-core.md`)
- task id (`T1`, `T2`, ...)
- whether the user asked only for docs/planning or for full code implementation

If task id is ambiguous:
- prefer the explicitly opened step plan file in the editor context
- otherwise use the most recent unfinished task in the step named "Current active step" in `docs/plans/README.md`

## Source of truth order

Before planning code changes, read in this order:
1. `docs/plans/portfolio-roadmap.md` — product intent, terminology, page structure, testing philosophy.
2. The active step plan file (see `docs/plans/README.md`).
3. `docs/architecture/backend-patterns.md` and `docs/architecture/frontend-patterns.md` — always read before editing.

Read completed step docs only when the current docs point back to them or implementation context is missing. When docs conflict, prefer the roadmap and the active step plan over older completed step notes.

## Execution contract

1. Read the task block in the step file:
- `Status`
- `Tasks`
- `Acceptance`
- any `Open decision` called out in that task — if present, stop and surface it to the user instead of guessing a default.

2. Implement fully:
- do real code/doc changes, not placeholder plans
- follow existing architecture/patterns in the repo
- keep scope limited to the selected task
- if the task has an open product decision, stop and surface the exact unresolved decision instead of inventing a permanent rule

3. Verify:
- run targeted tests/lint/build for touched areas when feasible (`npm --prefix api ...`, `npm --prefix web ...`)
- if verification cannot run, state exactly what is missing and why

4. Update plan status:
- mark the selected task's acceptance criteria as met in the step file
- append a short `Verification completed:` note with concrete evidence
- if scope changed, update `docs/plans/portfolio-roadmap.md` and `docs/plans/README.md` accordingly

5. Report back in this format:
- `What changed` (file-level)
- `Why`
- `Verification`
- `Commit message`

## Commit message standard

Prefer conventional style:
- `feat(scope): ...` for new behavior
- `fix(scope): ...` for bug fixes
- `refactor(scope): ...` for internal improvements
- `test(scope): ...` for tests
- `docs(scope): ...` for docs/plan updates

Message must:
- mention impacted scope (step/module)
- be specific about outcome
- avoid vague text like "updates" or "changes"

## Guardrails

- Do not mark a task done without corresponding implementation or clear documentation-only completion.
- Do not perform unrelated refactors.
- Do not implement the next step's work while executing the current step's task, even if it seems convenient.
- Preserve backward compatibility unless the task explicitly changes contracts.
- If a task requires a non-obvious tradeoff, pause and present short options.

## MyPortfolio backend rules

- Keep controllers thin; business rules live in services or pure helpers.
- Route all Prisma access through `PrismaService`.
- Every `Position` / `ModelPortfolio` / `ModelAllocation` query must be scoped by the authenticated user's id from `CurrentUser` — never trust a client-supplied `userId`.
- A resource that exists but belongs to another user resolves as `404`, not `403` — don't confirm existence to a non-owner.
- Use Prisma `Decimal` for monetary/quantity/percentage fields; never `Float`.

## MyPortfolio frontend rules

- Do not fetch directly in pages/components; use feature hooks.
- Use `ManageService` in services.
- Always use `web/src/shared/components/FormBuilder/` for forms.
- Format money/quantity/percentage values through one shared helper, never ad-hoc `toFixed()` calls scattered in components.
- New tabular/list surfaces: see the open `Grid`-porting decision in `step-2-positions-core.md` T6 before building an ad-hoc table.

## Testing rule (read before adding any test)

- Only test pure financial/domain calculation logic (P&L, average cost, allocation %, portfolio totals, rebalance diffs) and bug-fix regressions.
- Do not add tests for CRUD service methods, controller/route wiring, component rendering, page composition, or TanStack Query hook wrappers — they mirror the framework and churn on every refactor instead of catching real bugs.
- Quick test: would a bug here silently show the user a wrong number about their money? If yes, test it. If it's plumbing, skip it.
- Full rules: `docs/architecture/backend-patterns.md` → Testing, `docs/architecture/frontend-patterns.md` → Testing.

## SOLID and touched-file quality rule

- One file should have one clear primary responsibility.
- Prefer composition over large smart files.
- Avoid files larger than 150 lines when practical.
- Tests may exceed 150 lines when that keeps scenarios readable.
- During every step-task implementation, inspect every non-test file you edit. If a touched file is already over 150 lines or violates the repo's backend/frontend guidelines, look for a convenient, safe split while preserving behavior.

## MyPortfolio product reminders

- `Position` is an open/closed investment exposure the user owns — not a `Trade` (individual buy/sell) and not a model target.
- Money and quantity fields are `Decimal` end-to-end; convert to `string` at the API response boundary.
- `/dashboard` is a read-only summary with links out; it must never become an editing surface.
- `/positions` is the only place real positions are created/edited/deleted.
- `/models` targets are independent of real positions until Step 5 compares them.

## Fast invocation examples

- `Use step-task-executor: do T3 from docs/plans/step-2-positions-core.md`
- `Use step-task-executor: continue with next T in current step file`
- `Use step-task-executor: execute Step 2 T6 and give commit message`
