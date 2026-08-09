import type {
  AgeGroup,
  GoalCode,
  GoalDefinitionRecord,
  OnboardingRole,
  ProgramCode,
  ProgramEligibilityRecord,
  QuestionnaireAnswerValue,
  QuestionnaireQuestionRecord,
  SafetyAnswerCode,
  SafetyStatus,
} from '@sarira/shared-types';

export const PHASE_3_RULE_VERSION = 'phase3-dev-v1';
export const PHASE_3_CONTENT_STATUS = 'DEVELOPMENT_REQUIRES_EXPERT_VALIDATION' as const;

function parseIsoDate(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error('Tanggal lahir tidak valid.');
  return date;
}

export function calculateAge(dateOfBirth: string, referenceDate = new Date()): number {
  const birth = parseIsoDate(dateOfBirth);
  let age = referenceDate.getUTCFullYear() - birth.getUTCFullYear();
  const monthDelta = referenceDate.getUTCMonth() - birth.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && referenceDate.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age;
}

export function classifyAge(dateOfBirth: string, referenceDate = new Date()): AgeGroup {
  const age = calculateAge(dateOfBirth, referenceDate);
  if (age < 12) return 'UNDER_12';
  if (age <= 17) return 'TEEN';
  if (age <= 25) return 'YOUNG_ADULT';
  if (age <= 59) return 'ADULT_BALANCE';
  if (age <= 75) return 'HEALTHY_AGING';
  return 'OVER_75';
}

export const requiresGuardianConsent = (dateOfBirth: string, referenceDate = new Date()) => classifyAge(dateOfBirth, referenceDate) === 'TEEN';

export interface SafetyRuleConfiguration {
  ruleId: string;
  version: string;
  applicableAge: { minimum: number; maximum: number };
  condition: { questionCode: string; answer: SafetyAnswerCode };
  severity: number;
  result: Exclude<SafetyStatus, 'GREEN' | 'UNKNOWN'>;
  restrictedPrograms: ProgramCode[];
  messageKey: string;
  referralRequired: boolean;
  contentStatus: typeof PHASE_3_CONTENT_STATUS;
}

/**
 * These rules exercise deterministic routing only. They are deliberately based on the
 * generic Phase 0 safety placeholders and are not approved clinical triggers.
 */
export const phase3DevelopmentSafetyRules: SafetyRuleConfiguration[] = [
  {
    ruleId: 'SAFETY-CORE-001',
    version: PHASE_3_RULE_VERSION,
    applicableAge: { minimum: 12, maximum: 75 },
    condition: { questionCode: 'professional_restriction', answer: 'YES' },
    severity: 100,
    result: 'RED',
    restrictedPrograms: ['GUIDED_MEAL', 'FLEX_KITCHEN'],
    messageKey: 'safety.professional_restriction.referral',
    referralRequired: true,
    contentStatus: PHASE_3_CONTENT_STATUS,
  },
  {
    ruleId: 'SAFETY-CORE-002',
    version: PHASE_3_RULE_VERSION,
    applicableAge: { minimum: 12, maximum: 75 },
    condition: { questionCode: 'concerning_change', answer: 'YES' },
    severity: 50,
    result: 'YELLOW',
    restrictedPrograms: [],
    messageKey: 'safety.concerning_change.review',
    referralRequired: false,
    contentStatus: PHASE_3_CONTENT_STATUS,
  },
  {
    ruleId: 'SAFETY-UNKNOWN-001',
    version: PHASE_3_RULE_VERSION,
    applicableAge: { minimum: 12, maximum: 75 },
    condition: { questionCode: 'risk_information', answer: 'NOT_SURE' },
    severity: 40,
    result: 'YELLOW',
    restrictedPrograms: [],
    messageKey: 'safety.uncertain.additional_information',
    referralRequired: false,
    contentStatus: PHASE_3_CONTENT_STATUS,
  },
];

export interface SafetyEvaluationInput {
  age: number;
  answers: Record<string, SafetyAnswerCode>;
  requiredQuestionCodes: string[];
}

export interface SafetyEvaluation {
  status: SafetyStatus;
  triggeredRules: string[];
  restrictedPrograms: ProgramCode[];
  referralRequired: boolean;
  ruleVersion: string;
  messageKeys: string[];
}

export function evaluateSafety(input: SafetyEvaluationInput): SafetyEvaluation {
  const missing = input.requiredQuestionCodes.filter((code) => input.answers[code] === undefined);
  if (missing.length > 0) {
    return {
      status: 'UNKNOWN',
      triggeredRules: missing.map((code) => `MISSING:${code}`),
      restrictedPrograms: [],
      referralRequired: false,
      ruleVersion: PHASE_3_RULE_VERSION,
      messageKeys: ['safety.missing.required_information'],
    };
  }

  const matches = phase3DevelopmentSafetyRules
    .filter((rule) => input.age >= rule.applicableAge.minimum && input.age <= rule.applicableAge.maximum)
    .filter((rule) => input.answers[rule.condition.questionCode] === rule.condition.answer)
    .sort((left, right) => right.severity - left.severity || left.ruleId.localeCompare(right.ruleId));

  if (matches.length === 0) return { status: 'GREEN', triggeredRules: [], restrictedPrograms: [], referralRequired: false, ruleVersion: PHASE_3_RULE_VERSION, messageKeys: ['safety.green.limited_data'] };
  const status: SafetyStatus = matches.some((rule) => rule.result === 'RED') ? 'RED' : 'YELLOW';
  return {
    status,
    triggeredRules: matches.map((rule) => rule.ruleId),
    restrictedPrograms: [...new Set(matches.flatMap((rule) => rule.restrictedPrograms))],
    referralRequired: matches.some((rule) => rule.referralRequired),
    ruleVersion: PHASE_3_RULE_VERSION,
    messageKeys: matches.map((rule) => rule.messageKey),
  };
}

interface GoalConfiguration {
  code: GoalCode;
  label: string;
  description: string;
  minimumAge: number;
  maximumAge: number;
  roles: OnboardingRole[];
  blockedStatuses: SafetyStatus[];
  priorityGroups: AgeGroup[];
}

export const phase3GoalConfigurations: GoalConfiguration[] = [
  { code: 'LOSE_WEIGHT', label: 'Menurunkan berat secara bertahap', description: 'Hanya untuk kelompok dewasa yang eligible.', minimumAge: 18, maximumAge: 59, roles: ['USER'], blockedStatuses: ['RED'], priorityGroups: [] },
  { code: 'GAIN_WEIGHT', label: 'Menaikkan berat secara bertahap', description: 'Hanya untuk kelompok dewasa yang eligible.', minimumAge: 18, maximumAge: 59, roles: ['USER'], blockedStatuses: ['RED'], priorityGroups: [] },
  { code: 'MAINTAIN_WEIGHT', label: 'Menjaga keseimbangan berat', description: 'Fokus pada kebiasaan tanpa target ekstrem.', minimumAge: 18, maximumAge: 75, roles: ['USER'], blockedStatuses: ['RED'], priorityGroups: ['YOUNG_ADULT', 'ADULT_BALANCE'] },
  { code: 'BUILD_HEALTHY_HABITS', label: 'Membangun kebiasaan sehat', description: 'Rutinitas makan, tidur, dan aktivitas yang konsisten.', minimumAge: 12, maximumAge: 75, roles: ['USER'], blockedStatuses: [], priorityGroups: ['TEEN', 'YOUNG_ADULT', 'ADULT_BALANCE'] },
  { code: 'OPTIMIZE_GROWTH', label: 'Mendukung tumbuh kembang', description: 'Dukungan kebiasaan remaja tanpa janji tinggi.', minimumAge: 12, maximumAge: 17, roles: ['USER'], blockedStatuses: ['RED'], priorityGroups: ['TEEN'] },
  { code: 'IMPROVE_FITNESS', label: 'Meningkatkan kebugaran', description: 'Aktivitas yang mengikuti hasil safety.', minimumAge: 18, maximumAge: 75, roles: ['USER'], blockedStatuses: ['RED'], priorityGroups: [] },
  { code: 'MAINTAIN_MOBILITY', label: 'Menjaga mobilitas dan fungsi', description: 'Kekuatan, keseimbangan, dan aktivitas fungsional.', minimumAge: 60, maximumAge: 75, roles: ['USER'], blockedStatuses: ['RED'], priorityGroups: ['HEALTHY_AGING'] },
  { code: 'FAMILY_NUTRITION', label: 'Mendampingi nutrisi keluarga', description: 'Konteks pendamping; analisis keluarga belum aktif.', minimumAge: 18, maximumAge: 75, roles: ['PARENT', 'GUARDIAN', 'CAREGIVER'], blockedStatuses: [], priorityGroups: [] },
  { code: 'CHILD_GROWTH_SUPPORT', label: 'Mendampingi tumbuh kembang anak', description: 'Fondasi profil tanggungan; analisis Family Growth masih demo.', minimumAge: 18, maximumAge: 75, roles: ['PARENT', 'GUARDIAN', 'CAREGIVER'], blockedStatuses: [], priorityGroups: [] },
];

export function getGoalEligibility(input: { age: number; ageGroup: AgeGroup; role: OnboardingRole; safetyStatus: SafetyStatus }): GoalDefinitionRecord[] {
  return phase3GoalConfigurations.map((goal, index) => {
    const ageAllowed = input.age >= goal.minimumAge && input.age <= goal.maximumAge;
    const roleAllowed = goal.roles.includes(input.role);
    const safetyAllowed = !goal.blockedStatuses.includes(input.safetyStatus);
    const eligible = ageAllowed && roleAllowed && safetyAllowed;
    const disabledReason = !ageAllowed
      ? 'Tujuan ini tidak tersedia untuk kelompok usia profil.'
      : !roleAllowed
        ? 'Tujuan ini tidak sesuai dengan peran profil yang dipilih.'
        : !safetyAllowed
          ? 'Tujuan ini dibatasi oleh hasil safety. Tinjau arahan bantuan terlebih dahulu.'
          : undefined;
    return {
      id: `goal-${String(index + 1).padStart(2, '0')}`,
      code: goal.code,
      label: goal.label,
      description: goal.description,
      eligible,
      ...(disabledReason ? { disabledReason } : {}),
      priority: goal.priorityGroups.includes(input.ageGroup),
      expertValidationRequired: true,
    };
  });
}

export function getProgramEligibility(input: { ageGroup: AgeGroup; role: OnboardingRole; safetyStatus: SafetyStatus; goal: GoalCode }): ProgramEligibilityRecord[] {
  const blocked = input.safetyStatus === 'RED';
  const supporter = input.role !== 'USER';
  const outsideScope = input.ageGroup === 'UNDER_12' || input.ageGroup === 'OVER_75';
  const reasonCodes = [blocked ? 'SAFETY_RED' : '', supporter ? 'DEPENDENT_PROGRAM_NOT_IN_PHASE_3' : '', outsideScope ? 'AGE_OUTSIDE_MVP' : ''].filter(Boolean);
  return [
    { code: 'GUIDED_MEAL', label: 'Guided Meal', description: 'Struktur pilihan makan dengan rekomendasi deterministik dan Nutrition Engine yang sama.', eligible: reasonCodes.length === 0, reasonCodes },
    { code: 'FLEX_KITCHEN', label: 'Flex Kitchen', description: 'Ruang fleksibel memasak dengan perhitungan nutrisi real-time.', eligible: reasonCodes.length === 0, reasonCodes },
  ];
}

export function isQuestionVisible(question: Pick<QuestionnaireQuestionRecord, 'visibleWhen'>, answers: Record<string, QuestionnaireAnswerValue>): boolean {
  if (!question.visibleWhen) return true;
  const current = answers[question.visibleWhen.questionCode];
  if (question.visibleWhen.operator === 'equals') return current === question.visibleWhen.value;
  return Array.isArray(current) && current.includes(String(question.visibleWhen.value));
}

export function validateQuestionnaireCompletion(questions: QuestionnaireQuestionRecord[], answers: Record<string, QuestionnaireAnswerValue>): string[] {
  return questions
    .filter((question) => question.required && isQuestionVisible(question, answers))
    .filter((question) => {
      const value = answers[question.code];
      return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
    })
    .map((question) => question.code);
}

export interface CompletionState {
  roleComplete: boolean;
  validDateOfBirth: boolean;
  ageGroup?: AgeGroup;
  guardianConsentGranted: boolean;
  requiredConsentsGranted: boolean;
  safetyCompleted: boolean;
  goalValid: boolean;
  questionnaireCompleted: boolean;
  programPreferenceCompleted: boolean;
}

export function validateOnboardingCompletion(state: CompletionState): string[] {
  const issues: string[] = [];
  if (!state.roleComplete) issues.push('ROLE_MISSING');
  if (!state.validDateOfBirth) issues.push('DATE_OF_BIRTH_INVALID');
  if (state.ageGroup === 'UNDER_12') issues.push('AGE_UNDER_MINIMUM');
  if (state.ageGroup === 'OVER_75') issues.push('AGE_OVER_MVP_SCOPE');
  if (state.ageGroup === 'TEEN' && !state.guardianConsentGranted) issues.push('GUARDIAN_CONSENT_MISSING');
  if (!state.requiredConsentsGranted) issues.push('REQUIRED_CONSENT_MISSING');
  if (!state.safetyCompleted) issues.push('SAFETY_SCREENING_INCOMPLETE');
  if (!state.goalValid) issues.push('GOAL_INVALID');
  if (!state.questionnaireCompleted) issues.push('QUESTIONNAIRE_INCOMPLETE');
  if (!state.programPreferenceCompleted) issues.push('PROGRAM_PREFERENCE_MISSING');
  return issues;
}

export * from './phase7';
