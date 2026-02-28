-- CreateTable
CREATE TABLE "CreditAccount" (
    "id" SERIAL NOT NULL,
    "wholesalerId" INTEGER NOT NULL,
    "retailerId" INTEGER NOT NULL,
    "creditLimit" DOUBLE PRECISION NOT NULL,
    "creditUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditStatus" "CreditStatus" NOT NULL DEFAULT 'none',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreditAccount_wholesalerId_retailerId_key" ON "CreditAccount"("wholesalerId", "retailerId");

-- AddForeignKey
ALTER TABLE "CreditAccount" ADD CONSTRAINT "CreditAccount_wholesalerId_fkey" FOREIGN KEY ("wholesalerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditAccount" ADD CONSTRAINT "CreditAccount_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
