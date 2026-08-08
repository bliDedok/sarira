import type { ActiveProfile, WeeklyAction } from '@sarira/shared-types';

export const profiles: ActiveProfile[] = [
  { id: 'ayu', name: 'Ayu Lestari', relation: 'diri', segment: 'adult', initials: 'AL' },
  { id: 'raka', name: 'Raka', relation: 'anak', segment: 'child', initials: 'R' },
  { id: 'ibu', name: 'Ibu Ningsih', relation: 'tanggungan', segment: 'healthy-aging', initials: 'IN' },
];

export const weeklyAction: WeeklyAction = {
  id: 'WA-AWB-DEMO-01',
  title: 'Protein di waktu sarapan',
  description: 'Tambahkan satu sumber protein pada sarapan selama empat hari minggu ini.',
  progress: 2,
  target: 4,
  confidence: 'sedang',
  ruleId: 'AWB-MEAL-DEMO · v0.1',
};

export const todayTasks = [
  { id: 'checkin', title: 'Check-in harian', meta: '± 2 menit', done: false, icon: 'pulse' },
  { id: 'breakfast', title: 'Catat sarapan', meta: 'Selesai 07.20', done: true, icon: 'food' },
  { id: 'sleep', title: 'Lengkapi catatan tidur', meta: '1 jawaban belum diisi', done: false, icon: 'sleep' },
];

export const nutritionSummary = [
  { id: 'energy', label: 'Energi', value: 1420, target: 1900, unit: 'kkal', type: 'rentang', status: 'Masih perlu dilengkapi' },
  { id: 'protein', label: 'Protein', value: 48, target: 72, unit: 'g', type: 'minimum', status: 'Masih membutuhkan sekitar 24 g' },
  { id: 'fiber', label: 'Serat', value: 18, target: 28, unit: 'g', type: 'minimum', status: 'Tambahkan sumber serat' },
  { id: 'sodium', label: 'Natrium', value: 1650, target: 2000, unit: 'mg', type: 'batas', status: 'Mendekati batas harian' },
  { id: 'sugar', label: 'Gula', value: 31, target: 50, unit: 'g', type: 'batas', status: 'Masih dalam batas' },
  { id: 'saturated-fat', label: 'Lemak jenuh', value: 13, target: 20, unit: 'g', type: 'batas', status: 'Masih dalam batas' },
];

export const meals = [
  {
    id: 'breakfast',
    time: 'Sarapan',
    name: 'Bubur oat pisang & telur',
    duration: '18 menit',
    price: '± Rp18.000',
    energy: '420 kkal',
    protein: '21 g protein',
    tone: 'lime' as const,
    consumed: true,
  },
  {
    id: 'lunch',
    time: 'Makan siang',
    name: 'Nasi merah, ayam bumbu kuning & urap',
    duration: '35 menit',
    price: '± Rp28.000',
    energy: '610 kkal',
    protein: '32 g protein',
    tone: 'mint' as const,
    consumed: false,
  },
  {
    id: 'dinner',
    time: 'Makan malam',
    name: 'Sup tahu sayur & jagung',
    duration: '25 menit',
    price: '± Rp20.000',
    energy: '390 kkal',
    protein: '19 g protein',
    tone: 'cream' as const,
    consumed: false,
  },
];

export const activitySummary = {
  steps: 6240,
  stepGoal: 8000,
  activeMinutes: 38,
  sleepHours: 7.2,
  source: 'Input manual · diperbarui 14.20',
};

export const citations = [
  {
    id: 'EVID-DEMO-001',
    title: 'Pedoman Gizi Seimbang untuk konteks Indonesia',
    publisher: 'Kementerian Kesehatan Republik Indonesia',
    year: 'ditinjau demo 2026',
    evidenceType: 'Pedoman resmi · metadata simulasi',
    ageGroup: 'Dewasa',
    supports: 'Mendukung prinsip keragaman pangan pada contoh Weekly Action.',
    limitation: 'Belum menjadi evidence record final; verifikasi reviewer wajib sebelum rilis.',
  },
];

export const patternData = {
  title: 'Sarapan belum konsisten lengkap',
  observation: 'Pada 6 dari 10 catatan, sarapan tercatat tanpa sumber protein yang jelas.',
  used: ['10 catatan sarapan', 'Jam makan', 'Komposisi yang dikonfirmasi pengguna'],
  missing: ['2 foto makanan belum dikonfirmasi', '1 hari tanpa catatan sarapan'],
  rule: 'AWB-MEAL-DEMO · v0.1 · aturan simulasi untuk uji kegunaan',
  dataConfidence: 'Sedang',
  ruleConfidence: 'Demo — belum tervalidasi',
  evidenceStrength: 'Sumber awal · perlu review',
};

export const flowGroups = [
  {
    id: 'adult',
    title: 'Flow 1 · Pengguna Dewasa',
    steps: ['splash', 'onboarding', 'welcome', 'registration', 'role-selection', 'birth-date', 'privacy-consent', 'safety-screening', 'goal-selection', 'profile-questionnaire', 'food-mode', 'profile-summary', 'starter-journey', 'home-day-1'],
  },
  {
    id: 'teen',
    title: 'Flow 2 · Remaja',
    steps: ['registration', 'birth-date', 'guardian-consent', 'safety-screening', 'goal-selection', 'growth-path', 'starter-journey'],
  },
  {
    id: 'parent',
    title: 'Flow 3 · Orang Tua',
    steps: ['login', 'role-selection', 'child-profile', 'family-growth', 'referral-card'],
  },
  {
    id: 'baseline',
    title: 'Flow 4 · Baseline 14 Hari',
    steps: ['home-day-1', 'daily-check-in', 'early-pattern', 'pattern-map', 'weekly-action', 'weekly-action-reason'],
  },
  {
    id: 'guided',
    title: 'Flow 5 · Guided Meal',
    steps: ['guided-meal', 'recipe-detail', 'cooking-mode', 'nutrition-indicator'],
  },
  {
    id: 'flex',
    title: 'Flow 6 · Flex Kitchen',
    steps: ['flex-kitchen', 'recipe-builder', 'adjustment-suggestion', 'personal-recipes'],
  },
  {
    id: 'digestive',
    title: 'Flow 7 · Digestive Support',
    steps: ['digestive-support', 'complaint-pattern', 'referral-card'],
  },
];
