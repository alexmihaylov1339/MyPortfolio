# MyPortfolio Docs — Onboarding Guide

Start here if you are new to this repo or an AI assistant working in it.

---

## 1. Understand the product

MyPortfolio is a personal stock portfolio tracker. Positions are entered manually (Revolut and IBKR are not integrated via API — the user adds positions by hand). The goal is to have all stock/ETF positions in one place with a dashboard showing current balance, P&L, and filters (open/closed positions, with/without dividends).

---

## 2. Repo structure

```
api/          NestJS backend (Prisma, PostgreSQL via Supabase)
web/          Next.js frontend (React 19, TailwindCSS v4, TanStack Query v5)
docs/
  architecture/   Pattern guides
  plans/          Step-by-step implementation plans
```

Key entry points by role:

| Role | Start with |
|---|---|
| Backend work | `docs/architecture/backend-patterns.md` |
| Frontend work | `docs/architecture/frontend-patterns.md` |
| Understanding current task | `docs/plans/README.md` → latest active plan |

---

## 3. Read architecture patterns before touching code

These two files are mandatory reading before any code change:

- [`docs/architecture/backend-patterns.md`](architecture/backend-patterns.md)
- [`docs/architecture/frontend-patterns.md`](architecture/frontend-patterns.md)

---

## 4. Planning system

All step plans live in [`docs/plans/`](plans/). Each plan file covers one focused deliverable (foundations, a feature, a fix). Read the active plan's task list before starting work.

---

## 5. Run the app locally

```bash
# From repo root
npm run dev       # starts backend + frontend concurrently

# Backend only
npm run start:be

# Frontend only
npm run start:fe
```

---

## 6. Environment setup

```bash
# Backend
cp api/.env.example api/.env
# Fill in DATABASE_URL, DIRECT_URL, JWT_SECRET, EMAIL_* vars

# Frontend
cp web/.env.local.example web/.env.local
# Fill in NEXT_PUBLIC_API_URL
```

---

## 7. Database

```bash
# Apply migrations (dev)
cd api && npx prisma migrate dev

# Apply migrations (prod)
cd api && npx prisma migrate deploy

# Regenerate Prisma client after schema changes
cd api && npx prisma generate
```

---

## 8. Type-check

```bash
cd api && npx tsc --noEmit
cd web && npx tsc --noEmit
```

---

## 9. Tests

```bash
cd api && npm test
cd web && npm test
```
