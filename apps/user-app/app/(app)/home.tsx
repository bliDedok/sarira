import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Activity,
  Check,
  ChevronRight,
  Clock3,
  Database,
  Footprints,
  Lightbulb,
  MoonStar,
  Plus,
  Utensils,
} from 'lucide-react-native';
import { breakpoints, colors, radius, spacing } from '@sarira/design-tokens';
import { AppText, Button, Card, Chip, ProgressBar, ProgressRing, SectionHeader, SimulatedBadge } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { activitySummary, nutritionSummary, todayTasks, weeklyAction } from '@/mocks/data';
import { usePrototype } from '@/features/prototype/PrototypeContext';
import { screenHref } from '@/utils/routes';

function WeeklyActionCard({ dayOne }: { dayOne: boolean }) {
  const { weeklyProgress, completeWeeklyAction } = usePrototype();
  if (dayOne) {
    return (
      <Card tone="dark" style={styles.weeklyCard} accessibilityLabel="Weekly Action belum aktif">
        <View style={styles.cardTopRow}>
          <AppText variant="eyebrow" style={{ color: colors.lime }}>WEEKLY ACTION</AppText>
          <SimulatedBadge label="AKTIF HARI 14" />
        </View>
        <AppText variant="h2" style={{ color: colors.white }}>Kenali pola dulu, action menyusul.</AppText>
        <AppText variant="body" style={{ color: '#C8D6CC' }}>Selama baseline, cukup catat kondisi sebenarnya. SARIRA belum membuat kesimpulan pada Hari 1.</AppText>
        <Button label="Mulai check-in Hari 1" icon={ChevronRight} variant="lime" onPress={() => router.push(screenHref('daily-check-in') as never)} />
      </Card>
    );
  }
  return (
    <Card tone="dark" style={styles.weeklyCard} accessibilityLabel={`Weekly Action, progres ${weeklyProgress} dari ${weeklyAction.target} hari`}>
      <View style={styles.cardTopRow}>
        <View style={{ gap: 4 }}>
          <AppText variant="eyebrow" style={{ color: colors.lime }}>WEEKLY ACTION</AppText>
          <Chip label={`Data confidence · ${weeklyAction.confidence}`} tone="mint" />
        </View>
        <ProgressRing value={(weeklyProgress / weeklyAction.target) * 100} label={`${weeklyProgress} dari ${weeklyAction.target} hari`} />
      </View>
      <View style={{ gap: spacing.xs }}>
        <AppText variant="h2" style={{ color: colors.white }}>{weeklyAction.title}</AppText>
        <AppText variant="bodyLarge" style={{ color: '#D5E1D9' }}>{weeklyAction.description}</AppText>
      </View>
      <View style={styles.actionRow}>
        <Button label={weeklyProgress >= weeklyAction.target ? 'Target tercatat' : 'Catat hari ini'} icon={weeklyProgress >= weeklyAction.target ? Check : Plus} variant="lime" onPress={completeWeeklyAction} disabled={weeklyProgress >= weeklyAction.target} />
        <Button label="Mengapa dipilih" variant="inverse" onPress={() => router.push(screenHref('weekly-action-reason') as never)} />
      </View>
    </Card>
  );
}

function BaselineCard({ dayOne }: { dayOne: boolean }) {
  const day = dayOne ? 1 : 10;
  return (
    <Card tone="lime" style={styles.baselineCard} accessibilityLabel={`Baseline hari ${day} dari 14`}>
      <View style={styles.cardTopRow}>
        <View style={styles.roundIcon}><Clock3 size={21} color={colors.primaryDark} /></View>
        <Chip label={dayOne ? 'BARU DIMULAI' : '4 HARI LAGI'} tone="neutral" />
      </View>
      <View style={{ gap: 3 }}>
        <AppText variant="h3">Baseline · Hari {day}</AppText>
        <AppText variant="body">{dayOne ? 'Belajar mencatat sesuai kondisi sebenarnya.' : 'Cakupan data 8 dari 10 kategori.'}</AppText>
      </View>
      <ProgressBar value={day} max={14} tone="primary" label={`Hari ${day} dari 14`} />
      <Button label="Lihat perjalanan" variant="secondary" onPress={() => router.push(screenHref('starter-journey') as never)} />
    </Card>
  );
}

function TaskList() {
  const { completedTasks, toggleTask } = usePrototype();
  return (
    <Card style={{ gap: spacing.sm }}>
      <SectionHeader title="Tugas hari ini" action="Lihat semua" onAction={() => router.push(screenHref('daily-check-in') as never)} />
      {todayTasks.map((task) => {
        const done = completedTasks.includes(task.id);
        const Icon = task.icon === 'food' ? Utensils : task.icon === 'sleep' ? MoonStar : Activity;
        return (
          <Pressable
            key={task.id}
            accessibilityRole="checkbox"
            accessibilityLabel={task.title}
            accessibilityState={{ checked: done }}
            onPress={() => toggleTask(task.id)}
            style={({ pressed }) => [styles.taskRow, pressed && { opacity: 0.72 }]}
          >
            <View style={[styles.taskIcon, done && { backgroundColor: colors.softLime }]}>{done ? <Check size={19} color={colors.primaryDark} /> : <Icon size={19} color={colors.primary} />}</View>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="label" style={done ? styles.doneText : undefined}>{task.title}</AppText>
              <AppText variant="caption">{task.meta}</AppText>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </Pressable>
        );
      })}
    </Card>
  );
}

function NutritionCard() {
  const protein = nutritionSummary.find((metric) => metric.id === 'protein')!;
  const sodium = nutritionSummary.find((metric) => metric.id === 'sodium')!;
  return (
    <Card tone="mint" style={{ gap: spacing.md }}>
      <View style={styles.cardTopRow}>
        <View>
          <AppText variant="eyebrow">NUTRISI HARI INI</AppText>
          <AppText variant="h3">Masih perlu dilengkapi</AppText>
        </View>
        <View style={[styles.roundIcon, { backgroundColor: colors.white }]}><Utensils size={21} color={colors.primary} /></View>
      </View>
      <View style={{ gap: spacing.xs }}>
        <View style={styles.cardTopRow}><AppText variant="label">Protein</AppText><AppText variant="caption">{protein.value} dari {protein.target} {protein.unit}</AppText></View>
        <ProgressBar value={protein.value} max={protein.target} tone="primary" label="Protein minimum" />
        <AppText variant="caption">{protein.status}.</AppText>
      </View>
      <View style={{ gap: spacing.xs }}>
        <View style={styles.cardTopRow}><AppText variant="label">Natrium</AppText><AppText variant="caption">{sodium.value.toLocaleString('id-ID')} / {sodium.target.toLocaleString('id-ID')} {sodium.unit}</AppText></View>
        <ProgressBar value={sodium.value} max={sodium.target} tone="warning" label="Natrium mendekati batas" />
        <AppText variant="caption">{sodium.status}.</AppText>
      </View>
      <Button label="Buka indikator lengkap" variant="secondary" onPress={() => router.push(screenHref('nutrition-indicator') as never)} />
    </Card>
  );
}

function WellnessSummary() {
  return (
    <Card tone="cream" style={{ gap: spacing.md }}>
      <SectionHeader title="Aktivitas & tidur" />
      <View style={styles.summaryStats}>
        <View style={styles.summaryStat}><View style={styles.statIcon}><Footprints size={21} color={colors.primary} /></View><AppText variant="h3">{activitySummary.steps.toLocaleString('id-ID')}</AppText><AppText variant="caption">dari {activitySummary.stepGoal.toLocaleString('id-ID')} langkah</AppText></View>
        <View style={styles.summaryStat}><View style={styles.statIcon}><MoonStar size={21} color={colors.information} /></View><AppText variant="h3">{activitySummary.sleepHours} jam</AppText><AppText variant="caption">tidur semalam</AppText></View>
      </View>
      <View style={styles.sourceRow}><Database size={16} color={colors.textMuted} /><AppText variant="caption">{activitySummary.source}</AppText></View>
    </Card>
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const { day } = useLocalSearchParams<{ day?: string }>();
  const dayOne = day === '1';
  const desktop = width >= breakpoints.desktop;
  const { activeProfile } = usePrototype();
  return (
    <AppShell title="Beranda" subtitle="Ringkasan prioritas hari ini">
      <View style={styles.greeting}>
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="eyebrow">SELAMAT PAGI, {activeProfile.name.split(' ')[0]?.toUpperCase()}</AppText>
          <AppText variant={desktop ? 'h1' : 'h2'}>Satu langkah yang terasa mungkin.</AppText>
          <AppText variant="body">Tidak perlu sempurna, cukup catat sesuai kondisi sebenarnya.</AppText>
        </View>
        <Chip label="Semua fitur · demo" tone="lime" />
      </View>

      <View style={styles.heroGrid}>
        <View style={{ flex: desktop ? 1.65 : 1, minWidth: desktop ? 500 : '100%' }}><WeeklyActionCard dayOne={dayOne} /></View>
        <View style={{ flex: 0.85, minWidth: desktop ? 280 : '100%' }}><BaselineCard dayOne={dayOne} /></View>
      </View>

      <View style={styles.mainGrid}>
        <View style={styles.mainColumn}><TaskList /><WellnessSummary /></View>
        <View style={styles.mainColumn}><NutritionCard />
          <Card tone="blue" style={{ gap: spacing.sm }}>
            <View style={styles.cardTopRow}><View style={styles.roundIcon}><Lightbulb size={21} color={colors.information} /></View><Chip label="INSIGHT SINGKAT" tone="neutral" /></View>
            <AppText variant="h3">Catatan tidur mulai lebih konsisten.</AppText>
            <AppText variant="body">6 dari 8 catatan terakhir berada pada rentang waktu tidur yang serupa. Ini pola awal, bukan diagnosis.</AppText>
            <Button label="Lihat Pattern Map" variant="ghost" onPress={() => router.push(screenHref('pattern-map') as never)} />
          </Card>
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  greeting: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md },
  heroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignItems: 'stretch' },
  weeklyCard: { minHeight: 330, borderColor: colors.primaryDark, justifyContent: 'space-between', gap: spacing.lg, padding: spacing.xl },
  baselineCard: { minHeight: 330, justifyContent: 'space-between', gap: spacing.md, borderColor: '#D6E99A' },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  actionRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.xs },
  roundIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.64)', alignItems: 'center', justifyContent: 'center' },
  mainGrid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: spacing.md },
  mainColumn: { flex: 1, minWidth: 300, gap: spacing.md },
  taskRow: { minHeight: 64, borderRadius: radius.input, padding: spacing.xs, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  taskIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  doneText: { textDecorationLine: 'line-through', color: colors.textMuted },
  summaryStats: { flexDirection: 'row', gap: spacing.sm },
  summaryStat: { flex: 1, minHeight: 132, backgroundColor: colors.white, borderRadius: radius.input, padding: spacing.md, gap: 4 },
  statIcon: { width: 36, height: 36, borderRadius: 13, backgroundColor: colors.softMint, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
