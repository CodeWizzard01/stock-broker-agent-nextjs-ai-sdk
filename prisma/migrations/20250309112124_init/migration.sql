-- CreateTable
CREATE TABLE "StockOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "orderType" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockOrder_userId_idx" ON "StockOrder"("userId");
