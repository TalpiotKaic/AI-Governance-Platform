-- AlterTable
ALTER TABLE "ControlImplementation" ADD COLUMN     "auto" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "autoReason" TEXT,
ADD COLUMN     "testStatus" "ControlStatus";

-- AlterTable
ALTER TABLE "Policy" ADD COLUMN     "templateKey" TEXT;
