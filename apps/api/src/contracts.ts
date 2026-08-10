import type {
  ConsentDefinition,
  ConsentRecord,
  ConsentSource,
  ConsentType,
  GoalCode,
  GoalDefinitionRecord,
  GuardianConsentRecord,
  OnboardingProgressRecord,
  OnboardingRole,
  OnboardingStatus,
  OnboardingStep,
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
  UserRole,
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
  StepRecordValue,
  FoodItemRecord,
  FoodServingRecord,
  MealLogItemRecord,
  NutrientCode,
  NutritionSnapshotRecord,
  NutritionTargetProfileRecord,
  DailyMealPlanRecord,
  FlexKitchenIngredientInput,
  MealPlanItemRecord,
  NutrientAmountMap,
  RecipeRecord,
  RecipeStepRecord,
  DecisionRecordRecord,
  FeatureSnapshotRecord,
  PatternMapFeedbackValue,
  PatternMapRecord,
  Phase7AnalysisResult,
  WeeklyActionAssignmentRecord,
} from '@sarira/shared-types';
import type { FeatureEngineInput, FeatureEngineOutput } from '@sarira/feature-engine';
import type { Phase7EvaluationOutput } from '@sarira/expert-system';
import type {
  ActivityLogInput,
  DailyCheckInInput,
  DigestiveLogInput,
  MealLogInput,
  SleepLogInput,
} from '@sarira/validation';

export interface AuthIdentity {
  externalAuthId: string;
  email: string;
}

export interface AuthTokens extends AuthIdentity {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthPort {
  register(email: string, password: string, name: string): Promise<AuthTokens>;
  login(email: string, password: string): Promise<AuthTokens>;
  verify(accessToken: string): Promise<AuthIdentity>;
  logout(accessToken: string): Promise<void>;
}

export interface AccountRecord extends AuthIdentity {
  id: string;
  roles: UserRole[];
}

export type ProfileRecord = UserProfile;

export interface AdminConfigurationVersions {
  consentVersions: Array<{ type: string; version: string; status: string }>;
  questionnaireVersions: Array<{ code: string; version: string; status: string }>;
  safetyVersions: Array<{ code: string; version: string; ruleVersions: string[]; status: string }>;
  goals: Array<{ code: string; status: string }>;
}

export interface DataRepositories {
  accounts: {
    getOrCreate(identity: AuthIdentity): Promise<AccountRecord>;
    findById(id: string): Promise<AccountRecord | null>;
  };
  profiles: {
    getByUserId(userId: string): Promise<ProfileRecord | null>;
    ensure(userId: string, fullName: string): Promise<ProfileRecord>;
    update(userId: string, input: Partial<Pick<ProfileRecord, 'fullName' | 'dateOfBirth' | 'declaredAge' | 'ageRecordedAt' | 'gender' | 'country' | 'timezone' | 'preferredLanguage' | 'primaryRole' | 'onboardingStatus' | 'onboardingCompletedAt'>>): Promise<ProfileRecord>;
  };
  roles: {
    available(): Promise<Array<{ role: OnboardingRole; label: string; description: string }>>;
    setPrimary(userId: string, role: OnboardingRole): Promise<ProfileRecord>;
  };
  consents: {
    required(): Promise<ConsentDefinition[]>;
    definitions(): Promise<ConsentDefinition[]>;
    list(userId: string): Promise<ConsentRecord[]>;
    set(userId: string, profileId: string, type: ConsentType, version: string, granted: boolean, source: ConsentSource): Promise<ConsentRecord>;
    revoke(userId: string, profileId: string, type: ConsentType, source: ConsentSource): Promise<ConsentRecord>;
  };
  guardian: {
    get(profileId: string): Promise<GuardianConsentRecord | null>;
    set(profileId: string, input: { guardianName: string; guardianRelationship: string; consentVersion: string }): Promise<GuardianConsentRecord>;
    revoke(profileId: string): Promise<GuardianConsentRecord>;
  };
  onboarding: {
    get(userId: string, profileId: string): Promise<OnboardingProgressRecord>;
    advance(userId: string, profileId: string, input: { status: OnboardingStatus; currentStep: OnboardingStep; lastCompletedStep?: OnboardingStep }): Promise<OnboardingProgressRecord>;
    touch(userId: string, profileId: string, currentStep: OnboardingStep): Promise<OnboardingProgressRecord>;
    complete(userId: string, profileId: string): Promise<OnboardingProgressRecord>;
  };
  safety: {
    currentTemplate(): Promise<SafetyTemplateRecord>;
    createSession(userId: string, profileId: string): Promise<SafetySessionRecord>;
    saveAnswers(userId: string, sessionId: string, answers: Array<{ questionId: string; answerCode: SafetyAnswerCode }>): Promise<SafetySessionRecord>;
    getSession(userId: string, sessionId: string): Promise<SafetySessionRecord | null>;
    latestCompleted(profileId: string): Promise<SafetyResultRecord | null>;
    complete(userId: string, sessionId: string, result: Omit<SafetyResultRecord, 'id' | 'sessionId' | 'profileId' | 'completedAt'>): Promise<SafetyResultRecord>;
  };
  goals: {
    definitions(): Promise<GoalDefinitionRecord[]>;
    get(profileId: string): Promise<UserGoalRecord | null>;
    set(userId: string, profileId: string, code: GoalCode): Promise<UserGoalRecord>;
  };
  questionnaires: {
    onboardingTemplate(): Promise<QuestionnaireTemplateRecord>;
    createSession(userId: string, profileId: string, templateId: string): Promise<QuestionnaireSessionRecord>;
    getSession(userId: string, sessionId: string): Promise<QuestionnaireSessionRecord | null>;
    latest(profileId: string): Promise<QuestionnaireSessionRecord | null>;
    saveAnswers(userId: string, sessionId: string, answers: Array<{ questionId: string; value: QuestionnaireAnswerValue }>): Promise<QuestionnaireSessionRecord>;
    complete(userId: string, sessionId: string): Promise<QuestionnaireSessionRecord>;
  };
  programs: {
    get(profileId: string): Promise<ProgramPreferenceRecord | null>;
    set(profileId: string, program: ProgramPreferenceRecord['program']): Promise<ProgramPreferenceRecord>;
  };
  baseline: BaselineRepository;
  nutrition: NutritionRepository;
  mealPlanning: MealPlanningRepository;
  analysis: AnalysisRepository;
  admin: { configurationVersions(): Promise<AdminConfigurationVersions> };
  audit: {
    record(input: { actorUserId?: string; event: string; entityType: string; entityId?: string; requestId?: string; metadata?: Record<string, string | boolean | number> }): Promise<void>;
  };
}

export interface AnalysisRepository {
  loadFeatureInput(profileId: string, baselineId: string): Promise<FeatureEngineInput>;
  findFeatureSnapshot(profileId: string, baselineId: string, featureEngineVersion: string, inputSignature: string): Promise<FeatureSnapshotRecord | null>;
  saveFeatureSnapshot(input: { profileId: string; baselineId: string; generatedAt: string; inputSignature: string; output: FeatureEngineOutput; periodStart: string; periodEnd: string }): Promise<FeatureSnapshotRecord>;
  getLatestFeatureSnapshot(profileId: string): Promise<FeatureSnapshotRecord | null>;
  persistAnalysis(input: { profileId: string; baselineId: string; snapshot: FeatureSnapshotRecord; evaluation: Phase7EvaluationOutput; inputSignature: string; generatedAt: string; weekStart: string }): Promise<Phase7AnalysisResult>;
  getCurrentPatternMap(profileId: string): Promise<PatternMapRecord | null>;
  getPatternMap(profileId: string, id: string): Promise<PatternMapRecord | null>;
  getDecision(profileId: string, id: string): Promise<DecisionRecordRecord | null>;
  savePatternFeedback(profileId: string, patternMapId: string, value: PatternMapFeedbackValue, notes?: string): Promise<PatternMapRecord>;
  getCurrentWeeklyAction(profileId: string): Promise<WeeklyActionAssignmentRecord | null>;
  getWeeklyAction(profileId: string, assignmentId: string): Promise<WeeklyActionAssignmentRecord | null>;
  listWeeklyActions(profileId: string): Promise<WeeklyActionAssignmentRecord[]>;
  addWeeklyActionCheckIn(profileId: string, assignmentId: string, localDate: string, source: 'AUTO_VERIFIED' | 'USER_CONFIRMED', evidenceRef?: string): Promise<WeeklyActionAssignmentRecord>;
  removeWeeklyActionCheckIn(profileId: string, assignmentId: string, localDate: string): Promise<WeeklyActionAssignmentRecord>;
  previousActionCodes(profileId: string): Promise<string[]>;
  configurationVersions(): Promise<{ scoringPolicies: Array<{ code: string; version: string; requiresExpertValidation: boolean }>; rules: Array<{ ruleId: string; version: string; domain: string; requiresExpertValidation: boolean }>; actions: Array<{ code: string; version: string; domain: string; requiresExpertValidation: boolean }> }>;
}

export interface MealPlanningPolicyRecord {
  id: string;
  code: string;
  version: string;
  configuration: {
    weights: { mealType: number; protein: number; fiber: number; upperLimits: number; time: number; cost: number; preference: number; dataQuality: number };
    criticalNutrients: NutrientCode[];
    snackEnabled: boolean;
    alternativesMinimum: number;
    alternativesMaximum: number;
  };
  requiresProductValidation: boolean;
}

export interface RecipeVersionWriteInput {
  name: string;
  description: string;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  estimatedCostCategory: 'LOW' | 'MEDIUM' | 'HIGH';
  cookingMethod: 'RAW' | 'BOILED' | 'STEAMED' | 'GRILLED' | 'BAKED' | 'FRIED' | 'STIR_FRIED' | 'OTHER';
  mealTypes: Array<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'>;
  notes?: string;
  ingredients: Array<FlexKitchenIngredientInput & { foodName: string; gramAmount?: number; sourceType: 'OFFICIAL_DATABASE' | 'PRODUCT_LABEL' | 'INTERNAL_VERIFIED' | 'USER_ENTERED' | 'SYNTHETIC_TEST_DATA' }>;
  steps: Array<Pick<RecipeStepRecord, 'instruction' | 'timerSeconds'>>;
  nutrition: { total: NutrientAmountMap; perServing: NutrientAmountMap; missingNutrients: NutrientCode[]; complete: boolean; sourceVersions: string[]; calculationVersion: string; calculatedAt: string };
}

export interface MealPlanningRepository {
  getActivePolicy(): Promise<MealPlanningPolicyRecord | null>;
  listRecipes(input: { profileId: string; query?: string; mealType?: string; page: number; pageSize: number }): Promise<{ items: RecipeRecord[]; total: number; page: number; pageSize: number }>;
  getRecipe(id: string, profileId: string): Promise<RecipeRecord | null>;
  getCurrentPlan(profileId: string, localDate: string): Promise<DailyMealPlanRecord | null>;
  getPlan(id: string, profileId: string): Promise<DailyMealPlanRecord | null>;
  createPlan(input: { profileId: string; localDate: string; targetProfileId: string; policy: MealPlanningPolicyRecord; nutritionPolicyVersion: string; targetSnapshot: unknown; generatedAt: string; items: Array<{ mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'; recipe: RecipeRecord; reasonCodes: string[]; recommendationFit: 'HIGH' | 'MEDIUM' | 'LOW'; score: number; nutritionImpact: NutrientAmountMap }> }): Promise<DailyMealPlanRecord>;
  replacePlanItem(input: { profileId: string; planId: string; itemId: string; recipe: RecipeRecord; reasonCodes: string[]; recommendationFit: 'HIGH' | 'MEDIUM' | 'LOW'; score: number; nutritionImpact: NutrientAmountMap; replacementReason?: string }): Promise<DailyMealPlanRecord>;
  setCooking(input: { profileId: string; planId: string; itemId: string }): Promise<MealPlanItemRecord>;
  consumePlanItem(input: { profileId: string; baselineSessionId: string; dayIndex: number; planId: string; itemId: string; localDate: string; mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'; recipeName: string; fraction: number; consumedAt: string; ingredientItems: Array<{ foodItemId?: string; servingId?: string; itemSource: 'DATABASE_FOOD' | 'CUSTOM_FOOD' | 'USER_ENTERED'; customName?: string; quantity: number; gramAmount?: number; sourceVersion: string; snapshot: Omit<NutritionSnapshotRecord, 'id'>; allergenWarnings: MealLogItemRecord['allergenWarnings'] }> }): Promise<{ plan: DailyMealPlanRecord; mealLogId: string; alreadyConsumed: boolean }>;
  listPersonalRecipes(profileId: string): Promise<RecipeRecord[]>;
  createPersonalRecipe(profileId: string, input: RecipeVersionWriteInput): Promise<RecipeRecord>;
  updatePersonalRecipe(profileId: string, recipeId: string, input: RecipeVersionWriteInput): Promise<RecipeRecord>;
  duplicatePersonalRecipe(profileId: string, recipeId: string): Promise<RecipeRecord>;
  archivePersonalRecipe(profileId: string, recipeId: string): Promise<RecipeRecord>;
}

export interface NutritionPolicyRecord {
  id: string;
  code: string;
  version: string;
  ageMin: number;
  ageMax: number;
  applicableSex?: ProfileRecord['gender'];
  applicableGoals: string[];
  applicableSafetyStatuses: string[];
  targetConfiguration: Record<string, unknown>;
  requiresExpertValidation: boolean;
}

export interface NutritionFoodDetail extends FoodItemRecord {
  nutrients: Array<{ nutrientCode: NutrientCode; amount: number; unit: string; basisAmount: number; basisUnit: 'G'; sourceVersion: string }>;
}

export interface NutritionRepository {
  listNutrients(): Promise<Array<{ code: NutrientCode; displayName: string; unit: string; category: string; decimalPrecision: number }>>;
  searchFoods(input: { query?: string; category?: string; verified?: boolean; page: number; pageSize: number }): Promise<{ items: FoodItemRecord[]; total: number; page: number; pageSize: number }>;
  getFood(id: string): Promise<NutritionFoodDetail | null>;
  getServings(foodItemId: string): Promise<FoodServingRecord[]>;
  getItem(id: string): Promise<MealLogItemRecord | null>;
  createItem(input: { mealLogId: string; profileId: string; localDate: string; foodItemId?: string; servingId?: string; itemSource: 'DATABASE_FOOD' | 'CUSTOM_FOOD' | 'USER_ENTERED'; customName?: string; quantity: number; gramAmount?: number; sourceVersion: string; snapshot: Omit<NutritionSnapshotRecord, 'id'>; allergenWarnings: MealLogItemRecord['allergenWarnings'] }): Promise<MealLogItemRecord>;
  updateItem(id: string, input: { servingId?: string; quantity: number; gramAmount?: number; sourceVersion: string; snapshot: Omit<NutritionSnapshotRecord, 'id'>; allergenWarnings: MealLogItemRecord['allergenWarnings'] }): Promise<MealLogItemRecord>;
  deleteItem(id: string): Promise<void>;
  listItemsForDate(profileId: string, localDate: string): Promise<MealLogItemRecord[]>;
  getProfileAllergenText(profileId: string): Promise<string>;
  getActivePolicies(): Promise<NutritionPolicyRecord[]>;
  getCurrentTarget(profileId: string, localDate: string): Promise<NutritionTargetProfileRecord | null>;
  saveTarget(input: { profileId: string; policy: NutritionPolicyRecord; target: Omit<NutritionTargetProfileRecord, 'id'> }): Promise<NutritionTargetProfileRecord>;
}

export interface BaselineRepository {
  getCurrent(profileId: string): Promise<BaselineSessionRecord | null>;
  getLatestForAnalysis(profileId: string): Promise<BaselineSessionRecord | null>;
  getById(profileId: string, baselineId: string): Promise<BaselineSessionRecord | null>;
  getOwnerProfileId(baselineId: string): Promise<string | null>;
  create(profileId: string, input: { startedAt: string; startLocalDate: string; timezone: string; targetDays: number; extensionAllowed: boolean; extensionDays: number; configVersion: string }): Promise<BaselineSessionRecord>;
  refresh(baselineId: string, input: { currentDay: number; status: BaselineSessionRecord['status']; calendarCompletedAt?: string; readinessStatus?: BaselineSessionRecord['readinessStatus']; completenessScore?: number }): Promise<BaselineSessionRecord>;
  complete(profileId: string, baselineId: string, completedAt: string): Promise<BaselineSessionRecord>;
  listDays(profileId: string, baselineId: string, throughDay: number, calculatedAt: string): Promise<BaselineDayRecord[]>;
  getDay(profileId: string, baselineId: string, localDate: string, dayIndex: number, calculatedAt: string): Promise<BaselineDayRecord>;
  getCheckIn(profileId: string, baselineId: string, localDate: string, dayIndex: number, calculatedAt: string): Promise<DailyCheckInRecord | null>;
  putCheckIn(profileId: string, baselineId: string, localDate: string, dayIndex: number, input: DailyCheckInInput, calculatedAt: string): Promise<DailyCheckInRecord>;
  listMeals(profileId: string, baselineId: string, localDate?: string): Promise<MealLogRecord[]>;
  getMealById(profileId: string, baselineId: string, id: string): Promise<MealLogRecord | null>;
  createMeal(profileId: string, baselineId: string, dayIndex: number, input: MealLogInput, calculatedAt: string): Promise<MealLogRecord>;
  updateMeal(profileId: string, baselineId: string, id: string, input: Partial<MealLogInput>, calculatedAt: string): Promise<MealLogRecord>;
  deleteMeal(profileId: string, baselineId: string, id: string, calculatedAt: string): Promise<void>;
  listSleep(profileId: string, baselineId: string, localDate?: string): Promise<SleepLogRecord[]>;
  createSleep(profileId: string, baselineId: string, dayIndex: number, input: SleepLogInput & { durationMinutes: number }, calculatedAt: string): Promise<SleepLogRecord>;
  updateSleep(profileId: string, baselineId: string, id: string, input: Partial<SleepLogInput> & { durationMinutes?: number }, calculatedAt: string): Promise<SleepLogRecord>;
  deleteSleep(profileId: string, baselineId: string, id: string, calculatedAt: string): Promise<void>;
  listActivity(profileId: string, baselineId: string, localDate?: string): Promise<ActivityLogRecord[]>;
  createActivity(profileId: string, baselineId: string, dayIndex: number, input: ActivityLogInput, calculatedAt: string): Promise<ActivityLogRecord>;
  updateActivity(profileId: string, baselineId: string, id: string, input: Partial<ActivityLogInput>, calculatedAt: string): Promise<ActivityLogRecord>;
  deleteActivity(profileId: string, baselineId: string, id: string, calculatedAt: string): Promise<void>;
  listSteps(profileId: string, baselineId: string): Promise<StepRecordValue[]>;
  putSteps(profileId: string, baselineId: string, localDate: string, dayIndex: number, input: { steps: number; sourceDevice?: string }, calculatedAt: string): Promise<StepRecordValue>;
  listBody(profileId: string, baselineId: string): Promise<BodyMeasurementRecord[]>;
  createBody(profileId: string, baselineId: string, dayIndex: number, input: { localDate: string; measuredAt: string; weightKg: number; waistCm?: number; notes?: string }, calculatedAt: string): Promise<BodyMeasurementRecord>;
  listDigestive(profileId: string, baselineId: string, localDate?: string): Promise<DigestiveLogRecord[]>;
  createDigestive(profileId: string, baselineId: string, dayIndex: number, input: DigestiveLogInput, calculatedAt: string): Promise<DigestiveLogRecord>;
  updateDigestive(profileId: string, baselineId: string, id: string, input: Partial<DigestiveLogInput>, calculatedAt: string): Promise<DigestiveLogRecord>;
  deleteDigestive(profileId: string, baselineId: string, id: string, calculatedAt: string): Promise<void>;
  getTasks(profileId: string, baselineId: string, localDate: string, dayIndex: number, calculatedAt: string): Promise<DailyTaskRecord[]>;
  updateTask(profileId: string, baselineId: string, id: string, status: DailyTaskRecord['status'], calculatedAt: string): Promise<DailyTaskRecord>;
  getCompleteness(profileId: string, baselineId: string, throughDay: number, localDate: string | undefined, calculatedAt: string): Promise<CompletenessRecord>;
  getDay7Checkpoint(profileId: string, baselineId: string, calculatedAt: string): Promise<Day7CheckpointRecord>;
  saveDay7Feedback(profileId: string, baselineId: string, input: { easeRating: number; hardestDomains: Array<'checkIn' | 'food' | 'sleep' | 'activity'>; wantsToContinue: boolean; notes?: string }, calculatedAt: string): Promise<Day7FeedbackRecord>;
  getReadiness(profileId: string, baselineId: string, throughDay: number, calculatedAt: string): Promise<BaselineReadinessRecord>;
}
