-- Phase 7.5A keeps dateOfBirth nullable for legacy profiles while allowing new
-- profiles to record an explicitly confirmed age without fabricating a DOB.
ALTER TABLE "Profile"
ADD COLUMN "declaredAge" INTEGER,
ADD COLUMN "ageRecordedAt" TIMESTAMPTZ(3);

ALTER TABLE "Profile"
ADD CONSTRAINT "Profile_declared_age_range_check"
CHECK (
  ("declaredAge" IS NULL AND "ageRecordedAt" IS NULL)
  OR
  ("declaredAge" BETWEEN 12 AND 75 AND "ageRecordedAt" IS NOT NULL)
);
