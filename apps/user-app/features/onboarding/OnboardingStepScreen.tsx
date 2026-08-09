import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import {
  CheckCircle2,
  ClipboardList,
  HeartHandshake,
  ShieldCheck,
  Target,
  TriangleAlert,
  UserRound,
  Utensils,
} from 'lucide-react-native';
import type {
  ConsentDefinition,
  GoalCode,
  GoalDefinitionRecord,
  OnboardingRole,
  OnboardingSummaryRecord,
  ProgramCode,
  ProgramEligibilityRecord,
  QuestionnaireAnswerValue,
  QuestionnaireQuestionRecord,
  QuestionnaireSessionRecord,
  QuestionnaireTemplateRecord,
  SafetyAnswerCode,
  SafetyResultRecord,
  SafetySessionRecord,
  SafetyTemplateRecord,
  UserProfile,
} from '@sarira/shared-types';
import { ApiClientError } from '@sarira/api-client';
import { colors, spacing } from '@sarira/design-tokens';
import {
  AppText,
  AgePicker,
  Button,
  Card,
  Checkbox,
  Chip,
  ConsentCard,
  ErrorState,
  Field,
  HeightPicker,
  InlineNotice,
  Loading,
  MultiSelectionCard,
  ProgressBar,
  Radio,
  SelectionCard,
  StatusPill,
  TimePicker,
  Toast,
  WeightPicker,
} from '@sarira/ui';
import { PublicScreen } from '@/components/ScreenLayout';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/services/api';
import { useAutosave } from './useAutosave';

const canonicalSteps = [
  'role-selection',
  'birth-date',
  'guardian-consent',
  'privacy-consent',
  'safety-screening',
  'safety-result',
  'goal-selection',
  'profile-questionnaire',
  'program-preference',
  'profile-summary',
] as const;

type CanonicalStep = (typeof canonicalSteps)[number];

const aliases: Record<string, CanonicalStep> = {
  'food-preferences': 'profile-questionnaire',
  allergies: 'profile-questionnaire',
  'food-mode': 'program-preference',
  'safety-green': 'safety-result',
  'safety-yellow': 'safety-result',
  'safety-red': 'safety-result',
};

const stepMeta: Record<CanonicalStep, { eyebrow: string; title: string; description: string }> = {
  'role-selection': { eyebrow: 'Konteks profil', title: 'Siapa yang akan menggunakan SARIRA?', description: 'Pilih peran utama. Peran administratif tidak tersedia dari onboarding.' },
  'birth-date': { eyebrow: 'Profil dasar', title: 'Berapa usiamu?', description: 'Pilih usia saat ini. SARIRA menyimpan jawaban yang kamu konfirmasi tanpa membuat tanggal lahir perkiraan.' },
  'guardian-consent': { eyebrow: 'Persetujuan wali', title: 'Dukungan wali untuk pengguna remaja', description: 'Wali perlu membaca penjelasan dan memberi persetujuan sebelum pengguna remaja melanjutkan.' },
  'privacy-consent': { eyebrow: 'Privasi dan consent', title: 'Kamu memegang kendali atas data', description: 'Consent wajib dan opsional dipisahkan. Izin opsional dapat dilewati.' },
  'safety-screening': { eyebrow: 'Safety screening', title: 'Jawab sesuai kondisi sebenarnya', description: 'Tidak perlu sempurna. Tidak yakin tidak pernah dianggap otomatis aman.' },
  'safety-result': { eyebrow: 'Hasil safety', title: 'Jalur program awal', description: 'Hasil ditampilkan dengan label, ikon, dan penjelasan agar mudah dipahami.' },
  'goal-selection': { eyebrow: 'Tujuan', title: 'Apa yang ingin kamu prioritaskan?', description: 'Pilihan difilter berdasarkan usia, peran, dan hasil safety.' },
  'profile-questionnaire': { eyebrow: 'Kuesioner profil', title: 'Kenali rutinitasmu', description: 'Satu kelompok pertanyaan per langkah. Jawaban disimpan otomatis.' },
  'program-preference': { eyebrow: 'Preferensi program', title: 'Pilih cara yang terasa realistis', description: 'Kedua pilihan membantu merencanakan makan dengan tingkat panduan yang berbeda.' },
  'profile-summary': { eyebrow: 'Tinjau', title: 'Ringkasan profilmu', description: 'Periksa data sebelum menyelesaikan onboarding. Setiap bagian dapat diperbaiki.' },
};

const errorMessage = (error: unknown) => error instanceof ApiClientError ? error.message : error instanceof Error ? error.message : 'Terjadi kendala. Coba kembali.';

function SaveFeedback({ status, onRetry }: { status: 'idle' | 'saving' | 'saved' | 'failed'; onRetry: () => void }) {
  if (status === 'idle') return null;
  if (status === 'saving') return <Toast message="Menyimpan…" />;
  if (status === 'saved') return <Toast message="Tersimpan" tone="success" />;
  return <Toast message="Gagal menyimpan — jawaban tetap ada di layar." tone="danger" action={{ label: 'Coba lagi', onPress: onRetry }} />;
}

function StepFrame({ step, children, footer, saveStatus, onRetry }: { step: CanonicalStep; children: React.ReactNode; footer?: React.ReactNode; saveStatus?: 'idle' | 'saving' | 'saved' | 'failed'; onRetry?: () => void }) {
  const index = canonicalSteps.indexOf(step);
  const meta = stepMeta[step];
  return (
    <PublicScreen showBack maxWidth={820} stickyFooter={footer}>
      <View style={styles.page}>
        <View style={styles.progressHeader}>
          <Chip label={`LANGKAH ${index + 1} DARI ${canonicalSteps.length}`} tone="lime" />
          <AppText variant="caption">Bisa dilanjutkan nanti</AppText>
        </View>
        <ProgressBar value={index + 1} max={canonicalSteps.length} label={`Progres onboarding ${index + 1} dari ${canonicalSteps.length}`} />
        <View style={styles.intro}>
          <AppText variant="eyebrow">{meta.eyebrow}</AppText>
          <AppText variant="h1">{meta.title}</AppText>
          <AppText variant="bodyLarge">{meta.description}</AppText>
        </View>
        {saveStatus && onRetry ? <SaveFeedback status={saveStatus} onRetry={onRetry} /> : null}
        {children}
        <InlineNotice title="Jawab apa adanya" text="Tidak perlu sempurna, cukup jawab sesuai kondisi sebenarnya. Kamu bisa mengubah jawaban ini nanti." tone="info" />
      </View>
    </PublicScreen>
  );
}

function LoadBoundary({ loading, error, retry, children }: { loading: boolean; error?: string; retry: () => void; children: React.ReactNode }) {
  if (loading) return <Loading label="Memuat tahap onboarding…" />;
  return <>{error ? <ErrorState description={error} onRetry={retry} offline={error.toLowerCase().includes('terhubung')} /> : null}{children}</>;
}

function RoleStep() {
  const [roles, setRoles] = useState<Array<{ role: OnboardingRole; label: string; description: string }>>([]);
  const [selected, setSelected] = useState<OnboardingRole>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const { refreshSession } = useAuth();
  const load = async () => { setLoading(true); setError(undefined); try { setRoles(await api.getRoles()); } catch (cause) { setError(errorMessage(cause)); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const submit = async () => {
    if (!selected) return setError('Pilih satu peran untuk melanjutkan.');
    setSubmitting(true); setError(undefined);
    try { await api.setRole(selected); await refreshSession(); router.replace('/setup/birth-date' as never); }
    catch (cause) { setError(errorMessage(cause)); }
    finally { setSubmitting(false); }
  };
  return <StepFrame step="role-selection" footer={<Button label="Simpan peran" variant="lime" fullWidth loading={submitting} onPress={() => void submit()} />}><LoadBoundary loading={loading} error={error} retry={() => void load()}><View style={styles.stack}>{roles.map((item) => <SelectionCard key={item.role} title={item.label} description={item.description} icon={item.role === 'USER' ? UserRound : HeartHandshake} selected={selected === item.role} onPress={() => setSelected(item.role)} />)}</View></LoadBoundary>{error && !loading ? <InlineNotice title="Belum dapat menyimpan" text={error} tone="danger" /> : null}</StepFrame>;
}

function AgeStep() {
  const [profile, setProfile] = useState<UserProfile>();
  const [age, setAge] = useState(18);
  const [gender, setGender] = useState<UserProfile['gender']>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const { refreshSession } = useAuth();
  const load = async () => { setLoading(true); setError(undefined); try { const value = await api.getProfile(); setProfile(value); setAge(value.declaredAge ?? value.age ?? 18); setGender(value.gender); } catch (cause) { setError(errorMessage(cause)); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const submit = async () => {
    setSubmitting(true); setError(undefined);
    try {
      const value = await api.updateProfile({ declaredAge: age, ...(gender ? { gender } : {}) });
      if (value.ageGroup === 'UNDER_12') return setError('Profil mandiri tersedia mulai usia 12 tahun.');
      if (value.ageGroup === 'OVER_75') return setError('Cakupan program mandiri MVP saat ini adalah usia 12–75 tahun.');
      await refreshSession();
      router.replace(`/setup/${value.ageGroup === 'TEEN' ? 'guardian-consent' : 'privacy-consent'}` as never);
    } catch (cause) { setError(errorMessage(cause)); }
    finally { setSubmitting(false); }
  };
  return <StepFrame step="birth-date" footer={<Button label="Simpan usia dan lanjut" variant="lime" fullWidth loading={submitting} onPress={() => void submit()} />}><LoadBoundary loading={loading} error={error} retry={() => void load()}><View style={styles.stack}><Field label="Nama lengkap" value={profile?.fullName ?? ''} editable={false} helper="Nama berasal dari akun dan dapat diubah dari profil." /><AgePicker label="Usia saat ini" value={age} onChange={setAge} helper="Rentang program mandiri SARIRA: 12–75 tahun." /><Card tone="mint" style={styles.ageInfo}><AppText variant="label">Kenapa SARIRA menanyakan usia?</AppText><AppText variant="caption">Usia membantu menentukan alur wali, safety, serta pilihan tujuan. SARIRA tidak membuat tanggal lahir perkiraan dari jawaban ini.</AppText></Card><AppText variant="label">Gender (opsional)</AppText><View style={styles.stack}>{(['FEMALE', 'MALE', 'OTHER', 'UNDISCLOSED'] as const).map((value) => <Radio key={value} label={{ FEMALE: 'Perempuan', MALE: 'Laki-laki', OTHER: 'Lainnya', UNDISCLOSED: 'Tidak ingin menyebutkan' }[value]} selected={gender === value} onPress={() => setGender(value)} />)}</View></View></LoadBoundary>{error && !loading ? <InlineNotice title="Periksa profil" text={error} tone="danger" /> : null}</StepFrame>;
}

function GuardianStep() {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<'PARENT' | 'LEGAL_GUARDIAN'>('PARENT');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const { refreshSession } = useAuth();
  const submit = async () => {
    setSubmitting(true); setError(undefined);
    try { await api.setGuardianConsent({ guardianName: name, guardianRelationship: relationship, consentVersion: 'guardian-phase3-dev-v1', confirmed: true }); await refreshSession(); router.replace('/setup/privacy-consent' as never); }
    catch (cause) { setError(errorMessage(cause)); }
    finally { setSubmitting(false); }
  };
  return <StepFrame step="guardian-consent" footer={<Button label="Catat persetujuan wali" variant="lime" fullWidth loading={submitting} disabled={!confirmed || name.trim().length < 2} onPress={() => void submit()} />}><InlineNotice title="Konfirmasi wali diperlukan" text="Pastikan nama dan hubungan wali sesuai. Persetujuan ini bukan pengganti verifikasi identitas jika diwajibkan oleh layanan terkait." tone="warning" /><View style={styles.stack}><Field label="Nama wali" value={name} onChangeText={setName} autoComplete="name" /><Radio label="Orang tua" selected={relationship === 'PARENT'} onPress={() => setRelationship('PARENT')} /><Radio label="Wali yang sah" selected={relationship === 'LEGAL_GUARDIAN'} onPress={() => setRelationship('LEGAL_GUARDIAN')} /><Checkbox label="Saya mengonfirmasi telah membaca penjelasan dan memberi persetujuan sebagai wali." checked={confirmed} onChange={setConfirmed} /></View>{error ? <InlineNotice title="Persetujuan belum tercatat" text={error} tone="danger" /> : null}</StepFrame>;
}

function ConsentStep() {
  const [definitions, setDefinitions] = useState<ConsentDefinition[]>([]);
  const [granted, setGranted] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const autosave = useAutosave(250);
  const { refreshSession } = useAuth();
  const load = async () => {
    setLoading(true); setError(undefined);
    try {
      const [available, records] = await Promise.all([api.getAvailableConsents(), api.getConsents()]);
      const visible = available.filter((item) => item.required || ['NUTRITION_DATA', 'ACTIVITY_DATA', 'SLEEP_DATA'].includes(item.type));
      setDefinitions(visible);
      setGranted(Object.fromEntries(visible.map((item) => [item.type, records.some((record) => record.type === item.type && record.status === 'GRANTED')])));
    } catch (cause) { setError(errorMessage(cause)); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const toggle = (definition: ConsentDefinition, value: boolean) => {
    setGranted((current) => ({ ...current, [definition.type]: value }));
    autosave.schedule(definition.type, () => api.updateConsent(definition.type, { granted: value, version: definition.version, source: 'ONBOARDING' }).then(() => undefined), true);
  };
  const submit = async () => {
    const missing = definitions.filter((item) => item.required && !granted[item.type]);
    if (missing.length) return setError('Terms, Privacy, dan pemrosesan profil yang wajib harus disetujui.');
    setSubmitting(true); setError(undefined);
    try {
      await Promise.all(definitions.filter((item) => item.required).map((item) => api.updateConsent(item.type, { granted: true, version: item.version, source: 'ONBOARDING' })));
      await refreshSession();
      router.replace('/setup/safety-screening' as never);
    } catch (cause) { setError(errorMessage(cause)); }
    finally { setSubmitting(false); }
  };
  return <StepFrame step="privacy-consent" saveStatus={autosave.status} onRetry={autosave.retry} footer={<Button label="Simpan persetujuan dan lanjut" variant="lime" fullWidth loading={submitting} onPress={() => void submit()} />}><LoadBoundary loading={loading} error={error} retry={() => void load()}><View style={styles.stack}>{definitions.map((definition) => <ConsentCard key={definition.type} title={definition.displayName} summary={definition.description} details={`${definition.description} ${definition.required ? 'Persetujuan ini diperlukan untuk melanjutkan onboarding dan dapat ditinjau kembali dari pengaturan akun.' : 'Izin ini opsional, tidak menghalangi penyelesaian onboarding, dan dapat diubah kembali dari pengaturan akun.'}`} required={definition.required} checked={Boolean(granted[definition.type])} onChange={(value) => toggle(definition, value)} />)}</View></LoadBoundary>{error && !loading ? <InlineNotice title="Persetujuan belum lengkap" text={error} tone="danger" /> : null}</StepFrame>;
}

function SafetyStep() {
  const [template, setTemplate] = useState<SafetyTemplateRecord>();
  const [session, setSession] = useState<SafetySessionRecord>();
  const [answers, setAnswers] = useState<Record<string, SafetyAnswerCode>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const autosave = useAutosave(200);
  const load = async () => {
    setLoading(true); setError(undefined);
    try {
      const current = await api.getSafetyCurrent();
      const active = await api.createSafetySession();
      setTemplate(current.template); setSession(active);
      setAnswers(Object.fromEntries(active.answers.map((answer) => [answer.questionId, answer.answerCode])));
    } catch (cause) { setError(errorMessage(cause)); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const answer = (questionId: string, value: SafetyAnswerCode) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    if (session) autosave.schedule(questionId, () => api.saveSafetyAnswers(session.id, [{ questionId, answerCode: value }]).then(setSession).then(() => undefined), true);
  };
  const submit = async () => {
    if (!template || !session || template.questions.some((question) => question.required && !answers[question.id])) return setError('Jawab semua pertanyaan safety sebelum melanjutkan.');
    setSubmitting(true); setError(undefined);
    try {
      await api.saveSafetyAnswers(session.id, Object.entries(answers).map(([questionId, answerCode]) => ({ questionId, answerCode })));
      await api.completeSafety(session.id);
      router.replace('/setup/safety-result' as never);
    } catch (cause) { setError(errorMessage(cause)); }
    finally { setSubmitting(false); }
  };
  return <StepFrame step="safety-screening" saveStatus={autosave.status} onRetry={autosave.retry} footer={<Button label="Selesaikan safety screening" variant="lime" fullWidth loading={submitting} onPress={() => void submit()} />}><InlineNotice title="Perlu peninjauan ahli" text="Pertanyaan ini membantu menentukan jalur awal dan tidak menggantikan evaluasi profesional." tone="warning" /><LoadBoundary loading={loading} error={error} retry={() => void load()}><View style={styles.stack}>{template?.questions.map((question) => <Card key={question.id} style={styles.questionCard}><AppText variant="h3">{question.prompt}</AppText>{question.helpText ? <AppText variant="caption">{question.helpText}</AppText> : null}<View style={styles.stack}><SelectionCard title="Ya" selected={answers[question.id] === 'YES'} onPress={() => answer(question.id, 'YES')} /><SelectionCard title="Tidak" selected={answers[question.id] === 'NO'} onPress={() => answer(question.id, 'NO')} /><SelectionCard title="Tidak yakin" selected={answers[question.id] === 'NOT_SURE'} onPress={() => answer(question.id, 'NOT_SURE')} /></View></Card>)}</View></LoadBoundary>{error && !loading ? <InlineNotice title="Safety screening belum selesai" text={error} tone="danger" /> : null}</StepFrame>;
}

function SafetyResultStep() {
  const [result, setResult] = useState<SafetyResultRecord>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const load = async () => { setLoading(true); setError(undefined); try { const value = await api.getSafetyCurrent(); if (!value.latestResult) throw new Error('Hasil safety belum tersedia.'); setResult(value.latestResult); } catch (cause) { setError(errorMessage(cause)); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const copy = result?.status === 'GREEN'
    ? { title: 'Dapat melanjutkan', text: 'Jawaban yang tersedia tidak menunjukkan perlunya pembatasan tambahan pada tahap ini.', tone: 'mint' as const }
    : result?.status === 'YELLOW'
      ? { title: 'Lanjut dengan kehati-hatian', text: 'Ada informasi yang memerlukan penyesuaian atau perhatian tambahan.', tone: 'cream' as const }
      : { title: 'Tinjau bantuan profesional', text: 'Program terkait dibatasi. Acknowledgement bukan clearance untuk mengabaikan arahan.', tone: 'peach' as const };
  return <StepFrame step="safety-result" footer={<Button label="Lihat tujuan yang tersedia" variant="lime" fullWidth disabled={!result} onPress={() => router.replace('/setup/goal-selection' as never)} />}><LoadBoundary loading={loading} error={error} retry={() => void load()}>{result ? <Card tone={copy.tone} style={styles.resultCard}><View style={styles.inline}>{result.status === 'GREEN' ? <CheckCircle2 size={30} color={colors.success} /> : <TriangleAlert size={30} color={result.status === 'RED' ? colors.danger : colors.warning} />}<StatusPill status={result.status} /></View><AppText variant="h2">{copy.title}</AppText><AppText variant="bodyLarge">{copy.text}</AppText>{result.referralRequired ? <InlineNotice title="Pertimbangkan bantuan profesional" text="SARIRA tidak membuat diagnosis. Gunakan tenaga atau layanan profesional yang tepercaya." tone="danger" /> : null}</Card> : null}</LoadBoundary></StepFrame>;
}

function GoalStep() {
  const [goals, setGoals] = useState<GoalDefinitionRecord[]>([]);
  const [selected, setSelected] = useState<GoalCode>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const { refreshSession } = useAuth();
  const load = async () => { setLoading(true); setError(undefined); try { setGoals(await api.getGoals()); } catch (cause) { setError(errorMessage(cause)); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const submit = async () => { if (!selected) return setError('Pilih tujuan yang tersedia.'); setSubmitting(true); setError(undefined); try { await api.setGoal(selected); await refreshSession(); router.replace('/setup/profile-questionnaire' as never); } catch (cause) { setError(errorMessage(cause)); } finally { setSubmitting(false); } };
  return <StepFrame step="goal-selection" footer={<Button label="Simpan tujuan" variant="lime" fullWidth loading={submitting} onPress={() => void submit()} />}><LoadBoundary loading={loading} error={error} retry={() => void load()}><View style={styles.stack}>{goals.map((goal) => <SelectionCard key={goal.code} title={goal.label} description={`${goal.description}${goal.priority ? ' · Direkomendasikan untuk profilmu.' : ''}`} icon={Target} selected={selected === goal.code} disabled={!goal.eligible} error={goal.disabledReason} onPress={() => setSelected(goal.code)} />)}</View></LoadBoundary>{error && !loading ? <InlineNotice title="Tujuan belum tersimpan" text={error} tone="danger" /> : null}</StepFrame>;
}

const sectionLabels: Record<string, string> = { BODY_PROFILE: 'Profil tubuh', ROUTINE: 'Rutinitas', SLEEP: 'Tidur', FOOD_HABIT: 'Kebiasaan makan', DIET_PREFERENCE: 'Preferensi makan', ACTIVITY: 'Aktivitas' };
const sectionOrder = ['BODY_PROFILE', 'ROUTINE', 'SLEEP', 'FOOD_HABIT', 'DIET_PREFERENCE', 'ACTIVITY'];

function visible(question: QuestionnaireQuestionRecord, answers: Record<string, QuestionnaireAnswerValue>) {
  if (!question.visibleWhen) return true;
  const current = answers[question.visibleWhen.questionCode];
  return question.visibleWhen.operator === 'equals' ? current === question.visibleWhen.value : Array.isArray(current) && current.includes(String(question.visibleWhen.value));
}

function QuestionInput({ question, value, onChange }: { question: QuestionnaireQuestionRecord; value: QuestionnaireAnswerValue | undefined; onChange: (value: QuestionnaireAnswerValue, immediate?: boolean) => void }) {
  if (question.valueType === 'BOOLEAN') return <View style={styles.stack}><SelectionCard title="Ya" selected={value === true} onPress={() => onChange(true, true)} /><SelectionCard title="Tidak" selected={value === false} onPress={() => onChange(false, true)} /></View>;
  if (question.valueType === 'SINGLE_SELECT') return <View style={styles.stack}>{question.options.map((option) => <SelectionCard key={option.id} title={option.label} selected={value === option.code} onPress={() => onChange(option.code, true)} />)}</View>;
  if (question.valueType === 'MULTI_SELECT') {
    const selected = Array.isArray(value) ? value : [];
    return <View style={styles.stack}>{question.options.map((option) => <MultiSelectionCard key={option.id} title={option.label} selected={selected.includes(option.code)} onPress={() => onChange(selected.includes(option.code) ? selected.filter((item) => item !== option.code) : [...selected, option.code], true)} />)}</View>;
  }
  const numericValue = typeof value === 'number' && Number.isFinite(value) ? value : undefined;
  if (question.code === 'weight_kg') return <WeightPicker label={question.prompt} value={numericValue ?? 60} onChange={(next) => onChange(next)} helper={question.helpText} />;
  if (question.code === 'height_cm') return <HeightPicker label={question.prompt} value={numericValue ?? 165} onChange={(next) => onChange(next)} helper={question.helpText} />;
  if (question.valueType === 'TIME') return <TimePicker label={question.prompt} value={typeof value === 'string' ? value : '07:00'} onChange={(next) => onChange(next, true)} helper={question.helpText} />;
  return <Field label={question.prompt} value={value === undefined || value === null ? '' : String(value)} onChangeText={(text) => onChange(question.valueType === 'NUMBER' ? (text === '' ? null : Number(text.replace(',', '.'))) : text)} keyboardType={question.valueType === 'NUMBER' ? 'decimal-pad' : 'default'} helper={question.helpText} />;
}

function QuestionnaireStep() {
  const [template, setTemplate] = useState<QuestionnaireTemplateRecord>();
  const [session, setSession] = useState<QuestionnaireSessionRecord>();
  const [answers, setAnswers] = useState<Record<string, QuestionnaireAnswerValue>>({});
  const [sectionIndex, setSectionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const autosave = useAutosave();
  const { refreshSession } = useAuth();
  const load = async () => {
    setLoading(true); setError(undefined);
    try {
      const data = await api.getQuestionnaire();
      const active = data.session?.status === 'IN_PROGRESS' ? data.session : await api.createQuestionnaireSession(data.template.id);
      setTemplate(data.template); setSession(active);
      const restored = Object.fromEntries(active.answers.map((answer) => [answer.questionCode, answer.value])); setAnswers(restored);
      const firstIncomplete = sectionOrder.findIndex((section) => data.template.questions.some((question) => question.section === section && question.required && visible(question, restored) && (restored[question.code] === undefined || restored[question.code] === null || restored[question.code] === '')));
      if (firstIncomplete >= 0) setSectionIndex(firstIncomplete);
    } catch (cause) { setError(errorMessage(cause)); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const currentSection = sectionOrder[sectionIndex] ?? 'BODY_PROFILE';
  const questions = useMemo(() => template?.questions.filter((question) => question.section === currentSection && visible(question, answers)) ?? [], [answers, currentSection, template]);
  const change = (question: QuestionnaireQuestionRecord, value: QuestionnaireAnswerValue, immediate = false) => {
    setAnswers((current) => ({ ...current, [question.code]: value }));
    if (session) autosave.schedule(question.id, () => api.saveQuestionnaireAnswers(session.id, [{ questionId: question.id, value }]).then(setSession).then(() => undefined), immediate);
  };
  const next = async () => {
    const missing = questions.filter((question) => question.required && (answers[question.code] === undefined || answers[question.code] === null || answers[question.code] === '' || (Array.isArray(answers[question.code]) && (answers[question.code] as string[]).length === 0)));
    if (missing.length) return setError(`Lengkapi: ${missing.map((item) => item.prompt).join(', ')}`);
    if (!session) return;
    setSubmitting(true); setError(undefined);
    try {
      const sectionAnswers = questions.filter((question) => answers[question.code] !== undefined).map((question) => ({ questionId: question.id, value: answers[question.code]! }));
      if (sectionAnswers.length) await api.saveQuestionnaireAnswers(session.id, sectionAnswers);
      if (sectionIndex < sectionOrder.length - 1) setSectionIndex((value) => value + 1);
      else { await api.completeQuestionnaire(session.id); await refreshSession(); router.replace('/setup/program-preference' as never); }
    } catch (cause) { setError(errorMessage(cause)); }
    finally { setSubmitting(false); }
  };
  return <StepFrame step="profile-questionnaire" saveStatus={autosave.status} onRetry={autosave.retry} footer={<View style={styles.footerActions}>{sectionIndex > 0 ? <Button label="Bagian sebelumnya" variant="secondary" onPress={() => setSectionIndex((value) => Math.max(0, value - 1))} /> : null}<Button label={sectionIndex === sectionOrder.length - 1 ? 'Selesaikan kuesioner' : 'Bagian berikutnya'} variant="lime" loading={submitting} onPress={() => void next()} /></View>}><LoadBoundary loading={loading} error={error} retry={() => void load()}><View style={styles.sectionHeader}><ClipboardList size={24} color={colors.primary} /><View style={styles.flex}><AppText variant="h2">{sectionLabels[currentSection]}</AppText><AppText variant="caption">Bagian {sectionIndex + 1} dari {sectionOrder.length}</AppText></View></View><View style={styles.stack}>{questions.map((question) => <Card key={question.id} style={styles.questionCard}>{question.valueType === 'TEXT' || question.valueType === 'NUMBER' || question.valueType === 'TIME' ? null : <AppText variant="h3">{question.prompt}</AppText>}<QuestionInput question={question} value={answers[question.code]} onChange={(value, immediate) => change(question, value, immediate)} />{question.required ? <Chip label="WAJIB" tone="neutral" /> : <Chip label="OPSIONAL" tone="mint" />}</Card>)}</View></LoadBoundary>{error && !loading ? <InlineNotice title="Periksa jawaban" text={error} tone="danger" /> : null}</StepFrame>;
}

function ProgramStep() {
  const [options, setOptions] = useState<ProgramEligibilityRecord[]>([]);
  const [selected, setSelected] = useState<ProgramCode>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const { refreshSession } = useAuth();
  const load = async () => { setLoading(true); setError(undefined); try { const value = await api.getProgramPreferences(); setOptions(value.options); setSelected(value.selected?.program); } catch (cause) { setError(errorMessage(cause)); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const submit = async () => { setSubmitting(true); setError(undefined); try { if (options.every((item) => !item.eligible)) await api.skipProgramPreference(); else if (selected) await api.setProgramPreference(selected); else throw new Error('Pilih salah satu program yang tersedia.'); await refreshSession(); router.replace('/setup/profile-summary' as never); } catch (cause) { setError(errorMessage(cause)); } finally { setSubmitting(false); } };
  const allBlocked = options.length > 0 && options.every((item) => !item.eligible);
  return <StepFrame step="program-preference" footer={<Button label={allBlocked ? 'Lanjut tanpa program' : 'Simpan preferensi'} variant="lime" fullWidth loading={submitting} onPress={() => void submit()} />}><InlineNotice title="Dua mode makan tersedia" text="Pilih pendekatan yang paling realistis untuk rutinitasmu." tone="info" /><LoadBoundary loading={loading} error={error} retry={() => void load()}><View style={styles.stack}>{options.map((item) => <SelectionCard key={item.code} title={item.label} description={item.eligible ? (item.code === 'GUIDED_MEAL' ? 'Dapatkan struktur pilihan makan yang lebih terarah.' : 'Susun makanan secara fleksibel dari bahan yang tersedia.') : 'Pilihan ini belum tersedia untuk profilmu saat ini.'} icon={item.code === 'GUIDED_MEAL' ? Utensils : ShieldCheck} selected={selected === item.code} disabled={!item.eligible} onPress={() => setSelected(item.code)} />)}</View></LoadBoundary>{error && !loading ? <InlineNotice title="Preferensi belum tersimpan" text={error} tone="danger" /> : null}</StepFrame>;
}

function SummaryRow({ title, value, edit }: { title: string; value: string; edit: CanonicalStep }) {
  return <View style={styles.summaryRow}><View style={styles.flex}><AppText variant="label">{title}</AppText><AppText variant="body">{value}</AppText></View><Button label="Edit" variant="ghost" onPress={() => router.push(`/setup/${edit}` as never)} /></View>;
}

const ageGroupLabels: Record<string, string> = { TEEN: 'Remaja 12–17', YOUNG_ADULT: 'Dewasa muda 18–25', ADULT_BALANCE: 'Dewasa 26–59', HEALTHY_AGING: 'Usia sehat 60–75' };
const roleLabels: Record<string, string> = { USER: 'Untuk diri sendiri', PARENT: 'Orang tua', GUARDIAN: 'Wali', CAREGIVER: 'Pendamping' };
const safetyLabels: Record<string, string> = { GREEN: 'Dapat melanjutkan', YELLOW: 'Perlu kehati-hatian', RED: 'Perlu bantuan profesional', UNKNOWN: 'Belum ditentukan' };
const programLabels: Record<string, string> = { GUIDED_MEAL: 'Guided Meal', FLEX_KITCHEN: 'Flex Kitchen' };
const consentLabels: Record<string, string> = {
  TERMS_OF_SERVICE: 'Ketentuan Layanan', PRIVACY_POLICY: 'Kebijakan Privasi', HEALTH_PROFILE: 'Profil Kesehatan',
  NUTRITION_DATA: 'Data Nutrisi', ACTIVITY_DATA: 'Data Aktivitas', SLEEP_DATA: 'Data Tidur',
};
const readableCode = (value: unknown) => String(value ?? '—').toLocaleLowerCase('id-ID').replaceAll('_', ' ').replace(/^./, (character) => character.toLocaleUpperCase('id-ID'));

function SummaryStep() {
  const [summary, setSummary] = useState<OnboardingSummaryRecord>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const { refreshSession } = useAuth();
  const load = async () => { setLoading(true); setError(undefined); try { setSummary(await api.getOnboardingSummary()); } catch (cause) { setError(errorMessage(cause)); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const complete = async () => { setSubmitting(true); setError(undefined); try { await api.completeOnboarding(); await refreshSession(); router.replace('/starter-journey' as never); } catch (cause) { setError(errorMessage(cause)); } finally { setSubmitting(false); } };
  const answers = summary?.questionnaire?.answers ?? [];
  const answer = (code: string) => answers.find((item) => item.questionCode === code)?.value;
  return <StepFrame step="profile-summary" footer={<Button label="Selesaikan onboarding" variant="lime" fullWidth loading={submitting} disabled={!summary || summary.completionIssues.length > 0} onPress={() => void complete()} />}><LoadBoundary loading={loading} error={error} retry={() => void load()}>{summary ? <View style={styles.stack}><Card style={styles.stack}><SummaryRow title="Nama" value={summary.profile.fullName} edit="birth-date" /><SummaryRow title="Usia" value={`${summary.profile.age ?? '—'} tahun · ${ageGroupLabels[summary.ageGroup ?? ''] ?? 'Belum tersedia'}`} edit="birth-date" /><SummaryRow title="Peran" value={roleLabels[summary.profile.primaryRole ?? ''] ?? 'Belum dipilih'} edit="role-selection" /><SummaryRow title="Tujuan" value={summary.goal?.label ?? 'Belum dipilih'} edit="goal-selection" /><SummaryRow title="Safety" value={safetyLabels[summary.safetyResult?.status ?? ''] ?? 'Belum selesai'} edit="safety-screening" /></Card><Card style={styles.stack}><AppText variant="h3">Profil tubuh dan rutinitas</AppText><SummaryRow title="Tinggi / berat" value={`${String(answer('height_cm') ?? '—')} cm · ${String(answer('weight_kg') ?? '—')} kg`} edit="profile-questionnaire" /><SummaryRow title="Rutinitas" value={readableCode(answer('daily_context'))} edit="profile-questionnaire" /><SummaryRow title="Tidur" value={`${String(answer('sleep_time') ?? '—')}–${String(answer('wake_time') ?? '—')}`} edit="profile-questionnaire" /><SummaryRow title="Aktivitas" value={readableCode(answer('activity_level'))} edit="profile-questionnaire" /><SummaryRow title="Program" value={programLabels[summary.programPreference?.program ?? ''] ?? 'Belum dipilih'} edit="program-preference" /></Card><Card tone="mint" style={styles.stack}><AppText variant="h3">Persetujuan aktif</AppText>{summary.consents.filter((item) => item.status === 'GRANTED').map((item) => <View key={item.id} style={styles.inline}><CheckCircle2 size={18} color={colors.success} /><AppText variant="body">{consentLabels[item.type] ?? readableCode(item.type)}</AppText></View>)}</Card>{summary.completionIssues.length ? <InlineNotice title="Masih ada yang perlu dilengkapi" text="Periksa kembali bagian profil yang belum selesai sebelum melanjutkan." tone="warning" /> : <InlineNotice title="Siap diselesaikan" text="SARIRA akan memeriksa seluruh syarat sekali lagi sebelum onboarding selesai." tone="success" />}</View> : null}</LoadBoundary>{error && !loading ? <InlineNotice title="Onboarding belum dapat diselesaikan" text={error} tone="danger" /> : null}</StepFrame>;
}

export function OnboardingStepScreen({ requestedStep }: { requestedStep: string }) {
  const step = (aliases[requestedStep] ?? requestedStep) as CanonicalStep;
  if (!canonicalSteps.includes(step)) return <PublicScreen><ErrorState title="Tahap tidak ditemukan" description="Kembali ke status onboarding untuk melanjutkan." onRetry={() => router.replace('/setup/role-selection' as never)} /></PublicScreen>;
  const screens: Record<CanonicalStep, React.ReactNode> = {
    'role-selection': <RoleStep />,
    'birth-date': <AgeStep />,
    'guardian-consent': <GuardianStep />,
    'privacy-consent': <ConsentStep />,
    'safety-screening': <SafetyStep />,
    'safety-result': <SafetyResultStep />,
    'goal-selection': <GoalStep />,
    'profile-questionnaire': <QuestionnaireStep />,
    'program-preference': <ProgramStep />,
    'profile-summary': <SummaryStep />,
  };
  return screens[step];
}

const styles = StyleSheet.create({
  page: { flex: 1, gap: spacing.lg, paddingBottom: spacing.xl },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  intro: { gap: spacing.xs, marginVertical: spacing.sm },
  stack: { gap: spacing.md },
  flex: { flex: 1, minWidth: 0, gap: 3 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  ageInfo: { gap: spacing.xs },
  questionCard: { gap: spacing.md, padding: spacing.lg },
  resultCard: { gap: spacing.lg, padding: spacing.xl, minHeight: 300, justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.md },
  footerActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  summaryRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: spacing.xs },
});
