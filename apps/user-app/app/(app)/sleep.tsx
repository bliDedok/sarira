import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MoonStar, Pencil, Plus, Trash2 } from 'lucide-react-native';
import type { SleepLogRecord, SleepQuality } from '@sarira/shared-types';
import { colors, radius, spacing } from '@sarira/design-tokens';
import { AppText, Button, Card, Chip, ErrorState, Field, InlineNotice, Loading } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { api } from '@/services/api';
import { messageFor, useBaseline } from '@/features/baseline/useBaseline';
import { isoToLocalTime, localDateTimeToIso } from '@/utils/timezone';

const qualities: { value: SleepQuality; label: string }[] = [{ value: 'POOR', label: 'Kurang baik' }, { value: 'FAIR', label: 'Cukup' }, { value: 'GOOD', label: 'Baik' }, { value: 'VERY_GOOD', label: 'Sangat baik' }];
const previousDate = (value: string) => { const date = new Date(`${value}T00:00:00.000Z`); date.setUTCDate(date.getUTCDate() - 1); return date.toISOString().slice(0, 10); };

export default function SleepScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { profile, current, loading: baselineLoading, error: baselineError, reload: reloadBaseline } = useBaseline();
  const [logs, setLogs] = useState<SleepLogRecord[]>([]); const [editingId, setEditingId] = useState<string>();
  const [startTime, setStartTime] = useState('23:00'); const [wakeTime, setWakeTime] = useState('07:00'); const [quality, setQuality] = useState<SleepQuality>('FAIR'); const [awakenings, setAwakenings] = useState(''); const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState<string>();
  const trackingDate = date ?? current?.localDate;
  const load = useCallback(async () => { if (!trackingDate) return; setLoading(true); setError(undefined); try { setLogs(await api.getSleepLogs(trackingDate)); } catch (cause) { setError(messageFor(cause)); } finally { setLoading(false); } }, [trackingDate]);
  useEffect(() => {
    if (!trackingDate) return;
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load, trackingDate]);
  const reset = () => { setEditingId(undefined); setStartTime('23:00'); setWakeTime('07:00'); setQuality('FAIR'); setAwakenings(''); setNotes(''); };
  const edit = (log: SleepLogRecord) => { setEditingId(log.id); setStartTime(isoToLocalTime(log.sleepStartedAt, profile?.timezone ?? 'Asia/Makassar')); setWakeTime(isoToLocalTime(log.wokeUpAt, profile?.timezone ?? 'Asia/Makassar')); setQuality(log.perceivedQuality); setAwakenings(log.nightAwakenings === undefined ? '' : String(log.nightAwakenings)); setNotes(log.notes ?? ''); };
  const save = async () => {
    if (!current || !profile) return; setSaving(true); setError(undefined);
    try {
      const selectedDate = trackingDate!; const startDate = startTime >= wakeTime ? previousDate(selectedDate) : selectedDate;
      const payload = { localDate: selectedDate, sleepStartedAt: localDateTimeToIso(startDate, startTime, profile.timezone), wokeUpAt: localDateTimeToIso(selectedDate, wakeTime, profile.timezone), perceivedQuality: quality, ...(awakenings ? { nightAwakenings: Number(awakenings) } : {}), notes };
      if (editingId) await api.updateSleepLog(editingId, payload); else await api.createSleepLog(payload);
      reset(); await Promise.all([load(), reloadBaseline()]);
    } catch (cause) { setError(messageFor(cause)); } finally { setSaving(false); }
  };
  const remove = async (id: string) => { try { await api.deleteSleepLog(id); await Promise.all([load(), reloadBaseline()]); } catch (cause) { setError(messageFor(cause)); } };

  return <AppShell title="Catatan Tidur" subtitle="Sumber manual">
    {baselineLoading ? <Loading label="Memuat baseline…" /> : baselineError ? <ErrorState description={baselineError} onRetry={() => void reloadBaseline()} /> : !current ? <ErrorState title="Baseline belum dimulai" description="Mulai dari Starter Journey terlebih dahulu." /> : <>
      <Card tone="blue" style={styles.intro}><View style={styles.row}><MoonStar size={30} color={colors.information} /><View style={styles.flex}><AppText variant="h2">Tidur yang berakhir {trackingDate}</AppText><AppText variant="body">Durasi dihitung backend dari waktu mulai dan bangun. Tidur melewati tengah malam didukung.</AppText></View><Chip label="SUMBER · MANUAL" tone="neutral" /></View></Card>
      {error ? <View accessibilityLiveRegion="assertive"><InlineNotice title="Catatan belum tersimpan" text={error} tone="danger" /></View> : null}
      <View style={styles.grid}>
        <Card style={styles.column}><View style={styles.row}><AppText variant="h2">{editingId ? 'Edit tidur' : 'Tambah tidur'}</AppText>{editingId ? <Button label="Batal edit" variant="ghost" onPress={reset} /> : null}</View><View style={styles.grid}><Field label="Mulai tidur" value={startTime} onChangeText={setStartTime} placeholder="23:30" keyboardType="numbers-and-punctuation" style={styles.field} /><Field label="Bangun" value={wakeTime} onChangeText={setWakeTime} placeholder="06:30" keyboardType="numbers-and-punctuation" style={styles.field} /></View><AppText variant="label">Kualitas yang dirasakan</AppText><View style={styles.chips}>{qualities.map((item) => <Chip key={item.value} label={item.label} selected={quality === item.value} onPress={() => setQuality(item.value)} />)}</View><Field label="Terbangun malam (opsional)" value={awakenings} onChangeText={setAwakenings} keyboardType="number-pad" /><Field label="Catatan (opsional)" value={notes} onChangeText={setNotes} maxLength={500} multiline /><Button label={editingId ? 'Simpan perubahan' : 'Tambah catatan tidur'} icon={editingId ? Pencil : Plus} loading={saving} variant="lime" onPress={() => void save()} /></Card>
        <Card tone="mint" style={styles.column}><AppText variant="h2">Riwayat hari ini</AppText>{loading ? <Loading label="Memuat tidur…" /> : logs.length === 0 ? <AppText variant="body">Belum ada tidur yang tercatat.</AppText> : logs.map((log) => <View key={log.id} style={styles.log}><View style={styles.flex}><AppText variant="h3">{Math.floor(log.durationMinutes / 60)} jam {log.durationMinutes % 60} menit</AppText><AppText variant="body">{isoToLocalTime(log.sleepStartedAt, profile?.timezone ?? 'Asia/Makassar')} → {isoToLocalTime(log.wokeUpAt, profile?.timezone ?? 'Asia/Makassar')}</AppText><AppText variant="caption">{qualities.find((item) => item.value === log.perceivedQuality)?.label} · Manual</AppText></View><View style={styles.actions}><Button label="Edit" icon={Pencil} variant="secondary" onPress={() => edit(log)} /><Button label="Hapus" icon={Trash2} variant="danger" onPress={() => void remove(log.id)} /></View></View>)}</Card>
      </View>
    </>}
  </AppShell>;
}

const styles = StyleSheet.create({ intro: { gap: spacing.sm }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }, column: { flex: 1, minWidth: 300, gap: spacing.md }, flex: { flex: 1, gap: 4 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }, field: { minWidth: 140 }, log: { minHeight: 110, borderRadius: radius.input, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, gap: spacing.sm }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs } });
