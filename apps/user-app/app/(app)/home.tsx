import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Activity, CalendarDays, Check, ChevronRight, Clock3, Lightbulb, MoonStar, RefreshCw, Utensils } from 'lucide-react-native';
import { breakpoints, colors, radius, spacing } from '@sarira/design-tokens';
import { AppText, Button, Card, Chip, ErrorState, Loading, ProgressBar, ProgressRing, SectionHeader } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { useBaseline } from '@/features/baseline/useBaseline';
import type { DailyNutritionSummaryRecord, PatternMapRecord, WeeklyActionAssignmentRecord } from '@sarira/shared-types';
import { api } from '@/services/api';

const taskRoutes = { checkIn: '/daily-check-in', food: '/food', sleep: '/sleep', activity: '/activity' } as const;
const labels = { checkIn: 'Check-in', food: 'Makanan', sleep: 'Tidur', activity: 'Aktivitas' } as const;

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= breakpoints.desktop;
  const { profile, current, loading, error, reload } = useBaseline();
  const [nutrition, setNutrition] = useState<DailyNutritionSummaryRecord>();
  const [pattern, setPattern] = useState<PatternMapRecord>();
  const [weeklyAction, setWeeklyAction] = useState<WeeklyActionAssignmentRecord>();
  useEffect(() => { if (!current) return; const timer = setTimeout(() => void api.getDailyNutrition(current.localDate).then(setNutrition).catch(() => setNutrition(undefined)), 0); return () => clearTimeout(timer); }, [current]);
  useEffect(() => { const timer = setTimeout(() => void Promise.all([api.getCurrentPatternMap().then(setPattern).catch(() => setPattern(undefined)), api.getCurrentWeeklyAction().then(setWeeklyAction).catch(() => setWeeklyAction(undefined))]), 0); return () => clearTimeout(timer); }, []);

  return (
    <AppShell title="Beranda" subtitle="Ringkasan prioritas hari ini">
      <View style={styles.greeting}>
        <View style={styles.flex}>
          <AppText variant="eyebrow">SELAMAT DATANG, {profile?.fullName.split(' ')[0]?.toUpperCase() ?? 'KAMU'}</AppText>
          <AppText variant={desktop ? 'h1' : 'h2'}>Satu catatan yang terasa mungkin.</AppText>
          <AppText variant="body">Tidak perlu sempurna, cukup catat sesuai kondisi sebenarnya.</AppText>
        </View>
        <Button label="Muat ulang" icon={RefreshCw} variant="secondary" onPress={() => void reload()} />
      </View>

      {loading ? <Loading label="Memuat baseline nyata…" /> : error ? <ErrorState description={error} onRetry={() => void reload()} /> : !current ? (
        <Card tone="lime" style={styles.startCard}>
          <CalendarDays size={38} color={colors.primaryDark} />
          <View style={styles.flex}><AppText variant="h2">Starter Journey siap dimulai</AppText><AppText variant="body">Kenali baseline 14 hari dan pilih izin pencatatan yang sesuai sebelum membuat sesi.</AppText></View>
          <Button label="Buka Starter Journey" variant="primary" icon={ChevronRight} onPress={() => router.push('/starter-journey' as never)} />
        </Card>
      ) : <>
        <View style={styles.heroGrid}>
          <Card tone="dark" style={styles.weeklyCard} accessibilityLabel={weeklyAction ? `Weekly Action ${weeklyAction.definition.title}, progres ${weeklyAction.progress} dari ${weeklyAction.targetCount}` : 'Weekly Action belum tersedia'}>
            <View style={styles.rowBetween}><View style={styles.flex}><AppText variant="eyebrow" style={styles.limeText}>WEEKLY ACTION · REAL</AppText><AppText variant="caption" style={styles.muted}>{weeklyAction ? `${weeklyAction.progress} dari ${weeklyAction.targetCount} selesai` : current.day14Available ? 'Siap dibuat dari Pattern Map' : 'Tersedia setelah readiness hari ke-14'}</AppText></View><Chip label={weeklyAction ? weeklyAction.status : 'MENUNGGU'} tone={weeklyAction ? 'lime' : 'neutral'} /></View>
            <AppText variant="h2" style={styles.white}>{weeklyAction?.definition.title ?? pattern?.primaryPattern?.label ?? 'Kenali pola dulu, satu action menyusul.'}</AppText>
            <AppText variant="body" style={styles.muted}>{weeklyAction?.definition.description ?? 'SARIRA akan memilih tepat satu langkah kecil yang eligible, dengan safety dan kualitas data tetap menjadi batas.'}</AppText>
            {weeklyAction ? <ProgressBar value={weeklyAction.progress} max={weeklyAction.targetCount} tone="lime" label={`Progres ${weeklyAction.progress} dari ${weeklyAction.targetCount}`} /> : null}
            <Button label={weeklyAction ? 'Buka Weekly Action' : current.day14Available ? 'Buat Pattern Map' : 'Isi check-in hari ini'} icon={ChevronRight} variant="lime" onPress={() => router.push((weeklyAction ? '/weekly-action' : current.day14Available ? '/pattern-map' : '/daily-check-in') as never)} />
          </Card>

          <Card tone="lime" style={styles.baselineCard} accessibilityLabel={`Baseline hari ${current.baseline.currentDay} dari ${current.baseline.targetDays}`}>
            <View style={styles.rowBetween}><View style={styles.roundIcon}><Clock3 size={22} color={colors.primaryDark} /></View><Chip label={current.day14Available ? 'PERIODE TERCAPAI' : current.day7Available ? 'CHECKPOINT TERSEDIA' : 'AKTIF'} tone="neutral" /></View>
            <View><AppText variant="h2">Baseline · Hari {Math.min(current.baseline.currentDay, current.baseline.targetDays)}</AppText><AppText variant="body">{current.completeness.completedDays} hari lengkap · {current.completeness.score}% data baseline tersedia</AppText></View>
            <ProgressBar value={Math.min(current.baseline.currentDay, current.baseline.targetDays)} max={current.baseline.targetDays} tone="primary" label={`Hari ${Math.min(current.baseline.currentDay, current.baseline.targetDays)} dari ${current.baseline.targetDays}`} />
            <Button label="Lihat perjalanan" variant="secondary" onPress={() => router.push('/baseline-journey' as never)} />
          </Card>
        </View>

        {current.day14Available ? <Card tone={current.baseline.readinessStatus === 'READY' ? 'mint' : 'cream'} style={styles.readiness}>
          <View style={styles.flex}><AppText variant="eyebrow">DAY-14 READINESS</AppText><AppText variant="h2">{current.baseline.readinessStatus === 'READY' ? 'Data baseline siap dianalisis.' : 'Periode selesai, beberapa data masih perlu dilengkapi.'}</AppText><AppText variant="body">{pattern ? `Pattern Map versi ${pattern.version} tersedia.` : 'Pattern Map akan abstain bila bukti per-domain belum cukup.'}</AppText></View>
          <Button label={pattern ? 'Buka Pattern Map' : 'Analisis Pattern Map'} variant="secondary" onPress={() => router.push('/pattern-map' as never)} />
        </Card> : current.day7Available ? <Card tone="blue" style={styles.readiness}><View style={styles.flex}><AppText variant="eyebrow">CHECKPOINT HARI 7</AppText><AppText variant="h3">Ringkasan deskriptif minggu pertama tersedia.</AppText><AppText variant="body">Tidak berisi diagnosis atau kesimpulan sebab-akibat.</AppText></View><Button label="Buka checkpoint" variant="secondary" onPress={() => router.push('/day-7-checkpoint' as never)} /></Card> : null}

        <View style={styles.mainGrid}>
          <Card style={styles.column}>
            <SectionHeader title="Tugas hari ini" action="Perjalanan" onAction={() => router.push('/baseline-journey' as never)} />
            {current.tasks.map((task) => {
              const Icon = task.definitionCode === 'food' ? Utensils : task.definitionCode === 'sleep' ? MoonStar : task.definitionCode === 'activity' ? Activity : Lightbulb;
              return <Pressable key={task.id} accessibilityRole="link" accessibilityLabel={`${task.title}, ${task.status}`} onPress={() => router.push(taskRoutes[task.definitionCode] as never)} style={({ pressed }) => [styles.task, pressed && styles.pressed]}><View style={[styles.taskIcon, task.status === 'COMPLETED' && styles.doneIcon]}>{task.status === 'COMPLETED' ? <Check size={20} color={colors.primaryDark} /> : <Icon size={20} color={colors.primary} />}</View><View style={styles.flex}><AppText variant="label">{task.title}</AppText><AppText variant="caption">{task.status === 'COMPLETED' ? 'Tercatat' : task.status === 'SKIPPED' ? 'Dilewati' : 'Belum tercatat'} · {task.progress} dari {task.target}</AppText></View><ChevronRight size={18} color={colors.textMuted} /></Pressable>;
            })}
          </Card>

          <Card tone="mint" style={styles.column} accessibilityLabel={`Kelengkapan data ${current.completeness.score} persen`}>
            <View style={styles.rowBetween}><View><AppText variant="eyebrow">KELENGKAPAN DATA</AppText><AppText variant="h2">{current.completeness.score}% tersedia</AppText></View><ProgressRing value={current.completeness.score} trackColor="#CFE9D8" color={colors.primary} label={`Kelengkapan data ${current.completeness.score} persen`} /></View>
            <AppText variant="body">Ini mengukur ketersediaan catatan baseline, bukan skor kesehatan atau diagnosis.</AppText>
            <View style={styles.chips}>{(['checkIn', 'food', 'sleep', 'activity'] as const).map((domain) => <Chip key={domain} label={`${labels[domain]} · ${Math.round(current.completeness.domainCoverage[domain] * 100)}%`} tone={current.completeness.missingDomains.includes(domain) ? 'warning' : 'mint'} />)}</View>
          </Card>
        </View>

        <Card tone="cream" style={styles.demoCard} accessibilityLabel={`Ringkasan nutrisi nyata, ${nutrition?.itemCount ?? 0} item`}>
          <View style={styles.rowBetween}><View style={styles.flex}><AppText variant="eyebrow">NUTRITION INDICATOR · REAL</AppText><AppText variant="h3">Ringkasan nutrisi hari ini</AppText></View><Chip label={`${nutrition?.itemCount ?? 0} ITEM`} tone="mint" /></View>
          <View style={styles.chips}>{(['ENERGY_KCAL', 'PROTEIN_G', 'FIBER_G', 'SODIUM_MG'] as const).map((code) => { const indicator = nutrition?.indicators.find((item) => item.nutrientCode === code); return <Chip key={code} label={`${indicator?.displayName ?? code} · ${indicator?.amount === null || indicator?.amount === undefined ? 'belum tersedia' : `${indicator.amount} ${indicator.unit}`}`} tone={indicator?.amount === null || indicator?.amount === undefined ? 'warning' : 'neutral'} />; })}</View>
          <AppText variant="body">Angka berasal dari snapshot porsi. Guided Meal dan Flex Kitchen kini memakai mesin nutrisi yang sama; fitur AI tidak digunakan.</AppText>
          <View style={styles.chips}><Button label="Buka Guided Meal" variant="lime" onPress={() => router.push('/guided-meal' as never)} /><Button label="Buka Flex Kitchen" variant="secondary" onPress={() => router.push('/flex-kitchen' as never)} /><Button label="Indikator nutrisi" variant="ghost" onPress={() => router.push('/nutrition' as never)} /></View>
        </Card>
      </>}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  greeting: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md },
  flex: { flex: 1, gap: 4 },
  heroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  weeklyCard: { flex: 1.5, minWidth: 300, minHeight: 300, justifyContent: 'space-between', gap: spacing.lg, padding: spacing.xl, borderColor: colors.primaryDark },
  baselineCard: { flex: 0.9, minWidth: 280, minHeight: 300, justifyContent: 'space-between', gap: spacing.md },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  white: { color: colors.white }, limeText: { color: colors.lime }, muted: { color: '#C8D6CC' },
  roundIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  startCard: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.md, minHeight: 160 },
  readiness: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.md },
  mainGrid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: spacing.md },
  column: { flex: 1, minWidth: 300, gap: spacing.md },
  task: { minHeight: 64, borderRadius: radius.input, padding: spacing.xs, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  taskIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  doneIcon: { backgroundColor: colors.softLime }, pressed: { opacity: 0.72 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  demoCard: { gap: spacing.md },
});
