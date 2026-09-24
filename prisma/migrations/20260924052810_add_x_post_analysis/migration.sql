-- CreateEnum
CREATE TYPE "XPostAnalysisStatus" AS ENUM ('PENDING', 'ANALYZED', 'FAILED');

-- CreateTable
CREATE TABLE "XPostAnalysis" (
    "id" TEXT NOT NULL,
    "xPostId" TEXT NOT NULL,
    "status" "XPostAnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "hookType" "HookType",
    "structure" "ContentStructure",
    "topic" TEXT,
    "tone" "Tone",
    "format" "ContentFormat",
    "ctaType" "CtaType",
    "contentLength" INTEGER,
    "contentStyle" "ContentStyle",
    "stance" "Stance",
    "sentenceType" "SentenceType",
    "personalization" "Personalization",
    "confidence" DOUBLE PRECISION,
    "analysisVersion" TEXT,
    "analysisModel" TEXT,
    "analyzedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "XPostAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "XPostAnalysis_xPostId_key" ON "XPostAnalysis"("xPostId");

-- CreateIndex
CREATE INDEX "XPostAnalysis_status_idx" ON "XPostAnalysis"("status");

-- CreateIndex
CREATE INDEX "XPostAnalysis_analyzedAt_idx" ON "XPostAnalysis"("analyzedAt");

-- AddForeignKey
ALTER TABLE "XPostAnalysis" ADD CONSTRAINT "XPostAnalysis_xPostId_fkey" FOREIGN KEY ("xPostId") REFERENCES "XPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
