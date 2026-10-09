-- AlterTable
ALTER TABLE "TestScenario" ADD COLUMN     "datasetId" TEXT,
ADD COLUMN     "sourceRef" TEXT;

-- CreateIndex
CREATE INDEX "TestScenario_datasetId_idx" ON "TestScenario"("datasetId");

-- AddForeignKey
ALTER TABLE "TestScenario" ADD CONSTRAINT "TestScenario_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
