-- Enables Row-Level Security on every public-schema table, with no
-- policies attached. This blocks all access via Supabase's auto-generated
-- PostgREST API (which connects as the low-privilege `anon`/`authenticated`
-- roles and is otherwise reachable by anyone with the project URL), while
-- leaving the application unaffected: the API server connects via the
-- `postgres` role, which owns these tables and is exempt from RLS
-- restrictions by default (no FORCE ROW LEVEL SECURITY is set here).
-- Authorization for real users is enforced entirely in the NestJS API
-- layer (JWT auth + userId/portfolioId scoping on every query), not via
-- Postgres RLS policies — so "enable with zero policies" is the correct,
-- complete fix, not an interim step.

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Portfolio" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Position" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Dividend" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ModelPortfolio" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ModelAllocation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MarketPrice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
