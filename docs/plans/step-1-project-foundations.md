# Step 1 — Project Foundations & Auth

**Status:** Complete — pending a manual UI walkthrough (register/login/account in the browser) and email setup for forgot-password  
**Date:** 2026-07-10 (updated 2026-07-18)  

> **Network note:** on this machine's network, Postgres traffic on port **5432 is silently dropped** (all Supabase session-pooler nodes), while **6543 works**. `prisma migrate dev/deploy` therefore cannot connect from here. Workaround used for the init migration (repeat for future migrations, or run them from another network / Supabase SQL editor): generate SQL offline with `prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`, save under `prisma/migrations/<timestamp>_name/`, apply it over port 6543 (pg client), and insert the row into `_prisma_migrations` (sha256 checksum of migration.sql).

---

## Objective

Scaffold the full monorepo, wire up the tech stack, and deliver a working authentication system (register, login, logout, forgot/reset password) by porting and adapting the proven auth code from Memora. No portfolio-specific features yet — this step ends when a user can sign up, log in, and reach an empty dashboard.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TailwindCSS v4, TanStack Query v5, TypeScript |
| Backend | NestJS 11, Prisma 6, PostgreSQL (Supabase), TypeScript |
| Auth | JWT (access token stored in `localStorage`) |
| Dev runner | `concurrently` (same root-level `npm run dev` pattern as Memora) |

---

## Scope

**In scope:**
- Monorepo root with `web/`, `api/`, `docs/` directories
- Backend: NestJS scaffold, Prisma with User model, auth module (register, login, forgot/reset password, get me, update account)
- Frontend: Next.js scaffold, TailwindCSS, TanStack Query provider, `ManageService`, `AuthProvider` / `ProtectedRoute` / `GuestOnlyRoute`, auth feature (login, register, forgot-password, reset-password, account)
- Shared: `FormBuilder` component, `Button` component, `PageLoader`, error/notification components
- Pattern docs already created in `docs/architecture/`

**Out of scope:**
- Portfolio positions (Step 2)
- Portfolio dashboard / balance calculation (Step 3+)
- Any broker integrations

---

## What YOU need to do (user actions)

1. **Create a Supabase project** at supabase.com and grab `DATABASE_URL` and `DIRECT_URL` (pooled + direct connection strings).
2. **Create a SendGrid (or similar) account** for transactional email (forgot-password flow). Grab the API key and sender address.  
   *(Alternatively we can stub the email step and skip it for now.)*
3. **Generate a JWT secret** — any random 64-char string, e.g. `openssl rand -hex 32`.
4. After scaffold: fill in the `.env` files we create with the above values and run `npm run dev`.

---

## What AI will do (implementation tasks)

### Task 1 — Monorepo root
- [x] `package.json` with `concurrently` dev script: `start:fe`, `start:be`
- [x] `.gitignore` covering `node_modules`, `.env`, `dist`, `.next`, `prisma/migrations` (keep migrations committed)
- [x] Root `README.md` with quick-start instructions

### Task 2 — Backend scaffold
- [x] Manual scaffold matching Memora structure
- [x] Copy and adapt from Memora:
  - `prisma/prisma.service.ts` + `prisma.module.ts`
  - `src/auth/` (entire module: controller, service, guard, helpers, sessions, recovery, account, validation, errors, dto/)
  - `src/email/` email service (nodemailer)
  - `src/app.module.ts`, `src/main.ts`
  - `prisma/schema.prisma` (User model only — strip all Memora-specific models)
- [x] `api/.env.example` with `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `EMAIL_*` vars
- [x] Initial User migration created and applied *(via offline `migrate diff` + apply over port 6543 — see network note above; `migrate dev` itself is blocked on this network)*
- [x] Verify the API boots without errors (all auth routes mapped, health endpoint responds)

### Task 3 — Frontend scaffold
- [x] Manual scaffold matching Memora config (Next.js 16, Tailwind v4, src dir, app router)
- [x] Install TanStack Query v5 + devtools
- [x] Copy and adapt from Memora:
  - `src/shared/services/ManageService.ts`
  - `src/shared/services/apiConstants.ts` + `authHeaders.ts`
  - `src/shared/components/AuthProvider.tsx`
  - `src/shared/components/FormBuilder/`
  - `src/shared/components/Button/`
  - `src/shared/components/PageLoader/`
  - `src/shared/components/ErrorMessage/`
  - `src/shared/components/Notification/`
  - `src/shared/constants/auth.ts` (AUTH_TOKEN_KEY)
  - `src/shared/constants/routes.ts` (APP_ROUTES)
  - `src/shared/utils/` (browser environment check, etc.)
  - `src/features/auth/` (entire feature — login, register, forgot-password, reset-password, account)
- [x] Wire up TanStack Query provider in root layout
- [x] Wire up `AuthProvider` in root layout
- [x] Create Next.js app router pages:
  - `/login` → login page (GuestOnlyRoute)
  - `/register` → register page (GuestOnlyRoute)
  - `/forgot-password` → forgot-password page (GuestOnlyRoute)
  - `/reset-password` → reset-password page (GuestOnlyRoute)
  - `/dashboard` → empty dashboard placeholder (ProtectedRoute)
  - `/account` → account settings page (ProtectedRoute)
  - `/` → redirect to `/dashboard`
- [x] `web/.env.local.example` with `NEXT_PUBLIC_API_URL`
- [x] Verify `npm run dev` boots and login/register flow works end-to-end *(both apps boot; register → JWT, login, `/me`, and 401-on-bad-password verified against the live DB; browser click-through still recommended)*

### Task 4 — Developer tooling
- [x] Prettier config (`.prettierrc`) consistent with Memora
- [x] ESLint config
- [x] Path aliases in `tsconfig.json` for both `web/` and `api/` (`@/`, `@shared/`)
- [x] `web/jest.config.js` + test setup (copy from Memora)

---

## Key files expected after Step 1

```
MyPortfolio/
├── package.json                   # root dev runner
├── .gitignore
├── docs/
│   ├── README.md
│   ├── architecture/
│   │   ├── frontend-patterns.md
│   │   └── backend-patterns.md
│   └── plans/
│       ├── README.md
│       └── step-1-project-foundations.md
├── api/
│   ├── prisma/
│   │   ├── schema.prisma          # User model
│   │   └── migrations/
│   ├── src/
│   │   ├── auth/                  # full auth module
│   │   ├── email/                 # email service
│   │   ├── common/                # PrismaService, PrismaModule
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   └── package.json
└── web/
    ├── src/
    │   ├── app/                   # Next.js app router
    │   │   ├── layout.tsx
    │   │   ├── page.tsx           # redirect to /dashboard
    │   │   ├── login/page.tsx
    │   │   ├── register/page.tsx
    │   │   ├── forgot-password/page.tsx
    │   │   ├── reset-password/page.tsx
    │   │   ├── dashboard/page.tsx
    │   │   └── account/page.tsx
    │   ├── features/
    │   │   └── auth/              # full auth feature
    │   └── shared/
    │       ├── components/        # AuthProvider, FormBuilder, Button, etc.
    │       ├── constants/
    │       ├── services/          # ManageService
    │       └── utils/
    ├── .env.local.example
    └── package.json
```

---

## Differences from Memora (what we intentionally drop/change)

| Memora | MyPortfolio |
|---|---|
| `useService` / `useServiceQuery` hooks | Removed — use TanStack Query directly in feature hooks |
| `next-intl` i18n | Removed — single language for now |
| `Grid` component | Not ported in Step 1 — add in Step 3 when we have tabular data |
| `LanguageSwitcher` component | Not ported |
| `EntitySearch` component | Not ported |
| Deck/card/chunk domain models | Not ported — replaced by portfolio domain in Step 2+ |
| `BrandLogo` / `Vibur` font | Adapt to project identity |

---

## Exit criteria

- [ ] `npm run dev` from the root starts both BE and FE without errors
- [ ] A new user can register via `/register` and receive a JWT
- [ ] The same user can log in via `/login` and be redirected to `/dashboard`
- [ ] An unauthenticated request to `/dashboard` redirects to `/login`
- [ ] A logged-in user can view and update their account at `/account`
- [ ] A logged-in user can log out and be redirected to `/login`
- [ ] Forgot-password + reset-password flow works (email sent, token accepted)
- [ ] TypeScript compiles without errors in both `api/` and `web/`
- [ ] ESLint passes in both `api/` and `web/`

---

## Next step

Step 2: Positions Core — define the `Position` model, CRUD API, and the manual-entry UI for adding/editing/deleting stock positions (broker source: Revolut or IBKR, ticker, quantity, average price, open/closed status).
