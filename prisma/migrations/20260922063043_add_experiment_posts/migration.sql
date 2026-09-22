-- CreateTable
CREATE TABLE "ExperimentPost" (
    "id" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "postId" TEXT,
    "postUrl" TEXT,
    "content" TEXT,
    "publishedAt" TIMESTAMP(3),
    "views" INTEGER,
    "likes" INTEGER,
    "replies" INTEGER,
    "reposts" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExperimentPost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExperimentPost" ADD CONSTRAINT "ExperimentPost_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
