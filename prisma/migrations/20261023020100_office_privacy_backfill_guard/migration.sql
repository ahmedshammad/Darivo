-- Fail closed for legacy policy values that were not strict JSON booleans.
-- The previous applied migration is deliberately immutable. Its NOT NULL checks
-- still stop an upgrade with missing/null flag values before this migration runs.
-- No conversation text is modified, copied, or inferred here.
INSERT INTO "ClientPrivacyState" ("userId", "doNotSave", "doNotShare", "doNotBook", "version", "updatedAt")
SELECT "userId", true, true, true, 0, CURRENT_TIMESTAMP
FROM "ConciergeSession"
WHERE jsonb_typeof(snapshot #> '{brief,privacy,doNotSave}') IS DISTINCT FROM 'boolean'
   OR jsonb_typeof(snapshot #> '{brief,privacy,doNotShare}') IS DISTINCT FROM 'boolean'
   OR jsonb_typeof(snapshot #> '{brief,privacy,doNotBook}') IS DISTINCT FROM 'boolean'
ON CONFLICT ("userId") DO UPDATE SET
  "doNotSave" = true,
  "doNotShare" = true,
  "doNotBook" = true,
  "version" = "ClientPrivacyState"."version" + 1,
  "updatedAt" = CURRENT_TIMESTAMP;
