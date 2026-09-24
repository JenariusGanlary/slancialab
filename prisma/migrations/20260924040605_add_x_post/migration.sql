-- CreateTable
CREATE TABLE "XPost" (
    "id" TEXT NOT NULL,
    "xAccountId" TEXT NOT NULL,
    "xPostId" TEXT NOT NULL,
    "content" TEXT,
    "postUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "views" INTEGER,
    "likes" INTEGER,
    "replies" INTEGER,
    "reposts" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "XPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "XPost_xPostId_key" ON "XPost"("xPostId");

-- CreateIndex
CREATE INDEX "XPost_xAccountId_idx" ON "XPost"("xAccountId");

-- CreateIndex
CREATE INDEX "XPost_publishedAt_idx" ON "XPost"("publishedAt");

-- AddForeignKey
ALTER TABLE "XPost" ADD CONSTRAINT "XPost_xAccountId_fkey" FOREIGN KEY ("xAccountId") REFERENCES "XAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
