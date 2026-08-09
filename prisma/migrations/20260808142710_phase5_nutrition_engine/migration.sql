-- CreateEnum
CREATE TYPE "FoodCategory" AS ENUM ('GRAIN', 'PROTEIN', 'VEGETABLE', 'FRUIT', 'DAIRY', 'BEVERAGE', 'SNACK', 'CONDIMENT', 'MIXED_DISH', 'OTHER');

-- CreateEnum
CREATE TYPE "FoodUnit" AS ENUM ('G', 'KG', 'ML', 'L', 'PIECE', 'SERVING', 'TBSP', 'TSP', 'CUP');

-- CreateEnum
CREATE TYPE "FoodSourceType" AS ENUM ('OFFICIAL_DATABASE', 'PRODUCT_LABEL', 'INTERNAL_VERIFIED', 'USER_ENTERED', 'SYNTHETIC_TEST_DATA');

-- CreateEnum
CREATE TYPE "MealItemSource" AS ENUM ('DATABASE_FOOD', 'CUSTOM_FOOD', 'USER_ENTERED');

-- CreateEnum
CREATE TYPE "AllergenCode" AS ENUM ('MILK', 'EGG', 'FISH', 'SHELLFISH', 'PEANUT', 'TREE_NUT', 'SOY', 'WHEAT', 'SESAME', 'OTHER');

-- CreateEnum
CREATE TYPE "DietaryTagCode" AS ENUM ('VEGETARIAN', 'VEGAN', 'HALAL_VERIFIED', 'PORK', 'ALCOHOL', 'OTHER');

-- CreateEnum
CREATE TYPE "DietaryTagStatus" AS ENUM ('VERIFIED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "NutritionPolicyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DEPRECATED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditEvent" ADD VALUE 'MEAL_LOG_ITEM_CREATED';
ALTER TYPE "AuditEvent" ADD VALUE 'MEAL_LOG_ITEM_UPDATED';
ALTER TYPE "AuditEvent" ADD VALUE 'MEAL_LOG_ITEM_DELETED';
ALTER TYPE "AuditEvent" ADD VALUE 'NUTRITION_TARGET_CALCULATED';
ALTER TYPE "AuditEvent" ADD VALUE 'NUTRITION_DAILY_VIEWED';

-- AlterTable
ALTER TABLE "SafetyResult" ALTER COLUMN "ruleVersion" SET DEFAULT 'phase3-dev-v1';

-- CreateTable
CREATE TABLE "FoodDataSource" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "sourceType" "FoodSourceType" NOT NULL,
    "sourceUrl" TEXT,
    "license" TEXT NOT NULL,
    "datasetLabel" TEXT NOT NULL,
    "importedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMPTZ(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "FoodDataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodItem" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alternateNames" TEXT[],
    "category" "FoodCategory" NOT NULL,
    "description" TEXT,
    "defaultServingId" UUID,
    "sourceId" UUID NOT NULL,
    "sourceVersion" TEXT NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL DEFAULT 'ID',
    "language" TEXT NOT NULL DEFAULT 'id-ID',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "FoodItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodServing" (
    "id" UUID NOT NULL,
    "foodItemId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit" "FoodUnit" NOT NULL,
    "gramEquivalent" DECIMAL(10,3),
    "defaultServing" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "FoodServing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutrientDefinition" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "decimalPrecision" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "NutrientDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodNutrient" (
    "id" UUID NOT NULL,
    "foodItemId" UUID NOT NULL,
    "nutrientId" UUID NOT NULL,
    "amount" DECIMAL(14,6) NOT NULL,
    "unit" TEXT NOT NULL,
    "basisAmount" DECIMAL(10,3) NOT NULL DEFAULT 100,
    "basisUnit" "FoodUnit" NOT NULL DEFAULT 'G',
    "sourceId" UUID NOT NULL,
    "sourceVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "FoodNutrient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodAllergen" (
    "id" UUID NOT NULL,
    "foodItemId" UUID NOT NULL,
    "code" "AllergenCode" NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "sourceNote" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "FoodAllergen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodDietaryTag" (
    "id" UUID NOT NULL,
    "foodItemId" UUID NOT NULL,
    "code" "DietaryTagCode" NOT NULL,
    "status" "DietaryTagStatus" NOT NULL DEFAULT 'UNKNOWN',
    "sourceNote" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "FoodDietaryTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealLogItem" (
    "id" UUID NOT NULL,
    "mealLogId" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "foodItemId" UUID,
    "servingId" UUID,
    "itemSource" "MealItemSource" NOT NULL DEFAULT 'DATABASE_FOOD',
    "customName" TEXT,
    "quantity" DECIMAL(10,3) NOT NULL,
    "gramAmount" DECIMAL(10,3),
    "sourceVersion" TEXT NOT NULL,
    "allergenWarnings" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "MealLogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionSnapshot" (
    "id" UUID NOT NULL,
    "mealLogItemId" UUID NOT NULL,
    "sourceVersion" TEXT NOT NULL,
    "foodName" TEXT NOT NULL,
    "gramAmount" DECIMAL(10,3),
    "energyKcal" DECIMAL(14,6),
    "proteinG" DECIMAL(14,6),
    "carbohydrateG" DECIMAL(14,6),
    "fatG" DECIMAL(14,6),
    "saturatedFatG" DECIMAL(14,6),
    "fiberG" DECIMAL(14,6),
    "sugarG" DECIMAL(14,6),
    "sodiumMg" DECIMAL(14,6),
    "missingNutrients" TEXT[],
    "complete" BOOLEAN NOT NULL,
    "calculationVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "NutritionSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionPolicy" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "ageMin" INTEGER NOT NULL,
    "ageMax" INTEGER NOT NULL,
    "applicableSex" "Gender",
    "applicableGoals" TEXT[],
    "applicableSafetyStatuses" "SafetyStatus"[],
    "status" "NutritionPolicyStatus" NOT NULL DEFAULT 'DRAFT',
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "targetConfiguration" JSONB NOT NULL,
    "sourceMetadata" JSONB NOT NULL,
    "requiresExpertValidation" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "NutritionPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionTargetProfile" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "policyId" UUID NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "energyMin" DECIMAL(10,2),
    "energyTarget" DECIMAL(10,2),
    "energyMax" DECIMAL(10,2),
    "proteinMin" DECIMAL(10,2),
    "proteinTarget" DECIMAL(10,2),
    "carbsMin" DECIMAL(10,2),
    "carbsMax" DECIMAL(10,2),
    "fatMin" DECIMAL(10,2),
    "fatMax" DECIMAL(10,2),
    "fiberMin" DECIMAL(10,2),
    "sugarMax" DECIMAL(10,2),
    "sodiumMax" DECIMAL(10,2),
    "saturatedFatMax" DECIMAL(10,2),
    "inputValues" JSONB NOT NULL,
    "calculationReason" TEXT NOT NULL,
    "safetyStatus" "SafetyStatus" NOT NULL,
    "restrictionReasons" TEXT[],
    "requiresExpertValidation" BOOLEAN NOT NULL DEFAULT true,
    "calculatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "NutritionTargetProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FoodDataSource_sourceType_active_idx" ON "FoodDataSource"("sourceType", "active");

-- CreateIndex
CREATE UNIQUE INDEX "FoodDataSource_name_version_key" ON "FoodDataSource"("name", "version");

-- CreateIndex
CREATE UNIQUE INDEX "FoodItem_code_key" ON "FoodItem"("code");

-- CreateIndex
CREATE UNIQUE INDEX "FoodItem_defaultServingId_key" ON "FoodItem"("defaultServingId");

-- CreateIndex
CREATE INDEX "FoodItem_name_idx" ON "FoodItem"("name");

-- CreateIndex
CREATE INDEX "FoodItem_category_active_idx" ON "FoodItem"("category", "active");

-- CreateIndex
CREATE INDEX "FoodItem_sourceId_active_idx" ON "FoodItem"("sourceId", "active");

-- CreateIndex
CREATE INDEX "FoodServing_foodItemId_defaultServing_idx" ON "FoodServing"("foodItemId", "defaultServing");

-- CreateIndex
CREATE UNIQUE INDEX "FoodServing_foodItemId_label_key" ON "FoodServing"("foodItemId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "NutrientDefinition_code_key" ON "NutrientDefinition"("code");

-- CreateIndex
CREATE INDEX "NutrientDefinition_active_category_idx" ON "NutrientDefinition"("active", "category");

-- CreateIndex
CREATE INDEX "FoodNutrient_foodItemId_idx" ON "FoodNutrient"("foodItemId");

-- CreateIndex
CREATE INDEX "FoodNutrient_nutrientId_idx" ON "FoodNutrient"("nutrientId");

-- CreateIndex
CREATE INDEX "FoodNutrient_sourceId_idx" ON "FoodNutrient"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "FoodNutrient_foodItemId_nutrientId_key" ON "FoodNutrient"("foodItemId", "nutrientId");

-- CreateIndex
CREATE INDEX "FoodAllergen_code_verified_idx" ON "FoodAllergen"("code", "verified");

-- CreateIndex
CREATE UNIQUE INDEX "FoodAllergen_foodItemId_code_key" ON "FoodAllergen"("foodItemId", "code");

-- CreateIndex
CREATE INDEX "FoodDietaryTag_code_status_idx" ON "FoodDietaryTag"("code", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FoodDietaryTag_foodItemId_code_key" ON "FoodDietaryTag"("foodItemId", "code");

-- CreateIndex
CREATE INDEX "MealLogItem_mealLogId_idx" ON "MealLogItem"("mealLogId");

-- CreateIndex
CREATE INDEX "MealLogItem_foodItemId_idx" ON "MealLogItem"("foodItemId");

-- CreateIndex
CREATE INDEX "MealLogItem_profileId_createdAt_idx" ON "MealLogItem"("profileId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NutritionSnapshot_mealLogItemId_key" ON "NutritionSnapshot"("mealLogItemId");

-- CreateIndex
CREATE INDEX "NutritionSnapshot_sourceVersion_idx" ON "NutritionSnapshot"("sourceVersion");

-- CreateIndex
CREATE INDEX "NutritionPolicy_status_ageMin_ageMax_effectiveFrom_idx" ON "NutritionPolicy"("status", "ageMin", "ageMax", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "NutritionPolicy_code_version_key" ON "NutritionPolicy"("code", "version");

-- CreateIndex
CREATE INDEX "NutritionTargetProfile_profileId_effectiveFrom_effectiveTo_idx" ON "NutritionTargetProfile"("profileId", "effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE INDEX "NutritionTargetProfile_policyId_calculatedAt_idx" ON "NutritionTargetProfile"("policyId", "calculatedAt");

-- AddForeignKey
ALTER TABLE "FoodItem" ADD CONSTRAINT "FoodItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "FoodDataSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodItem" ADD CONSTRAINT "FoodItem_defaultServingId_fkey" FOREIGN KEY ("defaultServingId") REFERENCES "FoodServing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodServing" ADD CONSTRAINT "FoodServing_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodNutrient" ADD CONSTRAINT "FoodNutrient_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodNutrient" ADD CONSTRAINT "FoodNutrient_nutrientId_fkey" FOREIGN KEY ("nutrientId") REFERENCES "NutrientDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodNutrient" ADD CONSTRAINT "FoodNutrient_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "FoodDataSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodAllergen" ADD CONSTRAINT "FoodAllergen_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodDietaryTag" ADD CONSTRAINT "FoodDietaryTag_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealLogItem" ADD CONSTRAINT "MealLogItem_mealLogId_fkey" FOREIGN KEY ("mealLogId") REFERENCES "MealLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealLogItem" ADD CONSTRAINT "MealLogItem_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealLogItem" ADD CONSTRAINT "MealLogItem_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealLogItem" ADD CONSTRAINT "MealLogItem_servingId_fkey" FOREIGN KEY ("servingId") REFERENCES "FoodServing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionSnapshot" ADD CONSTRAINT "NutritionSnapshot_mealLogItemId_fkey" FOREIGN KEY ("mealLogItemId") REFERENCES "MealLogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionTargetProfile" ADD CONSTRAINT "NutritionTargetProfile_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionTargetProfile" ADD CONSTRAINT "NutritionTargetProfile_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "NutritionPolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
