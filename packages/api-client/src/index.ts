import type {
  AuthenticatedUser,
  ConsentDefinition,
  ConsentRecord,
  ConsentSource,
  ConsentType,
  GoalCode,
  GoalDefinitionRecord,
  GuardianConsentRecord,
  OnboardingProgressRecord,
  OnboardingRole,
  OnboardingStep,
  OnboardingSummaryRecord,
  ProgramCode,
  ProgramEligibilityRecord,
  ProgramPreferenceRecord,
  QuestionnaireAnswerValue,
  QuestionnaireSessionRecord,
  QuestionnaireTemplateRecord,
  SafetyAnswerCode,
  SafetyResultRecord,
  SafetySessionRecord,
  SafetyTemplateRecord,
  UserGoalRecord,
  UserProfile,
  ActivityLogRecord,
  BaselineDayRecord,
  BaselineReadinessRecord,
  BaselineSessionRecord,
  BodyMeasurementRecord,
  CompletenessRecord,
  DailyCheckInRecord,
  DailyTaskRecord,
  Day7CheckpointRecord,
  Day7FeedbackRecord,
  DigestiveLogRecord,
  MealLogRecord,
  SleepLogRecord,
  StarterJourneyRecord,
  StepRecordValue,
  DailyNutritionSummaryRecord,
  FoodItemRecord,
  FoodServingRecord,
  MealLogItemRecord,
  NutritionHistoryRecord,
  NutritionSnapshotRecord,
  NutritionTargetProfileRecord,
  DailyMealPlanRecord,
  FlexKitchenIngredientInput,
  FlexKitchenPreviewRecord,
  FoodSubstitutionRecord,
  MealAlternativeRecord,
  RecipeRecord,
  DecisionRecordRecord,
  FeatureSnapshotRecord,
  PatternMapFeedbackValue,
  PatternMapRecord,
  Phase7AnalysisResult,
  WeeklyActionAssignmentRecord,
} from '@sarira/shared-types';
import type { ApiResponse } from '@sarira/shared-types';

export class ApiClientError extends Error {
  constructor(message: string, public readonly code: string, public readonly status: number, public readonly details: unknown[] = []) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null>;
  fetcher?: typeof fetch;
}

export interface AuthResponse {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken?: string;
}

export function createApiClient({ baseUrl, getAccessToken, fetcher = fetch }: ApiClientOptions) {
  const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const token = await getAccessToken?.();
    let response: Response;
    try {
      response = await fetcher(`${baseUrl}${path}`, {
        ...init,
        headers: { ...(init.body !== undefined ? { 'content-type': 'application/json' } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}), ...init.headers },
      });
    } catch {
      throw new ApiClientError('Tidak dapat terhubung ke server.', 'NETWORK_ERROR', 0);
    }
    let body: ApiResponse<T>;
    try { body = (await response.json()) as ApiResponse<T>; }
    catch { throw new ApiClientError('Respons server tidak dapat dibaca.', 'INVALID_RESPONSE', response.status); }
    if (!response.ok || !body.success) {
      const error = body.success ? undefined : body.error;
      throw new ApiClientError(error?.message ?? 'Permintaan gagal.', error?.code ?? 'HTTP_ERROR', response.status, error?.details);
    }
    return body.data;
  };

  return {
    request,
    health: () => request<{ status: string }>('/health'),
    register: (input: { name: string; email: string; password: string }) => request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(input) }),
    login: (input: { email: string; password: string }) => request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),
    logout: () => request<{ loggedOut: boolean }>('/auth/logout', { method: 'POST' }),
    me: () => request<AuthenticatedUser>('/me'),
    getProfile: () => request<UserProfile>('/profiles/me'),
    updateProfile: (input: Partial<UserProfile>) => request<UserProfile>('/profiles/me', { method: 'PATCH', body: JSON.stringify(input) }),
    getRoles: () => request<Array<{ role: OnboardingRole; label: string; description: string }>>('/roles/available'),
    setRole: (role: OnboardingRole) => request<UserProfile>('/profiles/me/role', { method: 'PUT', body: JSON.stringify({ role }) }),
    getOnboardingStatus: () => request<{ profile: UserProfile; progress: OnboardingProgressRecord; resumePath: string }>('/onboarding/status'),
    touchOnboarding: (currentStep: OnboardingStep) => request<OnboardingProgressRecord>('/onboarding/status', { method: 'PATCH', body: JSON.stringify({ currentStep }) }),
    getOnboardingSummary: () => request<OnboardingSummaryRecord>('/onboarding/summary'),
    completeOnboarding: () => request<{ progress: OnboardingProgressRecord; starterContext: Record<string, unknown> }>('/onboarding/complete', { method: 'POST' }),
    getRequiredConsents: () => request<ConsentDefinition[]>('/consents/required'),
    getAvailableConsents: () => request<ConsentDefinition[]>('/consents/available'),
    getConsents: () => request<ConsentRecord[]>('/consents/me'),
    updateConsent: (type: ConsentType, input: { granted: boolean; version: string; source?: ConsentSource }) => request<ConsentRecord>(`/consents/${type}`, { method: 'PUT', body: JSON.stringify(input) }),
    revokeConsent: (type: ConsentType) => request<ConsentRecord>(`/consents/${type}`, { method: 'DELETE' }),
    getGuardianConsent: () => request<{ required: boolean; consent: GuardianConsentRecord | null }>('/guardian-consent/status'),
    setGuardianConsent: (input: { guardianName: string; guardianRelationship: 'PARENT' | 'LEGAL_GUARDIAN'; consentVersion: string; confirmed: true }) => request<GuardianConsentRecord>('/guardian-consent', { method: 'POST', body: JSON.stringify(input) }),
    revokeGuardianConsent: () => request<GuardianConsentRecord>('/guardian-consent', { method: 'DELETE' }),
    getSafetyCurrent: () => request<{ template: SafetyTemplateRecord; latestResult: SafetyResultRecord | null }>('/safety-screening/current'),
    createSafetySession: () => request<SafetySessionRecord>('/safety-screening/sessions', { method: 'POST' }),
    saveSafetyAnswers: (sessionId: string, answers: Array<{ questionId: string; answerCode: SafetyAnswerCode }>) => request<SafetySessionRecord>(`/safety-screening/sessions/${sessionId}/answers`, { method: 'PUT', body: JSON.stringify({ answers }) }),
    completeSafety: (sessionId: string) => request<SafetyResultRecord>(`/safety-screening/sessions/${sessionId}/complete`, { method: 'POST' }),
    getSafetyResult: (sessionId: string) => request<SafetyResultRecord>(`/safety-screening/sessions/${sessionId}/result`),
    getGoals: () => request<GoalDefinitionRecord[]>('/goals/available'),
    setGoal: (code: GoalCode) => request<UserGoalRecord>('/profiles/me/goal', { method: 'PUT', body: JSON.stringify({ code }) }),
    getQuestionnaire: () => request<{ template: QuestionnaireTemplateRecord; session: QuestionnaireSessionRecord | null }>('/questionnaires/onboarding'),
    createQuestionnaireSession: (templateId: string) => request<QuestionnaireSessionRecord>(`/questionnaires/${templateId}/sessions`, { method: 'POST' }),
    getQuestionnaireSession: (sessionId: string) => request<QuestionnaireSessionRecord>(`/questionnaire-sessions/${sessionId}`),
    saveQuestionnaireAnswers: (sessionId: string, answers: Array<{ questionId: string; value: QuestionnaireAnswerValue }>) => request<QuestionnaireSessionRecord>(`/questionnaire-sessions/${sessionId}/answers`, { method: 'PUT', body: JSON.stringify({ answers }) }),
    completeQuestionnaire: (sessionId: string) => request<QuestionnaireSessionRecord>(`/questionnaire-sessions/${sessionId}/complete`, { method: 'POST' }),
    getProgramPreferences: () => request<{ options: ProgramEligibilityRecord[]; selected: ProgramPreferenceRecord | null }>('/program-preferences'),
    setProgramPreference: (program: ProgramCode) => request<ProgramPreferenceRecord>('/profiles/me/program-preference', { method: 'PUT', body: JSON.stringify({ program }) }),
    skipProgramPreference: () => request<{ skipped: boolean; reasonCodes: string[] }>('/profiles/me/program-preference/skip', { method: 'POST' }),
    getStarterJourney: () => request<StarterJourneyRecord>('/starter-journey'),
    startBaseline: () => request<BaselineSessionRecord>('/baseline', { method: 'POST' }),
    getCurrentBaseline: () => request<{ baseline: BaselineSessionRecord; localDate: string; completeness: CompletenessRecord; tasks: DailyTaskRecord[]; day7Available: boolean; day14Available: boolean }>('/baseline/current'),
    getBaseline: (id: string) => request<BaselineSessionRecord>(`/baseline/${id}`),
    completeBaseline: (id: string) => request<BaselineSessionRecord>(`/baseline/${id}/complete`, { method: 'POST' }),
    getBaselineDays: (id: string) => request<BaselineDayRecord[]>(`/baseline/${id}/days`),
    getBaselineDay: (id: string, dayIndex: number) => request<BaselineDayRecord>(`/baseline/${id}/days/${dayIndex}`),
    getCompleteness: (id: string, localDate?: string) => request<CompletenessRecord>(`/baseline/${id}/completeness${localDate ? `/${localDate}` : ''}`),
    getReadiness: (id: string) => request<BaselineReadinessRecord>(`/baseline/${id}/readiness`),
    getDailyCheckIn: (localDate: string) => request<DailyCheckInRecord | null>(`/daily-checkins/${localDate}`),
    saveDailyCheckIn: (localDate: string, input: { mood: DailyCheckInRecord['mood']; hunger: number; fullness: number; energy?: number; bodyFeeling?: string; barriers: DailyCheckInRecord['barriers']; notes?: string }) => request<DailyCheckInRecord>(`/daily-checkins/${localDate}`, { method: 'PUT', body: JSON.stringify(input) }),
    getMealLogs: (localDate?: string) => request<MealLogRecord[]>(`/meal-logs${localDate ? `?localDate=${localDate}` : ''}`),
    createMealLog: (input: { localDate: string; mealType: MealLogRecord['mealType']; eatenAt?: string; description?: string; skipped: boolean; sugaryDrinkConsumed?: boolean; lateMeal?: boolean; homeCooked?: boolean; eatingContext?: string; notes?: string }) => request<MealLogRecord>('/meal-logs', { method: 'POST', body: JSON.stringify(input) }),
    updateMealLog: (id: string, input: Partial<MealLogRecord>) => request<MealLogRecord>(`/meal-logs/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    deleteMealLog: (id: string) => request<{ deleted: boolean }>(`/meal-logs/${id}`, { method: 'DELETE' }),
    getSleepLogs: (localDate?: string) => request<SleepLogRecord[]>(`/sleep-logs${localDate ? `?localDate=${localDate}` : ''}`),
    createSleepLog: (input: { localDate: string; sleepStartedAt: string; wokeUpAt: string; perceivedQuality: SleepLogRecord['perceivedQuality']; nightAwakenings?: number; notes?: string }) => request<SleepLogRecord>('/sleep-logs', { method: 'POST', body: JSON.stringify(input) }),
    updateSleepLog: (id: string, input: Partial<SleepLogRecord>) => request<SleepLogRecord>(`/sleep-logs/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    deleteSleepLog: (id: string) => request<{ deleted: boolean }>(`/sleep-logs/${id}`, { method: 'DELETE' }),
    getActivityLogs: (localDate?: string) => request<ActivityLogRecord[]>(`/activity-logs${localDate ? `?localDate=${localDate}` : ''}`),
    createActivityLog: (input: { localDate: string; activityType: ActivityLogRecord['activityType']; startedAt?: string; durationMinutes: number; perceivedIntensity: ActivityLogRecord['perceivedIntensity']; description?: string; notes?: string }) => request<ActivityLogRecord>('/activity-logs', { method: 'POST', body: JSON.stringify(input) }),
    updateActivityLog: (id: string, input: Partial<ActivityLogRecord>) => request<ActivityLogRecord>(`/activity-logs/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    deleteActivityLog: (id: string) => request<{ deleted: boolean }>(`/activity-logs/${id}`, { method: 'DELETE' }),
    getStepRecords: () => request<StepRecordValue[]>('/step-records'),
    saveSteps: (localDate: string, input: { steps: number; sourceDevice?: string }) => request<StepRecordValue>(`/step-records/${localDate}`, { method: 'PUT', body: JSON.stringify(input) }),
    getBodyMeasurements: () => request<BodyMeasurementRecord[]>('/body-measurements'),
    createBodyMeasurement: (input: { localDate: string; measuredAt: string; weightKg: number; waistCm?: number; notes?: string }) => request<BodyMeasurementRecord>('/body-measurements', { method: 'POST', body: JSON.stringify(input) }),
    getDigestiveLogs: (localDate?: string) => request<DigestiveLogRecord[]>(`/digestive-logs${localDate ? `?localDate=${localDate}` : ''}`),
    createDigestiveLog: (input: { localDate: string; symptomType: DigestiveLogRecord['symptomType']; occurredAt: string; intensity: number; relatedMealId?: string; notes?: string }) => request<DigestiveLogRecord>('/digestive-logs', { method: 'POST', body: JSON.stringify(input) }),
    updateDigestiveLog: (id: string, input: Partial<DigestiveLogRecord>) => request<DigestiveLogRecord>(`/digestive-logs/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    deleteDigestiveLog: (id: string) => request<{ deleted: boolean }>(`/digestive-logs/${id}`, { method: 'DELETE' }),
    getDailyTasks: (localDate: string) => request<DailyTaskRecord[]>(`/daily-tasks/${localDate}`),
    updateDailyTask: (id: string, status: DailyTaskRecord['status']) => request<DailyTaskRecord>(`/daily-tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    getDay7Checkpoint: (id: string) => request<Day7CheckpointRecord>(`/baseline/${id}/day-7-checkpoint`),
    saveDay7Feedback: (id: string, input: { easeRating: number; hardestDomains: Array<'checkIn' | 'food' | 'sleep' | 'activity'>; wantsToContinue: boolean; notes?: string }) => request<Day7FeedbackRecord>(`/baseline/${id}/day-7-feedback`, { method: 'POST', body: JSON.stringify(input) }),
    searchFoods: (input: { q?: string; category?: FoodItemRecord['category']; verified?: boolean; page?: number; pageSize?: number } = {}) => {
      const query = new URLSearchParams(); if (input.q) query.set('q', input.q); if (input.category) query.set('category', input.category); if (input.verified !== undefined) query.set('verified', String(input.verified)); query.set('page', String(input.page ?? 1)); query.set('pageSize', String(input.pageSize ?? 20));
      return request<{ items: FoodItemRecord[]; total: number; page: number; pageSize: number }>(`/foods?${query.toString()}`);
    },
    getFood: (id: string) => request<FoodItemRecord>(`/foods/${id}`),
    getFoodServings: (id: string) => request<FoodServingRecord[]>(`/foods/${id}/servings`),
    previewNutrition: (input: { foodItemId: string; servingId: string; quantity: number }) => request<{ food: FoodItemRecord; serving: FoodServingRecord; quantity: number; gramAmount: number; nutrition: NutritionSnapshotRecord; allergenWarnings: MealLogItemRecord['allergenWarnings'] }>('/nutrition/preview', { method: 'POST', body: JSON.stringify(input) }),
    getNutritionTarget: () => request<NutritionTargetProfileRecord>('/nutrition/targets/current'),
    recalculateNutritionTarget: () => request<NutritionTargetProfileRecord>('/nutrition/targets/recalculate', { method: 'POST' }),
    getDailyNutrition: (localDate: string) => request<DailyNutritionSummaryRecord>(`/nutrition/daily/${localDate}`),
    getNutritionHistory: (from: string, to: string) => request<NutritionHistoryRecord>(`/nutrition/history?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
    addMealLogItem: (mealLogId: string, input: { foodItemId: string; servingId: string; quantity: number }) => request<MealLogItemRecord>(`/meal-logs/${mealLogId}/items`, { method: 'POST', body: JSON.stringify(input) }),
    addCustomMealLogItem: (mealLogId: string, input: { customName: string; servingDescription: string; quantity: number }) => request<MealLogItemRecord>(`/meal-logs/${mealLogId}/items/custom`, { method: 'POST', body: JSON.stringify(input) }),
    updateMealLogItem: (id: string, input: { servingId?: string; quantity?: number }) => request<MealLogItemRecord>(`/meal-log-items/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    deleteMealLogItem: (id: string) => request<{ deleted: boolean }>(`/meal-log-items/${id}`, { method: 'DELETE' }),
    searchRecipes: (input: { q?: string; mealType?: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'; page?: number; pageSize?: number } = {}) => { const query = new URLSearchParams(); if (input.q) query.set('q', input.q); if (input.mealType) query.set('mealType', input.mealType); query.set('page', String(input.page ?? 1)); query.set('pageSize', String(input.pageSize ?? 20)); return request<{ items: RecipeRecord[]; total: number; page: number; pageSize: number }>(`/recipes?${query.toString()}`); },
    getRecipe: (id: string) => request<RecipeRecord>(`/recipes/${id}`),
    getRecipeNutrition: (id: string) => request<RecipeRecord['currentVersion']['nutrition']>(`/recipes/${id}/nutrition`),
    getCurrentMealPlan: (localDate?: string) => request<DailyMealPlanRecord | null>(`/meal-plans/current${localDate ? `?localDate=${encodeURIComponent(localDate)}` : ''}`),
    generateMealPlan: (localDate: string) => request<DailyMealPlanRecord>('/meal-plans/generate', { method: 'POST', body: JSON.stringify({ localDate }) }),
    getMealPlan: (id: string) => request<DailyMealPlanRecord>(`/meal-plans/${id}`),
    getMealAlternatives: (planId: string, itemId: string) => request<MealAlternativeRecord[]>(`/meal-plans/${planId}/items/${itemId}/alternatives`),
    replaceMeal: (planId: string, itemId: string, input: { recipeId: string; reason?: 'DISLIKED' | 'UNAVAILABLE' | 'TOO_LONG' | 'TOO_EXPENSIVE' | 'VARIETY' | 'OTHER' }) => request<DailyMealPlanRecord>(`/meal-plans/${planId}/items/${itemId}/replace`, { method: 'POST', body: JSON.stringify(input) }),
    startCooking: (planId: string, itemId: string) => request<DailyMealPlanRecord['items'][number]>(`/meal-plans/${planId}/items/${itemId}/cooking`, { method: 'POST' }),
    consumeMealPlanItem: (planId: string, itemId: string, fraction: 1 | 0.75 | 0.5 | 0.25) => request<{ plan: DailyMealPlanRecord; mealLogId: string; alreadyConsumed: boolean; nutrition: DailyNutritionSummaryRecord }>(`/meal-plans/${planId}/items/${itemId}/consume`, { method: 'POST', body: JSON.stringify({ fraction }) }),
    previewFlexKitchen: (input: { localDate: string; servings: number; ingredients: FlexKitchenIngredientInput[] }) => request<FlexKitchenPreviewRecord>('/flex-kitchen/preview', { method: 'POST', body: JSON.stringify(input) }),
    consumeFlexKitchen: (input: { localDate: string; recipeName: string; mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'; servings: number; fraction: 1 | 0.75 | 0.5 | 0.25; ingredients: FlexKitchenIngredientInput[] }) => request<{ mealLogId: string; nutrition: DailyNutritionSummaryRecord }>('/flex-kitchen/consume', { method: 'POST', body: JSON.stringify(input) }),
    getSubstitutions: (input: { localDate: string; ingredient: FlexKitchenIngredientInput; replacementFoodItemId?: string }) => request<FoodSubstitutionRecord[]>('/flex-kitchen/substitutions', { method: 'POST', body: JSON.stringify(input) }),
    getPersonalRecipes: () => request<RecipeRecord[]>('/profiles/me/recipes'),
    savePersonalRecipe: (input: { name: string; description?: string; servings: number; prepTimeMinutes?: number; cookTimeMinutes?: number; difficulty?: 'EASY' | 'MEDIUM' | 'HARD'; estimatedCostCategory?: 'LOW' | 'MEDIUM' | 'HIGH'; cookingMethod: 'RAW' | 'BOILED' | 'STEAMED' | 'GRILLED' | 'BAKED' | 'FRIED' | 'STIR_FRIED' | 'OTHER'; mealTypes: Array<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'>; ingredients: FlexKitchenIngredientInput[]; notes?: string; steps?: Array<{ instruction: string; timerSeconds?: number }> }) => request<RecipeRecord>('/profiles/me/recipes', { method: 'POST', body: JSON.stringify(input) }),
    updatePersonalRecipe: (id: string, input: Record<string, unknown>) => request<RecipeRecord>(`/profiles/me/recipes/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    duplicatePersonalRecipe: (id: string) => request<RecipeRecord>(`/profiles/me/recipes/${id}/duplicate`, { method: 'POST' }),
    archivePersonalRecipe: (id: string) => request<RecipeRecord>(`/profiles/me/recipes/${id}/archive`, { method: 'POST' }),
    generateFeatureSnapshot: () => request<{ snapshot: FeatureSnapshotRecord; reused: boolean }>('/analysis/features/generate', { method: 'POST' }),
    getLatestFeatureSnapshot: () => request<FeatureSnapshotRecord>('/analysis/features/latest'),
    generatePatternMap: () => request<Phase7AnalysisResult>('/pattern-maps/generate', { method: 'POST' }),
    getCurrentPatternMap: () => request<PatternMapRecord>('/pattern-maps/current'),
    getPatternMap: (id: string) => request<PatternMapRecord>(`/pattern-maps/${id}`),
    savePatternMapFeedback: (id: string, value: PatternMapFeedbackValue, notes?: string) => request<PatternMapRecord>(`/pattern-maps/${id}/feedback`, { method: 'POST', body: JSON.stringify({ value, ...(notes ? { notes } : {}) }) }),
    getDecision: (id: string) => request<DecisionRecordRecord>(`/decisions/${id}`),
    getCurrentWeeklyAction: () => request<WeeklyActionAssignmentRecord>('/weekly-actions/current'),
    getWeeklyActionHistory: () => request<WeeklyActionAssignmentRecord[]>('/weekly-actions/history'),
    checkInWeeklyAction: (id: string, localDate: string) => request<WeeklyActionAssignmentRecord>(`/weekly-actions/${id}/check-ins`, { method: 'POST', body: JSON.stringify({ localDate }) }),
    undoWeeklyActionCheckIn: (id: string, localDate: string) => request<WeeklyActionAssignmentRecord>(`/weekly-actions/${id}/check-ins/${localDate}`, { method: 'DELETE' }),
  };
}
