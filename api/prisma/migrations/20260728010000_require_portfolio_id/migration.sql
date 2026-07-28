-- AlterTable
ALTER TABLE "Position" ALTER COLUMN "portfolioId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Position_portfolioId_idx" ON "Position"("portfolioId");
CREATE INDEX "Position_portfolioId_status_idx" ON "Position"("portfolioId", "status");

-- AlterTable
ALTER TABLE "ModelPortfolio" ALTER COLUMN "portfolioId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ModelPortfolio" ADD CONSTRAINT "ModelPortfolio_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "ModelPortfolio_portfolioId_idx" ON "ModelPortfolio"("portfolioId");
