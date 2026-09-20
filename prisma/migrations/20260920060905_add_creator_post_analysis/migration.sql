-- CreateEnum
CREATE TYPE "HookType" AS ENUM ('CONTRARIAN', 'CURIOSITY', 'QUESTION', 'STATEMENT', 'STORY', 'PROBLEM', 'BENEFIT', 'OTHER');

-- CreateEnum
CREATE TYPE "ContentStructure" AS ENUM ('CLAIM_EXPLANATION', 'HOOK_BODY_CTA', 'PROBLEM_SOLUTION', 'STORY_LESSON', 'LIST', 'FRAMEWORK', 'QUESTION_ANSWER', 'OTHER');

-- CreateEnum
CREATE TYPE "Tone" AS ENUM ('NEUTRAL', 'EDUCATIONAL', 'PROVOCATIVE', 'CONVERSATIONAL', 'INSPIRATIONAL', 'HUMOROUS', 'AUTHORITATIVE', 'PERSONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ContentFormat" AS ENUM ('OPINION', 'EDUCATIONAL', 'STORY', 'FRAMEWORK', 'LIST', 'QUESTION', 'OBSERVATION', 'THREAD', 'OTHER');

-- CreateEnum
CREATE TYPE "CtaType" AS ENUM ('NONE', 'QUESTION', 'FOLLOW', 'REPLY', 'CLICK', 'SHARE', 'SIGNUP', 'OTHER');

-- CreateEnum
CREATE TYPE "ContentStyle" AS ENUM ('STORY', 'EDUCATIONAL', 'OPINION', 'ENTERTAINMENT', 'PERSONAL', 'FRAMEWORK', 'OBSERVATIONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "Stance" AS ENUM ('CONTRARIAN', 'CONVENTIONAL', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "SentenceType" AS ENUM ('QUESTION', 'STATEMENT');

-- CreateEnum
CREATE TYPE "Personalization" AS ENUM ('PERSONAL', 'GENERIC');

-- AlterTable
ALTER TABLE "CreatorPost" ADD COLUMN     "contentLength" INTEGER,
ADD COLUMN     "contentStyle" "ContentStyle",
ADD COLUMN     "ctaType" "CtaType",
ADD COLUMN     "format" "ContentFormat",
ADD COLUMN     "hookType" "HookType",
ADD COLUMN     "likes" INTEGER,
ADD COLUMN     "personalization" "Personalization",
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "replies" INTEGER,
ADD COLUMN     "reposts" INTEGER,
ADD COLUMN     "researchNotes" TEXT,
ADD COLUMN     "sentenceType" "SentenceType",
ADD COLUMN     "stance" "Stance",
ADD COLUMN     "structure" "ContentStructure",
ADD COLUMN     "tone" "Tone",
ADD COLUMN     "topic" TEXT,
ADD COLUMN     "views" INTEGER,
ALTER COLUMN "patternTag" DROP NOT NULL;
