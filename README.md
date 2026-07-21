# MyPortfolio

Personal stock portfolio tracker. Positions are entered manually (Revolut + IBKR); the app shows all positions, portfolio balance, and P&L in one place.

## Stack

- **Frontend** (`web/`): Next.js 16, React 19, TailwindCSS v4, TanStack Query v5, TypeScript
- **Backend** (`api/`): NestJS 11, Prisma 6, PostgreSQL (Supabase), TypeScript
- **Auth**: JWT (access token in `localStorage`)

## Quick start

1. Install dependencies:

   ```bash
   npm install
   npm --prefix api install
   npm --prefix web install
   ```

2. Configure environment:

   ```bash
   cp api/.env.example api/.env          # fill in Supabase + JWT + email values
   cp web/.env.local.example web/.env.local
   ```

3. Create the database schema:

   ```bash
   cd api && npx prisma migrate dev
   ```

4. Run both apps from the repo root:

   ```bash
   npm run dev
   ```

   Frontend: http://localhost:3000 — API: http://localhost:3001

## Docs

- `docs/architecture/` — frontend/backend patterns (read before contributing)
- `docs/plans/` — numbered step plans; current: `step-1-project-foundations.md`
