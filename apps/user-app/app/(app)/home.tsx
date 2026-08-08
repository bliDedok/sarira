import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Activity, CalendarDays, Check, ChevronRight, Clock3, Lightbulb, MoonStar, RefreshCw, Utensils } from 'lucide-react-native';
import { breakpoints, colors, radius, spacing } from '@sarira/design-tokens';
import { AppText, Button, Card, Chip, ErrorState, Loading, ProgressBar, ProgressRing, SectionHeader, SimulatedBadge } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { useBaseline } from '@/features/baseline/useBaseline';

const taskRoutes = { checkIn: '/daily-check-in', food: '/food', sleep: '/sleep', activity: '/activity' } as const;
const labels = { checkIn: 'Check-in', food: 'Makanan', sleep: 'Tidur', activity: 'Aktivitas' } as const;

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= breakpoints.desktop;
  const { profile, current, loading, error, reload } = useBaseline();

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
          <Card tone="dark" style={styles.weeklyCard} accessibilityLabel="Weekly Action masih Demo">
            <View style={styles.rowBetween}><View style={styles.flex}><AppText variant="eyebrow" style={styles.limeText}>WEEKLY ACTION</AppText><AppText variant="caption" style={styles.muted}>Aktif setelah analisis pola pada fase berikutnya</AppText></View><SimulatedBadge label="DEMO" /></View>
            <AppText variant="h2" style={styles.white}>Kenali pola dulu, action menyusul.</AppText>
            <AppText variant="body" style={styles.muted}>Selama baseline, cukup catat kondisi sebenarnya. SARIRA belum membuat kesimpulan sebab-akibat.</AppText>
            <Button label="Isi check-in hari ini" icon={ChevronRight} variant="lime" onPress={() => router.push('/daily-check-in' as never)} />
          </Card>

          <Card tone="lime" style={styles.baselineCard} accessibilityLabel={`Baseline hari ${current.baseline.currentDay} dari ${current.baseline.targetDays}`}>
            <View style={styles.rowBetween}><View style={styles.roundIcon}><Clock3 size={22} color={colors.primaryDark} /></View><Chip label={current.day14Available ? 'PERIODE TERCAPAI' : current.day7Available ? 'CHECKPOINT TERSEDIA' : 'AKTIF'} tone="neutral" /></View>
            <View><AppText variant="h2">Baseline · Hari {Math.min(current.baseline.currentDay, current.baseline.targetDays)}</AppText><AppText variant="body">{current.completeness.completedDays} hari lengkap · {current.completeness.score}% data baseline tersedia</AppText></View>
            <ProgressBar value={Math.min(current.baseline.currentDay, current.baseline.targetDays)} max={current.baseline.targetDays} tone="primary" label={`Hari ${Math.min(current.baseline.currentDay, current.baseline.targetDays)} dari ${current.baseline.targetDays}`} />
            <Button label="Lihat perjalanan" variant="secondary" onPress={() => router.push('/baseline-journey' as never)} />
          </Card>
        </View>

        {current.day14Available ? <Card tone={current.baseline.readinessStatus === 'READY' ? 'mint' : 'cream'} style={styles.readiness}>
          <View style={styles.flex}><AppText variant="eyebrow">DAY-14 READINESS</AppText><AppText variant="h2">{current.baseline.readinessStatus === 'READY' ? 'Data baseline siap dianalisis.' : 'Periode selesai, beberapa data masih perlu dilengkapi.'}</AppText><AppText variant="body">Pattern Map final belum dibuat pada Phase 4.</AppText></View>
          <Button label="Lihat readiness" variant="secondary" onPress={() => router.push('/baseline-journey' as never)} />
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

        <Card tone="cream" style={styles.demoCard} accessibilityLabel="Ringkasan nutrisi Demo">
          <View style={styles.rowBetween}><View style={styles.flex}><AppText variant="eyebrow">NUTRITION RECOMMENDATION</AppText><AppText variant="h3">Perhitungan nutrisi belum aktif</AppText></View><SimulatedBadge label="DEMO" /></View>
          <AppText variant="body">Food log dasar sudah nyata, tetapi kalori, makro, natrium, rekomendasi Guided Meal, dan Flex Kitchen tetap Demo sampai fase berikutnya.</AppText>
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
