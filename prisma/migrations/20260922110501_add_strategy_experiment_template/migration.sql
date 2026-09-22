-- AlterTable
ALTER TABLE "Strategy" ADD COLUMN     "hypothesisTemplate" TEXT,
ADD COLUMN     "primaryMetric" TEXT,
ADD COLUMN     "protocolTemplate" TEXT,
ADD COLUMN     "recommendedDurationDays" INTEGER,
ADD COLUMN     "recommendedPostCount" INTEGER,
ADD COLUMN     "successThresholdPercent" INTEGER;
