import type {
  AgeGroup,
  AnalysisDataQuality,
  AnalysisFeatureKey,
  AnalysisFeatureSet,
  AnalysisStatus,
  DomainScoreRecord,
  GoalCode,
  PatternDomain,
  PatternSelectionRecord,
  RuleEvaluationRecord,
  SafetyStatus,
  WeeklyActionDefinitionRecord,
} from '@sarira/shared-types';

export const PHASE_7_EXPERT_SYSTEM_VERSION = 'phase7-expert-dev-v1' as const;
export const PHASE_7_SCORING_POLICY_VERSION = 'pattern-scoring-dev-v1' as const;
export const PHASE_7_WEEKLY_ACTION_POLICY_VERSION = 'weekly-action-dev-v1' as const;
export const PHASE_7_RULE_VERSION = 'pattern-rules-dev-v1' as const;
export const PHASE_7_VALIDATION_LABEL = 'DEVELOPMENT RULE / NOT CLINICALLY VALIDATED' as const;

export type SafeOperator = 'LT' | 'LTE' | 'GT' | 'GTE';
export interface Phase7RuleDefinition {
  ruleId: string;
  version: string;
  domain: PatternDomain;
  description: string;
  requiredFeatures: AnalysisFeatureKey[];
  condition: { feature: AnalysisFeatureKey; operator: SafeOperator; threshold: number };
  contribution: number;
  strengthCategory: 'LOW' | 'MODERATE' | 'STRONG';
  minimumEvidence: number;
  exclusions: string[];
  actionCandidateCodes: string[];
  agePacks: string[];
  active: true;
  requiresExpertValidation: true;
}

export interface Phase7ScoringPolicyEntry {
  version: string;
  domain: PatternDomain;
  feature: AnalysisFeatureKey;
  featureWeight: number;
  threshold: number;
  direction: 'LOW_IS_SIGNAL' | 'HIGH_IS_SIGNAL';
  minimumEvidence: number;
  active: true;
  requiresExpertValidation: true;
}

export const ageRulePackVersions: Record<Exclude<AgeGroup, 'UNDER_12' | 'OVER_75'>, string> = {
  TEEN: 'PATTERN-TEEN-DEV-V1',
  YOUNG_ADULT: 'PATTERN-ADULT-DEV-V1',
  ADULT_BALANCE: 'PATTERN-ADULT-DEV-V1',
  HEALTHY_AGING: 'PATTERN-AGING-DEV-V1',
};

const allPacks = [...new Set(Object.values(ageRulePackVersions))];

export const phase7RuleDefinitions: Phase7RuleDefinition[] = [
  { ruleId: 'PAT-PORTION-001', version: PHASE_7_RULE_VERSION, domain: 'PORTION_INTAKE', description: 'Ketersediaan energi harian jarang berada dalam rentang policy.', requiredFeatures: ['energyRangeFrequency'], condition: { feature: 'energyRangeFrequency', operator: 'LT', threshold: 0.5 }, contribution: 60, strengthCategory: 'STRONG', minimumEvidence: 0.35, exclusions: [], actionCandidateCodes: ['ACT-PORTION-CHECKIN-001'], agePacks: allPacks, active: true, requiresExpertValidation: true },
  { ruleId: 'PAT-PORTION-002', version: PHASE_7_RULE_VERSION, domain: 'PORTION_INTAKE', description: 'Rata-rata fullness setelah makan terlihat tinggi pada catatan yang tersedia.', requiredFeatures: ['fullnessAverage'], condition: { feature: 'fullnessAverage', operator: 'GTE', threshold: 4.2 }, contribution: 40, strengthCategory: 'MODERATE', minimumEvidence: 0.35, exclusions: [], actionCandidateCodes: ['ACT-PORTION-CHECKIN-001'], agePacks: allPacks, active: true, requiresExpertValidation: true },
  { ruleId: 'PAT-SUGAR-001', version: PHASE_7_RULE_VERSION, domain: 'SUGARY_ENERGY_DENSE', description: 'Minuman manis tercatat pada beberapa hari baseline.', requiredFeatures: ['sugaryDrinkDays'], condition: { feature: 'sugaryDrinkDays', operator: 'GTE', threshold: 0.25 }, contribution: 55, strengthCategory: 'STRONG', minimumEvidence: 0.35, exclusions: [], actionCandidateCodes: ['ACT-SUGARY-DRINK-001'], agePacks: allPacks, active: true, requiresExpertValidation: true },
  { ruleId: 'PAT-SUGAR-002', version: PHASE_7_RULE_VERSION, domain: 'SUGARY_ENERGY_DENSE', description: 'Batas gula tercatat mendekati atau terlampaui pada sebagian hari.', requiredFeatures: ['sugarUpperLimitFrequency'], condition: { feature: 'sugarUpperLimitFrequency', operator: 'GTE', threshold: 0.3 }, contribution: 45, strengthCategory: 'MODERATE', minimumEvidence: 0.35, exclusions: [], actionCandidateCodes: ['ACT-SUGARY-DRINK-001'], agePacks: allPacks, active: true, requiresExpertValidation: true },
  { ruleId: 'PAT-SLEEP-001', version: PHASE_7_RULE_VERSION, domain: 'SLEEP', description: 'Durasi tidur rata-rata berada di bawah threshold product development.', requiredFeatures: ['averageSleepDuration'], condition: { feature: 'averageSleepDuration', operator: 'LT', threshold: 7 }, contribution: 60, strengthCategory: 'STRONG', minimumEvidence: 0.35, exclusions: [], actionCandidateCodes: ['ACT-SLEEP-ROUTINE-001'], agePacks: allPacks, active: true, requiresExpertValidation: true },
  { ruleId: 'PAT-SLEEP-002', version: PHASE_7_RULE_VERSION, domain: 'SLEEP', description: 'Waktu mulai tidur bervariasi pada catatan yang tersedia.', requiredFeatures: ['sleepTimingVariance'], condition: { feature: 'sleepTimingVariance', operator: 'GTE', threshold: 0.12 }, contribution: 40, strengthCategory: 'MODERATE', minimumEvidence: 0.35, exclusions: [], actionCandidateCodes: ['ACT-SLEEP-ROUTINE-001'], agePacks: allPacks, active: true, requiresExpertValidation: true },
  { ruleId: 'PAT-ACTIVITY-001', version: PHASE_7_RULE_VERSION, domain: 'ACTIVITY_SEDENTARY', description: 'Hari dengan aktivitas tercatat masih terbatas.', requiredFeatures: ['activeDays'], condition: { feature: 'activeDays', operator: 'LT', threshold: 0.45 }, contribution: 60, strengthCategory: 'STRONG', minimumEvidence: 0.35, exclusions: ['SAFETY_RED'], actionCandidateCodes: ['ACT-LIGHT-ACTIVITY-001'], agePacks: allPacks, active: true, requiresExpertValidation: true },
  { ruleId: 'PAT-ACTIVITY-002', version: PHASE_7_RULE_VERSION, domain: 'ACTIVITY_SEDENTARY', description: 'Durasi aktivitas rata-rata masih rendah menurut threshold product development.', requiredFeatures: ['averageActivityMinutes'], condition: { feature: 'averageActivityMinutes', operator: 'LT', threshold: 20 }, contribution: 40, strengthCategory: 'MODERATE', minimumEvidence: 0.35, exclusions: ['SAFETY_RED'], actionCandidateCodes: ['ACT-LIGHT-ACTIVITY-001'], agePacks: allPacks, active: true, requiresExpertValidation: true },
  { ruleId: 'PAT-CONTEXT-001', version: PHASE_7_RULE_VERSION, domain: 'CONTEXTUAL_EATING', description: 'Catatan makan dan mood rendah muncul pada hari yang sama.', requiredFeatures: ['lowMoodMealAssociationDays'], condition: { feature: 'lowMoodMealAssociationDays', operator: 'GTE', threshold: 0.2 }, contribution: 70, strengthCategory: 'STRONG', minimumEvidence: 0.35, exclusions: [], actionCandidateCodes: ['ACT-CONTEXT-CHECKIN-001'], agePacks: allPacks, active: true, requiresExpertValidation: true },
  { ruleId: 'PAT-CONTEXT-002', version: PHASE_7_RULE_VERSION, domain: 'CONTEXTUAL_EATING', description: 'Rata-rata rasa lapar pada check-in terlihat tinggi.', requiredFeatures: ['hungerAverage'], condition: { feature: 'hungerAverage', operator: 'GTE', threshold: 4.2 }, contribution: 30, strengthCategory: 'LOW', minimumEvidence: 0.35, exclusions: [], actionCandidateCodes: ['ACT-CONTEXT-CHECKIN-001'], agePacks: allPacks, active: true, requiresExpertValidation: true },
  { ruleId: 'PAT-BALANCE-001', version: PHASE_7_RULE_VERSION, domain: 'MEAL_BALANCE_REGULARITY', description: 'Sarapan tidak tercatat secara konsisten selama baseline.', requiredFeatures: ['breakfastFrequency'], condition: { feature: 'breakfastFrequency', operator: 'LT', threshold: 0.6 }, contribution: 40, strengthCategory: 'MODERATE', minimumEvidence: 0.35, exclusions: [], actionCandidateCodes: ['ACT-PROTEIN-BREAKFAST-001'], agePacks: allPacks, active: true, requiresExpertValidation: true },
  { ruleId: 'PAT-BALANCE-002', version: PHASE_7_RULE_VERSION, domain: 'MEAL_BALANCE_REGULARITY', description: 'Protein minimum belum tercapai secara konsisten pada hari dengan data nutrisi.', requiredFeatures: ['proteinTargetCoverage'], condition: { feature: 'proteinTargetCoverage', operator: 'LT', threshold: 0.6 }, contribution: 35, strengthCategory: 'MODERATE', minimumEvidence: 0.35, exclusions: [], actionCandidateCodes: ['ACT-PROTEIN-BREAKFAST-001'], agePacks: allPacks, active: true, requiresExpertValidation: true },
  { ruleId: 'PAT-BALANCE-003', version: PHASE_7_RULE_VERSION, domain: 'MEAL_BALANCE_REGULARITY', description: 'Keteraturan jumlah makan harian masih bervariasi.', requiredFeatures: ['mealRegularity'], condition: { feature: 'mealRegularity', operator: 'LT', threshold: 0.65 }, contribution: 25, strengthCategory: 'LOW', minimumEvidence: 0.35, exclusions: [], actionCandidateCodes: ['ACT-PROTEIN-BREAKFAST-001'], agePacks: allPacks, active: true, requiresExpertValidation: true },
];

export const phase7ScoringPolicy: Phase7ScoringPolicyEntry[] = phase7RuleDefinitions.map((rule) => ({ version: PHASE_7_SCORING_POLICY_VERSION, domain: rule.domain, feature: rule.condition.feature, featureWeight: rule.contribution, threshold: rule.condition.threshold, direction: rule.condition.operator === 'LT' || rule.condition.operator === 'LTE' ? 'LOW_IS_SIGNAL' : 'HIGH_IS_SIGNAL', minimumEvidence: rule.minimumEvidence, active: true, requiresExpertValidation: true }));

const eligibleAges: AgeGroup[] = ['TEEN', 'YOUNG_ADULT', 'ADULT_BALANCE', 'HEALTHY_AGING'];
export const phase7WeeklyActions: Array<Omit<WeeklyActionDefinitionRecord, 'id'>> = [
  { code: 'ACT-PORTION-CHECKIN-001', version: PHASE_7_WEEKLY_ACTION_POLICY_VERSION, domain: 'PORTION_INTAKE', title: 'Periksa rasa lapar dan kenyang', description: 'Isi rasa lapar sebelum dan rasa kenyang setelah makan utama pada empat hari minggu ini.', durationDays: 7, targetCount: 4, ageEligibility: eligibleAges, safetyRestrictions: [], requiredEvidence: ['hungerAverage', 'fullnessAverage'], actionability: 82, active: true, requiresExpertValidation: true },
  { code: 'ACT-SUGARY-DRINK-001', version: PHASE_7_WEEKLY_ACTION_POLICY_VERSION, domain: 'SUGARY_ENERGY_DENSE', title: 'Catat pilihan minuman', description: 'Pilih satu minuman tanpa gula tambahan pada empat hari minggu ini dan tandai hari yang selesai.', durationDays: 7, targetCount: 4, ageEligibility: eligibleAges, safetyRestrictions: [], requiredEvidence: ['sugaryDrinkDays'], actionability: 88, active: true, requiresExpertValidation: true },
  { code: 'ACT-SLEEP-ROUTINE-001', version: PHASE_7_WEEKLY_ACTION_POLICY_VERSION, domain: 'SLEEP', title: 'Jaga waktu mulai istirahat', description: 'Mulai rutinitas istirahat pada waktu yang serupa di empat malam minggu ini.', durationDays: 7, targetCount: 4, ageEligibility: eligibleAges, safetyRestrictions: [], requiredEvidence: ['averageSleepDuration'], actionability: 80, active: true, requiresExpertValidation: true },
  { code: 'ACT-LIGHT-ACTIVITY-001', version: PHASE_7_WEEKLY_ACTION_POLICY_VERSION, domain: 'ACTIVITY_SEDENTARY', title: 'Tambahkan aktivitas ringan', description: 'Lakukan aktivitas ringan yang sudah aman bagimu pada empat hari minggu ini.', durationDays: 7, targetCount: 4, ageEligibility: eligibleAges, safetyRestrictions: ['RED'], requiredEvidence: ['activeDays'], actionability: 74, active: true, requiresExpertValidation: true },
  { code: 'ACT-CONTEXT-CHECKIN-001', version: PHASE_7_WEEKLY_ACTION_POLICY_VERSION, domain: 'CONTEXTUAL_EATING', title: 'Catat konteks sebelum makan', description: 'Tambahkan catatan singkat tentang suasana dan konteks makan pada empat hari minggu ini.', durationDays: 7, targetCount: 4, ageEligibility: eligibleAges, safetyRestrictions: [], requiredEvidence: ['lowMoodMealAssociationDays'], actionability: 78, active: true, requiresExpertValidation: true },
  { code: 'ACT-PROTEIN-BREAKFAST-001', version: PHASE_7_WEEKLY_ACTION_POLICY_VERSION, domain: 'MEAL_BALANCE_REGULARITY', title: 'Tambahkan sumber protein saat sarapan', description: 'Tambahkan satu sumber protein yang sesuai profil pada sarapan di empat hari minggu ini.', durationDays: 7, targetCount: 4, ageEligibility: eligibleAges, safetyRestrictions: ['RED'], requiredEvidence: ['breakfastFrequency', 'proteinTargetCoverage'], actionability: 90, active: true, requiresExpertValidation: true },
];

const domainFeatures: Record<PatternDomain, AnalysisFeatureKey[]> = {
  PORTION_INTAKE: ['energyRangeFrequency', 'hungerAverage', 'fullnessAverage', 'skippedMealFrequency'],
  SUGARY_ENERGY_DENSE: ['sugaryDrinkDays', 'sugarUpperLimitFrequency'],
  SLEEP: ['averageSleepDuration', 'sleepDurationVariance', 'sleepTimingVariance', 'perceivedSleepQuality'],
  ACTIVITY_SEDENTARY: ['activeDays', 'averageActivityMinutes', 'averageSteps', 'lowActivityDays'],
  CONTEXTUAL_EATING: ['lowMoodMealAssociationDays', 'hungerAverage', 'fullnessAverage'],
  MEAL_BALANCE_REGULARITY: ['breakfastFrequency', 'mealRegularity', 'proteinTargetCoverage', 'fiberTargetCoverage', 'mealBalanceCoverage'],
};

const domainPriority: PatternDomain[] = ['MEAL_BALANCE_REGULARITY', 'PORTION_INTAKE', 'SUGARY_ENERGY_DENSE', 'SLEEP', 'ACTIVITY_SEDENTARY', 'CONTEXTUAL_EATING'];
const domainActionability: Record<PatternDomain, number> = { PORTION_INTAKE: 82, SUGARY_ENERGY_DENSE: 88, SLEEP: 80, ACTIVITY_SEDENTARY: 74, CONTEXTUAL_EATING: 78, MEAL_BALANCE_REGULARITY: 90 };
const labels: Record<PatternDomain, string> = { PORTION_INTAKE: 'Porsi dan asupan belum konsisten', SUGARY_ENERGY_DENSE: 'Pilihan minuman atau pangan manis cukup terlihat', SLEEP: 'Waktu dan durasi tidur belum konsisten', ACTIVITY_SEDENTARY: 'Aktivitas harian masih terbatas', CONTEXTUAL_EATING: 'Sinyal konteks makan terlihat', MEAL_BALANCE_REGULARITY: 'Keteraturan dan keseimbangan makan perlu perhatian' };
const patternCodes: Record<PatternDomain, string> = { PORTION_INTAKE: 'PATTERN-PORTION-INTAKE', SUGARY_ENERGY_DENSE: 'PATTERN-SUGARY-ENERGY', SLEEP: 'PATTERN-SLEEP-REGULARITY', ACTIVITY_SEDENTARY: 'PATTERN-ACTIVITY-CONSISTENCY', CONTEXTUAL_EATING: 'PATTERN-CONTEXTUAL-EATING-SIGNAL', MEAL_BALANCE_REGULARITY: 'PATTERN-MEAL-BALANCE-REGULARITY' };

function qualityFromCoverage(coverage: number): AnalysisDataQuality {
  return coverage < 0.3 ? 'INSUFFICIENT' : coverage < 0.5 ? 'LOW' : coverage < 0.75 ? 'MEDIUM' : 'HIGH';
}
const qualityRank: Record<AnalysisDataQuality, number> = { INSUFFICIENT: 0, LOW: 1, MEDIUM: 2, HIGH: 3 };
const compare = (value: number, operator: SafeOperator, threshold: number) => operator === 'LT' ? value < threshold : operator === 'LTE' ? value <= threshold : operator === 'GT' ? value > threshold : value >= threshold;
const strength = (score: number): 'LOW' | 'MODERATE' | 'STRONG' => score >= 67 ? 'STRONG' : score >= 34 ? 'MODERATE' : 'LOW';
const observedText = (domain: PatternDomain, features: AnalysisFeatureSet) => {
  const values = domainFeatures[domain].filter((key) => features[key].value !== null).slice(0, 2).map((key) => `${key}=${String(features[key].value)} (${features[key].coverage.availableDays}/${features[key].coverage.totalDays} hari)`);
  return values.length ? values : ['Belum ada feature utama yang cukup.'];
};

export interface Phase7EvaluationInput {
  features: AnalysisFeatureSet;
  baselineReady: boolean;
  ageGroup: AgeGroup;
  safetyStatus: SafetyStatus;
  goal: GoalCode;
  previousActionCodes: string[];
}

export interface Phase7EvaluationOutput {
  expertSystemVersion: string;
  scoringPolicyVersion: string;
  weeklyActionPolicyVersion: string;
  rulePackVersion: string;
  status: AnalysisStatus;
  dataQuality: AnalysisDataQuality;
  domainScores: DomainScoreRecord[];
  ruleEvaluations: RuleEvaluationRecord[];
  primaryPattern?: PatternSelectionRecord;
  supportingPatterns: PatternSelectionRecord[];
  selectedAction?: Omit<WeeklyActionDefinitionRecord, 'id'>;
  actionAlternatives: Array<Omit<WeeklyActionDefinitionRecord, 'id'>>;
  actionReasonCodes: string[];
  limitations: string[];
}

export function evaluatePhase7(input: Phase7EvaluationInput): Phase7EvaluationOutput {
  const rulePackVersion = input.ageGroup in ageRulePackVersions ? ageRulePackVersions[input.ageGroup as keyof typeof ageRulePackVersions] : 'PATTERN-OUT-OF-SCOPE';
  const ruleEvaluations: RuleEvaluationRecord[] = phase7RuleDefinitions.map((rule) => {
    const observed = Object.fromEntries(rule.requiredFeatures.map((key) => [key, input.features[key].value]));
    const evidenceRefs = [...new Set(rule.requiredFeatures.flatMap((key) => input.features[key].evidenceRefs))];
    const limitations = rule.requiredFeatures.filter((key) => input.features[key].availability === 'INSUFFICIENT_DATA' || input.features[key].coverage.ratio < rule.minimumEvidence).map((key) => `Data ${key} belum cukup (${input.features[key].coverage.availableDays}/${input.features[key].coverage.totalDays} hari).`);
    const value = input.features[rule.condition.feature].value;
    const safetyExcluded = rule.exclusions.includes('SAFETY_RED') && input.safetyStatus === 'RED';
    const matched = value !== null && limitations.length === 0 && !safetyExcluded && rule.agePacks.includes(rulePackVersion) && compare(value, rule.condition.operator, rule.condition.threshold);
    return { ruleId: rule.ruleId, ruleVersion: rule.version, domain: rule.domain, matched, contribution: matched ? rule.contribution : 0, observedValues: observed, reasonCodes: [...(matched ? [`${rule.ruleId}_MATCHED`] : ['RULE_NOT_MATCHED']), ...(safetyExcluded ? ['SAFETY_EXCLUSION'] : []), ...(limitations.length ? ['EVIDENCE_INSUFFICIENT'] : [])], evidenceRefs, limitations };
  });

  const domainScores: DomainScoreRecord[] = domainPriority.map((domain) => {
    const relevantFeatures = domainFeatures[domain];
    const available = relevantFeatures.filter((key) => input.features[key].availability === 'AVAILABLE');
    const coverage = available.length === 0 ? 0 : available.reduce((sum, key) => sum + input.features[key].coverage.ratio, 0) / relevantFeatures.length;
    const dataQuality = qualityFromCoverage(coverage);
    const rules = phase7RuleDefinitions.filter((rule) => rule.domain === domain && rule.agePacks.includes(rulePackVersion));
    const evaluations = ruleEvaluations.filter((evaluation) => evaluation.domain === domain);
    const possible = rules.reduce((sum, rule) => sum + rule.contribution, 0);
    const contribution = evaluations.reduce((sum, evaluation) => sum + evaluation.contribution, 0);
    const score = dataQuality === 'INSUFFICIENT' || possible === 0 ? null : Math.round(contribution / possible * 100);
    const limitations = [...new Set([...evaluations.flatMap((evaluation) => evaluation.limitations), ...(dataQuality === 'INSUFFICIENT' ? [`Data domain ${domain} belum cukup untuk menilai pola.`] : [])])];
    return { domain, availability: score === null ? 'INSUFFICIENT_DATA' : 'AVAILABLE', score, strength: score === null ? 'NOT_AVAILABLE' : strength(score), dataQuality, actionability: domainActionability[domain], matchedRuleIds: evaluations.filter((evaluation) => evaluation.matched).map((evaluation) => evaluation.ruleId), evidence: observedText(domain, input.features), limitations };
  });

  const availableDomains = domainScores.filter((domain): domain is DomainScoreRecord & { score: number; strength: 'LOW' | 'MODERATE' | 'STRONG' } => domain.score !== null && domain.strength !== 'NOT_AVAILABLE');
  const averageCoverageQuality = availableDomains.length === 0 ? 'INSUFFICIENT' : qualityFromCoverage(availableDomains.reduce((sum, domain) => sum + qualityRank[domain.dataQuality] / 3, 0) / domainScores.length);
  const ranked = availableDomains.filter((domain) => domain.score >= 25).sort((left, right) => {
    const goalPriorityLeft = (input.goal === 'IMPROVE_FITNESS' && left.domain === 'ACTIVITY_SEDENTARY') || (['LOSE_WEIGHT', 'GAIN_WEIGHT', 'MAINTAIN_WEIGHT'].includes(input.goal) && left.domain === 'MEAL_BALANCE_REGULARITY') ? 1 : 0;
    const goalPriorityRight = (input.goal === 'IMPROVE_FITNESS' && right.domain === 'ACTIVITY_SEDENTARY') || (['LOSE_WEIGHT', 'GAIN_WEIGHT', 'MAINTAIN_WEIGHT'].includes(input.goal) && right.domain === 'MEAL_BALANCE_REGULARITY') ? 1 : 0;
    return qualityRank[right.dataQuality] - qualityRank[left.dataQuality] || goalPriorityRight - goalPriorityLeft || right.actionability - left.actionability || right.score - left.score || domainPriority.indexOf(left.domain) - domainPriority.indexOf(right.domain);
  });
  const pattern = (domain: typeof ranked[number]): PatternSelectionRecord => ({ code: patternCodes[domain.domain], domain: domain.domain, label: labels[domain.domain], explanation: `Pola ini diprioritaskan dari data internal yang tersedia. ${domain.evidence.join('; ')}.`, strength: domain.strength, dataQuality: domain.dataQuality, score: domain.score, evidence: domain.evidence, limitations: domain.limitations });
  const primaryPattern = ranked[0] ? pattern(ranked[0]) : undefined;
  const supportingPatterns = ranked.slice(1, 3).map(pattern);
  const limitations = [...new Set(domainScores.flatMap((domain) => domain.limitations))];
  const status: AnalysisStatus = !input.baselineReady || availableDomains.length === 0 || !primaryPattern ? 'INSUFFICIENT_DATA' : availableDomains.length < domainScores.length ? 'PARTIAL' : 'READY';

  const eligibleActions = primaryPattern ? phase7WeeklyActions.filter((action) => action.domain === primaryPattern.domain && action.ageEligibility.includes(input.ageGroup) && !action.safetyRestrictions.includes(input.safetyStatus) && action.requiredEvidence.some((key) => input.features[key].availability === 'AVAILABLE')) : [];
  const sortedActions = eligibleActions.sort((left, right) => (input.previousActionCodes.includes(left.code) ? 1 : 0) - (input.previousActionCodes.includes(right.code) ? 1 : 0) || right.actionability - left.actionability || left.code.localeCompare(right.code));
  const selectedAction = status === 'INSUFFICIENT_DATA' ? undefined : sortedActions[0];
  const actionAlternatives = sortedActions.slice(1, 4);
  return { expertSystemVersion: PHASE_7_EXPERT_SYSTEM_VERSION, scoringPolicyVersion: PHASE_7_SCORING_POLICY_VERSION, weeklyActionPolicyVersion: PHASE_7_WEEKLY_ACTION_POLICY_VERSION, rulePackVersion, status, dataQuality: averageCoverageQuality, domainScores, ruleEvaluations, ...(primaryPattern ? { primaryPattern } : {}), supportingPatterns, ...(selectedAction ? { selectedAction } : {}), actionAlternatives, actionReasonCodes: selectedAction && primaryPattern ? [`PRIMARY_${primaryPattern.domain}`, `DATA_QUALITY_${primaryPattern.dataQuality}`, `ACTIONABILITY_${selectedAction.actionability}`] : status === 'INSUFFICIENT_DATA' ? ['INSUFFICIENT_DATA'] : ['ACTION_NOT_ELIGIBLE'], limitations };
}
