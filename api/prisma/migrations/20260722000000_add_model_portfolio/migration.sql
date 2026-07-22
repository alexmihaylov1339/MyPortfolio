-- CreateTable
CREATE TABLE "ModelPortfolio" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelPortfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelAllocation" (
    "id" TEXT NOT NULL,
    "modelPortfolioId" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "targetPercent" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "ModelAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModelPortfolio_userId_idx" ON "ModelPortfolio"("userId");

-- CreateIndex
CREATE INDEX "ModelAllocation_modelPortfolioId_idx" ON "ModelAllocation"("modelPortfolioId");

-- CreateIndex
CREATE UNIQUE INDEX "ModelAllocation_modelPortfolioId_ticker_key" ON "ModelAllocation"("modelPortfolioId", "ticker");

-- AddForeignKey
ALTER TABLE "ModelPortfolio" ADD CONSTRAINT "ModelPortfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelAllocation" ADD CONSTRAINT "ModelAllocation_modelPortfolioId_fkey" FOREIGN KEY ("modelPortfolioId") REFERENCES "ModelPortfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

