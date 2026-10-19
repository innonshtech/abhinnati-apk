-- AlterTable
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "requiresFssai" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameMr" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "pincode" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "district" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT 'India',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radiusKm" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "searchCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AreaAlias" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "aliasName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AreaAlias_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Area_slug_key" ON "Area"("slug");
CREATE INDEX IF NOT EXISTS "Area_isActive_idx" ON "Area"("isActive");
CREATE INDEX IF NOT EXISTS "Area_slug_idx" ON "Area"("slug");
CREATE INDEX IF NOT EXISTS "Area_city_idx" ON "Area"("city");
CREATE INDEX IF NOT EXISTS "Area_latitude_longitude_idx" ON "Area"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "AreaAlias_areaId_idx" ON "AreaAlias"("areaId");
CREATE INDEX IF NOT EXISTS "AreaAlias_aliasName_idx" ON "AreaAlias"("aliasName");
CREATE INDEX IF NOT EXISTS "Business_categoryId_idx" ON "Business"("categoryId");

DO $$ BEGIN
 ALTER TABLE "Business" ADD CONSTRAINT "Business_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
 ALTER TABLE "AreaAlias" ADD CONSTRAINT "AreaAlias_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN NULL;
END $$;
