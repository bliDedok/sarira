import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import type { Clock } from '@sarira/baseline';
import { localDateAt } from '@sarira/baseline';
import {
  flexKitchenConsumeSchema,
  flexKitchenPreviewSchema,
  mealConsumptionSchema,
  mealPlanGenerateSchema,
  mealReplacementSchema,
  personalRecipePatchSchema,
  personalRecipeSchema,
  recipeSearchQuerySchema,
  substitutionSchema,
} from '@sarira/validation';
import { z } from 'zod';
import type { DataRepositories } from '../contracts';
import { ConflictError } from '../errors';
import { success } from '../response';
import { getProfileOrThrow } from '../domains/onboarding/service';
import {
  archivePersonalRecipe,
  consumeFlexKitchen,
  consumeMealPlanItem,
  currentMealPlan,
  duplicatePersonalRecipe,
  generateDailyMealPlan,
  getRecipe,
  listPersonalRecipes,
  listRecipes,
  mealAlternatives,
  mealPlanById,
  previewFlexKitchen,
  replaceMeal,
  savePersonalRecipe,
  startCooking,
  substitutions,
} from '../domains/recipes/service';

const idParams = z.object({ id: z.string().uuid() });
const itemParams = z.object({ id: z.string().uuid(), itemId: z.string().uuid() });
const currentQuery = z.object({ localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() });

export const createMealPlanningRoutes = (repositories: DataRepositories, clock: Clock): FastifyPluginAsync => async (app) => {
  const authenticated = { preHandler: app.authenticate };
  const audit = (request: FastifyRequest, event: string, entityType: string, entityId?: string, metadata?: Record<string, string | number | boolean>) => repositories.audit.record({ actorUserId: request.authUser!.id, event, entityType, entityId, requestId: request.id, metadata });

  app.get('/recipes', authenticated, async (request) => success(await listRecipes(repositories, request.authUser!.id, recipeSearchQuerySchema.parse(request.query))));
  app.get('/recipes/:id', authenticated, async (request) => success(await getRecipe(repositories, request.authUser!.id, idParams.parse(request.params).id)));
  app.get('/recipes/:id/nutrition', authenticated, async (request) => { const recipe = await getRecipe(repositories, request.authUser!.id, idParams.parse(request.params).id); return success(recipe.currentVersion.nutrition); });

  app.get('/meal-plans/current', authenticated, async (request) => { const profile = await getProfileOrThrow(repositories, request.authUser!.id); const query = currentQuery.parse(request.query); return success(await currentMealPlan(repositories, clock, request.authUser!.id, query.localDate ?? localDateAt(clock.now(), profile.timezone))); });
  app.post('/meal-plans/generate', authenticated, async (request, reply) => { const input = mealPlanGenerateSchema.parse(request.body); const value = await generateDailyMealPlan(repositories, clock, request.authUser!.id, input.localDate); await audit(request, 'MEAL_PLAN_GENERATED', 'DailyMealPlan', value.id, { localDate: value.localDate, policyVersion: value.policyVersion }); return reply.code(201).send(success(value)); });
  app.get('/meal-plans/:id', authenticated, async (request) => success(await mealPlanById(repositories, clock, request.authUser!.id, idParams.parse(request.params).id)));
  app.get('/meal-plans/:id/items/:itemId/alternatives', authenticated, async (request) => { const params = itemParams.parse(request.params); return success(await mealAlternatives(repositories, clock, request.authUser!.id, params.id, params.itemId)); });
  app.post('/meal-plans/:id/items/:itemId/replace', authenticated, async (request) => { const params = itemParams.parse(request.params); const input = mealReplacementSchema.parse(request.body); const value = await replaceMeal(repositories, clock, request.authUser!.id, params.id, params.itemId, input.recipeId, input.reason); await audit(request, 'MEAL_PLAN_ITEM_REPLACED', 'DailyMealPlanItem', params.itemId, { recipeId: input.recipeId, ...(input.reason ? { reason: input.reason } : {}) }); return success(value); });
  app.post('/meal-plans/:id/items/:itemId/cooking', authenticated, async (request) => { const params = itemParams.parse(request.params); return success(await startCooking(repositories, request.authUser!.id, params.id, params.itemId)); });
  app.post('/meal-plans/:id/items/:itemId/consume', authenticated, async (request) => { const params = itemParams.parse(request.params); const input = mealConsumptionSchema.parse(request.body); const value = await consumeMealPlanItem(repositories, clock, request.authUser!.id, params.id, params.itemId, input.fraction); await audit(request, 'MEAL_PLAN_ITEM_CONSUMED', 'DailyMealPlanItem', params.itemId, { fraction: input.fraction, alreadyConsumed: value.alreadyConsumed }); return success(value); });

  app.post('/flex-kitchen/preview', authenticated, async (request) => success(await previewFlexKitchen(repositories, clock, request.authUser!.id, flexKitchenPreviewSchema.parse(request.body))));
  app.post('/flex-kitchen/consume', authenticated, async (request) => { const input = flexKitchenConsumeSchema.parse(request.body); const value = await consumeFlexKitchen(repositories, clock, request.authUser!.id, input); await audit(request, 'MEAL_LOG_CREATED', 'MealLog', value.mealLogId, { source: 'FLEX_KITCHEN', fraction: input.fraction }); return success(value); });
  app.post('/flex-kitchen/substitutions', authenticated, async (request) => success(await substitutions(repositories, clock, request.authUser!.id, substitutionSchema.parse(request.body))));
  app.post('/flex-kitchen/save', authenticated, async (request, reply) => { const input = personalRecipeSchema.parse(request.body); const value = await savePersonalRecipe(repositories, clock, request.authUser!.id, input); await audit(request, 'PERSONAL_RECIPE_CREATED', 'Recipe', value.id); return reply.code(201).send(success(value)); });

  app.get('/profiles/me/recipes', authenticated, async (request) => success(await listPersonalRecipes(repositories, request.authUser!.id)));
  app.post('/profiles/me/recipes', authenticated, async (request, reply) => { const input = personalRecipeSchema.parse(request.body); const value = await savePersonalRecipe(repositories, clock, request.authUser!.id, input); await audit(request, 'PERSONAL_RECIPE_CREATED', 'Recipe', value.id); return reply.code(201).send(success(value)); });
  app.get('/profiles/me/recipes/:id', authenticated, async (request) => { const value = await getRecipe(repositories, request.authUser!.id, idParams.parse(request.params).id); if (value.sourceType !== 'USER_CREATED') throw new ConflictError('Route ini hanya untuk resep pribadi.'); return success(value); });
  app.patch('/profiles/me/recipes/:id', authenticated, async (request) => {
    const recipeId = idParams.parse(request.params).id; const patch = personalRecipePatchSchema.parse(request.body); const current = await getRecipe(repositories, request.authUser!.id, recipeId); if (current.sourceType !== 'USER_CREATED') throw new ConflictError('Hanya resep pribadi yang dapat diedit.'); const version = current.currentVersion;
    const merged = { name: patch.name ?? current.name, description: patch.description ?? current.description, servings: patch.servings ?? version.servings, prepTimeMinutes: patch.prepTimeMinutes ?? version.prepTimeMinutes, cookTimeMinutes: patch.cookTimeMinutes ?? version.cookTimeMinutes, difficulty: patch.difficulty ?? version.difficulty, estimatedCostCategory: patch.estimatedCostCategory ?? version.estimatedCostCategory, cookingMethod: patch.cookingMethod ?? version.cookingMethod, mealTypes: patch.mealTypes ?? version.mealTypes.filter((item): item is 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' => item !== 'OTHER'), ingredients: patch.ingredients ?? version.ingredients.map((item) => ({ ...(item.foodItemId ? { foodItemId: item.foodItemId } : {}), ...(item.servingId ? { servingId: item.servingId } : {}), ...(item.customName ? { customName: item.customName } : {}), quantity: item.quantity })), notes: patch.notes ?? version.notes, steps: patch.steps ?? version.steps.map((item) => ({ instruction: item.instruction, ...(item.timerSeconds ? { timerSeconds: item.timerSeconds } : {}) })) };
    const value = await savePersonalRecipe(repositories, clock, request.authUser!.id, merged, recipeId); await audit(request, 'PERSONAL_RECIPE_UPDATED', 'Recipe', recipeId, { version: value.currentVersion.version }); return success(value);
  });
  app.post('/profiles/me/recipes/:id/duplicate', authenticated, async (request, reply) => { const value = await duplicatePersonalRecipe(repositories, request.authUser!.id, idParams.parse(request.params).id); await audit(request, 'PERSONAL_RECIPE_CREATED', 'Recipe', value.id, { duplicated: true }); return reply.code(201).send(success(value)); });
  app.post('/profiles/me/recipes/:id/archive', authenticated, async (request) => { const value = await archivePersonalRecipe(repositories, request.authUser!.id, idParams.parse(request.params).id); await audit(request, 'PERSONAL_RECIPE_ARCHIVED', 'Recipe', value.id); return success(value); });
};
