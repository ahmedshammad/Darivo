-- AlterTable
ALTER TABLE "Advisor" ADD COLUMN     "availability" TEXT NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "availabilityUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "displayNameAr" TEXT NOT NULL DEFAULT 'مستشار تجريبي',
ADD COLUMN     "displayNameEn" TEXT NOT NULL DEFAULT 'Demo advisor',
ADD COLUMN     "profileKind" TEXT NOT NULL DEFAULT 'DEMO';

-- AlterTable
ALTER TABLE "Shortlist" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ViewingRequest" ADD COLUMN     "confirmedSlot" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ShortlistProjectItem" (
    "id" TEXT NOT NULL,
    "shortlistId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShortlistProjectItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientPrivacyState" (
    "userId" TEXT NOT NULL,
    "doNotSave" BOOLEAN NOT NULL DEFAULT false,
    "doNotShare" BOOLEAN NOT NULL DEFAULT false,
    "doNotBook" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientPrivacyState_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "WorkflowMutation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "clientRequestId" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowMutation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvisorAssignment" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "advisorId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "AdvisorAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvisorThread" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,

    CONSTRAINT "AdvisorThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvisorMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "attachmentRefs" JSONB NOT NULL,
    "clientRequestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdvisorMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectEnquiry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShortlistProjectItem_shortlistId_projectId_key" ON "ShortlistProjectItem"("shortlistId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowMutation_userId_kind_clientRequestId_key" ON "WorkflowMutation"("userId", "kind", "clientRequestId");

-- CreateIndex
CREATE INDEX "AdvisorAssignment_clientId_endedAt_idx" ON "AdvisorAssignment"("clientId", "endedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdvisorThread_assignmentId_key" ON "AdvisorThread"("assignmentId");

-- CreateIndex
CREATE INDEX "AdvisorMessage_threadId_createdAt_id_idx" ON "AdvisorMessage"("threadId", "createdAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "AdvisorMessage_authorId_clientRequestId_key" ON "AdvisorMessage"("authorId", "clientRequestId");

-- AddForeignKey
ALTER TABLE "ShortlistProjectItem" ADD CONSTRAINT "ShortlistProjectItem_shortlistId_fkey" FOREIGN KEY ("shortlistId") REFERENCES "Shortlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShortlistProjectItem" ADD CONSTRAINT "ShortlistProjectItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPrivacyState" ADD CONSTRAINT "ClientPrivacyState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowMutation" ADD CONSTRAINT "WorkflowMutation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvisorAssignment" ADD CONSTRAINT "AdvisorAssignment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvisorAssignment" ADD CONSTRAINT "AdvisorAssignment_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "Advisor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvisorThread" ADD CONSTRAINT "AdvisorThread_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "AdvisorAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvisorMessage" ADD CONSTRAINT "AdvisorMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "AdvisorThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvisorMessage" ADD CONSTRAINT "AdvisorMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEnquiry" ADD CONSTRAINT "ProjectEnquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEnquiry" ADD CONSTRAINT "ProjectEnquiry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEnquiry" ADD CONSTRAINT "ProjectEnquiry_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "AdvisorThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Only one current advisor relationship. Ending an assignment preserves its private history.
CREATE UNIQUE INDEX "AdvisorAssignment_one_active_client" ON "AdvisorAssignment" ("clientId") WHERE "endedAt" IS NULL;
ALTER TABLE "Advisor" ADD CONSTRAINT "Advisor_demo_profile" CHECK ("profileKind" = 'DEMO');
ALTER TABLE "Advisor" ADD CONSTRAINT "Advisor_availability" CHECK ("availability" IN ('AVAILABLE','AWAY','BY_APPOINTMENT','UNKNOWN'));
ALTER TABLE "ProjectEnquiry" ADD CONSTRAINT "ProjectEnquiry_status" CHECK ("status" IN ('REQUESTED','RESOLVED','CANCELLED'));
ALTER TABLE "AdvisorMessage" ADD CONSTRAINT "AdvisorMessage_body_bounded" CHECK (length("body") BETWEEN 1 AND 4000);

CREATE FUNCTION office_reference_target() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Project" WHERE id = NEW."projectId" AND kind = 'REAL_REFERENCE') THEN
    RAISE EXCEPTION 'Office project interests require a real reference';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER office_shortlist_reference BEFORE INSERT OR UPDATE ON "ShortlistProjectItem" FOR EACH ROW EXECUTE FUNCTION office_reference_target();
CREATE TRIGGER office_enquiry_reference BEFORE INSERT OR UPDATE ON "ProjectEnquiry" FOR EACH ROW EXECUTE FUNCTION office_reference_target();
CREATE FUNCTION office_preserve_reference_kind() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.kind <> 'REAL_REFERENCE' AND (EXISTS (SELECT 1 FROM "ShortlistProjectItem" WHERE "projectId"=OLD.id) OR EXISTS (SELECT 1 FROM "ProjectEnquiry" WHERE "projectId"=OLD.id)) THEN
    RAISE EXCEPTION 'An office reference cannot become a fictional grouping';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER office_project_kind BEFORE UPDATE OF kind ON "Project" FOR EACH ROW EXECUTE FUNCTION office_preserve_reference_kind();

-- Legacy item writes must invalidate the same board revision as new Office writes.
CREATE FUNCTION office_touch_board() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE "Shortlist" SET version = version + 1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = CASE WHEN TG_OP='DELETE' THEN OLD."shortlistId" ELSE NEW."shortlistId" END;
  RETURN NULL;
END $$;
CREATE TRIGGER office_touch_unit_items AFTER INSERT OR UPDATE OR DELETE ON "ShortlistItem" FOR EACH ROW EXECUTE FUNCTION office_touch_board();
CREATE TRIGGER office_touch_project_items AFTER INSERT OR UPDATE OR DELETE ON "ShortlistProjectItem" FOR EACH ROW EXECUTE FUNCTION office_touch_board();
CREATE FUNCTION office_rename_board() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name AND NEW.version = OLD.version THEN NEW.version = OLD.version + 1; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER office_board_name BEFORE UPDATE ON "Shortlist" FOR EACH ROW EXECUTE FUNCTION office_rename_board();

-- Persist policy only, never duplicate conversation content. A later explicit clear
-- changes this row; old snapshots must not be imported again once it exists.
INSERT INTO "ClientPrivacyState" ("userId","doNotSave","doNotShare","doNotBook",version,"updatedAt")
SELECT "userId", snapshot#>>'{brief,privacy,doNotSave}'='true', snapshot#>>'{brief,privacy,doNotShare}'='true', snapshot#>>'{brief,privacy,doNotBook}'='true', 0, CURRENT_TIMESTAMP
FROM "ConciergeSession" WHERE snapshot#>'{brief,privacy}' IS NOT NULL
ON CONFLICT ("userId") DO NOTHING;
