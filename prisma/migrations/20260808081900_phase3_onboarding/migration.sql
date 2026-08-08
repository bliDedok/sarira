/*
  Phase 3 incremental migration.
  Existing profile, onboarding, safety answer, and safety result data is backfilled in place.
  Rollback guidance is documented in docs/phase-3/DATABASE_CHANGES.md.
*/
-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('ACCOUNT_CREATED', 'ROLE_PENDING', 'ROLE_COMPLETED', 'BIRTH_DATE_PENDING', 'GUARDIAN_CONSENT_PENDING', 'PRIVACY_CONSENT_PENDING', 'SAFETY_SCREENING_PENDING', 'GOAL_PENDING', 'QUESTIONNAIRE_PENDING', 'PROGRAM_PREFERENCE_PENDING', 'REVIEW_PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ConsentSource" AS ENUM ('ONBOARDING', 'SETTINGS', 'FEATURE_PROMPT', 'GUARDIAN_FLOW');

-- CreateEnum
CREATE TYPE "GuardianConsentStatus" AS ENUM ('GRANTED', 'REVOKED');

-- CreateEnum
CREATE TYPE "SafetySessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SafetyAnswerCode" AS ENUM ('YES', 'NO', 'NOT_SURE');

-- CreateEnum
CREATE TYPE "QuestionnaireSessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "QuestionnaireValueType" AS ENUM ('TEXT', 'NUMBER', 'SINGLE_SELECT', 'MULTI_SELECT', 'BOOLEAN', 'TIME');

-- CreateEnum
CREATE TYPE "ProgramCode" AS ENUM ('GUIDED_MEAL', 'FLEX_KITCHEN');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DEVELOPMENT_REQUIRES_EXPERT_VALIDATION', 'ACTIVE', 'RETIRED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditEvent" ADD VALUE 'ONBOARDING_STARTED';
ALTER TYPE "AuditEvent" ADD VALUE 'ROLE_SELECTED';
ALTER TYPE "AuditEvent" ADD VALUE 'DATE_OF_BIRTH_UPDATED';
ALTER TYPE "AuditEvent" ADD VALUE 'GUARDIAN_CONSENT_GRANTED';
ALTER TYPE "AuditEvent" ADD VALUE 'GUARDIAN_CONSENT_REVOKED';
ALTER TYPE "AuditEvent" ADD VALUE 'SAFETY_SCREENING_STARTED';
ALTER TYPE "AuditEvent" ADD VALUE 'SAFETY_SCREENING_COMPLETED';
ALTER TYPE "AuditEvent" ADD VALUE 'SAFETY_RESULT_CREATED';
ALTER TYPE "AuditEvent" ADD VALUE 'GOAL_SELECTED';
ALTER TYPE "AuditEvent" ADD VALUE 'QUESTIONNAIRE_STARTED';
ALTER TYPE "AuditEvent" ADD VALUE 'QUESTIONNAIRE_COMPLETED';
ALTER TYPE "AuditEvent" ADD VALUE 'PROGRAM_PREFERENCE_SELECTED';
ALTER TYPE "AuditEvent" ADD VALUE 'ONBOARDING_COMPLETED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ConsentType" ADD VALUE 'TERMS_OF_SERVICE';
ALTER TYPE "ConsentType" ADD VALUE 'PRIVACY_POLICY';
ALTER TYPE "ConsentType" ADD VALUE 'HEALTH_PROFILE';
ALTER TYPE "ConsentType" ADD VALUE 'NUTRITION_DATA';
ALTER TYPE "ConsentType" ADD VALUE 'ACTIVITY_DATA';
ALTER TYPE "ConsentType" ADD VALUE 'SLEEP_DATA';
ALTER TYPE "ConsentType" ADD VALUE 'CAMERA_FOOD';
ALTER TYPE "ConsentType" ADD VALUE 'CAMERA_WORKOUT';
ALTER TYPE "ConsentType" ADD VALUE 'LOCATION';
ALTER TYPE "ConsentType" ADD VALUE 'WEARABLE';
ALTER TYPE "ConsentType" ADD VALUE 'BODY_PHOTO';
ALTER TYPE "ConsentType" ADD VALUE 'CHILD_DATA';

-- DropIndex
DROP INDEX "Goal_profileId_idx";

-- DropIndex
DROP INDEX "SafetyScreeningSession_profileId_idx";

-- DropIndex
DROP INDEX "SafetyScreeningSession_userId_createdAt_idx";

-- DropIndex
DROP INDEX "UserConsent_profileId_idx";

-- AlterTable
ALTER TABLE "ConsentVersion" ADD COLUMN     "contentStatus" "ContentStatus" NOT NULL DEFAULT 'DEVELOPMENT_REQUIRES_EXPERT_VALIDATION',
ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "displayName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "expertValidationRequired" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "required" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "definitionId" UUID;

-- AlterTable: preserve existing profile identity and completion state.
ALTER TABLE "Profile" RENAME COLUMN "name" TO "fullName";
ALTER TABLE "Profile"
ADD COLUMN     "country" VARCHAR(2) NOT NULL DEFAULT 'ID',
ADD COLUMN     "onboardingCompletedAt" TIMESTAMPTZ(3),
ADD COLUMN     "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'ROLE_PENDING',
ADD COLUMN     "preferredLanguage" TEXT NOT NULL DEFAULT 'id-ID',
ADD COLUMN     "primaryRole" "Role",
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Asia/Makassar';
UPDATE "Profile"
SET "onboardingStatus" = CASE WHEN "onboardingCompleted" THEN 'COMPLETED'::"OnboardingStatus" ELSE 'ROLE_PENDING'::"OnboardingStatus" END,
    "onboardingCompletedAt" = CASE WHEN "onboardingCompleted" THEN "updatedAt" ELSE NULL END,
    "primaryRole" = 'USER'::"Role";
ALTER TABLE "Profile" DROP COLUMN "onboardingCompleted", ALTER COLUMN "dateOfBirth" DROP NOT NULL;

-- AlterTable: convert legacy text answers without dropping data.
ALTER TABLE "SafetyAnswer" ADD COLUMN "questionDefinitionId" UUID;
ALTER TABLE "SafetyAnswer"
ALTER COLUMN "answerCode" TYPE "SafetyAnswerCode"
USING (CASE
  WHEN UPPER("answerCode") IN ('YES', 'YA', 'TRUE') THEN 'YES'::"SafetyAnswerCode"
  WHEN UPPER("answerCode") IN ('NO', 'TIDAK', 'FALSE') THEN 'NO'::"SafetyAnswerCode"
  ELSE 'NOT_SURE'::"SafetyAnswerCode"
END);

-- AlterTable: preserve legacy reason codes as triggered rules.
ALTER TABLE "SafetyResult" RENAME COLUMN "reasonCodes" TO "triggeredRules";
ALTER TABLE "SafetyResult"
ADD COLUMN     "completedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "profileId" UUID,
ADD COLUMN     "referralRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "restrictedPrograms" TEXT[],
ADD COLUMN     "ruleVersion" TEXT NOT NULL DEFAULT 'phase2-legacy';

-- AlterTable
ALTER TABLE "SafetyScreeningSession" ADD COLUMN     "expiresAt" TIMESTAMPTZ(3),
ADD COLUMN     "ruleVersion" TEXT NOT NULL DEFAULT 'phase3-dev-v1',
ADD COLUMN     "status" "SafetySessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
ADD COLUMN     "templateId" UUID;

-- AlterTable
ALTER TABLE "UserConsent" ADD COLUMN     "source" "ConsentSource" NOT NULL DEFAULT 'ONBOARDING';

-- CreateTable
CREATE TABLE "GuardianConsent" (
    "id" UUID NOT NULL,
    "minorProfileId" UUID NOT NULL,
    "guardianName" TEXT NOT NULL,
    "guardianRelationship" TEXT NOT NULL,
    "status" "GuardianConsentStatus" NOT NULL,
    "consentVersion" TEXT NOT NULL,
    "source" "ConsentSource" NOT NULL DEFAULT 'GUARDIAN_FLOW',
    "grantedAt" TIMESTAMPTZ(3),
    "revokedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "GuardianConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyScreeningTemplate" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contentStatus" "ContentStatus" NOT NULL DEFAULT 'DEVELOPMENT_REQUIRES_EXPERT_VALIDATION',
    "expertValidationRequired" BOOLEAN NOT NULL DEFAULT true,
    "activeAt" TIMESTAMPTZ(3) NOT NULL,
    "retiredAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "SafetyScreeningTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyQuestion" (
    "id" UUID NOT NULL,
    "templateId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "helpText" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "allowsUnknown" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL,
    "applicability" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "SafetyQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyRuleDefinition" (
    "id" UUID NOT NULL,
    "templateId" UUID NOT NULL,
    "ruleId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "applicableAgeMin" INTEGER NOT NULL,
    "applicableAgeMax" INTEGER NOT NULL,
    "condition" JSONB NOT NULL,
    "severity" INTEGER NOT NULL,
    "result" "SafetyStatus" NOT NULL,
    "restrictedPrograms" TEXT[],
    "messageKey" TEXT NOT NULL,
    "referralRequired" BOOLEAN NOT NULL DEFAULT false,
    "contentStatus" "ContentStatus" NOT NULL DEFAULT 'DEVELOPMENT_REQUIRES_EXPERT_VALIDATION',
    "expertValidationRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "SafetyRuleDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalDefinition" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "minimumAge" INTEGER NOT NULL,
    "maximumAge" INTEGER NOT NULL,
    "allowedRoles" "Role"[],
    "blockedSafetyStatuses" "SafetyStatus"[],
    "priorityAgeGroups" TEXT[],
    "contentStatus" "ContentStatus" NOT NULL DEFAULT 'DEVELOPMENT_REQUIRES_EXPERT_VALIDATION',
    "expertValidationRequired" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "GoalDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireTemplate" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contentStatus" "ContentStatus" NOT NULL DEFAULT 'DEVELOPMENT_REQUIRES_EXPERT_VALIDATION',
    "expertValidationRequired" BOOLEAN NOT NULL DEFAULT true,
    "activeAt" TIMESTAMPTZ(3) NOT NULL,
    "retiredAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "QuestionnaireTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireQuestion" (
    "id" UUID NOT NULL,
    "templateId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "helpText" TEXT,
    "valueType" "QuestionnaireValueType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL,
    "validation" JSONB,
    "visibleWhen" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "QuestionnaireQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireOption" (
    "id" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "QuestionnaireOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "templateId" UUID NOT NULL,
    "status" "QuestionnaireSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "QuestionnaireSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireAnswer" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "QuestionnaireAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramPreference" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "program" "ProgramCode" NOT NULL,
    "selectedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ProgramPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingProgress" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'ROLE_PENDING',
    "currentStep" TEXT NOT NULL DEFAULT 'role-selection',
    "lastCompletedStep" TEXT,
    "stateVersion" INTEGER NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "OnboardingProgress_pkey" PRIMARY KEY ("id")
);

-- Backfill resumable progress for existing profiles without resetting user data.
INSERT INTO "OnboardingProgress" (
  "id", "userId", "profileId", "status", "currentStep", "lastCompletedStep", "stateVersion", "startedAt", "completedAt", "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid(), p."userId", p."id", p."onboardingStatus",
  CASE WHEN p."onboardingStatus" = 'COMPLETED'::"OnboardingStatus" THEN 'starter-journey' ELSE 'role-selection' END,
  CASE WHEN p."onboardingStatus" = 'COMPLETED'::"OnboardingStatus" THEN 'profile-summary' ELSE NULL END,
  1, p."createdAt", p."onboardingCompletedAt", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Profile" p;

-- Preserve links for historical safety results where possible.
UPDATE "SafetyResult" r
SET "profileId" = s."profileId",
    "ruleVersion" = COALESCE(s."ruleVersion", 'phase2-legacy'),
    "restrictedPrograms" = COALESCE(r."restrictedPrograms", ARRAY[]::TEXT[])
FROM "SafetyScreeningSession" s
WHERE r."sessionId" = s."id";

-- CreateIndex
CREATE INDEX "GuardianConsent_minorProfileId_status_createdAt_idx" ON "GuardianConsent"("minorProfileId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "SafetyScreeningTemplate_activeAt_retiredAt_idx" ON "SafetyScreeningTemplate"("activeAt", "retiredAt");

-- CreateIndex
CREATE UNIQUE INDEX "SafetyScreeningTemplate_code_version_key" ON "SafetyScreeningTemplate"("code", "version");

-- CreateIndex
CREATE INDEX "SafetyQuestion_templateId_sortOrder_idx" ON "SafetyQuestion"("templateId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SafetyQuestion_templateId_code_key" ON "SafetyQuestion"("templateId", "code");

-- CreateIndex
CREATE INDEX "SafetyRuleDefinition_templateId_result_idx" ON "SafetyRuleDefinition"("templateId", "result");

-- CreateIndex
CREATE UNIQUE INDEX "SafetyRuleDefinition_ruleId_version_key" ON "SafetyRuleDefinition"("ruleId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "GoalDefinition_code_key" ON "GoalDefinition"("code");

-- CreateIndex
CREATE INDEX "GoalDefinition_active_minimumAge_maximumAge_idx" ON "GoalDefinition"("active", "minimumAge", "maximumAge");

-- CreateIndex
CREATE INDEX "QuestionnaireTemplate_activeAt_retiredAt_idx" ON "QuestionnaireTemplate"("activeAt", "retiredAt");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireTemplate_code_version_key" ON "QuestionnaireTemplate"("code", "version");

-- CreateIndex
CREATE INDEX "QuestionnaireQuestion_templateId_section_sortOrder_idx" ON "QuestionnaireQuestion"("templateId", "section", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireQuestion_templateId_code_key" ON "QuestionnaireQuestion"("templateId", "code");

-- CreateIndex
CREATE INDEX "QuestionnaireOption_questionId_sortOrder_idx" ON "QuestionnaireOption"("questionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireOption_questionId_code_key" ON "QuestionnaireOption"("questionId", "code");

-- CreateIndex
CREATE INDEX "QuestionnaireSession_userId_status_updatedAt_idx" ON "QuestionnaireSession"("userId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "QuestionnaireSession_profileId_status_idx" ON "QuestionnaireSession"("profileId", "status");

-- CreateIndex
CREATE INDEX "QuestionnaireSession_templateId_status_idx" ON "QuestionnaireSession"("templateId", "status");

-- CreateIndex
CREATE INDEX "QuestionnaireAnswer_questionId_idx" ON "QuestionnaireAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireAnswer_sessionId_questionId_key" ON "QuestionnaireAnswer"("sessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramPreference_profileId_key" ON "ProgramPreference"("profileId");

-- CreateIndex
CREATE INDEX "ProgramPreference_program_idx" ON "ProgramPreference"("program");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingProgress_userId_key" ON "OnboardingProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingProgress_profileId_key" ON "OnboardingProgress"("profileId");

-- CreateIndex
CREATE INDEX "OnboardingProgress_status_updatedAt_idx" ON "OnboardingProgress"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "ConsentVersion_required_activeAt_idx" ON "ConsentVersion"("required", "activeAt");

-- CreateIndex
CREATE INDEX "Goal_profileId_status_idx" ON "Goal"("profileId", "status");

-- CreateIndex
CREATE INDEX "Goal_definitionId_idx" ON "Goal"("definitionId");

-- CreateIndex
CREATE INDEX "Profile_onboardingStatus_idx" ON "Profile"("onboardingStatus");

-- CreateIndex
CREATE INDEX "SafetyAnswer_questionDefinitionId_idx" ON "SafetyAnswer"("questionDefinitionId");

-- CreateIndex
CREATE INDEX "SafetyResult_profileId_status_completedAt_idx" ON "SafetyResult"("profileId", "status", "completedAt");

-- CreateIndex
CREATE INDEX "SafetyScreeningSession_userId_status_createdAt_idx" ON "SafetyScreeningSession"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "SafetyScreeningSession_profileId_status_idx" ON "SafetyScreeningSession"("profileId", "status");

-- CreateIndex
CREATE INDEX "SafetyScreeningSession_templateId_idx" ON "SafetyScreeningSession"("templateId");

-- CreateIndex
CREATE INDEX "UserConsent_profileId_status_idx" ON "UserConsent"("profileId", "status");

-- AddForeignKey
ALTER TABLE "GuardianConsent" ADD CONSTRAINT "GuardianConsent_minorProfileId_fkey" FOREIGN KEY ("minorProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyQuestion" ADD CONSTRAINT "SafetyQuestion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "SafetyScreeningTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyRuleDefinition" ADD CONSTRAINT "SafetyRuleDefinition_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "SafetyScreeningTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyScreeningSession" ADD CONSTRAINT "SafetyScreeningSession_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "SafetyScreeningTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyAnswer" ADD CONSTRAINT "SafetyAnswer_questionDefinitionId_fkey" FOREIGN KEY ("questionDefinitionId") REFERENCES "SafetyQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyResult" ADD CONSTRAINT "SafetyResult_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "GoalDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireQuestion" ADD CONSTRAINT "QuestionnaireQuestion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "QuestionnaireTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireOption" ADD CONSTRAINT "QuestionnaireOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionnaireQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireSession" ADD CONSTRAINT "QuestionnaireSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireSession" ADD CONSTRAINT "QuestionnaireSession_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireSession" ADD CONSTRAINT "QuestionnaireSession_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "QuestionnaireTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireAnswer" ADD CONSTRAINT "QuestionnaireAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "QuestionnaireSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireAnswer" ADD CONSTRAINT "QuestionnaireAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionnaireQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramPreference" ADD CONSTRAINT "ProgramPreference_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingProgress" ADD CONSTRAINT "OnboardingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingProgress" ADD CONSTRAINT "OnboardingProgress_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
