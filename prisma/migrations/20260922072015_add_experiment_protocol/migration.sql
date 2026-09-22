-- AlterTable
ALTER TABLE "Experiment" ADD COLUMN     "durationDays" INTEGER,
ADD COLUMN     "primaryMetric" TEXT,
ADD COLUMN     "successThresholdPercent" INTEGER,
ADD COLUMN     "targetPostCount" INTEGER;
