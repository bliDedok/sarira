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
} from '@sarira/shared-types';

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
    update(userId: string, input: Partial<Pick<ProfileRecord, 'fullName' | 'dateOfBirth' | 'gender' | 'country' | 'timezone' | 'preferredLanguage' | 'primaryRole' | 'onboardingStatus' | 'onboardingCompletedAt'>>): Promise<ProfileRecord>;
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
  admin: { configurationVersions(): Promise<AdminConfigurationVersions> };
  audit: {
    record(input: { actorUserId?: string; event: string; entityType: string; entityId?: string; requestId?: string; metadata?: Record<string, string | boolean | number> }): Promise<void>;
  };
}
