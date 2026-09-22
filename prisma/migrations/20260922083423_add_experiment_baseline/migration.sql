-- AlterTable
ALTER TABLE "Experiment" ADD COLUMN     "baselineAverage" DOUBLE PRECISION,
ADD COLUMN     "baselineCapturedAt" TIMESTAMP(3),
ADD COLUMN     "baselineSampleSize" INTEGER;
