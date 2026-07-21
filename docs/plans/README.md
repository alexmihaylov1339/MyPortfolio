# Plans

This folder holds **implementation plans** for MyPortfolio (decisions, scope, file references, verification steps).

- Add new plans as numbered step files (e.g. `step-2-positions-core.md`).
- Keep plans **updated** when scope changes, or add a short "Superseded by …" note at the top of older files.
- When a step is done, mark its tasks `Done` and add a brief completion note. Do not reopen completed tasks to carry future work.
- `portfolio-roadmap.md` is the source of truth for product intent, page structure, terminology, and testing philosophy — read it before starting any step.
- To execute a step task, use the `.claude/commands/step-task-executor.md` slash command (e.g. "do T3 from step-2-positions-core.md").
- Latest completed step: `step-2-positions-core.md`.
- Current active step: none — pick the next step from the roadmap.
- Next planned steps: `step-3-portfolio-dashboard.md`, `step-4-model-portfolio.md`, `step-5-rebalance-comparison.md`, `step-6-market-prices.md`.

Why keep plans in the repo:

- **Team**: shared context without repeating background in every PR or chat.
- **AI assistants**: referencing these files gives accurate context about prior decisions and the current direction.
