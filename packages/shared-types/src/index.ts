export type SafetyStatus = 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
export type SafetyDisplayStatus = Lowercase<SafetyStatus>;
export type ConfidenceLevel = 'rendah' | 'sedang' | 'tinggi';
export type ProfileSegment = 'teen' | 'young-adult' | 'adult' | 'healthy-aging' | 'child';
export type DataSource = 'manual' | 'apple-health' | 'health-connect' | 'caregiver';

export const userRoles = [
  'USER',
  'PARENT',
  'GUARDIAN',
  'CAREGIVER',
  'ADMIN',
  'CONTENT_REVIEWER',
  'NUTRITION_REVIEWER',
  'SUPER_ADMIN',
] as const;

export const onboardingRoles = ['USER', 'PARENT', 'GUARDIAN', 'CAREGIVER'] as const;
export type UserRole = (typeof userRoles)[number];
export type OnboardingRole = (typeof onboardingRoles)[number];
export type AppEnvironment = 'development' | 'test' | 'staging' | 'production';

export const onboardingStatuses = [
  'ACCOUNT_CREATED',
  'ROLE_PENDING',
  'ROLE_COMPLETED',
  'BIRTH_DATE_PENDING',
  'GUARDIAN_CONSENT_PENDING',
  'PRIVACY_CONSENT_PENDING',
  'SAFETY_SCREENING_PENDING',
  'GOAL_PENDING',
  'QUESTIONNAIRE_PENDING',
  'PROGRAM_PREFERENCE_PENDING',
  'REVIEW_PENDING',
  'COMPLETED',
] as const;

export type OnboardingStatus = (typeof onboardingStatuses)[number];
export type OnboardingStep =
  | 'role-selection'
  | 'birth-date'
  | 'guardian-consent'
  | 'privacy-consent'
  | 'safety-screening'
  | 'safety-result'
  | 'goal-selection'
  | 'profile-questionnaire'
  | 'program-preference'
  | 'profile-summary'
  | 'starter-journey';

export type AgeGroup =
  | 'UNDER_12'
  | 'TEEN'
  | 'YOUNG_ADULT'
  | 'ADULT_BALANCE'
  | 'HEALTHY_AGING'
  | 'OVER_75';

export const consentTypes = [
  'TERMS_OF_SERVICE',
  'PRIVACY_POLICY',
  'HEALTH_PROFILE',
  'NUTRITION_DATA',
  'ACTIVITY_DATA',
  'SLEEP_DATA',
  'CAMERA_FOOD',
  'CAMERA_WORKOUT',
  'LOCATION',
  'WEARABLE',
  'BODY_PHOTO',
  'CHILD_DATA',
] as const;

export type ConsentType = (typeof consentTypes)[number];
export type ConsentSource = 'ONBOARDING' | 'SETTINGS' | 'FEATURE_PROMPT' | 'GUARDIAN_FLOW';
export type ConsentStatus = 'GRANTED' | 'REVOKED';
export type SafetyAnswerCode = 'YES' | 'NO' | 'NOT_SURE';

export const goalCodes = [
  'LOSE_WEIGHT',
  'GAIN_WEIGHT',
  'MAINTAIN_WEIGHT',
  'BUILD_HEALTHY_HABITS',
  'OPTIMIZE_GROWTH',
  'IMPROVE_FITNESS',
  'MAINTAIN_MOBILITY',
  'FAMILY_NUTRITION',
  'CHILD_GROWTH_SUPPORT',
] as const;

export type GoalCode = (typeof goalCodes)[number];
export type ProgramCode = 'GUIDED_MEAL' | 'FLEX_KITCHEN';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'failed';

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: Record<string, unknown>;
}

export interface ApiFailure {
  success: false;
  error: { code: string; message: string; details: unknown[] };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: UserRole[];
  onboardingCompleted: boolean;
  onboardingStatus: OnboardingStatus;
  currentStep: OnboardingStep;
}

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth?: string;
  age?: number;
  ageGroup?: AgeGroup;
  gender?: 'FEMALE' | 'MALE' | 'OTHER' | 'UNDISCLOSED';
  country: string;
  timezone: string;
  preferredLanguage: string;
  primaryRole?: UserRole;
  onboardingStatus: OnboardingStatus;
  onboardingCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingProgressRecord {
  id: string;
  userId: string;
  profileId: string;
  status: OnboardingStatus;
  currentStep: OnboardingStep;
  lastCompletedStep?: OnboardingStep;
  stateVersion: number;
  startedAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface ConsentDefinition {
  id: string;
  type: ConsentType;
  version: string;
  displayName: string;
  description: string;
  required: boolean;
  contentStatus: 'DEVELOPMENT_REQUIRES_EXPERT_VALIDATION' | 'ACTIVE' | 'RETIRED';
  expertValidationRequired: boolean;
}

export interface ConsentRecord {
  id: string;
  type: ConsentType;
  version: string;
  status: ConsentStatus;
  source: ConsentSource;
  grantedAt?: string;
  revokedAt?: string;
  updatedAt: string;
}

export interface GuardianConsentRecord {
  id: string;
  minorProfileId: string;
  guardianName: string;
  guardianRelationship: string;
  status: ConsentStatus;
  consentVersion: string;
  grantedAt?: string;
  revokedAt?: string;
  updatedAt: string;
}

export interface SafetyQuestionRecord {
  id: string;
  code: string;
  category: string;
  prompt: string;
  helpText?: string;
  required: boolean;
  allowsUnknown: boolean;
  sortOrder: number;
}

export interface SafetyTemplateRecord {
  id: string;
  code: string;
  version: string;
  title: string;
  description: string;
  contentStatus: string;
  expertValidationRequired: boolean;
  questions: SafetyQuestionRecord[];
}

export interface SafetyAnswerRecord {
  questionId: string;
  questionCode: string;
  answerCode: SafetyAnswerCode;
  updatedAt: string;
}

export interface SafetyResultRecord {
  id: string;
  sessionId: string;
  profileId: string;
  status: SafetyStatus;
  triggeredRules: string[];
  restrictedPrograms: string[];
  referralRequired: boolean;
  ruleVersion: string;
  completedAt: string;
}

export interface SafetySessionRecord {
  id: string;
  profileId: string;
  templateId: string;
  templateVersion: string;
  ruleVersion: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
  answers: SafetyAnswerRecord[];
  result?: SafetyResultRecord;
  startedAt: string;
  updatedAt: string;
}

export interface GoalDefinitionRecord {
  id: string;
  code: GoalCode;
  label: string;
  description: string;
  eligible: boolean;
  disabledReason?: string;
  priority: boolean;
  expertValidationRequired: boolean;
}

export interface UserGoalRecord {
  id: string;
  code: GoalCode;
  label: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  updatedAt: string;
}

export type QuestionnaireAnswerValue = string | number | boolean | string[] | null;

export interface QuestionnaireOptionRecord {
  id: string;
  code: string;
  label: string;
  sortOrder: number;
}

export interface QuestionnaireQuestionRecord {
  id: string;
  code: string;
  section: string;
  prompt: string;
  helpText?: string;
  valueType: 'TEXT' | 'NUMBER' | 'SINGLE_SELECT' | 'MULTI_SELECT' | 'BOOLEAN' | 'TIME';
  required: boolean;
  sortOrder: number;
  validation?: Record<string, unknown>;
  visibleWhen?: { questionCode: string; operator: 'equals' | 'includes'; value: QuestionnaireAnswerValue };
  options: QuestionnaireOptionRecord[];
}

export interface QuestionnaireTemplateRecord {
  id: string;
  code: string;
  version: string;
  title: string;
  description: string;
  contentStatus: string;
  expertValidationRequired: boolean;
  questions: QuestionnaireQuestionRecord[];
}

export interface QuestionnaireAnswerRecord {
  questionId: string;
  questionCode: string;
  value: QuestionnaireAnswerValue;
  updatedAt: string;
}

export interface QuestionnaireSessionRecord {
  id: string;
  profileId: string;
  templateId: string;
  templateVersion: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
  answers: QuestionnaireAnswerRecord[];
  startedAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface ProgramEligibilityRecord {
  code: ProgramCode;
  label: string;
  description: string;
  eligible: boolean;
  reasonCodes: string[];
}

export interface ProgramPreferenceRecord {
  id: string;
  profileId: string;
  program: ProgramCode;
  selectedAt: string;
  updatedAt: string;
}

export interface OnboardingSummaryRecord {
  profile: UserProfile;
  ageGroup?: AgeGroup;
  guardianConsent?: GuardianConsentRecord;
  consents: ConsentRecord[];
  safetyResult?: SafetyResultRecord;
  goal?: UserGoalRecord;
  questionnaire?: QuestionnaireSessionRecord;
  programPreference?: ProgramPreferenceRecord;
  completionIssues: string[];
}

export const baselineStatuses = [
  'ACTIVE',
  'DAY_7_REVIEW_AVAILABLE',
  'DAY_14_REVIEW_AVAILABLE',
  'DATA_INSUFFICIENT',
  'COMPLETED',
  'PAUSED',
  'CANCELLED',
] as const;
export type BaselineStatus = (typeof baselineStatuses)[number];
export type BaselineReadinessStatus = 'PENDING' | 'READY' | 'PARTIALLY_READY' | 'INSUFFICIENT_DATA';
export type DailyCompletenessStatus = 'COMPLETE' | 'PARTIAL' | 'MISSING';
export type BaselineDayState = DailyCompletenessStatus | 'TODAY' | 'UPCOMING';
export type TrackingSource = 'MANUAL' | 'APPLE_HEALTH' | 'HEALTH_CONNECT' | 'GARMIN' | 'FITBIT' | 'SAMSUNG' | 'HUAWEI' | 'OURA' | 'OTHER';
export type MoodLevel = 'VERY_LOW' | 'LOW' | 'NEUTRAL' | 'GOOD' | 'VERY_GOOD';
export type BarrierCode = 'BUSY' | 'FORGOT' | 'FOOD_UNAVAILABLE' | 'LACK_OF_SLEEP' | 'NO_TIME_FOR_ACTIVITY' | 'NONE' | 'OTHER';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER';
export type SleepQuality = 'POOR' | 'FAIR' | 'GOOD' | 'VERY_GOOD';
export type ActivityType = 'WALKING' | 'RUNNING' | 'CYCLING' | 'STRENGTH' | 'STRETCHING' | 'SPORT' | 'OTHER';
export type PerceivedIntensity = 'LIGHT' | 'MODERATE' | 'VIGOROUS';
export type DigestiveSymptomType = 'BLOATING' | 'NAUSEA' | 'ABDOMINAL_PAIN' | 'DIARRHEA' | 'CONSTIPATION' | 'HEARTBURN' | 'LOW_APPETITE' | 'POST_MEAL_DISCOMFORT' | 'OTHER';
export type DailyTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
export type BaselineDomain = 'checkIn' | 'food' | 'sleep' | 'activity';

export interface BaselineSessionRecord {
  id: string;
  profileId: string;
  status: BaselineStatus;
  startedAt: string;
  startLocalDate: string;
  timezone: string;
  currentDay: number;
  targetDays: number;
  calendarCompletedAt?: string;
  completedAt?: string;
  readinessStatus: BaselineReadinessStatus;
  completenessScore: number;
  extensionAllowed: boolean;
  extensionDays: number;
  configVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyCheckInRecord {
  id: string;
  profileId: string;
  baselineSessionId: string;
  dailyRecordId: string;
  localDate: string;
  mood: MoodLevel;
  hunger: number;
  fullness: number;
  energy?: number;
  bodyFeeling?: string;
  barriers: BarrierCode[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MealLogRecord {
  id: string;
  profileId: string;
  baselineSessionId: string;
  dailyRecordId: string;
  localDate: string;
  mealType: MealType;
  eatenAt?: string;
  description?: string;
  source: TrackingSource;
  skipped: boolean;
  sugaryDrinkConsumed?: boolean;
  lateMeal?: boolean;
  homeCooked?: boolean;
  eatingContext?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SleepLogRecord {
  id: string;
  profileId: string;
  baselineSessionId: string;
  dailyRecordId: string;
  localDate: string;
  sleepStartedAt: string;
  wokeUpAt: string;
  durationMinutes: number;
  perceivedQuality: SleepQuality;
  nightAwakenings?: number;
  notes?: string;
  source: TrackingSource;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLogRecord {
  id: string;
  profileId: string;
  baselineSessionId: string;
  dailyRecordId: string;
  localDate: string;
  activityType: ActivityType;
  startedAt?: string;
  durationMinutes: number;
  perceivedIntensity: PerceivedIntensity;
  description?: string;
  notes?: string;
  source: TrackingSource;
  createdAt: string;
  updatedAt: string;
}

export interface StepRecordValue {
  id: string;
  profileId: string;
  baselineSessionId: string;
  dailyRecordId: string;
  localDate: string;
  steps: number;
  source: TrackingSource;
  sourceDevice?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BodyMeasurementRecord {
  id: string;
  profileId: string;
  baselineSessionId: string;
  dailyRecordId: string;
  localDate: string;
  measuredAt: string;
  weightKg: number;
  waistCm?: number;
  source: TrackingSource;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DigestiveLogRecord {
  id: string;
  profileId: string;
  baselineSessionId: string;
  dailyRecordId: string;
  localDate: string;
  symptomType: DigestiveSymptomType;
  occurredAt: string;
  intensity: number;
  relatedMealId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyTaskRecord {
  id: string;
  definitionCode: BaselineDomain;
  title: string;
  localDate: string;
  status: DailyTaskStatus;
  progress: number;
  target: number;
  completedAt?: string;
  source: 'SYSTEM' | 'USER';
}

export interface CompletenessRecord {
  scope: 'DAILY' | 'OVERALL';
  localDate?: string;
  status: DailyCompletenessStatus;
  score: number;
  achievedDomains: BaselineDomain[];
  missingDomains: BaselineDomain[];
  domainCoverage: Record<BaselineDomain, number>;
  completedDays: number;
  elapsedDays: number;
  configVersion: string;
  validationStatus: 'REQUIRES_PRODUCT_EXPERT_VALIDATION';
  calculatedAt: string;
}

export interface BaselineDayRecord {
  id?: string;
  localDate: string;
  dayIndex: number;
  state: BaselineDayState;
  completenessStatus: DailyCompletenessStatus;
  completedAt?: string;
  categoryCount: number;
  tasks: DailyTaskRecord[];
  checkIn?: DailyCheckInRecord;
  mealLogs: MealLogRecord[];
  sleepLogs: SleepLogRecord[];
  activityLogs: ActivityLogRecord[];
  stepRecord?: StepRecordValue;
  bodyMeasurements: BodyMeasurementRecord[];
  digestiveLogs: DigestiveLogRecord[];
}

export interface Day7CheckpointRecord {
  id: string;
  baselineSessionId: string;
  generatedAt: string;
  observedDays: number;
  daysWithData: number;
  domainCoverage: Record<BaselineDomain, number>;
  missingDomains: BaselineDomain[];
  observations: string[];
  disclaimer: string;
}

export interface Day7FeedbackRecord {
  id: string;
  baselineSessionId: string;
  easeRating: number;
  hardestDomains: BaselineDomain[];
  wantsToContinue: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BaselineReadinessRecord {
  id: string;
  baselineSessionId: string;
  status: Exclude<BaselineReadinessStatus, 'PENDING'>;
  domainCoverage: Record<BaselineDomain, number>;
  missingDomains: BaselineDomain[];
  totalDays: number;
  completedDays: number;
  completenessScore: number;
  reasonCodes: string[];
  recommendation: string;
  configVersion: string;
  evaluatedAt: string;
}

export interface StarterJourneyRecord {
  profile: UserProfile;
  ageGroup: AgeGroup;
  goal: UserGoalRecord;
  safetyResult: SafetyResultRecord;
  programPreference?: ProgramPreferenceRecord;
  baseline: BaselineSessionRecord | null;
}

export const nutrientCodes = ['ENERGY_KCAL', 'PROTEIN_G', 'CARBOHYDRATE_G', 'FAT_G', 'SATURATED_FAT_G', 'FIBER_G', 'SUGAR_G', 'SODIUM_MG'] as const;
export type NutrientCode = (typeof nutrientCodes)[number];
export type FoodCategory = 'GRAIN' | 'PROTEIN' | 'VEGETABLE' | 'FRUIT' | 'DAIRY' | 'BEVERAGE' | 'SNACK' | 'CONDIMENT' | 'MIXED_DISH' | 'OTHER';
export type FoodUnit = 'G' | 'KG' | 'ML' | 'L' | 'PIECE' | 'SERVING' | 'TBSP' | 'TSP' | 'CUP';
export type AllergenCode = 'MILK' | 'EGG' | 'FISH' | 'SHELLFISH' | 'PEANUT' | 'TREE_NUT' | 'SOY' | 'WHEAT' | 'SESAME' | 'OTHER';
export type DietaryTagCode = 'VEGETARIAN' | 'VEGAN' | 'HALAL_VERIFIED' | 'PORK' | 'ALCOHOL' | 'OTHER';
export type TargetType = 'MINIMUM' | 'RANGE' | 'UPPER_LIMIT';
export type NutritionPolicyStatus = 'DRAFT' | 'ACTIVE' | 'DEPRECATED';
export type NutrientAmountMap = Record<NutrientCode, number | null>;

export interface FoodDataSourceRecord {
  id: string; name: string; publisher: string; version: string;
  sourceType: 'OFFICIAL_DATABASE' | 'PRODUCT_LABEL' | 'INTERNAL_VERIFIED' | 'USER_ENTERED' | 'SYNTHETIC_TEST_DATA';
  sourceUrl?: string; license: string; datasetLabel: string; importedAt: string; reviewedAt?: string; active: boolean;
}

export interface FoodServingRecord {
  id: string; foodItemId: string; label: string; quantity: number; unit: FoodUnit;
  gramEquivalent?: number; defaultServing: boolean; source: string; verified: boolean;
}

export interface FoodItemRecord {
  id: string; code: string; name: string; alternateNames: string[]; category: FoodCategory;
  description?: string; countryCode: string; language: string; verified: boolean; active: boolean;
  source: FoodDataSourceRecord; servings: FoodServingRecord[];
  allergens: Array<{ code: AllergenCode; verified: boolean }>;
  dietaryTags: Array<{ code: DietaryTagCode; status: 'VERIFIED' | 'UNKNOWN' }>;
  nutrientCoverage?: NutrientCode[];
}

export interface NutritionSnapshotRecord {
  id: string; sourceVersion: string; foodName: string; gramAmount?: number;
  nutrients: NutrientAmountMap; missingNutrients: NutrientCode[]; complete: boolean; calculationVersion: string;
}

export interface MealLogItemRecord {
  id: string; mealLogId: string; profileId: string; foodItemId?: string; servingId?: string;
  itemSource: 'DATABASE_FOOD' | 'CUSTOM_FOOD' | 'USER_ENTERED'; customName?: string;
  quantity: number; gramAmount?: number; sourceVersion: string; snapshot: NutritionSnapshotRecord;
  allergenWarnings: Array<{ code: AllergenCode; label: string; matchedProfile: boolean; verified: boolean }>;
  createdAt: string; updatedAt: string;
}

export interface NutritionTargetEntry {
  nutrientCode: NutrientCode; type: TargetType; unit: 'kcal' | 'g' | 'mg';
  minimum?: number; target?: number; maximum?: number;
}

export interface NutritionTargetProfileRecord {
  id: string; profileId: string; policyCode: string; policyVersion: string; ageGroup: AgeGroup;
  goal: GoalCode; safetyStatus: SafetyStatus; effectiveFrom: string; effectiveTo?: string;
  targets: NutritionTargetEntry[]; calculationReason: string; calculatedAt: string;
  requiresExpertValidation: boolean; restricted: boolean; restrictionReasons: string[];
}

export interface NutritionIndicatorRecord {
  nutrientCode: NutrientCode; displayName: string; unit: string; amount: number | null;
  target?: NutritionTargetEntry; status: string; statusLabel: string; complete: boolean;
}

export interface DailyNutritionSummaryRecord {
  profileId: string; localDate: string; timezone: string; totals: NutrientAmountMap;
  missingNutrients: NutrientCode[]; complete: boolean; mealCount: number; itemCount: number;
  indicators: NutritionIndicatorRecord[]; target?: NutritionTargetProfileRecord;
  sourceVersions: string[]; calculatedAt: string;
  items: MealLogItemRecord[];
}

export interface NutritionHistoryRecord {
  from: string; to: string; days: DailyNutritionSummaryRecord[];
}

export type RecipeSourceType = 'INTERNAL_CURATED' | 'OFFICIAL_GUIDE' | 'EXPERT_REVIEWED' | 'USER_CREATED' | 'SYNTHETIC_DEVELOPMENT';
export type RecipeDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type EstimatedCostCategory = 'LOW' | 'MEDIUM' | 'HIGH';
export type CookingMethod = 'RAW' | 'BOILED' | 'STEAMED' | 'GRILLED' | 'BAKED' | 'FRIED' | 'STIR_FRIED' | 'OTHER';
export type RecipeVersionStatus = 'DRAFT' | 'ACTIVE' | 'RETIRED';
export type MealPlanStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'REPLACED' | 'EXPIRED';
export type MealPlanItemStatus = 'PLANNED' | 'REPLACED' | 'COOKING' | 'CONSUMED' | 'SKIPPED';
export type RecipeEligibilityStatus = 'ELIGIBLE' | 'WARNING' | 'INELIGIBLE';
export type RecommendationFit = 'HIGH' | 'MEDIUM' | 'LOW';

export interface RecipeIngredientRecord {
  id: string; foodItemId?: string; servingId?: string; customName?: string; foodName: string;
  quantity: number; gramAmount?: number; preparationNote?: string; optional: boolean;
  replacementGroup?: string; orderIndex: number; sourceType: FoodDataSourceRecord['sourceType'];
  userNutrition?: Partial<NutrientAmountMap>;
  food?: FoodItemRecord;
}

export interface RecipeStepRecord {
  id: string; orderIndex: number; instruction: string; timerSeconds?: number;
}

export interface RecipeNutritionRecord {
  id: string; recipeVersionId: string; total: NutrientAmountMap; perServing: NutrientAmountMap;
  missingNutrients: NutrientCode[]; complete: boolean; sourceVersions: string[];
  calculationVersion: string; calculatedAt: string;
}

export interface RecipeVersionRecord {
  id: string; recipeId: string; version: number; status: RecipeVersionStatus; servings: number;
  prepTimeMinutes: number; cookTimeMinutes: number; difficulty: RecipeDifficulty;
  estimatedCostCategory: EstimatedCostCategory; cookingMethod: CookingMethod;
  mealTypes: MealType[]; dietaryTags: DietaryTagCode[]; equipment: string[]; notes?: string;
  verified: boolean; requiresExpertValidation: boolean; publishedAt?: string;
  ingredients: RecipeIngredientRecord[]; steps: RecipeStepRecord[]; nutrition?: RecipeNutritionRecord;
  createdAt: string; updatedAt: string;
}

export interface RecipeRecord {
  id: string; code: string; ownerProfileId?: string; name: string; description: string;
  sourceType: RecipeSourceType; sourceId: string; sourceVersion: string; verified: boolean;
  active: boolean; private: boolean; archivedAt?: string; requiresExpertValidation: boolean;
  currentVersion: RecipeVersionRecord; createdAt: string; updatedAt: string;
  eligibility?: { status: RecipeEligibilityStatus; reasonCodes: string[]; allergenMessage?: string };
}

export interface RemainingNutrientRecord {
  nutrientCode: NutrientCode; type: TargetType; consumed: number | null;
  minimumRemaining?: number | null; maximumRemaining?: number | null;
}
export type RemainingNutritionRecord = Record<NutrientCode, RemainingNutrientRecord | undefined>;

export interface MealPlanItemRecord {
  id: string; mealType: MealType; position: number; status: MealPlanItemStatus;
  recipe: RecipeRecord; recipeVersionId: string; reasonCodes: string[];
  recommendationFit: RecommendationFit; score: number; nutritionImpact: NutrientAmountMap;
  replacementReason?: string; consumedAt?: string;
}

export interface DailyMealPlanRecord {
  id: string; profileId: string; localDate: string; targetProfileId: string;
  policyVersion: string; nutritionPolicyVersion: string; generatedByPolicyVersion: string;
  targetSnapshot: NutritionTargetProfileRecord; status: MealPlanStatus; source: string;
  generatedAt: string; createdAt: string; updatedAt: string;
  remainingNutrition: RemainingNutritionRecord; items: MealPlanItemRecord[];
}

export interface MealAlternativeRecord {
  recipe: RecipeRecord; score: number; recommendationFit: RecommendationFit; reasonCodes: string[];
  difference: NutrientAmountMap; differenceMessage: string;
}

export interface FlexKitchenIngredientInput {
  foodItemId?: string; servingId?: string; customName?: string; quantity: number;
  userNutrition?: Partial<NutrientAmountMap>;
}

export interface FlexKitchenPreviewRecord {
  servings: number; ingredients: RecipeIngredientRecord[]; nutrition: RecipeNutritionRecord;
  impact: NutrientAmountMap; remainingNutrition: RemainingNutritionRecord;
  suggestions: Array<{ reasonCode: string; priority: number; message: string; candidateFood?: FoodItemRecord }>;
}

export interface FoodSubstitutionRecord {
  original: RecipeIngredientRecord; replacement: RecipeIngredientRecord;
  before: NutrientAmountMap; after: NutrientAmountMap; difference: NutrientAmountMap;
  score: number; reasonCodes: string[]; requiresConfirmation: true;
}

export interface ActiveProfile {
  id: string;
  name: string;
  relation: 'diri' | 'anak' | 'tanggungan';
  segment: ProfileSegment;
  initials: string;
}

export interface WeeklyAction {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  confidence: ConfidenceLevel;
  ruleId: string;
}

export const patternDomains = ['PORTION_INTAKE', 'SUGARY_ENERGY_DENSE', 'SLEEP', 'ACTIVITY_SEDENTARY', 'CONTEXTUAL_EATING', 'MEAL_BALANCE_REGULARITY'] as const;
export type PatternDomain = (typeof patternDomains)[number];
export type AnalysisDataQuality = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';
export type AnalysisAvailability = 'AVAILABLE' | 'INSUFFICIENT_DATA';
export type AnalysisStatus = 'READY' | 'PARTIAL' | 'INSUFFICIENT_DATA';

export const analysisFeatureKeys = [
  'breakfastFrequency', 'mealRegularity', 'averageMealCount', 'sugaryDrinkDays', 'averageSleepDuration',
  'sleepDurationVariance', 'sleepTimingVariance', 'perceivedSleepQuality', 'activeDays', 'averageActivityMinutes',
  'averageSteps', 'lowActivityDays', 'hungerAverage', 'fullnessAverage', 'lowMoodMealAssociationDays',
  'proteinTargetCoverage', 'fiberTargetCoverage', 'sodiumLimitFrequency', 'sugarUpperLimitFrequency',
  'energyRangeFrequency', 'mealBalanceCoverage', 'skippedMealFrequency', 'mealPlanAdherence',
  'personalRecipeUsage', 'missingDataRatio',
] as const;
export type AnalysisFeatureKey = (typeof analysisFeatureKeys)[number];

export interface AnalysisFeatureValue {
  value: number | null;
  availability: AnalysisAvailability;
  coverage: { availableDays: number; totalDays: number; ratio: number };
  source: string[];
  evidenceRefs: string[];
}

export type AnalysisFeatureSet = Record<AnalysisFeatureKey, AnalysisFeatureValue>;

export interface FeatureSnapshotRecord {
  id: string;
  profileId: string;
  baselineSessionId: string;
  featureEngineVersion: string;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  inputCompleteness: number;
  features: AnalysisFeatureSet;
  missingFeatures: AnalysisFeatureKey[];
  warnings: string[];
  inputSignature: string;
  createdAt: string;
}

export interface RuleEvaluationRecord {
  id?: string;
  ruleId: string;
  ruleVersion: string;
  domain: PatternDomain;
  matched: boolean;
  contribution: number;
  observedValues: Record<string, number | null>;
  reasonCodes: string[];
  evidenceRefs: string[];
  limitations: string[];
}

export interface DomainScoreRecord {
  domain: PatternDomain;
  availability: AnalysisAvailability;
  score: number | null;
  strength: 'LOW' | 'MODERATE' | 'STRONG' | 'NOT_AVAILABLE';
  dataQuality: AnalysisDataQuality;
  actionability: number;
  matchedRuleIds: string[];
  evidence: string[];
  limitations: string[];
}

export interface PatternSelectionRecord {
  code: string;
  domain: PatternDomain;
  label: string;
  explanation: string;
  strength: Exclude<DomainScoreRecord['strength'], 'NOT_AVAILABLE'>;
  dataQuality: AnalysisDataQuality;
  score: number;
  evidence: string[];
  limitations: string[];
}

export interface DecisionRecordRecord {
  id: string;
  profileId: string;
  baselineSessionId: string;
  featureSnapshotId: string;
  expertSystemVersion: string;
  scoringPolicyVersion: string;
  weeklyActionPolicyVersion: string;
  status: AnalysisStatus;
  primaryPatternCode?: string;
  supportingPatternCodes: string[];
  selectedActionCode?: string;
  dataQuality: AnalysisDataQuality;
  domainScores: DomainScoreRecord[];
  ruleEvaluations: RuleEvaluationRecord[];
  limitations: string[];
  ruleVersions: string[];
  inputSignature: string;
  generatedAt: string;
  supersededAt?: string;
}

export type PatternMapStatus = AnalysisStatus | 'ACKNOWLEDGED' | 'SUPERSEDED';
export type PatternMapFeedbackValue = 'VERY_ACCURATE' | 'FAIRLY_ACCURATE' | 'LESS_ACCURATE' | 'UNSURE';

export interface PatternMapRecord {
  id: string;
  profileId: string;
  baselineSessionId: string;
  featureSnapshotId: string;
  decisionRecordId: string;
  status: PatternMapStatus;
  primaryPattern?: PatternSelectionRecord;
  supportingPatterns: PatternSelectionRecord[];
  domains: DomainScoreRecord[];
  dataQuality: AnalysisDataQuality;
  limitations: string[];
  generatedAt: string;
  acknowledgedAt?: string;
  feedback?: { value: PatternMapFeedbackValue; notes?: string; createdAt: string };
  version: number;
}

export interface WeeklyActionDefinitionRecord {
  id: string;
  code: string;
  version: string;
  domain: PatternDomain;
  title: string;
  description: string;
  durationDays: number;
  targetCount: number;
  ageEligibility: AgeGroup[];
  safetyRestrictions: SafetyStatus[];
  requiredEvidence: AnalysisFeatureKey[];
  actionability: number;
  active: boolean;
  requiresExpertValidation: boolean;
}

export type WeeklyActionAssignmentStatus = 'ACTIVE' | 'COMPLETED' | 'PARTIAL' | 'SKIPPED' | 'REPLACED';
export type WeeklyActionCompletionSource = 'AUTO_VERIFIED' | 'USER_CONFIRMED';

export interface WeeklyActionCheckInRecord {
  id: string;
  assignmentId: string;
  localDate: string;
  source: WeeklyActionCompletionSource;
  evidenceRef?: string;
  createdAt: string;
}

export interface WeeklyActionAssignmentRecord {
  id: string;
  profileId: string;
  patternMapId: string;
  definition: WeeklyActionDefinitionRecord;
  assignedAt: string;
  weekStart: string;
  weekEnd: string;
  targetCount: number;
  progress: number;
  status: WeeklyActionAssignmentStatus;
  completedAt?: string;
  reasonCodes: string[];
  alternatives: Array<{ code: string; title: string }>;
  selectionVersion: string;
  why: string;
  checkIns: WeeklyActionCheckInRecord[];
}

export interface Phase7AnalysisResult {
  featureSnapshot: FeatureSnapshotRecord;
  decision: DecisionRecordRecord;
  patternMap: PatternMapRecord;
  weeklyAction?: WeeklyActionAssignmentRecord;
  reused: boolean;
}

export type PrototypeScreenKind =
  | 'form'
  | 'dashboard'
  | 'status'
  | 'pattern'
  | 'nutrition'
  | 'recipe'
  | 'activity'
  | 'settings'
  | 'referral';

export interface PrototypeScreenDefinition {
  number: number;
  slug: string;
  category: string;
  title: string;
  eyebrow: string;
  description: string;
  kind: PrototypeScreenKind;
  primaryAction: string;
  next?: string;
  highlights: string[];
  simulation?: boolean;
}
