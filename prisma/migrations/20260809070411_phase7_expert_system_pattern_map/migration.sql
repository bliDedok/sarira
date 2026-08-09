-- CreateEnum
CREATE TYPE "PatternDomain" AS ENUM ('PORTION_INTAKE', 'SUGARY_ENERGY_DENSE', 'SLEEP', 'ACTIVITY_SEDENTARY', 'CONTEXTUAL_EATING', 'MEAL_BALANCE_REGULARITY');

-- CreateEnum
CREATE TYPE "AnalysisDataQuality" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'INSUFFICIENT');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('READY', 'PARTIAL', 'INSUFFICIENT_DATA');

-- CreateEnum
CREATE TYPE "PatternMapStatus" AS ENUM ('READY', 'PARTIAL', 'INSUFFICIENT_DATA', 'ACKNOWLEDGED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "PatternMapFeedbackValue" AS ENUM ('VERY_ACCURATE', 'FAIRLY_ACCURATE', 'LESS_ACCURATE', 'UNSURE');

-- CreateEnum
CREATE TYPE "WeeklyActionAssignmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PARTIAL', 'SKIPPED', 'REPLACED');

-- CreateEnum
CREATE TYPE "WeeklyActionCompletionSource" AS ENUM ('AUTO_VERIFIED', 'USER_CONFIRMED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditEvent" ADD VALUE 'FEATURE_SNAPSHOT_GENERATED';
ALTER TYPE "AuditEvent" ADD VALUE 'PATTERN_MAP_GENERATED';
ALTER TYPE "AuditEvent" ADD VALUE 'PATTERN_MAP_FEEDBACK_SAVED';
ALTER TYPE "AuditEvent" ADD VALUE 'WEEKLY_ACTION_ASSIGNED';
ALTER TYPE "AuditEvent" ADD VALUE 'WEEKLY_ACTION_CHECKED_IN';
ALTER TYPE "AuditEvent" ADD VALUE 'WEEKLY_ACTION_CHECKIN_REMOVED';

-- CreateTable
CREATE TABLE "FeatureSnapshot" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "baselineSessionId" UUID NOT NULL,
    "featureEngineVersion" TEXT NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "generatedAt" TIMESTAMPTZ(3) NOT NULL,
    "inputCompleteness" DOUBLE PRECISION NOT NULL,
    "features" JSONB NOT NULL,
    "missingFeatures" TEXT[],
    "warnings" TEXT[],
    "inputSignature" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatternScoringPolicy" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "configuration" JSONB NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "requiresExpertValidation" BOOLEAN NOT NULL DEFAULT true,
    "validationLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PatternScoringPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatternRuleDefinition" (
    "id" UUID NOT NULL,
    "ruleId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "domain" "PatternDomain" NOT NULL,
    "description" TEXT NOT NULL,
    "requiredFeatures" TEXT[],
    "condition" JSONB NOT NULL,
    "contribution" DOUBLE PRECISION NOT NULL,
    "strengthCategory" TEXT NOT NULL,
    "evidenceRequirement" JSONB NOT NULL,
    "exclusions" TEXT[],
    "actionCandidateCodes" TEXT[],
    "agePacks" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "requiresExpertValidation" BOOLEAN NOT NULL DEFAULT true,
    "validationLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PatternRuleDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionRecord" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "baselineSessionId" UUID NOT NULL,
    "featureSnapshotId" UUID NOT NULL,
    "expertSystemVersion" TEXT NOT NULL,
    "scoringPolicyVersion" TEXT NOT NULL,
    "weeklyActionPolicyVersion" TEXT NOT NULL,
    "status" "AnalysisStatus" NOT NULL,
    "primaryPatternCode" TEXT,
    "supportingPatternCodes" TEXT[],
    "selectedActionCode" TEXT,
    "dataQuality" "AnalysisDataQuality" NOT NULL,
    "domainScores" JSONB NOT NULL,
    "limitations" TEXT[],
    "ruleVersions" TEXT[],
    "inputSignature" TEXT NOT NULL,
    "generatedAt" TIMESTAMPTZ(3) NOT NULL,
    "supersededAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecisionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleEvaluation" (
    "id" UUID NOT NULL,
    "decisionRecordId" UUID NOT NULL,
    "ruleDefinitionId" UUID NOT NULL,
    "ruleId" TEXT NOT NULL,
    "ruleVersion" TEXT NOT NULL,
    "domain" "PatternDomain" NOT NULL,
    "matched" BOOLEAN NOT NULL,
    "contribution" DOUBLE PRECISION NOT NULL,
    "observedValues" JSONB NOT NULL,
    "reasonCodes" TEXT[],
    "evidenceRefs" TEXT[],
    "limitations" TEXT[],
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RuleEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatternMap" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "baselineSessionId" UUID NOT NULL,
    "featureSnapshotId" UUID NOT NULL,
    "decisionRecordId" UUID NOT NULL,
    "status" "PatternMapStatus" NOT NULL,
    "primaryPattern" JSONB,
    "supportingPatterns" JSONB NOT NULL,
    "domains" JSONB NOT NULL,
    "dataQuality" "AnalysisDataQuality" NOT NULL,
    "limitations" TEXT[],
    "generatedAt" TIMESTAMPTZ(3) NOT NULL,
    "acknowledgedAt" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PatternMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatternMapFeedback" (
    "id" UUID NOT NULL,
    "patternMapId" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "value" "PatternMapFeedbackValue" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatternMapFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyActionDefinition" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "domain" "PatternDomain" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "targetCount" INTEGER NOT NULL,
    "ageEligibility" TEXT[],
    "safetyRestrictions" "SafetyStatus"[],
    "requiredEvidence" TEXT[],
    "actionability" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "requiresExpertValidation" BOOLEAN NOT NULL DEFAULT true,
    "validationLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "WeeklyActionDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyActionAssignment" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "patternMapId" UUID NOT NULL,
    "actionDefinitionId" UUID NOT NULL,
    "assignedAt" TIMESTAMPTZ(3) NOT NULL,
    "weekStart" DATE NOT NULL,
    "weekEnd" DATE NOT NULL,
    "targetCount" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" "WeeklyActionAssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "completedAt" TIMESTAMPTZ(3),
    "reasonCodes" TEXT[],
    "alternatives" JSONB NOT NULL,
    "selectionVersion" TEXT NOT NULL,
    "why" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "WeeklyActionAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyActionCheckIn" (
    "id" UUID NOT NULL,
    "assignmentId" UUID NOT NULL,
    "localDate" DATE NOT NULL,
    "source" "WeeklyActionCompletionSource" NOT NULL,
    "evidenceRef" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyActionCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeatureSnapshot_profileId_generatedAt_idx" ON "FeatureSnapshot"("profileId", "generatedAt");

-- CreateIndex
CREATE INDEX "FeatureSnapshot_baselineSessionId_createdAt_idx" ON "FeatureSnapshot"("baselineSessionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureSnapshot_baselineSessionId_featureEngineVersion_inpu_key" ON "FeatureSnapshot"("baselineSessionId", "featureEngineVersion", "inputSignature");

-- CreateIndex
CREATE INDEX "PatternScoringPolicy_active_effectiveFrom_effectiveTo_idx" ON "PatternScoringPolicy"("active", "effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE UNIQUE INDEX "PatternScoringPolicy_code_version_key" ON "PatternScoringPolicy"("code", "version");

-- CreateIndex
CREATE INDEX "PatternRuleDefinition_domain_active_idx" ON "PatternRuleDefinition"("domain", "active");

-- CreateIndex
CREATE UNIQUE INDEX "PatternRuleDefinition_ruleId_version_key" ON "PatternRuleDefinition"("ruleId", "version");

-- CreateIndex
CREATE INDEX "DecisionRecord_profileId_generatedAt_idx" ON "DecisionRecord"("profileId", "generatedAt");

-- CreateIndex
CREATE INDEX "DecisionRecord_baselineSessionId_supersededAt_idx" ON "DecisionRecord"("baselineSessionId", "supersededAt");

-- CreateIndex
CREATE UNIQUE INDEX "DecisionRecord_featureSnapshotId_expertSystemVersion_scorin_key" ON "DecisionRecord"("featureSnapshotId", "expertSystemVersion", "scoringPolicyVersion", "weeklyActionPolicyVersion");

-- CreateIndex
CREATE INDEX "RuleEvaluation_ruleId_matched_idx" ON "RuleEvaluation"("ruleId", "matched");

-- CreateIndex
CREATE INDEX "RuleEvaluation_domain_matched_idx" ON "RuleEvaluation"("domain", "matched");

-- CreateIndex
CREATE UNIQUE INDEX "RuleEvaluation_decisionRecordId_ruleId_ruleVersion_key" ON "RuleEvaluation"("decisionRecordId", "ruleId", "ruleVersion");

-- CreateIndex
CREATE UNIQUE INDEX "PatternMap_decisionRecordId_key" ON "PatternMap"("decisionRecordId");

-- CreateIndex
CREATE INDEX "PatternMap_profileId_status_generatedAt_idx" ON "PatternMap"("profileId", "status", "generatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PatternMap_baselineSessionId_version_key" ON "PatternMap"("baselineSessionId", "version");

-- CreateIndex
CREATE INDEX "PatternMapFeedback_patternMapId_createdAt_idx" ON "PatternMapFeedback"("patternMapId", "createdAt");

-- CreateIndex
CREATE INDEX "PatternMapFeedback_profileId_createdAt_idx" ON "PatternMapFeedback"("profileId", "createdAt");

-- CreateIndex
CREATE INDEX "WeeklyActionDefinition_domain_active_idx" ON "WeeklyActionDefinition"("domain", "active");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyActionDefinition_code_version_key" ON "WeeklyActionDefinition"("code", "version");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyActionAssignment_patternMapId_key" ON "WeeklyActionAssignment"("patternMapId");

-- CreateIndex
CREATE INDEX "WeeklyActionAssignment_profileId_status_weekStart_idx" ON "WeeklyActionAssignment"("profileId", "status", "weekStart");

-- CreateIndex
CREATE INDEX "WeeklyActionAssignment_actionDefinitionId_assignedAt_idx" ON "WeeklyActionAssignment"("actionDefinitionId", "assignedAt");

-- CreateIndex
CREATE INDEX "WeeklyActionCheckIn_localDate_source_idx" ON "WeeklyActionCheckIn"("localDate", "source");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyActionCheckIn_assignmentId_localDate_key" ON "WeeklyActionCheckIn"("assignmentId", "localDate");

-- AddForeignKey
ALTER TABLE "FeatureSnapshot" ADD CONSTRAINT "FeatureSnapshot_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureSnapshot" ADD CONSTRAINT "FeatureSnapshot_baselineSessionId_fkey" FOREIGN KEY ("baselineSessionId") REFERENCES "BaselineSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionRecord" ADD CONSTRAINT "DecisionRecord_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionRecord" ADD CONSTRAINT "DecisionRecord_baselineSessionId_fkey" FOREIGN KEY ("baselineSessionId") REFERENCES "BaselineSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionRecord" ADD CONSTRAINT "DecisionRecord_featureSnapshotId_fkey" FOREIGN KEY ("featureSnapshotId") REFERENCES "FeatureSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleEvaluation" ADD CONSTRAINT "RuleEvaluation_decisionRecordId_fkey" FOREIGN KEY ("decisionRecordId") REFERENCES "DecisionRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleEvaluation" ADD CONSTRAINT "RuleEvaluation_ruleDefinitionId_fkey" FOREIGN KEY ("ruleDefinitionId") REFERENCES "PatternRuleDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatternMap" ADD CONSTRAINT "PatternMap_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatternMap" ADD CONSTRAINT "PatternMap_baselineSessionId_fkey" FOREIGN KEY ("baselineSessionId") REFERENCES "BaselineSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatternMap" ADD CONSTRAINT "PatternMap_featureSnapshotId_fkey" FOREIGN KEY ("featureSnapshotId") REFERENCES "FeatureSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatternMap" ADD CONSTRAINT "PatternMap_decisionRecordId_fkey" FOREIGN KEY ("decisionRecordId") REFERENCES "DecisionRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatternMapFeedback" ADD CONSTRAINT "PatternMapFeedback_patternMapId_fkey" FOREIGN KEY ("patternMapId") REFERENCES "PatternMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatternMapFeedback" ADD CONSTRAINT "PatternMapFeedback_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyActionAssignment" ADD CONSTRAINT "WeeklyActionAssignment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyActionAssignment" ADD CONSTRAINT "WeeklyActionAssignment_patternMapId_fkey" FOREIGN KEY ("patternMapId") REFERENCES "PatternMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyActionAssignment" ADD CONSTRAINT "WeeklyActionAssignment_actionDefinitionId_fkey" FOREIGN KEY ("actionDefinitionId") REFERENCES "WeeklyActionDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyActionCheckIn" ADD CONSTRAINT "WeeklyActionCheckIn_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "WeeklyActionAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
