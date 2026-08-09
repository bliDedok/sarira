import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Activity, Footprints, Pencil, Plus, Trash2 } from 'lucide-react-native';
import type { ActivityLogRecord, ActivityType, PerceivedIntensity, StepRecordValue } from '@sarira/shared-types';
import { colors, radius, spacing } from '@sarira/design-tokens';
import { AppText, Button, Card, Chip, ErrorState, Field, InlineNotice, Loading, SimulatedBadge } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { api } from '@/services/api';
import { messageFor, useBaseline } from '@/features/baseline/useBaseline';

const activities: { value: ActivityType; label: string }[] = [{ value: 'WALKING', label: 'Jalan kaki' }, { value: 'RUNNING', label: 'Lari' }, { value: 'CYCLING', label: 'Bersepeda' }, { value: 'STRENGTH', label: 'Kekuatan' }, { value: 'STRETCHING', label: 'Peregangan' }, { value: 'SPORT', label: 'Olahraga' }, { value: 'OTHER', label: 'Lainnya' }];
const intensities: { value: PerceivedIntensity; label: string }[] = [{ value: 'LIGHT', label: 'Ringan' }, { value: 'MODERATE', label: 'Sedang' }, { value: 'VIGOROUS', label: 'Tinggi' }];

export default function ActivityScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { current, loading: baselineLoading, error: baselineError, reload: reloadBaseline } = useBaseline();
  const [logs, setLogs] = useState<ActivityLogRecord[]>([]); const [stepRecord, setStepRecord] = useState<StepRecordValue>(); const [steps, setSteps] = useState('');
  const [editingId, setEditingId] = useState<string>(); const [activityType, setActivityType] = useState<ActivityType>('WALKING'); const [duration, setDuration] = useState('20'); const [intensity, setIntensity] = useState<PerceivedIntensity>('LIGHT'); const [description, setDescription] = useState(''); const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState<string>();
  const trackingDate = date ?? current?.localDate;
  const load = useCallback(async () => { if (!trackingDate) return; setLoading(true); setError(undefined); try { const [activityValues, stepValues] = await Promise.all([api.getActivityLogs(trackingDate), api.getStepRecords()]); setLogs(activityValues); const today = stepValues.find((item) => item.localDate === trackingDate); setStepRecord(today); setSteps(today ? String(today.steps) : ''); } catch (cause) { setError(messageFor(cause)); } finally { setLoading(false); } }, [trackingDate]);
  useEffect(() => {
    if (!trackingDate) return;
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load, trackingDate]);
  const reset = () => { setEditingId(undefined); setActivityType('WALKING'); setDuration('20'); setIntensity('LIGHT'); setDescription(''); setNotes(''); };
  const edit = (log: ActivityLogRecord) => { setEditingId(log.id); setActivityType(log.activityType); setDuration(String(log.durationMinutes)); setIntensity(log.perceivedIntensity); setDescription(log.description ?? ''); setNotes(log.notes ?? ''); };
  const save = async () => { if (!trackingDate) return; setSaving(true); setError(undefined); try { const payload = { localDate: trackingDate, activityType, durationMinutes: Number(duration), perceivedIntensity: intensity, description, notes }; if (editingId) await api.updateActivityLog(editingId, payload); else await api.createActivityLog(payload); reset(); await Promise.all([load(), reloadBaseline()]); } catch (cause) { setError(messageFor(cause)); } finally { setSaving(false); } };
  const saveSteps = async () => { if (!trackingDate) return; setError(undefined); try { const value = await api.saveSteps(trackingDate, { steps: Number(steps), sourceDevice: 'Input pengguna' }); setStepRecord(value); } catch (cause) { setError(messageFor(cause)); } };
  const remove = async (id: string) => { try { await api.deleteActivityLog(id); await Promise.all([load(), reloadBaseline()]); } catch (cause) { setError(messageFor(cause)); } };

  return <AppShell title="Aktivitas" subtitle="Pencatatan manual dasar">
    {baselineLoading ? <Loading label="Memuat baseline…" /> : baselineError ? <ErrorState description={baselineError} onRetry={() => void reloadBaseline()} /> : !current ? <ErrorState title="Baseline belum dimulai" description="Mulai dari Starter Journey terlebih dahulu." /> : <>
      <Card tone="lime" style={styles.intro}><View style={styles.row}><Activity size={30} color={colors.primaryDark} /><View style={styles.flex}><AppText variant="h2">Aktivitas · {trackingDate}</AppText><AppText variant="body">Durasi dan intensitas adalah catatan pengguna, bukan data wearable terverifikasi.</AppText></View><Chip label="SUMBER · MANUAL" tone="neutral" /></View></Card>
      {error ? <View accessibilityLiveRegion="assertive"><InlineNotice title="Belum tersimpan" text={error} tone="danger" /></View> : null}
      <View style={styles.grid}>
        <Card style={styles.column}><View style={styles.row}><AppText variant="h2">{editingId ? 'Edit aktivitas' : 'Tambah aktivitas'}</AppText>{editingId ? <Button label="Batal edit" variant="ghost" onPress={reset} /> : null}</View><View style={styles.chips}>{activities.map((item) => <Chip key={item.value} label={item.label} selected={activityType === item.value} onPress={() => setActivityType(item.value)} />)}</View><Field label="Durasi (menit)" value={duration} onChangeText={setDuration} keyboardType="number-pad" /><AppText variant="label">Intensitas yang dirasakan</AppText><View style={styles.chips}>{intensities.map((item) => <Chip key={item.value} label={item.label} selected={intensity === item.value} onPress={() => setIntensity(item.value)} />)}</View><Field label="Deskripsi (opsional)" value={description} onChangeText={setDescription} maxLength={200} /><Field label="Catatan (opsional)" value={notes} onChangeText={setNotes} maxLength={500} multiline /><Button label={editingId ? 'Simpan perubahan' : 'Tambah aktivitas'} icon={editingId ? Pencil : Plus} loading={saving} variant="lime" disabled={!Number.isFinite(Number(duration)) || Number(duration) < 1} onPress={() => void save()} /></Card>
        <Card tone="mint" style={styles.column}><AppText variant="h2">Langkah manual</AppText><View style={styles.rowStart}><View style={styles.icon}><Footprints size={24} color={colors.primary} /></View><View style={styles.flex}><AppText variant="h2">{stepRecord?.steps.toLocaleString('id-ID') ?? 'Belum dicatat'}</AppText><AppText variant="caption">Manual · tidak terverifikasi wearable</AppText></View></View><Field label="Jumlah langkah" value={steps} onChangeText={setSteps} keyboardType="number-pad" placeholder="Contoh: 6200" /><Button label="Simpan langkah" variant="secondary" onPress={() => void saveSteps()} /></Card>
      </View>
      <Card style={styles.column}><AppText variant="h2">Riwayat hari ini</AppText>{loading ? <Loading label="Memuat aktivitas…" /> : logs.length === 0 ? <AppText variant="body">Belum ada aktivitas yang tercatat.</AppText> : logs.map((log) => <View key={log.id} style={styles.log}><View style={styles.flex}><AppText variant="h3">{activities.find((item) => item.value === log.activityType)?.label}</AppText><AppText variant="body">{log.durationMinutes} menit · {intensities.find((item) => item.value === log.perceivedIntensity)?.label}</AppText><AppText variant="caption">Sumber manual</AppText></View><View style={styles.actions}><Button label="Edit" icon={Pencil} variant="secondary" onPress={() => edit(log)} /><Button label="Hapus" icon={Trash2} variant="danger" onPress={() => void remove(log.id)} /></View></View>)}</Card>
      <Card tone="blue" style={styles.demo}><View style={styles.flex}><View style={styles.chips}><AppText variant="eyebrow">MOTION COACH & WEARABLE SYNC</AppText><SimulatedBadge label="DEMO" /></View><AppText variant="h3">Integrasi perangkat dan analisis pose belum aktif</AppText><AppText variant="body">Apple Health, Health Connect, smartwatch, serta pose estimation tetap berada di luar Phase 4.</AppText></View></Card>
    </>}
  </AppShell>;
}

const styles = StyleSheet.create({ intro: { gap: spacing.sm }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }, column: { flex: 1, minWidth: 300, gap: spacing.md }, flex: { flex: 1, gap: 4 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' }, rowStart: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }, icon: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, log: { minHeight: 100, borderRadius: radius.input, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }, demo: { flexDirection: 'row', gap: spacing.md } });
