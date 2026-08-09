-- A consumption link is derived from both its meal-plan item and meal log.
-- Deleting either owner (for example during account erasure) must not leave an orphan or block the privacy workflow.
ALTER TABLE "MealPlanConsumption" DROP CONSTRAINT "MealPlanConsumption_mealPlanItemId_fkey";
ALTER TABLE "MealPlanConsumption" DROP CONSTRAINT "MealPlanConsumption_mealLogId_fkey";

ALTER TABLE "MealPlanConsumption"
  ADD CONSTRAINT "MealPlanConsumption_mealPlanItemId_fkey"
  FOREIGN KEY ("mealPlanItemId") REFERENCES "DailyMealPlanItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MealPlanConsumption"
  ADD CONSTRAINT "MealPlanConsumption_mealLogId_fkey"
  FOREIGN KEY ("mealLogId") REFERENCES "MealLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
