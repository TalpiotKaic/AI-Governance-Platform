-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('POLICY', 'PROCEDURE', 'STANDARD', 'ROLES', 'OBJECTIVES', 'PLAN', 'RECORDS', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PolicyStatus" ADD VALUE 'IN_REVIEW';
ALTER TYPE "PolicyStatus" ADD VALUE 'EXPIRED';
ALTER TYPE "PolicyStatus" ADD VALUE 'SUPERSEDED';

-- AlterTable
ALTER TABLE "Evidence" ADD COLUMN     "policyId" TEXT;

-- AlterTable
ALTER TABLE "Policy" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "controlCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "docType" "DocumentType" NOT NULL DEFAULT 'POLICY',
ADD COLUMN     "evidenceId" TEXT,
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "lastReviewedAt" TIMESTAMP(3),
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "nextReviewDate" TIMESTAMP(3),
ADD COLUMN     "previousId" TEXT,
ADD COLUMN     "reviewComment" TEXT,
ADD COLUMN     "reviewCycleMonths" INTEGER NOT NULL DEFAULT 12,
ADD COLUMN     "selfApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sha256" TEXT,
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "submittedById" TEXT;

-- CreateIndex
CREATE INDEX "Policy_orgId_status_idx" ON "Policy"("orgId", "status");
