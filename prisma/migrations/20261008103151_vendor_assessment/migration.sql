-- AlterEnum
ALTER TYPE "EvidenceType" ADD VALUE 'VENDOR_ASSESSMENT';

-- AlterEnum
ALTER TYPE "RiskSource" ADD VALUE 'VENDOR';

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "assessedAt" TIMESTAMP(3),
ADD COLUMN     "assessment" JSONB,
ADD COLUMN     "dataProfile" JSONB;
