-- Phase 7 keeps at most one current Pattern Map and one active Weekly Action per profile.
CREATE UNIQUE INDEX "PatternMap_one_current_per_profile"
ON "PatternMap" ("profileId")
WHERE "status" IN ('READY', 'PARTIAL', 'INSUFFICIENT_DATA', 'ACKNOWLEDGED');

CREATE UNIQUE INDEX "WeeklyActionAssignment_one_active_per_profile"
ON "WeeklyActionAssignment" ("profileId")
WHERE "status" = 'ACTIVE';

ALTER TABLE "FeatureSnapshot"
ADD CONSTRAINT "FeatureSnapshot_inputCompleteness_range"
CHECK ("inputCompleteness" >= 0 AND "inputCompleteness" <= 1);

ALTER TABLE "WeeklyActionDefinition"
ADD CONSTRAINT "WeeklyActionDefinition_values_valid"
CHECK ("durationDays" > 0 AND "targetCount" > 0 AND "actionability" BETWEEN 0 AND 100);

ALTER TABLE "WeeklyActionAssignment"
ADD CONSTRAINT "WeeklyActionAssignment_progress_valid"
CHECK ("targetCount" > 0 AND "progress" >= 0 AND "progress" <= "targetCount");
