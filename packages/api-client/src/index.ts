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
  };
}
