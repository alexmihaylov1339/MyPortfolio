# MyPortfolio: Step 4 Plan - Model Portfolio

**Status:** Proposed  
**Date:** 2026-07-21  
**Roadmap ref:** `docs/plans/portfolio-roadmap.md` → Step 4

---

## Branch proposal

- `feat/step4-model-portfolio`

---

## Objective

Let the user define a target allocation — independent of their real positions until Step 5 compares them.

---

## Scope

In scope:
- `ModelPortfolio` + `ModelAllocation` Prisma models, user-scoped.
- Backend CRUD for model portfolios and their allocation rows.
- `/models` page: create/edit a model, add ticker/percent rows, validate that percentages sum to 100%.

Out of scope:
- Comparing a model against real positions (Step 5).
- Multiple active models with a "primary" selector beyond the `isDefault` flag already sketched in the schema idea below.

---

## Proposed schema (starting point, refine at task time)

```prisma
model ModelPortfolio {
  id          String @id @default(cuid())
  userId      String
  name        String
  isDefault   Boolean @default(false)
  allocations ModelAllocation[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ModelAllocation {
  id               String @id @default(cuid())
  modelPortfolioId String
  ticker           String
  targetPercent    Decimal
}
```

`targetPercent` is `Decimal`, per the roadmap's money/quantity rule — percentages are financial data too.

---

## Deliverables (to be broken into T-tasks when this step starts)

- Migration for the two new models, scoped by `userId` on `ModelPortfolio`.
- CRUD API: create/edit/delete a model, add/edit/remove allocation rows.
- `/models` page with a form (via `FormBuilder`) for the model + a row-editor for allocations, validating the 100% sum before save.

---

## Testing note

The "percentages sum to 100%" validation is a real, worth-testing rule. The CRUD plumbing around it is not — same lean approach as Step 2.

---

## Open decisions to resolve when this step is picked up

- Can a user have more than one model portfolio, or exactly one (`isDefault` implies multiple could exist — confirm before building)?
- Row-editing UX for allocations: inline rows in the model form, or a separate add/edit flow per allocation?

---

## Definition of done (draft)

- A user can create a model portfolio with named allocations summing to 100%.
- Build/lint/tests pass in both packages.
