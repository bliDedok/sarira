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

export type ProfileInput = z.infer<typeof profileSchema>;
export type ProfilePatchInput = z.infer<typeof profilePatchSchema>;
export type ConsentInput = z.infer<typeof consentSchema>;
export type GuardianConsentInput = z.infer<typeof guardianConsentSchema>;
export type SafetyAnswersInput = z.infer<typeof safetyAnswersSchema>;
export type QuestionnaireAnswersInput = z.infer<typeof questionnaireAnswersSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
