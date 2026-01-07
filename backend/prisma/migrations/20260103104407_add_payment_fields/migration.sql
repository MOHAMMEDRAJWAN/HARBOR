-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'ONLINE', 'CREDIT');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('unpaid', 'paid');

-- CreateEnum
CREATE TYPE "CreditStatus" AS ENUM ('none', 'requested', 'approved', 'rejected', 'settled');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "creditStatus" "CreditStatus" NOT NULL DEFAULT 'none',
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'COD',
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'unpaid';
