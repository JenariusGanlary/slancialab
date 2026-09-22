-- AlterEnum
ALTER TYPE "ContentStyle" ADD VALUE 'LIST';

-- AlterTable
ALTER TABLE "Experiment" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "hypothesis" TEXT,
ADD COLUMN     "protocol" TEXT;
