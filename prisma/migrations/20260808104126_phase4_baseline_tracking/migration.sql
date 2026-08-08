-- CreateEnum
CREATE TYPE "BaselineStatus" AS ENUM ('ACTIVE', 'DAY_7_REVIEW_AVAILABLE', 'DAY_14_REVIEW_AVAILABLE', 'DATA_INSUFFICIENT', 'COMPLETED', 'PAUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BaselineReadinessStatus" AS ENUM ('PENDING', 'READY', 'PARTIALLY_READY', 'INSUFFICIENT_DATA');

-- CreateEnum
CREATE TYPE "DailyCompletenessStatus" AS ENUM ('COMPLETE', 'PARTIAL', 'MISSING');

-- CreateEnum
CREATE TYPE "MoodLevel" AS ENUM ('VERY_LOW', 'LOW', 'NEUTRAL', 'GOOD', 'VERY_GOOD');

-- CreateEnum
CREATE TYPE "BarrierCode" AS ENUM ('BUSY', 'FORGOT', 'FOOD_UNAVAILABLE', 'LACK_OF_SLEEP', 'NO_TIME_FOR_ACTIVITY', 'NONE', 'OTHER');

-- CreateEnum
CREATE TYPE "TrackingSource" AS ENUM ('MANUAL', 'APPLE_HEALTH', 'HEALTH_CONNECT', 'GARMIN', 'FITBIT', 'SAMSUNG', 'HUAWEI', 'OURA', 'OTHER');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER');

-- CreateEnum
CREATE TYPE "SleepQuality" AS ENUM ('POOR', 'FAIR', 'GOOD', 'VERY_GOOD');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('WALKING', 'RUNNING', 'CYCLING', 'STRENGTH', 'STRETCHING', 'SPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "PerceivedIntensity" AS ENUM ('LIGHT', 'MODERATE', 'VIGOROUS');

-- CreateEnum
CREATE TYPE "DigestiveSymptomType" AS ENUM ('BLOATING', 'NAUSEA', 'ABDOMINAL_PAIN', 'DIARRHEA', 'CONSTIPATION', 'HEARTBURN', 'LOW_APPETITE', 'POST_MEAL_DISCOMFORT', 'OTHER');

-- CreateEnum
CREATE TYPE "DailyTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "DailyTaskSource" AS ENUM ('SYSTEM', 'USER');

-- CreateEnum
CREATE TYPE "CompletenessScope" AS ENUM ('DAILY', 'OVERALL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditEvent" ADD VALUE 'BASELINE_STARTED';
ALTER TYPE "AuditEvent" ADD VALUE 'BASELINE_DAY_CREATED';
ALTER TYPE "AuditEvent" ADD VALUE 'DAILY_CHECKIN_UPDATED';
ALTER TYPE "AuditEvent" ADD VALUE 'MEAL_LOG_CREATED';
ALTER TYPE "AuditEvent" ADD VALUE 'MEAL_LOG_UPDATED';
ALTER TYPE "AuditEvent" ADD VALUE 'MEAL_LOG_DELETED';
ALTER TYPE "AuditEvent" ADD VALUE 'SLEEP_LOG_CREATED';
ALTER TYPE "AuditEvent" ADD VALUE 'ACTIVITY_LOG_CREATED';
ALTER TYPE "AuditEvent" ADD VALUE 'STEP_RECORD_UPDATED';
ALTER TYPE "AuditEvent" ADD VALUE 'DIGESTIVE_LOG_CREATED';
ALTER TYPE "AuditEvent" ADD VALUE 'DAY_7_CHECKPOINT_VIEWED';
ALTER TYPE "AuditEvent" ADD VALUE 'DAY_7_FEEDBACK_SUBMITTED';
ALTER TYPE "AuditEvent" ADD VALUE 'BASELINE_DAY_14_REACHED';
ALTER TYPE "AuditEvent" ADD VALUE 'BASELINE_READY';
ALTER TYPE "AuditEvent" ADD VALUE 'BASELINE_DATA_INSUFFICIENT';
ALTER TYPE "AuditEvent" ADD VALUE 'BASELINE_COMPLETED';

-- CreateTable
CREATE TABLE "BaselineSession" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "status" "BaselineStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startLocalDate" DATE NOT NULL,
    "timezone" TEXT NOT NULL,
    "currentDay" INTEGER NOT NULL DEFAULT 1,
    "targetDays" INTEGER NOT NULL DEFAULT 14,
    "calendarCompletedAt" TIMESTAMPTZ(3),
    "completedAt" TIMESTAMPTZ(3),
    "readinessStatus" "BaselineReadinessStatus" NOT NULL DEFAULT 'PENDING',
    "completenessScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "extensionAllowed" BOOLEAN NOT NULL DEFAULT true,
    "extensionDays" INTEGER NOT NULL DEFAULT 7,
    "configVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "BaselineSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyRecord" (
    "id" UUID NOT NULL,
    "baselineSessionId" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "localDate" DATE NOT NULL,
    "dayIndex" INTEGER NOT NULL,
    "completenessStatus" "DailyCompletenessStatus" NOT NULL DEFAULT 'MISSING',
    "completedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "DailyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCheckIn" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "baselineSessionId" UUID NOT NULL,
    "dailyRecordId" UUID NOT NULL,
    "localDate" DATE NOT NULL,
    "mood" "MoodLevel" NOT NULL,
    "hunger" INTEGER NOT NULL,
    "fullness" INTEGER NOT NULL,
    "energy" INTEGER,
    "bodyFeeling" TEXT,
    "barriers" "BarrierCode"[],
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "DailyCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealLog" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "baselineSessionId" UUID NOT NULL,
    "dailyRecordId" UUID NOT NULL,
    "localDate" DATE NOT NULL,
    "mealType" "MealType" NOT NULL,
    "eatenAt" TIMESTAMPTZ(3),
    "description" TEXT,
    "source" "TrackingSource" NOT NULL DEFAULT 'MANUAL',
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "sugaryDrinkConsumed" BOOLEAN,
    "lateMeal" BOOLEAN,
    "homeCooked" BOOLEAN,
    "eatingContext" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "MealLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SleepLog" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "baselineSessionId" UUID NOT NULL,
    "dailyRecordId" UUID NOT NULL,
    "localDate" DATE NOT NULL,
    "sleepStartedAt" TIMESTAMPTZ(3) NOT NULL,
    "wokeUpAt" TIMESTAMPTZ(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "perceivedQuality" "SleepQuality" NOT NULL,
    "nightAwakenings" INTEGER,
    "notes" TEXT,
    "source" "TrackingSource" NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "SleepLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "baselineSessionId" UUID NOT NULL,
    "dailyRecordId" UUID NOT NULL,
    "localDate" DATE NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "startedAt" TIMESTAMPTZ(3),
    "durationMinutes" INTEGER NOT NULL,
    "perceivedIntensity" "PerceivedIntensity" NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "source" "TrackingSource" NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepRecord" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "baselineSessionId" UUID NOT NULL,
    "dailyRecordId" UUID NOT NULL,
    "localDate" DATE NOT NULL,
    "steps" INTEGER NOT NULL,
    "source" "TrackingSource" NOT NULL DEFAULT 'MANUAL',
    "sourceDevice" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "StepRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyMeasurement" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "baselineSessionId" UUID NOT NULL,
    "dailyRecordId" UUID NOT NULL,
    "localDate" DATE NOT NULL,
    "measuredAt" TIMESTAMPTZ(3) NOT NULL,
    "weightKg" DECIMAL(6,2) NOT NULL,
    "waistCm" DECIMAL(6,2),
    "source" "TrackingSource" NOT NULL DEFAULT 'MANUAL',
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "BodyMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigestiveLog" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "baselineSessionId" UUID NOT NULL,
    "dailyRecordId" UUID NOT NULL,
    "localDate" DATE NOT NULL,
    "symptomType" "DigestiveSymptomType" NOT NULL,
    "occurredAt" TIMESTAMPTZ(3) NOT NULL,
    "intensity" INTEGER NOT NULL,
    "relatedMealId" UUID,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "DigestiveLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyTaskDefinition" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "minimumRequirement" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL,
    "contentStatus" "ContentStatus" NOT NULL DEFAULT 'DEVELOPMENT_REQUIRES_EXPERT_VALIDATION',
    "expertValidationRequired" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "DailyTaskDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyTaskInstance" (
    "id" UUID NOT NULL,
    "dailyRecordId" UUID NOT NULL,
    "definitionId" UUID NOT NULL,
    "status" "DailyTaskStatus" NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "target" INTEGER NOT NULL DEFAULT 1,
    "source" "DailyTaskSource" NOT NULL DEFAULT 'SYSTEM',
    "completedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "DailyTaskInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataCompletenessSnapshot" (
    "id" UUID NOT NULL,
    "baselineSessionId" UUID NOT NULL,
    "scope" "CompletenessScope" NOT NULL,
    "scopeKey" TEXT NOT NULL,
    "localDate" DATE,
    "status" "DailyCompletenessStatus" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "achievedDomains" TEXT[],
    "missingDomains" TEXT[],
    "domainCoverage" JSONB NOT NULL,
    "completedDays" INTEGER NOT NULL,
    "elapsedDays" INTEGER NOT NULL,
    "configVersion" TEXT NOT NULL,
    "validationStatus" TEXT NOT NULL,
    "calculatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "DataCompletenessSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Day7Checkpoint" (
    "id" UUID NOT NULL,
    "baselineSessionId" UUID NOT NULL,
    "generatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observedDays" INTEGER NOT NULL,
    "daysWithData" INTEGER NOT NULL,
    "domainCoverage" JSONB NOT NULL,
    "missingDomains" TEXT[],
    "observations" TEXT[],
    "disclaimer" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Day7Checkpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Day7Feedback" (
    "id" UUID NOT NULL,
    "baselineSessionId" UUID NOT NULL,
    "easeRating" INTEGER NOT NULL,
    "hardestDomains" TEXT[],
    "wantsToContinue" BOOLEAN NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Day7Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaselineReadinessResult" (
    "id" UUID NOT NULL,
    "baselineSessionId" UUID NOT NULL,
    "status" "BaselineReadinessStatus" NOT NULL,
    "domainCoverage" JSONB NOT NULL,
    "missingDomains" TEXT[],
    "totalDays" INTEGER NOT NULL,
    "completedDays" INTEGER NOT NULL,
    "completenessScore" DOUBLE PRECISION NOT NULL,
    "reasonCodes" TEXT[],
    "recommendation" TEXT NOT NULL,
    "configVersion" TEXT NOT NULL,
    "evaluatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "BaselineReadinessResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BaselineSession_profileId_status_idx" ON "BaselineSession"("profileId", "status");

-- CreateIndex
CREATE INDEX "BaselineSession_profileId_startedAt_idx" ON "BaselineSession"("profileId", "startedAt");

-- Enforce one open baseline per profile even under concurrent requests.
CREATE UNIQUE INDEX "BaselineSession_one_open_per_profile_key"
ON "BaselineSession"("profileId")
WHERE "status" IN ('ACTIVE', 'DAY_7_REVIEW_AVAILABLE', 'DAY_14_REVIEW_AVAILABLE', 'DATA_INSUFFICIENT', 'PAUSED');

-- Technical data-quality constraints; these are not clinical thresholds.
ALTER TABLE "BaselineSession" ADD CONSTRAINT "BaselineSession_day_bounds_check" CHECK ("currentDay" >= 1 AND "targetDays" >= 1 AND "extensionDays" >= 0);
ALTER TABLE "DailyRecord" ADD CONSTRAINT "DailyRecord_dayIndex_check" CHECK ("dayIndex" >= 1);
ALTER TABLE "DailyCheckIn" ADD CONSTRAINT "DailyCheckIn_scales_check" CHECK ("hunger" BETWEEN 1 AND 5 AND "fullness" BETWEEN 1 AND 5 AND ("energy" IS NULL OR "energy" BETWEEN 1 AND 5));
ALTER TABLE "SleepLog" ADD CONSTRAINT "SleepLog_duration_check" CHECK ("durationMinutes" > 0 AND "durationMinutes" <= 1440 AND "wokeUpAt" > "sleepStartedAt");
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_duration_check" CHECK ("durationMinutes" > 0 AND "durationMinutes" <= 1440);
ALTER TABLE "StepRecord" ADD CONSTRAINT "StepRecord_steps_check" CHECK ("steps" >= 0 AND "steps" <= 200000);
ALTER TABLE "BodyMeasurement" ADD CONSTRAINT "BodyMeasurement_values_check" CHECK ("weightKg" BETWEEN 20 AND 300 AND ("waistCm" IS NULL OR "waistCm" BETWEEN 30 AND 250));
ALTER TABLE "DigestiveLog" ADD CONSTRAINT "DigestiveLog_intensity_check" CHECK ("intensity" BETWEEN 1 AND 5);
ALTER TABLE "Day7Feedback" ADD CONSTRAINT "Day7Feedback_ease_check" CHECK ("easeRating" BETWEEN 1 AND 5);

-- CreateIndex
CREATE INDEX "DailyRecord_profileId_localDate_idx" ON "DailyRecord"("profileId", "localDate");

-- CreateIndex
CREATE INDEX "DailyRecord_baselineSessionId_dayIndex_idx" ON "DailyRecord"("baselineSessionId", "dayIndex");

-- CreateIndex
CREATE UNIQUE INDEX "DailyRecord_baselineSessionId_localDate_key" ON "DailyRecord"("baselineSessionId", "localDate");

-- CreateIndex
CREATE UNIQUE INDEX "DailyCheckIn_dailyRecordId_key" ON "DailyCheckIn"("dailyRecordId");

-- CreateIndex
CREATE INDEX "DailyCheckIn_profileId_localDate_idx" ON "DailyCheckIn"("profileId", "localDate");

-- CreateIndex
CREATE UNIQUE INDEX "DailyCheckIn_baselineSessionId_localDate_key" ON "DailyCheckIn"("baselineSessionId", "localDate");

-- CreateIndex
CREATE INDEX "MealLog_profileId_localDate_idx" ON "MealLog"("profileId", "localDate");

-- CreateIndex
CREATE INDEX "MealLog_baselineSessionId_localDate_idx" ON "MealLog"("baselineSessionId", "localDate");

-- CreateIndex
CREATE INDEX "SleepLog_profileId_localDate_idx" ON "SleepLog"("profileId", "localDate");

-- CreateIndex
CREATE INDEX "SleepLog_baselineSessionId_localDate_idx" ON "SleepLog"("baselineSessionId", "localDate");

-- CreateIndex
CREATE INDEX "ActivityLog_profileId_localDate_idx" ON "ActivityLog"("profileId", "localDate");

-- CreateIndex
CREATE INDEX "ActivityLog_baselineSessionId_localDate_idx" ON "ActivityLog"("baselineSessionId", "localDate");

-- CreateIndex
CREATE UNIQUE INDEX "StepRecord_dailyRecordId_key" ON "StepRecord"("dailyRecordId");

-- CreateIndex
CREATE INDEX "StepRecord_profileId_localDate_idx" ON "StepRecord"("profileId", "localDate");

-- CreateIndex
CREATE UNIQUE INDEX "StepRecord_baselineSessionId_localDate_key" ON "StepRecord"("baselineSessionId", "localDate");

-- CreateIndex
CREATE INDEX "BodyMeasurement_profileId_measuredAt_idx" ON "BodyMeasurement"("profileId", "measuredAt");

-- CreateIndex
CREATE INDEX "BodyMeasurement_baselineSessionId_localDate_idx" ON "BodyMeasurement"("baselineSessionId", "localDate");

-- CreateIndex
CREATE INDEX "DigestiveLog_profileId_localDate_idx" ON "DigestiveLog"("profileId", "localDate");

-- CreateIndex
CREATE INDEX "DigestiveLog_baselineSessionId_localDate_idx" ON "DigestiveLog"("baselineSessionId", "localDate");

-- CreateIndex
CREATE INDEX "DigestiveLog_relatedMealId_idx" ON "DigestiveLog"("relatedMealId");

-- CreateIndex
CREATE INDEX "DailyTaskDefinition_active_sortOrder_idx" ON "DailyTaskDefinition"("active", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "DailyTaskDefinition_code_version_key" ON "DailyTaskDefinition"("code", "version");

-- CreateIndex
CREATE INDEX "DailyTaskInstance_status_updatedAt_idx" ON "DailyTaskInstance"("status", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DailyTaskInstance_dailyRecordId_definitionId_key" ON "DailyTaskInstance"("dailyRecordId", "definitionId");

-- CreateIndex
CREATE INDEX "DataCompletenessSnapshot_baselineSessionId_scope_calculated_idx" ON "DataCompletenessSnapshot"("baselineSessionId", "scope", "calculatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DataCompletenessSnapshot_baselineSessionId_scopeKey_key" ON "DataCompletenessSnapshot"("baselineSessionId", "scopeKey");

-- CreateIndex
CREATE UNIQUE INDEX "Day7Checkpoint_baselineSessionId_key" ON "Day7Checkpoint"("baselineSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Day7Feedback_baselineSessionId_key" ON "Day7Feedback"("baselineSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "BaselineReadinessResult_baselineSessionId_key" ON "BaselineReadinessResult"("baselineSessionId");

-- AddForeignKey
ALTER TABLE "BaselineSession" ADD CONSTRAINT "BaselineSession_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRecord" ADD CONSTRAINT "DailyRecord_baselineSessionId_fkey" FOREIGN KEY ("baselineSessionId") REFERENCES "BaselineSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRecord" ADD CONSTRAINT "DailyRecord_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCheckIn" ADD CONSTRAINT "DailyCheckIn_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCheckIn" ADD CONSTRAINT "DailyCheckIn_dailyRecordId_fkey" FOREIGN KEY ("dailyRecordId") REFERENCES "DailyRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealLog" ADD CONSTRAINT "MealLog_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealLog" ADD CONSTRAINT "MealLog_baselineSessionId_fkey" FOREIGN KEY ("baselineSessionId") REFERENCES "BaselineSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealLog" ADD CONSTRAINT "MealLog_dailyRecordId_fkey" FOREIGN KEY ("dailyRecordId") REFERENCES "DailyRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SleepLog" ADD CONSTRAINT "SleepLog_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SleepLog" ADD CONSTRAINT "SleepLog_baselineSessionId_fkey" FOREIGN KEY ("baselineSessionId") REFERENCES "BaselineSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SleepLog" ADD CONSTRAINT "SleepLog_dailyRecordId_fkey" FOREIGN KEY ("dailyRecordId") REFERENCES "DailyRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_baselineSessionId_fkey" FOREIGN KEY ("baselineSessionId") REFERENCES "BaselineSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_dailyRecordId_fkey" FOREIGN KEY ("dailyRecordId") REFERENCES "DailyRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepRecord" ADD CONSTRAINT "StepRecord_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepRecord" ADD CONSTRAINT "StepRecord_baselineSessionId_fkey" FOREIGN KEY ("baselineSessionId") REFERENCES "BaselineSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepRecord" ADD CONSTRAINT "StepRecord_dailyRecordId_fkey" FOREIGN KEY ("dailyRecordId") REFERENCES "DailyRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodyMeasurement" ADD CONSTRAINT "BodyMeasurement_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodyMeasurement" ADD CONSTRAINT "BodyMeasurement_baselineSessionId_fkey" FOREIGN KEY ("baselineSessionId") REFERENCES "BaselineSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodyMeasurement" ADD CONSTRAINT "BodyMeasurement_dailyRecordId_fkey" FOREIGN KEY ("dailyRecordId") REFERENCES "DailyRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigestiveLog" ADD CONSTRAINT "DigestiveLog_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigestiveLog" ADD CONSTRAINT "DigestiveLog_baselineSessionId_fkey" FOREIGN KEY ("baselineSessionId") REFERENCES "BaselineSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigestiveLog" ADD CONSTRAINT "DigestiveLog_dailyRecordId_fkey" FOREIGN KEY ("dailyRecordId") REFERENCES "DailyRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigestiveLog" ADD CONSTRAINT "DigestiveLog_relatedMealId_fkey" FOREIGN KEY ("relatedMealId") REFERENCES "MealLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTaskInstance" ADD CONSTRAINT "DailyTaskInstance_dailyRecordId_fkey" FOREIGN KEY ("dailyRecordId") REFERENCES "DailyRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTaskInstance" ADD CONSTRAINT "DailyTaskInstance_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "DailyTaskDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataCompletenessSnapshot" ADD CONSTRAINT "DataCompletenessSnapshot_baselineSessionId_fkey" FOREIGN KEY ("baselineSessionId") REFERENCES "BaselineSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Day7Checkpoint" ADD CONSTRAINT "Day7Checkpoint_baselineSessionId_fkey" FOREIGN KEY ("baselineSessionId") REFERENCES "BaselineSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Day7Feedback" ADD CONSTRAINT "Day7Feedback_baselineSessionId_fkey" FOREIGN KEY ("baselineSessionId") REFERENCES "BaselineSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaselineReadinessResult" ADD CONSTRAINT "BaselineReadinessResult_baselineSessionId_fkey" FOREIGN KEY ("baselineSessionId") REFERENCES "BaselineSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
