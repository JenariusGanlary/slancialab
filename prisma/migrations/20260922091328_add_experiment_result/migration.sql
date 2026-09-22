-- CreateTable
CREATE TABLE "ExperimentResult" (
    "id" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "primaryMetric" TEXT NOT NULL,
    "postsMeasured" INTEGER NOT NULL,
    "baselineAverage" DOUBLE PRECISION,
    "baselineSampleSize" INTEGER,
    "experimentAverage" DOUBLE PRECISION,
    "absoluteChange" DOUBLE PRECISION,
    "percentageChange" DOUBLE PRECISION,
    "successThresholdPercent" INTEGER,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExperimentResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExperimentResult_experimentId_key" ON "ExperimentResult"("experimentId");

-- AddForeignKey
ALTER TABLE "ExperimentResult" ADD CONSTRAINT "ExperimentResult_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
