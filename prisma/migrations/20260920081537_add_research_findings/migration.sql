-- AlterTable
ALTER TABLE "Experiment" ADD COLUMN     "researchFindingId" TEXT;

-- CreateTable
CREATE TABLE "ResearchFinding" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "signalLevel" TEXT NOT NULL,
    "postCount" INTEGER NOT NULL,
    "measuredCount" INTEGER NOT NULL,
    "evidenceLabel" TEXT NOT NULL,
    "medianLiftPercent" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchFinding_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Experiment" ADD CONSTRAINT "Experiment_researchFindingId_fkey" FOREIGN KEY ("researchFindingId") REFERENCES "ResearchFinding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchFinding" ADD CONSTRAINT "ResearchFinding_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
