-- Results written by evaluation runs (or invalidated by a change record) become the test-derived status.
UPDATE "ControlImplementation"
SET "testStatus" = "status"
WHERE "status" IN ('VERIFIED', 'IN_PROGRESS')
  AND ("lastVerifiedAt" IS NOT NULL OR "notes" LIKE 'Evidence %' OR "notes" LIKE 'Re-test required%');

-- Statuses a user set by hand before automatic status existed are kept as manual exceptions, so nothing changes silently.
UPDATE "ControlImplementation"
SET "auto" = false, "notes" = COALESCE(NULLIF("notes", ''), 'Set manually before automatic status')
WHERE "testStatus" IS NULL AND "status" IN ('IMPLEMENTED', 'NOT_APPLICABLE', 'VERIFIED');
