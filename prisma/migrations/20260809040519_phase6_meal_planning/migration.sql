-- CreateEnum
CREATE TYPE "RecipeSourceType" AS ENUM ('INTERNAL_CURATED', 'OFFICIAL_GUIDE', 'EXPERT_REVIEWED', 'USER_CREATED', 'SYNTHETIC_DEVELOPMENT');

-- CreateEnum
CREATE TYPE "RecipeDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "EstimatedCostCategory" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "CookingMethod" AS ENUM ('RAW', 'BOILED', 'STEAMED', 'GRILLED', 'BAKED', 'FRIED', 'STIR_FRIED', 'OTHER');

-- CreateEnum
CREATE TYPE "RecipeVersionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "MealPlanningPolicyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "MealPlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'REPLACED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "MealPlanItemStatus" AS ENUM ('PLANNED', 'REPLACED', 'COOKING', 'CONSUMED', 'SKIPPED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditEvent" ADD VALUE 'MEAL_PLAN_GENERATED';
ALTER TYPE "AuditEvent" ADD VALUE 'MEAL_PLAN_ITEM_REPLACED';
ALTER TYPE "AuditEvent" ADD VALUE 'MEAL_PLAN_ITEM_CONSUMED';
ALTER TYPE "AuditEvent" ADD VALUE 'PERSONAL_RECIPE_CREATED';
ALTER TYPE "AuditEvent" ADD VALUE 'PERSONAL_RECIPE_UPDATED';
ALTER TYPE "AuditEvent" ADD VALUE 'PERSONAL_RECIPE_ARCHIVED';

-- CreateTable
CREATE TABLE "Recipe" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "ownerProfileId" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sourceType" "RecipeSourceType" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceVersion" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMPTZ(3),
    "requiresExpertValidation" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeVersion" (
    "id" UUID NOT NULL,
    "recipeId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "RecipeVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "servings" DECIMAL(8,2) NOT NULL,
    "prepTimeMinutes" INTEGER NOT NULL,
    "cookTimeMinutes" INTEGER NOT NULL,
    "difficulty" "RecipeDifficulty" NOT NULL,
    "estimatedCostCategory" "EstimatedCostCategory" NOT NULL,
    "cookingMethod" "CookingMethod" NOT NULL,
    "mealTypes" "MealType"[],
    "dietaryTags" "DietaryTagCode"[],
    "equipment" TEXT[],
    "notes" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "requiresExpertValidation" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "RecipeVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" UUID NOT NULL,
    "recipeVersionId" UUID NOT NULL,
    "foodItemId" UUID,
    "servingId" UUID,
    "customName" TEXT,
    "quantity" DECIMAL(10,3) NOT NULL,
    "gramAmount" DECIMAL(10,3),
    "preparationNote" TEXT,
    "optional" BOOLEAN NOT NULL DEFAULT false,
    "replacementGroup" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "sourceType" "FoodSourceType" NOT NULL DEFAULT 'SYNTHETIC_TEST_DATA',
    "userNutrition" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeStep" (
    "id" UUID NOT NULL,
    "recipeVersionId" UUID NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "instruction" TEXT NOT NULL,
    "timerSeconds" INTEGER,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "RecipeStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeNutritionSnapshot" (
    "id" UUID NOT NULL,
    "recipeVersionId" UUID NOT NULL,
    "totalEnergyKcal" DECIMAL(14,6),
    "totalProteinG" DECIMAL(14,6),
    "totalCarbohydrateG" DECIMAL(14,6),
    "totalFatG" DECIMAL(14,6),
    "totalSaturatedFatG" DECIMAL(14,6),
    "totalFiberG" DECIMAL(14,6),
    "totalSugarG" DECIMAL(14,6),
    "totalSodiumMg" DECIMAL(14,6),
    "perServing" JSONB NOT NULL,
    "missingNutrients" TEXT[],
    "complete" BOOLEAN NOT NULL,
    "sourceVersions" TEXT[],
    "calculationVersion" TEXT NOT NULL,
    "calculatedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipeNutritionSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlanningPolicy" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" "MealPlanningPolicyStatus" NOT NULL DEFAULT 'DRAFT',
    "configuration" JSONB NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "requiresProductValidation" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "MealPlanningPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyMealPlan" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "localDate" DATE NOT NULL,
    "targetProfileId" UUID NOT NULL,
    "mealPlanningPolicyId" UUID NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "nutritionPolicyVersion" TEXT NOT NULL,
    "generatedByPolicyVersion" TEXT NOT NULL,
    "targetSnapshot" JSONB NOT NULL,
    "status" "MealPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "source" TEXT NOT NULL DEFAULT 'DETERMINISTIC_RULES',
    "generatedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "DailyMealPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyMealPlanItem" (
    "id" UUID NOT NULL,
    "mealPlanId" UUID NOT NULL,
    "mealType" "MealType" NOT NULL,
    "recipeId" UUID NOT NULL,
    "recipeVersionId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "status" "MealPlanItemStatus" NOT NULL DEFAULT 'PLANNED',
    "reasonCodes" TEXT[],
    "recommendationFit" TEXT NOT NULL,
    "score" DECIMAL(10,4) NOT NULL,
    "nutritionImpact" JSONB NOT NULL,
    "replacedFromItemId" UUID,
    "replacementReason" TEXT,
    "consumedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "DailyMealPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlanItemSnapshot" (
    "id" UUID NOT NULL,
    "mealPlanItemId" UUID NOT NULL,
    "recipeVersionId" UUID NOT NULL,
    "recipeName" TEXT NOT NULL,
    "recipeVersion" INTEGER NOT NULL,
    "servings" DECIMAL(8,2) NOT NULL,
    "nutritionPerServing" JSONB NOT NULL,
    "ingredients" JSONB NOT NULL,
    "sourceVersion" TEXT NOT NULL,
    "calculationVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealPlanItemSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlanConsumption" (
    "id" UUID NOT NULL,
    "mealPlanItemId" UUID NOT NULL,
    "mealLogId" UUID NOT NULL,
    "consumedFraction" DECIMAL(4,2) NOT NULL,
    "consumedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealPlanConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_code_key" ON "Recipe"("code");

-- CreateIndex
CREATE INDEX "Recipe_ownerProfileId_active_archivedAt_idx" ON "Recipe"("ownerProfileId", "active", "archivedAt");

-- CreateIndex
CREATE INDEX "Recipe_sourceType_active_idx" ON "Recipe"("sourceType", "active");

-- CreateIndex
CREATE INDEX "RecipeVersion_status_mealTypes_idx" ON "RecipeVersion"("status", "mealTypes");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeVersion_recipeId_version_key" ON "RecipeVersion"("recipeId", "version");

-- CreateIndex
CREATE INDEX "RecipeIngredient_foodItemId_idx" ON "RecipeIngredient"("foodItemId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeIngredient_recipeVersionId_orderIndex_key" ON "RecipeIngredient"("recipeVersionId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeStep_recipeVersionId_orderIndex_key" ON "RecipeStep"("recipeVersionId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeNutritionSnapshot_recipeVersionId_key" ON "RecipeNutritionSnapshot"("recipeVersionId");

-- CreateIndex
CREATE INDEX "RecipeNutritionSnapshot_complete_calculatedAt_idx" ON "RecipeNutritionSnapshot"("complete", "calculatedAt");

-- CreateIndex
CREATE INDEX "MealPlanningPolicy_status_effectiveFrom_effectiveTo_idx" ON "MealPlanningPolicy"("status", "effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE UNIQUE INDEX "MealPlanningPolicy_code_version_key" ON "MealPlanningPolicy"("code", "version");

-- CreateIndex
CREATE INDEX "DailyMealPlan_profileId_localDate_status_idx" ON "DailyMealPlan"("profileId", "localDate", "status");

-- CreateIndex
CREATE INDEX "DailyMealPlan_profileId_localDate_policyVersion_idx" ON "DailyMealPlan"("profileId", "localDate", "policyVersion");

-- CreateIndex
CREATE INDEX "DailyMealPlanItem_recipeVersionId_status_idx" ON "DailyMealPlanItem"("recipeVersionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DailyMealPlanItem_mealPlanId_mealType_position_key" ON "DailyMealPlanItem"("mealPlanId", "mealType", "position");

-- CreateIndex
CREATE UNIQUE INDEX "MealPlanItemSnapshot_mealPlanItemId_key" ON "MealPlanItemSnapshot"("mealPlanItemId");

-- CreateIndex
CREATE INDEX "MealPlanItemSnapshot_recipeVersionId_idx" ON "MealPlanItemSnapshot"("recipeVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "MealPlanConsumption_mealPlanItemId_key" ON "MealPlanConsumption"("mealPlanItemId");

-- CreateIndex
CREATE UNIQUE INDEX "MealPlanConsumption_mealLogId_key" ON "MealPlanConsumption"("mealLogId");

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_ownerProfileId_fkey" FOREIGN KEY ("ownerProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeVersion" ADD CONSTRAINT "RecipeVersion_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeVersionId_fkey" FOREIGN KEY ("recipeVersionId") REFERENCES "RecipeVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_servingId_fkey" FOREIGN KEY ("servingId") REFERENCES "FoodServing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeStep" ADD CONSTRAINT "RecipeStep_recipeVersionId_fkey" FOREIGN KEY ("recipeVersionId") REFERENCES "RecipeVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeNutritionSnapshot" ADD CONSTRAINT "RecipeNutritionSnapshot_recipeVersionId_fkey" FOREIGN KEY ("recipeVersionId") REFERENCES "RecipeVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMealPlan" ADD CONSTRAINT "DailyMealPlan_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMealPlan" ADD CONSTRAINT "DailyMealPlan_targetProfileId_fkey" FOREIGN KEY ("targetProfileId") REFERENCES "NutritionTargetProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMealPlan" ADD CONSTRAINT "DailyMealPlan_mealPlanningPolicyId_fkey" FOREIGN KEY ("mealPlanningPolicyId") REFERENCES "MealPlanningPolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMealPlanItem" ADD CONSTRAINT "DailyMealPlanItem_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "DailyMealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMealPlanItem" ADD CONSTRAINT "DailyMealPlanItem_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMealPlanItem" ADD CONSTRAINT "DailyMealPlanItem_recipeVersionId_fkey" FOREIGN KEY ("recipeVersionId") REFERENCES "RecipeVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanItemSnapshot" ADD CONSTRAINT "MealPlanItemSnapshot_mealPlanItemId_fkey" FOREIGN KEY ("mealPlanItemId") REFERENCES "DailyMealPlanItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanItemSnapshot" ADD CONSTRAINT "MealPlanItemSnapshot_recipeVersionId_fkey" FOREIGN KEY ("recipeVersionId") REFERENCES "RecipeVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanConsumption" ADD CONSTRAINT "MealPlanConsumption_mealPlanItemId_fkey" FOREIGN KEY ("mealPlanItemId") REFERENCES "DailyMealPlanItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanConsumption" ADD CONSTRAINT "MealPlanConsumption_mealLogId_fkey" FOREIGN KEY ("mealLogId") REFERENCES "MealLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
