-- CreateTable
CREATE TABLE "Dividend" (
    "id" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dividend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Dividend_positionId_idx" ON "Dividend"("positionId");

-- AddForeignKey
ALTER TABLE "Dividend" ADD CONSTRAINT "Dividend_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

