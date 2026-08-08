import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import type { Clock } from '@sarira/baseline';
import { customMealLogItemSchema, foodSearchQuerySchema, localDateSchema, mealLogItemPatchSchema, mealLogItemSchema, nutritionHistoryQuerySchema, nutritionPreviewSchema } from '@sarira/validation';
import { z } from 'zod';
import type { DataRepositories } from '../contracts';
import { FoodNotFoundError } from '../errors';
import { success } from '../response';
import { addCustomMealItem, addMealItem, currentTarget, dailyNutrition, deleteMealItem, nutritionHistory, previewFood, recalculateTarget, updateMealItem } from '../domains/nutrition/service';

const idParams = z.object({ id: z.string().uuid() });
const mealParams = z.object({ mealLogId: z.string().uuid() });
const dateParams = z.object({ localDate: localDateSchema });

export const createNutritionRoutes = (repositories: DataRepositories, clock: Clock): FastifyPluginAsync => async (app) => {
  const authenticated = { preHandler: app.authenticate };
  const audit = (request: FastifyRequest, event: string, entityType: string, entityId?: string, metadata?: Record<string, string | number | boolean>) => repositories.audit.record({ actorUserId: request.authUser!.id, event, entityType, entityId, requestId: request.id, metadata });

  app.get('/foods', authenticated, async (request) => {
    const query = foodSearchQuerySchema.parse(request.query);
    return success(await repositories.nutrition.searchFoods({ query: query.q, category: query.category, verified: query.verified, page: query.page, pageSize: query.pageSize }));
  });
  app.get('/foods/:id', authenticated, async (request) => { const value = await repositories.nutrition.getFood(idParams.parse(request.params).id); if (!value) throw new FoodNotFoundError(); return success(value); });
  app.get('/foods/:id/servings', authenticated, async (request) => success(await repositories.nutrition.getServings(idParams.parse(request.params).id)));
  app.get('/nutrients', authenticated, async () => success(await repositories.nutrition.listNutrients()));

  app.post('/nutrition/preview', authenticated, async (request) => success(await previewFood(repositories, request.authUser!.id, nutritionPreviewSchema.parse(request.body))));
  app.get('/nutrition/targets/current', authenticated, async (request) => success(await currentTarget(repositories, clock, request.authUser!.id)));
  app.post('/nutrition/targets/recalculate', authenticated, async (request) => { const value = await recalculateTarget(repositories, clock, request.authUser!.id); await audit(request, 'NUTRITION_TARGET_CALCULATED', 'NutritionTargetProfile', value.id, { policyVersion: value.policyVersion, safetyStatus: value.safetyStatus, restricted: value.restricted }); return success(value); });
  app.get('/nutrition/daily/:localDate', authenticated, async (request) => { const localDate = dateParams.parse(request.params).localDate; const value = await dailyNutrition(repositories, clock, request.authUser!.id, localDate); await audit(request, 'NUTRITION_DAILY_VIEWED', 'DailyNutritionSummary', undefined, { localDate, itemCount: value.itemCount, complete: value.complete }); return success(value); });
  app.get('/nutrition/history', authenticated, async (request) => { const query = nutritionHistoryQuerySchema.parse(request.query); return success(await nutritionHistory(repositories, clock, request.authUser!.id, query.from, query.to)); });

  app.post('/meal-logs/:mealLogId/items', authenticated, async (request, reply) => { const value = await addMealItem(repositories, clock, request.authUser!.id, mealParams.parse(request.params).mealLogId, mealLogItemSchema.parse(request.body)); await audit(request, 'MEAL_LOG_ITEM_CREATED', 'MealLogItem', value.id, { sourceVersion: value.sourceVersion, complete: value.snapshot.complete }); return reply.code(201).send(success(value)); });
  app.post('/meal-logs/:mealLogId/items/custom', authenticated, async (request, reply) => { const value = await addCustomMealItem(repositories, clock, request.authUser!.id, mealParams.parse(request.params).mealLogId, customMealLogItemSchema.parse(request.body)); await audit(request, 'MEAL_LOG_ITEM_CREATED', 'MealLogItem', value.id, { sourceVersion: value.sourceVersion, complete: false }); return reply.code(201).send(success(value)); });
  app.patch('/meal-log-items/:id', authenticated, async (request) => { const value = await updateMealItem(repositories, clock, request.authUser!.id, idParams.parse(request.params).id, mealLogItemPatchSchema.parse(request.body)); await audit(request, 'MEAL_LOG_ITEM_UPDATED', 'MealLogItem', value.id, { sourceVersion: value.sourceVersion, complete: value.snapshot.complete }); return success(value); });
  app.delete('/meal-log-items/:id', authenticated, async (request) => { const id = idParams.parse(request.params).id; await deleteMealItem(repositories, clock, request.authUser!.id, id); await audit(request, 'MEAL_LOG_ITEM_DELETED', 'MealLogItem', id); return success({ deleted: true }); });
};
