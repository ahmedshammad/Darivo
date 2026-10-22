-- CreateEnum
CREATE TYPE "DeveloperKind" AS ENUM ('REAL_REFERENCE', 'DEMO', 'AGGREGATE');

-- CreateEnum
CREATE TYPE "ProjectKind" AS ENUM ('REAL_REFERENCE', 'DEMO');

-- CreateEnum
CREATE TYPE "DatePrecision" AS ENUM ('UNKNOWN', 'YEAR', 'MONTH', 'DAY');

-- CreateEnum
CREATE TYPE "SourceBasis" AS ENUM ('UNKNOWN', 'AGENT_LISTING', 'LISTING', 'BROKER_PROJECT_PAGE', 'PORTAL_PROJECT_PAGE', 'PRESS_REPORT', 'DEMO_ESTIMATE');

-- CreateEnum
CREATE TYPE "SourceConfidence" AS ENUM ('UNASSESSED', 'LOW', 'MEDIUM', 'HIGH');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'VERIFIED_CLIENT';
ALTER TYPE "Role" ADD VALUE 'DEVELOPER_PARTNER';

-- AlterTable
ALTER TABLE "ClientProfile" ADD COLUMN     "arabicIndicDigits" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Developer" ADD COLUMN     "country" TEXT,
ADD COLUMN     "kind" "DeveloperKind" NOT NULL DEFAULT 'DEMO',
ADD COLUMN     "knownFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "rawReference" JSONB;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "projectId" TEXT;

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" "ProjectKind" NOT NULL,
    "developerId" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "communityName" TEXT NOT NULL,
    "communityId" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "coordinatesApproximate" BOOLEAN NOT NULL DEFAULT true,
    "types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT,
    "completion" TEXT,
    "priceFromAmount" DECIMAL(20,2),
    "priceFromCurrency" TEXT,
    "priceFromLabel" TEXT,
    "priceBasis" "SourceBasis" NOT NULL DEFAULT 'UNKNOWN',
    "priceNote" TEXT,
    "paymentPlanText" TEXT,
    "asOf" TEXT,
    "asOfPrecision" "DatePrecision" NOT NULL DEFAULT 'UNKNOWN',
    "confidence" "SourceConfidence" NOT NULL DEFAULT 'UNASSESSED',
    "rawReference" JSONB,
    "demoPriceBasis" JSONB,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "basis" "SourceBasis" NOT NULL DEFAULT 'UNKNOWN',
    "retrievedAt" TIMESTAMP(3),
    "retrievedDatePrecision" "DatePrecision" NOT NULL DEFAULT 'UNKNOWN',
    "confidence" "SourceConfidence" NOT NULL DEFAULT 'UNASSESSED',

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceFact" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "developerId" TEXT,
    "projectId" TEXT,
    "marketStatId" TEXT,
    "asOf" TEXT,
    "asOfPrecision" "DatePrecision" NOT NULL DEFAULT 'UNKNOWN',
    "basis" "SourceBasis" NOT NULL DEFAULT 'UNKNOWN',
    "confidence" "SourceConfidence" NOT NULL DEFAULT 'UNASSESSED',
    "citationScope" TEXT NOT NULL DEFAULT 'record',

    CONSTRAINT "ReferenceFact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketStat" (
    "id" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "detail" TEXT,
    "asOf" TEXT,
    "asOfPrecision" "DatePrecision" NOT NULL DEFAULT 'UNKNOWN',
    "rawReference" JSONB NOT NULL,

    CONSTRAINT "MarketStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoPOI" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DemoPOI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ReferenceFactToSource" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ReferenceFactToSource_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_kind_country_city_idx" ON "Project"("kind", "country", "city");

-- CreateIndex
CREATE INDEX "Project_developerId_kind_idx" ON "Project"("developerId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "Source_url_basis_key" ON "Source"("url", "basis");

-- CreateIndex
CREATE INDEX "ReferenceFact_developerId_idx" ON "ReferenceFact"("developerId");

-- CreateIndex
CREATE INDEX "ReferenceFact_projectId_idx" ON "ReferenceFact"("projectId");

-- CreateIndex
CREATE INDEX "ReferenceFact_marketStatId_idx" ON "ReferenceFact"("marketStatId");

-- CreateIndex
CREATE INDEX "DemoPOI_communityId_kind_idx" ON "DemoPOI"("communityId", "kind");

-- CreateIndex
CREATE INDEX "_ReferenceFactToSource_B_index" ON "_ReferenceFactToSource"("B");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceFact" ADD CONSTRAINT "ReferenceFact_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceFact" ADD CONSTRAINT "ReferenceFact_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceFact" ADD CONSTRAINT "ReferenceFact_marketStatId_fkey" FOREIGN KEY ("marketStatId") REFERENCES "MarketStat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoPOI" ADD CONSTRAINT "DemoPOI_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReferenceFactToSource" ADD CONSTRAINT "_ReferenceFactToSource_A_fkey" FOREIGN KEY ("A") REFERENCES "ReferenceFact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReferenceFactToSource" ADD CONSTRAINT "_ReferenceFactToSource_B_fkey" FOREIGN KEY ("B") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Guard all write paths, including direct SQL and future tools. Real reference
-- organisations and projects never receive synthetic unit inventory.
CREATE FUNCTION "darivo_project_kind_guard"() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE developer_kind "DeveloperKind";
BEGIN
  SELECT "kind" INTO developer_kind FROM "Developer" WHERE id = NEW."developerId" FOR SHARE;
  IF developer_kind IS NULL OR
    (NEW.kind = 'DEMO' AND developer_kind <> 'DEMO') OR
    (NEW.kind = 'REAL_REFERENCE' AND developer_kind <> 'REAL_REFERENCE') THEN
    RAISE EXCEPTION 'Project and developer provenance must match; aggregates are not organisations' USING ERRCODE='23514';
  END IF;
  IF TG_OP = 'UPDATE' AND (NEW.kind <> OLD.kind OR NEW."developerId" <> OLD."developerId")
    AND EXISTS (SELECT 1 FROM "Property" WHERE "projectId" = OLD.id) THEN
    RAISE EXCEPTION 'Cannot change the provenance or developer of a project with units' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "Project_provenance_guard" BEFORE INSERT OR UPDATE OF "kind", "developerId" ON "Project"
FOR EACH ROW EXECUTE FUNCTION "darivo_project_kind_guard"();

CREATE FUNCTION "darivo_unit_provenance_guard"() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE developer_kind "DeveloperKind"; project_kind "ProjectKind"; project_developer text; project_community text; fallback_id text;
BEGIN
  SELECT "kind" INTO developer_kind FROM "Developer" WHERE id = NEW."developerId" FOR SHARE;
  IF developer_kind IS DISTINCT FROM 'DEMO'::"DeveloperKind" THEN
    RAISE EXCEPTION 'Unit inventory requires a fictional demo developer' USING ERRCODE='23514';
  END IF;
  -- Existing admin creates/edits do not yet choose a project. Resolve a fictional
  -- collection for that developer/community instead of leaving an orphan unit.
  IF TG_OP = 'UPDATE' AND NEW."projectId" IS NOT DISTINCT FROM OLD."projectId"
    AND (NEW."developerId" <> OLD."developerId" OR NEW."communityId" <> OLD."communityId") THEN
    NEW."projectId" := NULL;
  END IF;
  IF NEW."projectId" IS NULL THEN
    SELECT id INTO fallback_id FROM "Project" WHERE kind='DEMO'
      AND "developerId"=NEW."developerId" AND "communityId"=NEW."communityId" ORDER BY id LIMIT 1;
    IF fallback_id IS NULL THEN
      fallback_id := 'demo-auto-' || md5(NEW."developerId" || ':' || NEW."communityId");
      INSERT INTO "Project" (id,slug,kind,"developerId","nameEn","nameAr",country,city,"communityName","communityId",lat,lng,"priceBasis")
      SELECT fallback_id,fallback_id,'DEMO',NEW."developerId",'Demo Collection · ' || c."nameEn",'مجموعة تجريبية · ' || c."nameAr",
        co."nameEn",ci."nameEn",c."nameEn",c.id,c.lat,c.lng,'DEMO_ESTIMATE'
      FROM "Community" c JOIN "City" ci ON ci.id=c."cityId" JOIN "Country" co ON co.id=ci."countryId"
      WHERE c.id=NEW."communityId" ON CONFLICT (id) DO NOTHING;
    END IF;
    NEW."projectId" := fallback_id;
  END IF;
  SELECT kind,"developerId","communityId" INTO project_kind,project_developer,project_community
    FROM "Project" WHERE id=NEW."projectId" FOR SHARE;
  IF project_kind IS DISTINCT FROM 'DEMO'::"ProjectKind" OR project_developer IS DISTINCT FROM NEW."developerId"
    OR (project_community IS NOT NULL AND project_community <> NEW."communityId") THEN
    RAISE EXCEPTION 'Unit inventory requires its own fictional project and community' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "Property_provenance_guard" BEFORE INSERT OR UPDATE OF "developerId", "projectId", "communityId" ON "Property"
FOR EACH ROW EXECUTE FUNCTION "darivo_unit_provenance_guard"();
UPDATE "Property" SET "projectId"=NULL WHERE "projectId" IS NULL;
ALTER TABLE "Property" ADD CONSTRAINT "Property_project_required" CHECK ("projectId" IS NOT NULL);

CREATE FUNCTION "darivo_developer_kind_guard"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.kind <> OLD.kind AND (EXISTS (SELECT 1 FROM "Property" WHERE "developerId"=OLD.id)
    OR EXISTS (SELECT 1 FROM "Project" WHERE "developerId"=OLD.id)) THEN
    RAISE EXCEPTION 'Cannot change developer provenance while projects or units exist' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "Developer_provenance_guard" BEFORE UPDATE OF "kind" ON "Developer"
FOR EACH ROW EXECUTE FUNCTION "darivo_developer_kind_guard"();

ALTER TABLE "ReferenceFact" ADD CONSTRAINT "ReferenceFact_one_owner"
  CHECK (num_nonnulls("developerId","projectId","marketStatId")=1);
ALTER TABLE "Source" ADD CONSTRAINT "Source_retrieval_precision"
  CHECK (("retrievedAt" IS NULL) = ("retrievedDatePrecision"='UNKNOWN'));
ALTER TABLE "Source" ADD CONSTRAINT "Source_https" CHECK (url LIKE 'https://%');
ALTER TABLE "DemoPOI" ADD CONSTRAINT "DemoPOI_always_demo" CHECK ("isDemo"=true);
ALTER TABLE "Project" ADD CONSTRAINT "Project_price_pair"
  CHECK (("priceFromAmount" IS NULL) = ("priceFromCurrency" IS NULL));
ALTER TABLE "Project" ADD CONSTRAINT "Project_price_positive" CHECK ("priceFromAmount">0);
ALTER TABLE "Project" ADD CONSTRAINT "Project_coordinates" CHECK (lat BETWEEN -90 AND 90 AND lng BETWEEN -180 AND 180);
