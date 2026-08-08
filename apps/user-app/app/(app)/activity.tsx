import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Activity as ActivityIcon, Camera, ChevronRight, Clock3, Database, Dumbbell, Footprints, HeartPulse, PersonStanding } from 'lucide-react-native';
import { breakpoints, colors, radius, spacing } from '@sarira/design-tokens';
import { AppText, Button, Card, Chip, ProgressBar, ProgressRing, SectionHeader } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { activitySummary } from '@/mocks/data';
import { screenHref } from '@/utils/routes';

const workoutCards = [
  { title: 'Mobilitas pagi', meta: '12 menit · ringan', tone: 'mint' as const, icon: PersonStanding },
  { title: 'Kekuatan dasar', meta: '18 menit · tanpa alat', tone: 'lime' as const, icon: Dumbbell },
  { title: 'Pemulihan ringan', meta: '10 menit · peregangan', tone: 'blue' as const, icon: HeartPulse },
];

export default function ActivityScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= breakpoints.desktop;
  return (
    <AppShell title="Aktivitas" subtitle="Gerak, latihan, dan sumber data">
      <View style={styles.titleRow}><View style={{ flex: 1, gap: 4 }}><AppText variant="eyebrow">AKTIF TANPA AGRESIF</AppText><AppText variant={desktop ? 'h1' : 'h2'}>Bergerak sesuai kondisi tubuhmu.</AppText><AppText variant="body">Tidak ada target yang mengalahkan safety atau membuat input manual terasa lebih rendah.</AppText></View><Button label="Catat aktivitas" variant="lime" onPress={() => router.push(screenHref('daily-check-in') as never)} /></View>

      <View style={styles.summaryGrid}>
        <Card tone="dark" style={styles.stepsCard}>
          <View style={styles.rowBetween}><View style={styles.iconDark}><Footprints size={24} color={colors.primaryDark} /></View><ProgressRing value={(activitySummary.steps / activitySummary.stepGoal) * 100} size={80} /></View>
          <View><AppText variant="display" style={{ color: colors.white }}>{activitySummary.steps.toLocaleString('id-ID')}</AppText><AppText variant="body" style={{ color: '#C9D7CD' }}>dari target demo {activitySummary.stepGoal.toLocaleString('id-ID')} langkah</AppText></View>
          <View style={styles.source}><Database size={16} color={colors.lime} /><AppText variant="caption" style={{ color: '#C9D7CD' }}>Input manual · sumber terlihat</AppText></View>
        </Card>
        <View style={styles.smallStatColumn}>
          <Card tone="lime" style={styles.smallStat}><ActivityIcon size={24} color={colors.primary} /><View><AppText variant="h2">{activitySummary.activeMinutes} menit</AppText><AppText variant="caption">aktif hari ini</AppText></View><ProgressBar value={38} max={45} tone="primary" label="38 dari target demo 45 menit" /></Card>
          <Card tone="cream" style={styles.smallStat}><Clock3 size={24} color={colors.information} /><View><AppText variant="h2">2 sesi</AppText><AppText variant="caption">gerak ringan tercatat</AppText></View></Card>
        </View>
      </View>

      <SectionHeader title="Pilihan gerak hari ini" action="Semua latihan" onAction={() => router.push(screenHref('workout-list') as never)} />
      <View style={styles.workoutGrid}>
        {workoutCards.map(({ title, meta, tone, icon: Icon }) => (
          <Pressable key={title} accessibilityRole="button" accessibilityLabel={`Buka ${title}`} onPress={() => router.push(screenHref('workout-detail') as never)} style={({ pressed }) => [styles.workoutPress, pressed && { opacity: 0.74 }]}>
            <Card tone={tone} style={styles.workoutCard}><View style={styles.workoutVisual}><View style={styles.motionHead} /><View style={styles.motionBody} /><View style={styles.motionArm} /><View style={styles.motionLeg} /></View><View style={styles.rowBetween}><View style={styles.workoutIcon}><Icon size={21} color={colors.primary} /></View><ChevronRight size={20} color={colors.textMuted} /></View><AppText variant="h3">{title}</AppText><AppText variant="caption">{meta}</AppText></Card>
          </Pressable>
        ))}
      </View>

      <Card tone="blue" style={styles.coachCard}>
        <View style={styles.coachVisual}><View style={styles.cameraFrame}><PersonStanding size={56} color={colors.information} strokeWidth={1.4} /></View></View>
        <View style={{ flex: 1, minWidth: 220, gap: spacing.xs }}><View style={styles.tagRow}><Chip label="MOTION COACH" tone="neutral" /><Chip label="SIMULASI" tone="lime" /></View><AppText variant="h2">Umpan balik gerakan yang netral.</AppText><AppText variant="body">Kamera dan analisis pose belum terintegrasi. Prototype menunjukkan bahasa, privasi, dan alur feedback tanpa menilai bentuk tubuh.</AppText><Button label="Coba Motion Coach" icon={Camera} variant="secondary" onPress={() => router.push(screenHref('motion-coach') as never)} /></View>
      </Card>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  stepsCard: { flex: 1.3, minWidth: 310, minHeight: 300, justifyContent: 'space-between', borderColor: colors.primaryDark, padding: spacing.xl },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  iconDark: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  source: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  smallStatColumn: { flex: 0.8, minWidth: 280, gap: spacing.md },
  smallStat: { flex: 1, minHeight: 142, justifyContent: 'space-between', gap: spacing.sm },
  workoutGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  workoutPress: { flex: 1, minWidth: 230, borderRadius: radius.card },
  workoutCard: { minHeight: 300, justifyContent: 'space-between', gap: spacing.sm },
  workoutVisual: { height: 112, borderRadius: radius.input, backgroundColor: 'rgba(255,255,255,0.62)', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  motionHead: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primaryDark, top: 4 },
  motionBody: { width: 18, height: 54, borderRadius: 10, backgroundColor: colors.primary, top: 6 },
  motionArm: { position: 'absolute', width: 82, height: 14, borderRadius: 8, backgroundColor: colors.primary, top: 54, transform: [{ rotate: '-18deg' }] },
  motionLeg: { position: 'absolute', width: 84, height: 15, borderRadius: 8, backgroundColor: colors.primaryDark, bottom: 13, transform: [{ rotate: '15deg' }] },
  workoutIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  coachCard: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xl, padding: spacing.xl },
  coachVisual: { width: 190, height: 190, borderRadius: radius.cardLarge, backgroundColor: '#D7E9F6', alignItems: 'center', justifyContent: 'center' },
  cameraFrame: { width: 120, height: 140, borderRadius: radius.input, borderWidth: 2, borderColor: colors.information, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
