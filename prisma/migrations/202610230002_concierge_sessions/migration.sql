CREATE TABLE "ConciergeSession" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 0,
  "snapshot" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ConciergeSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ConciergeSession_userId_key" ON "ConciergeSession"("userId");
ALTER TABLE "ConciergeSession" ADD CONSTRAINT "ConciergeSession_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ConciergeProposal" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "result" JSONB,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ConciergeProposal_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ConciergeProposal_sessionId_status_idx" ON "ConciergeProposal"("sessionId", "status");
ALTER TABLE "ConciergeProposal" ADD CONSTRAINT "ConciergeProposal_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "ConciergeSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
