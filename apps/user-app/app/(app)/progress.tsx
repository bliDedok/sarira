import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { CalendarDays, Check, ChevronRight, CircleDot, TrendingUp } from 'lucide-react-native';
import { breakpoints, colors, spacing } from '@sarira/design-tokens';
import { AppText, Button, Card, Chip, ProgressBar, ProgressRing, SectionHeader } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { patternData, weeklyAction } from '@/mocks/data';
import { usePrototype } from '@/features/prototype/PrototypeContext';
import { screenHref } from '@/utils/routes';

const weeks = [2, 3, 2, 4, 3, 4, 4];

export default function ProgressScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= breakpoints.desktop;
  const { weeklyProgress } = usePrototype();
  return (
    <AppShell title="Progres" subtitle="Pola dan kebiasaan, bukan health score">
      <View style={styles.titleRow}><View style={{ flex: 1, gap: 4 }}><AppText variant="eyebrow">PROGRES YANG DAPAT DIJELASKAN</AppText><AppText variant={desktop ? 'h1' : 'h2'}>Lihat apa yang berubah—dan apa yang belum cukup.</AppText><AppText variant="body">SARIRA tidak menggabungkan semua hal menjadi satu skor kesehatan.</AppText></View><Button label="Buka Pattern Map" icon={ChevronRight} variant="lime" onPress={() => router.push(screenHref('pattern-map') as never)} /></View>

      <View style={styles.topGrid}>
        <Card tone="dark" style={styles.actionCard}>
          <View style={styles.rowBetween}><View><AppText variant="eyebrow" style={{ color: colors.lime }}>WEEKLY ACTION</AppText><AppText variant="h2" style={{ color: colors.white }}>{weeklyAction.title}</AppText></View><ProgressRing value={(weeklyProgress / weeklyAction.target) * 100} /></View>
          <AppText variant="body" style={{ color: '#CBD8CE' }}>{weeklyAction.description}</AppText>
          <View style={{ gap: spacing.xs }}><View style={styles.rowBetween}><AppText variant="label" style={{ color: colors.white }}>{weeklyProgress} dari {weeklyAction.target} hari</AppText><AppText variant="caption" style={{ color: '#CBD8CE' }}>Siklus berakhir Minggu</AppText></View><ProgressBar value={weeklyProgress} max={weeklyAction.target} tone="lime" label={`${weeklyProgress} dari ${weeklyAction.target} hari`} /></View>
        </Card>
        <Card tone="lime" style={styles.baselineDone}><View style={styles.checkCircle}><Check size={26} color={colors.primaryDark} strokeWidth={3} /></View><View><AppText variant="eyebrow">BASELINE 14 HARI</AppText><AppText variant="h2">Selesai</AppText></View><AppText variant="body">10 hari memenuhi data minimum demo. Dua domain masih insufficient.</AppText><Button label="Lihat cakupan data" variant="secondary" onPress={() => router.push(screenHref('early-pattern') as never)} /></Card>
      </View>

      <View style={styles.detailGrid}>
        <Card style={{ flex: 1.25, minWidth: 310, gap: spacing.md }}>
          <SectionHeader title="Tren kebiasaan" action="Detail" onAction={() => router.push(screenHref('habit-trend') as never)} />
          <AppText variant="caption">Sarapan dengan sumber protein · 7 hari terakhir</AppText>
          <View style={styles.chart} accessibilityLabel="Grafik sarapan dengan protein, meningkat dari dua menjadi empat hari per minggu">
            {weeks.map((value, index) => <View key={`${value}-${index}`} style={styles.barWrap}><View style={[styles.bar, { height: 24 + value * 20, backgroundColor: index === weeks.length - 1 ? colors.lime : colors.primary }]} /><AppText variant="caption">{['S', 'S', 'R', 'K', 'J', 'S', 'M'][index]}</AppText></View>)}
          </View>
          <View style={styles.insight}><TrendingUp size={20} color={colors.primary} /><AppText variant="body" style={{ flex: 1 }}>Frekuensi meningkat, tetapi satu minggu belum cukup untuk menyimpulkan perubahan jangka panjang.</AppText></View>
        </Card>
        <Card tone="mint" style={{ flex: 0.75, minWidth: 280, gap: spacing.md }}>
          <View style={styles.rowBetween}><AppText variant="h3">Pola prioritas</AppText><Chip label="SIMULASI" tone="lime" /></View>
          <AppText variant="h3">{patternData.title}</AppText>
          <AppText variant="body">{patternData.observation}</AppText>
          <View style={styles.confidenceRow}><CircleDot size={18} color={colors.primary} /><View><AppText variant="label">Data confidence · {patternData.dataConfidence}</AppText><AppText variant="caption">Rule dan evidence ditampilkan terpisah.</AppText></View></View>
          <Button label="Mengapa hasil ini?" variant="secondary" onPress={() => router.push(screenHref('weekly-action-reason') as never)} />
        </Card>
      </View>

      <Card tone="cream" style={styles.timelineCard}>
        <View style={styles.timelineIcon}><CalendarDays size={24} color={colors.primary} /></View>
        <View style={{ flex: 1, minWidth: 220 }}><AppText variant="h3">Riwayat yang dapat ditelusuri</AppText><AppText variant="body">Koreksi data tidak menghapus hasil lama. Hasil yang terdampak ditandai dan versi baru dievaluasi ulang.</AppText></View>
        <Button label="Lihat riwayat demo" variant="ghost" onPress={() => router.push(screenHref('habit-trend') as never)} />
      </Card>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md },
  topGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  actionCard: { flex: 1.2, minWidth: 310, minHeight: 275, justifyContent: 'space-between', gap: spacing.lg, borderColor: colors.primaryDark, padding: spacing.xl },
  baselineDone: { flex: 0.8, minWidth: 280, minHeight: 275, justifyContent: 'space-between', gap: spacing.sm },
  checkCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  chart: { height: 160, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: spacing.sm },
  barWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: spacing.xs, height: '100%' },
  bar: { width: '54%', maxWidth: 42, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  insight: { borderRadius: 16, backgroundColor: colors.softMint, padding: spacing.sm, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  confidenceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  timelineCard: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.md },
  timelineIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
});
