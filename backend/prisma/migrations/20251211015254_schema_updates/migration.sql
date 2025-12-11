-- CreateEnum
CREATE TYPE "CountStatus" AS ENUM ('PENDING', 'APPROVED', 'RECOUNT_REQUESTED', 'REJECTED');

-- AlterTable
ALTER TABLE "inventory_counts" ADD COLUMN     "reviewNotes" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "status" "CountStatus" NOT NULL DEFAULT 'PENDING';

-- RenameIndex
ALTER INDEX "inventory_counts_productId_warehouseId_cutoffDate_countNumber_k" RENAME TO "inventory_counts_productId_warehouseId_cutoffDate_countNumb_key";
