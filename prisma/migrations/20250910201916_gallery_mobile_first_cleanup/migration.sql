-- CreateTable
CREATE TABLE "public"."GalleryImage" (
    "id" TEXT NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "displayUrl" TEXT NOT NULL,
    "thumbUrl" TEXT,
    "deleteUrl" TEXT,
    "caption" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "size" INTEGER,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GalleryImage_createdAt_expiresAt_idx" ON "public"."GalleryImage"("createdAt", "expiresAt");

-- CreateIndex
CREATE INDEX "GalleryImage_expiresAt_idx" ON "public"."GalleryImage"("expiresAt");

-- CreateIndex
CREATE INDEX "GalleryImage_deletedAt_idx" ON "public"."GalleryImage"("deletedAt");

-- AddForeignKey
ALTER TABLE "public"."GalleryImage" ADD CONSTRAINT "GalleryImage_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
