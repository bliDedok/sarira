import { z } from 'zod';

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const time24Hour = /^([01]\d|2[0-3]):[0-5]\d$/;

export const emailSchema = z.string().trim().email('Masukkan alamat email yang valid.').max(254);

export const passwordSchema = z
  .string()
  .min(12, 'Kata sandi minimal 12 karakter.')
  .max(128)
  .regex(/[a-z]/, 'Tambahkan huruf kecil.')
  .regex(/[A-Z]/, 'Tambahkan huruf besar.')
  .regex(/[0-9]/, 'Tambahkan angka.');

export const dateOfBirthSchema = z
  .string()
  .regex(isoDate, 'Gunakan format YYYY-MM-DD.')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && date <= new Date();
  }, 'Tanggal lahir tidak valid.');

export const genderSchema = z.enum(['FEMALE', 'MALE', 'OTHER', 'UNDISCLOSED']);
export const onboardingRoleSchema = z.enum(['USER', 'PARENT', 'GUARDIAN', 'CAREGIVER']);

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(100),
  dateOfBirth: dateOfBirthSchema.optional(),
  gender: genderSchema.optional(),
  country: z.string().trim().length(2).toUpperCase().default('ID'),
  timezone: z.string().trim().min(3).max(100).default('Asia/Makassar'),
  preferredLanguage: z.string().trim().min(2).max(20).default('id-ID'),
});

export const profilePatchSchema = profileSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Minimal satu field harus diubah.',
);

export const consentTypeSchema = z.enum([
  'TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'HEALTH_PROFILE', 'NUTRITION_DATA', 'ACTIVITY_DATA', 'SLEEP_DATA',
  'CAMERA_FOOD', 'CAMERA_WORKOUT', 'LOCATION', 'WEARABLE', 'BODY_PHOTO', 'CHILD_DATA',
]);

export const consentSourceSchema = z.enum(['ONBOARDING', 'SETTINGS', 'FEATURE_PROMPT', 'GUARDIAN_FLOW']);
export const consentSchema = z.object({
  granted: z.boolean(),
  version: z.string().trim().min(1).max(60),
  source: consentSourceSchema.default('ONBOARDING'),
});

export const guardianConsentSchema = z.object({
  guardianName: z.string().trim().min(2).max(100),
  guardianRelationship: z.enum(['PARENT', 'LEGAL_GUARDIAN']),
  consentVersion: z.string().trim().min(1).max(60),
  confirmed: z.literal(true, { error: 'Persetujuan afirmatif wali diperlukan.' }),
});

export const safetyAnswerCodeSchema = z.enum(['YES', 'NO', 'NOT_SURE']);
export const safetyAnswersSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    answerCode: safetyAnswerCodeSchema,
  })).min(1).max(100),
});

export const goalCodeSchema = z.enum([
  'LOSE_WEIGHT', 'GAIN_WEIGHT', 'MAINTAIN_WEIGHT', 'BUILD_HEALTHY_HABITS', 'OPTIMIZE_GROWTH',
  'IMPROVE_FITNESS', 'MAINTAIN_MOBILITY', 'FAMILY_NUTRITION', 'CHILD_GROWTH_SUPPORT',
]);

export const goalSelectionSchema = z.object({ code: goalCodeSchema });
export const programCodeSchema = z.enum(['GUIDED_MEAL', 'FLEX_KITCHEN']);
export const programPreferenceSchema = z.object({ program: programCodeSchema });

export const questionnaireAnswerValueSchema = z.union([
  z.string().max(500),
  z.number().finite(),
  z.boolean(),
  z.array(z.string().max(100)).max(50),
  z.null(),
]);

export const questionnaireAnswersSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    value: questionnaireAnswerValueSchema,
  })).min(1).max(100),
});

export const bodyProfileSchema = z.object({
  heightCm: z.number().min(80, 'Tinggi minimal teknis 80 cm.').max(250, 'Tinggi maksimal teknis 250 cm.'),
  weightKg: z.number().min(20, 'Berat minimal teknis 20 kg.').max(300, 'Berat maksimal teknis 300 kg.'),
  targetWeightKg: z.number().min(20).max(300).optional(),
  waistCm: z.number().min(30).max(250).optional(),
});

export const routineProfileSchema = z.object({
  dailyContext: z.enum(['SCHOOL', 'DESK_WORK', 'ACTIVE_WORK', 'SHIFT_WORK', 'RETIRED', 'OTHER']),
  sittingHours: z.number().min(0).max(24),
  freeTimeMinutes: z.number().int().min(0).max(1440),
});

export const sleepProfileSchema = z.object({
  sleepTime: z.string().regex(time24Hour),
  wakeTime: z.string().regex(time24Hour),
  estimatedHours: z.number().min(0).max(24),
  quality: z.enum(['POOR', 'FAIR', 'GOOD']),
});

export const onboardingStatusPatchSchema = z.object({
  currentStep: z.enum([
    'role-selection', 'birth-date', 'guardian-consent', 'privacy-consent', 'safety-screening', 'safety-result',
    'goal-selection', 'profile-questionnaire', 'program-preference', 'profile-summary', 'starter-journey',
  ]),
});

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(128) });

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().min(2).max(100),
  dateOfBirth: dateOfBirthSchema.optional(),
});

export const localDateSchema = z.string().regex(isoDate, 'Gunakan tanggal lokal YYYY-MM-DD.').refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, 'Tanggal lokal tidak valid.');

const isoDateTimeSchema = z.string().datetime({ offset: true });
const optionalText = (maximum: number) => z.string().trim().max(maximum).optional();

export const dailyCheckInSchema = z.object({
  mood: z.enum(['VERY_LOW', 'LOW', 'NEUTRAL', 'GOOD', 'VERY_GOOD']),
  hunger: z.number().int().min(1).max(5),
  fullness: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5).optional(),
  bodyFeeling: optionalText(120),
  barriers: z.array(z.enum(['BUSY', 'FORGOT', 'FOOD_UNAVAILABLE', 'LACK_OF_SLEEP', 'NO_TIME_FOR_ACTIVITY', 'NONE', 'OTHER'])).max(7).default([]).refine((values) => !values.includes('NONE') || values.length === 1, 'Tidak ada hambatan tidak dapat digabung dengan pilihan lain.'),
  notes: optionalText(500),
});

const mealLogBaseSchema = z.object({
  localDate: localDateSchema,
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER']),
  eatenAt: isoDateTimeSchema.optional(),
  description: optionalText(200),
  skipped: z.boolean().default(false),
  sugaryDrinkConsumed: z.boolean().optional(),
  lateMeal: z.boolean().optional(),
  homeCooked: z.boolean().optional(),
  eatingContext: optionalText(80),
  notes: optionalText(500),
});
export const mealLogSchema = mealLogBaseSchema.refine((value) => value.skipped || Boolean(value.description), { message: 'Deskripsi makanan diperlukan jika tidak dilewati.', path: ['description'] });
export const mealLogPatchSchema = mealLogBaseSchema.partial().refine((value) => Object.keys(value).length > 0, 'Minimal satu field harus diubah.');

export const sleepLogSchema = z.object({
  localDate: localDateSchema,
  sleepStartedAt: isoDateTimeSchema,
  wokeUpAt: isoDateTimeSchema,
  perceivedQuality: z.enum(['POOR', 'FAIR', 'GOOD', 'VERY_GOOD']),
  nightAwakenings: z.number().int().min(0).max(50).optional(),
  notes: optionalText(500),
});
export const sleepLogPatchSchema = sleepLogSchema.partial().refine((value) => Object.keys(value).length > 0, 'Minimal satu field harus diubah.');

export const activityLogSchema = z.object({
  localDate: localDateSchema,
  activityType: z.enum(['WALKING', 'RUNNING', 'CYCLING', 'STRENGTH', 'STRETCHING', 'SPORT', 'OTHER']),
  startedAt: isoDateTimeSchema.optional(),
  durationMinutes: z.number().int().min(1).max(1440),
  perceivedIntensity: z.enum(['LIGHT', 'MODERATE', 'VIGOROUS']),
  description: optionalText(200),
  notes: optionalText(500),
});
export const activityLogPatchSchema = activityLogSchema.partial().refine((value) => Object.keys(value).length > 0, 'Minimal satu field harus diubah.');

export const stepRecordSchema = z.object({
  steps: z.number().int().min(0).max(200_000),
  sourceDevice: optionalText(100),
});

export const bodyMeasurementSchema = z.object({
  localDate: localDateSchema,
  measuredAt: isoDateTimeSchema,
  weightKg: z.number().min(20).max(300),
  waistCm: z.number().min(30).max(250).optional(),
  notes: optionalText(500),
});

export const digestiveLogSchema = z.object({
  localDate: localDateSchema,
  symptomType: z.enum(['BLOATING', 'NAUSEA', 'ABDOMINAL_PAIN', 'DIARRHEA', 'CONSTIPATION', 'HEARTBURN', 'LOW_APPETITE', 'POST_MEAL_DISCOMFORT', 'OTHER']),
  occurredAt: isoDateTimeSchema,
  intensity: z.number().int().min(1).max(5),
  relatedMealId: z.string().uuid().optional(),
  notes: optionalText(500),
});
export const digestiveLogPatchSchema = digestiveLogSchema.partial().refine((value) => Object.keys(value).length > 0, 'Minimal satu field harus diubah.');

export const taskPatchSchema = z.object({ status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']) });
export const day7FeedbackSchema = z.object({
  easeRating: z.number().int().min(1).max(5),
  hardestDomains: z.array(z.enum(['checkIn', 'food', 'sleep', 'activity'])).max(4),
  wantsToContinue: z.boolean(),
  notes: optionalText(500),
});

export const foodSearchQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.enum(['GRAIN', 'PROTEIN', 'VEGETABLE', 'FRUIT', 'DAIRY', 'BEVERAGE', 'SNACK', 'CONDIMENT', 'MIXED_DISH', 'OTHER']).optional(),
  verified: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export const mealLogItemSchema = z.object({
  foodItemId: z.string().uuid(),
  servingId: z.string().uuid(),
  quantity: z.number().positive().max(100),
});

export const mealLogItemPatchSchema = z.object({
  servingId: z.string().uuid().optional(),
  quantity: z.number().positive().max(100).optional(),
}).refine((value) => Object.keys(value).length > 0, 'Minimal satu field harus diubah.');

export const customMealLogItemSchema = z.object({
  customName: z.string().trim().min(2).max(160),
  servingDescription: z.string().trim().min(1).max(100),
  quantity: z.number().positive().max(100),
});

export const nutritionPreviewSchema = mealLogItemSchema;

export const nutritionHistoryQuerySchema = z.object({
  from: localDateSchema,
  to: localDateSchema,
}).refine((value) => value.from <= value.to, { message: 'Rentang tanggal tidak valid.', path: ['to'] });

export const recipeSearchQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export const mealPlanGenerateSchema = z.object({ localDate: localDateSchema });
export const mealReplacementSchema = z.object({
  recipeId: z.string().uuid(),
  reason: z.enum(['DISLIKED', 'UNAVAILABLE', 'TOO_LONG', 'TOO_EXPENSIVE', 'VARIETY', 'OTHER']).optional(),
});
export const mealConsumptionSchema = z.object({ fraction: z.union([z.literal(1), z.literal(0.75), z.literal(0.5), z.literal(0.25)]) });

const nutrientValueSchema = z.number().nonnegative().finite().nullable();
export const flexIngredientSchema = z.object({
  foodItemId: z.string().uuid().optional(),
  servingId: z.string().uuid().optional(),
  customName: z.string().trim().min(2).max(160).optional(),
  quantity: z.number().positive().max(100),
  userNutrition: z.object({
    ENERGY_KCAL: nutrientValueSchema.optional(), PROTEIN_G: nutrientValueSchema.optional(), CARBOHYDRATE_G: nutrientValueSchema.optional(), FAT_G: nutrientValueSchema.optional(),
    SATURATED_FAT_G: nutrientValueSchema.optional(), FIBER_G: nutrientValueSchema.optional(), SUGAR_G: nutrientValueSchema.optional(), SODIUM_MG: nutrientValueSchema.optional(),
  }).optional(),
}).refine((value) => Boolean(value.foodItemId && value.servingId) || Boolean(value.customName), 'Pilih item database atau isi nama bahan custom.');

export const flexKitchenPreviewSchema = z.object({
  localDate: localDateSchema,
  servings: z.number().positive().max(100),
  ingredients: z.array(flexIngredientSchema).min(1).max(50),
});

export const substitutionSchema = z.object({
  localDate: localDateSchema,
  ingredient: flexIngredientSchema,
  replacementFoodItemId: z.string().uuid().optional(),
});

export const personalRecipeSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1000).default('Resep pribadi'),
  servings: z.number().positive().max(100),
  prepTimeMinutes: z.number().int().min(0).max(1440).default(0),
  cookTimeMinutes: z.number().int().min(0).max(1440).default(0),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('EASY'),
  estimatedCostCategory: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  cookingMethod: z.enum(['RAW', 'BOILED', 'STEAMED', 'GRILLED', 'BAKED', 'FRIED', 'STIR_FRIED', 'OTHER']),
  mealTypes: z.array(z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'])).min(1).max(4),
  ingredients: z.array(flexIngredientSchema).min(1).max(50),
  notes: z.string().trim().max(1000).optional(),
  steps: z.array(z.object({ instruction: z.string().trim().min(2).max(1000), timerSeconds: z.number().int().min(1).max(86400).optional() })).max(50).default([]),
});
export const personalRecipePatchSchema = personalRecipeSchema.partial().refine((value) => Object.keys(value).length > 0, 'Minimal satu field harus diubah.');

export type ProfileInput = z.infer<typeof profileSchema>;
export type ProfilePatchInput = z.infer<typeof profilePatchSchema>;
export type ConsentInput = z.infer<typeof consentSchema>;
export type GuardianConsentInput = z.infer<typeof guardianConsentSchema>;
export type SafetyAnswersInput = z.infer<typeof safetyAnswersSchema>;
export type QuestionnaireAnswersInput = z.infer<typeof questionnaireAnswersSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type DailyCheckInInput = z.infer<typeof dailyCheckInSchema>;
export type MealLogInput = z.infer<typeof mealLogSchema>;
export type SleepLogInput = z.infer<typeof sleepLogSchema>;
export type ActivityLogInput = z.infer<typeof activityLogSchema>;
export type DigestiveLogInput = z.infer<typeof digestiveLogSchema>;
export type MealLogItemInput = z.infer<typeof mealLogItemSchema>;
