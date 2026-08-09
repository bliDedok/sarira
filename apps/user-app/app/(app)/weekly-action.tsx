import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Check, ChevronLeft, CircleHelp, History, ShieldCheck } from 'lucide-react-native';
import type { PatternMapRecord, WeeklyActionAssignmentRecord } from '@sarira/shared-types';
import { colors, radius, spacing } from '@sarira/design-tokens';
import { AppText, Button, Card, Chip, ErrorState, InlineNotice, Loading, ProgressBar } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { api } from '@/services/api';
import { messageFor } from '@/features/baseline/useBaseline';

const addDays = (date: string, days: number) => new Date(Date.parse(`${date}T00:00:00.000Z`) + days * 86_400_000).toISOString().slice(0, 10);

export default function WeeklyActionScreen() {
  const [action, setAction] = useState<WeeklyActionAssignmentRecord>();
  const [history, setHistory] = useState<WeeklyActionAssignmentRecord[]>([]);
  const [pattern, setPattern] = useState<PatternMapRecord>();
  const [loading, setLoading] = useState(true);
  const [busyDate, setBusyDate] = useState<string>();
  const [error, setError] = useState<string>();
  const load = useCallback(async () => { setLoading(true); setError(undefined); try { const [current, items, map] = await Promise.all([api.getCurrentWeeklyAction(), api.getWeeklyActionHistory(), api.getCurrentPatternMap()]); setAction(current); setHistory(items); setPattern(map); } catch (cause) { setError(messageFor(cause)); } finally { setLoading(false); } }, []);
  useEffect(() => { const timer = setTimeout(() => void load(), 0); return () => clearTimeout(timer); }, [load]);
  const toggle = async (localDate: string) => { if (!action) return; setBusyDate(localDate); setError(undefined); try { const checked = action.checkIns.some((item) => item.localDate === localDate); setAction(checked ? await api.undoWeeklyActionCheckIn(action.id, localDate) : await api.checkInWeeklyAction(action.id, localDate)); } catch (cause) { setError(messageFor(cause)); } finally { setBusyDate(undefined); } };
  const dates = action ? Array.from({ length: action.definition.durationDays }, (_, index) => addDays(action.weekStart, index)) : [];

  return <AppShell title="Weekly Action" subtitle="Satu langkah kecil untuk minggu ini">
    {loading ? <Loading label="Memuat Weekly Action…" /> : !action ? <ErrorState title="Weekly Action belum tersedia" description={error ?? 'Buat Pattern Map setelah readiness hari ke-14 untuk memilih satu action yang eligible.'} onRetry={() => router.push('/pattern-map' as never)} /> : <>
      <Card tone="dark" style={styles.hero} accessibilityLabel={`${action.definition.title}, progres ${action.progress} dari ${action.targetCount}`}>
        <View style={styles.row}><Chip label="WEEKLY ACTION" tone="lime" /><Chip label={`${action.progress}/${action.targetCount} SELESAI`} tone="mint" /></View>
        <AppText variant="h1" style={styles.white}>{action.definition.title}</AppText><AppText variant="body" style={styles.muted}>{action.definition.description}</AppText>
        <ProgressBar value={action.progress} max={action.targetCount} tone="lime" label={`Progres Weekly Action ${action.progress} dari ${action.targetCount}`} />
        <AppText variant="caption" style={styles.muted}>{action.weekStart} – {action.weekEnd} · dipilih oleh policy {action.selectionVersion}</AppText>
      </Card>
      {error ? <InlineNotice title="Perubahan belum tersimpan" text={error} tone="danger" /> : null}
      <Card style={styles.stack}><AppText variant="h2">Check-in harian</AppText><AppText variant="body">Tandai hanya saat action benar-benar dilakukan. Kamu dapat membatalkan tanda pada hari yang sama.</AppText><View style={styles.dayGrid}>{dates.map((date) => { const checked = action.checkIns.some((item) => item.localDate === date); return <Pressable key={date} accessibilityRole="checkbox" accessibilityLabel={`${date}, ${checked ? 'sudah dilakukan' : 'belum dilakukan'}`} accessibilityState={{ checked, busy: busyDate === date }} onPress={() => void toggle(date)} style={({ pressed }) => [styles.day, checked && styles.dayChecked, pressed && styles.pressed]}><View style={[styles.check, checked && styles.checkDone]}>{checked ? <Check size={18} color={colors.primaryDark} /> : null}</View><AppText variant="label">{new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00.000Z`))}</AppText></Pressable>; })}</View></Card>
      <View style={styles.grid}><Card tone="lime" style={styles.column}><View style={styles.rowStart}><CircleHelp size={25} color={colors.primaryDark} /><AppText variant="h2">Why This Action</AppText></View><AppText variant="body">{action.why}</AppText><View style={styles.chips}>{action.reasonCodes.map((code) => <Chip key={code} label={code.replaceAll('_', ' ')} tone="neutral" />)}</View><AppText variant="caption">Pemilihan bersifat deterministik dan non-diagnostik. Goal dapat memengaruhi prioritas action, bukan fakta yang diamati.</AppText></Card><Card tone="mint" style={styles.column}><View style={styles.rowStart}><ShieldCheck size={25} color={colors.primary} /><AppText variant="h2">Batas keselamatan</AppText></View><AppText variant="body">Safety Result tetap authoritative. Action tidak menggantikan arahan profesional dan akan ditolak bila status safety terbaru membuatnya tidak eligible.</AppText>{pattern?.limitations[0] ? <AppText variant="caption">Keterbatasan data: {pattern.limitations[0]}</AppText> : null}</Card></View>
      <Card style={styles.stack}><View style={styles.row}><View style={styles.rowStart}><History size={24} color={colors.primary} /><AppText variant="h2">Histori action</AppText></View><Chip label={`${history.length} VERSI`} tone="neutral" /></View>{history.slice(0, 5).map((item) => <View key={item.id} style={styles.history}><View style={styles.flex}><AppText variant="label">{item.definition.title}</AppText><AppText variant="caption">{item.weekStart} · {item.progress}/{item.targetCount} · {item.status}</AppText></View></View>)}</Card>
      <Button label="Kembali ke Pattern Map" variant="secondary" icon={ChevronLeft} iconPosition="left" onPress={() => router.push('/pattern-map' as never)} />
    </>}
  </AppShell>;
}

const styles = StyleSheet.create({ hero: { gap: spacing.md, padding: spacing.xl }, white: { color: colors.white }, muted: { color: '#C8D6CC' }, stack: { gap: spacing.md }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' }, rowStart: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }, dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }, day: { minWidth: 112, minHeight: 56, flexGrow: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.input, padding: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.xs }, dayChecked: { backgroundColor: colors.softLime, borderColor: colors.primary }, check: { width: 28, height: 28, borderRadius: 10, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, checkDone: { backgroundColor: colors.lime, borderColor: colors.primary }, pressed: { opacity: 0.7 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }, column: { flex: 1, minWidth: 300, gap: spacing.md }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }, history: { minHeight: 58, paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row' }, flex: { flex: 1 } });
