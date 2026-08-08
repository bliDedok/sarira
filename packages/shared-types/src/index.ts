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
