# Plans

This folder holds **implementation plans** for MyPortfolio (decisions, scope, file references, verification steps).

- Add new plans as numbered step files (e.g. `step-2-positions-core.md`).
- Keep plans **updated** when scope changes, or add a short "Superseded by …" note at the top of older files.
- When a step is done, mark its tasks `Done` and add a brief completion note. Do not reopen completed tasks to carry future work.
- `portfolio-roadmap.md` is the source of truth for product intent, page structure, terminology, and testing philosophy — read it before starting any step.
- To execute a step task, use the `.claude/commands/step-task-executor.md` slash command (e.g. "do T3 from step-2-positions-core.md").
- Latest completed step: `step-5-rebalance-comparison.md`.
- Current active step: `step-6-market-prices.md` — T1–T6 done (calculation, tests, service, endpoint, frontend, dashboard UI all live-verified). Only T7 remains, and it's blocked on the user adding a real `TWELVE_DATA_API_KEY` to `api/.env` (see the plan's "What YOU need to do" section).
- Next planned steps: none — Step 6 is the last one on the roadmap.

Why keep plans in the repo:

- **Team**: shared context without repeating background in every PR or chat.
- **AI assistants**: referencing these files gives accurate context about prior decisions and the current direction.
