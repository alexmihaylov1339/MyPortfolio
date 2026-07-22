-- CreateTable
CREATE TABLE "MarketPrice" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "micCode" TEXT NOT NULL DEFAULT '',
    "price" DECIMAL(65,30) NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketPrice_ticker_micCode_key" ON "MarketPrice"("ticker", "micCode");

