import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { HeartPulse, Pencil, Plus, Trash2 } from 'lucide-react-native';
import type { DigestiveLogRecord, DigestiveSymptomType } from '@sarira/shared-types';
import { colors, radius, spacing } from '@sarira/design-tokens';
import { AppText, Button, Card, Chip, ErrorState, Field, InlineNotice, Loading } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { api } from '@/services/api';
import { messageFor, useBaseline } from '@/features/baseline/useBaseline';
import { isoToLocalTime, localDateTimeToIso } from '@/utils/timezone';

const symptoms: { value: DigestiveSymptomType; label: string }[] = [{ value: 'BLOATING', label: 'Kembung' }, { value: 'NAUSEA', label: 'Mual' }, { value: 'ABDOMINAL_PAIN', label: 'Nyeri perut' }, { value: 'DIARRHEA', label: 'Diare' }, { value: 'CONSTIPATION', label: 'Konstipasi' }, { value: 'HEARTBURN', label: 'Panas dada / ulu hati' }, { value: 'LOW_APPETITE', label: 'Nafsu makan menurun' }, { value: 'POST_MEAL_DISCOMFORT', label: 'Tidak nyaman setelah makan' }, { value: 'OTHER', label: 'Lainnya' }];

export default function DigestiveScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { profile, current, loading: baselineLoading, error: baselineError } = useBaseline();
  const [logs, setLogs] = useState<DigestiveLogRecord[]>([]); const [editingId, setEditingId] = useState<string>(); const [symptom, setSymptom] = useState<DigestiveSymptomType>('BLOATING'); const [time, setTime] = useState('12:00'); const [intensity, setIntensity] = useState(3); const [notes, setNotes] = useState(''); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState<string>();
  const trackingDate = date ?? current?.localDate;
  const load = useCallback(async () => { if (!trackingDate) return; setLoading(true); try { setLogs(await api.getDigestiveLogs(trackingDate)); } catch (cause) { setError(messageFor(cause)); } finally { setLoading(false); } }, [trackingDate]);
  useEffect(() => {
    if (!trackingDate) return;
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load, trackingDate]);
  const reset = () => { setEditingId(undefined); setSymptom('BLOATING'); setTime('12:00'); setIntensity(3); setNotes(''); };
  const edit = (log: DigestiveLogRecord) => { setEditingId(log.id); setSymptom(log.symptomType); setTime(isoToLocalTime(log.occurredAt, profile?.timezone ?? 'Asia/Makassar')); setIntensity(log.intensity); setNotes(log.notes ?? ''); };
  const save = async () => { if (!trackingDate || !profile) return; setSaving(true); setError(undefined); try { const payload = { localDate: trackingDate, symptomType: symptom, occurredAt: localDateTimeToIso(trackingDate, time, profile.timezone), intensity, notes }; if (editingId) await api.updateDigestiveLog(editingId, payload); else await api.createDigestiveLog(payload); reset(); await load(); } catch (cause) { setError(messageFor(cause)); } finally { setSaving(false); } };
  const remove = async (id: string) => { try { await api.deleteDigestiveLog(id); await load(); } catch (cause) { setError(messageFor(cause)); } };

  return <AppShell title="Keluhan Pencernaan" subtitle="Histori dasar, bukan diagnosis">
    {baselineLoading ? <Loading label="Memuat baseline…" /> : baselineError ? <ErrorState description={baselineError} /> : !current ? <ErrorState title="Baseline belum dimulai" description="Mulai dari Starter Journey terlebih dahulu." /> : <>
      <Card tone="peach" style={styles.intro}><View style={styles.row}><HeartPulse size={30} color={colors.danger} /><View style={styles.flex}><AppText variant="h2">Catat keluhan tanpa menyimpulkan penyebab</AppText><AppText variant="body">SARIRA hanya menyimpan waktu, jenis, intensitas, dan histori. Catatan tidak mendiagnosis GERD, IBS, intoleransi, atau penyakit lain.</AppText></View></View></Card>
      {error ? <View accessibilityLiveRegion="assertive"><InlineNotice title="Belum tersimpan" text={error} tone="danger" /></View> : null}
      <View style={styles.grid}><Card style={styles.column}><View style={styles.row}><AppText variant="h2">{editingId ? 'Edit keluhan' : 'Tambah keluhan'}</AppText>{editingId ? <Button label="Batal edit" variant="ghost" onPress={reset} /> : null}</View><View style={styles.chips}>{symptoms.map((item) => <Chip key={item.value} label={item.label} selected={symptom === item.value} onPress={() => setSymptom(item.value)} />)}</View><Field label="Terjadi sekitar pukul" value={time} onChangeText={setTime} keyboardType="numbers-and-punctuation" placeholder="12:00" /><AppText variant="label">Intensitas sederhana</AppText><View style={styles.chips}>{[1, 2, 3, 4, 5].map((value) => <Chip key={value} label={`${value}`} selected={intensity === value} onPress={() => setIntensity(value)} />)}</View><Field label="Catatan (opsional)" value={notes} onChangeText={setNotes} maxLength={500} multiline /><Button label={editingId ? 'Simpan perubahan' : 'Tambah keluhan'} icon={editingId ? Pencil : Plus} loading={saving} variant="lime" onPress={() => void save()} /></Card><Card tone="cream" style={styles.column}><AppText variant="h2">Riwayat hari ini</AppText>{loading ? <Loading label="Memuat keluhan…" /> : logs.length === 0 ? <AppText variant="body">Tidak ada keluhan yang dicatat hari ini.</AppText> : logs.map((log) => <View key={log.id} style={styles.log}><View style={styles.flex}><AppText variant="h3">{symptoms.find((item) => item.value === log.symptomType)?.label}</AppText><AppText variant="body">Intensitas {log.intensity} dari 5 · {isoToLocalTime(log.occurredAt, profile?.timezone ?? 'Asia/Makassar')}</AppText><AppText variant="caption">{log.notes || 'Tanpa catatan tambahan'}</AppText></View><View style={styles.actions}><Button label="Edit" icon={Pencil} variant="secondary" onPress={() => edit(log)} /><Button label="Hapus" icon={Trash2} variant="danger" onPress={() => void remove(log.id)} /></View></View>)}</Card></View>
    </>}
  </AppShell>;
}

const styles = StyleSheet.create({ intro: { gap: spacing.sm }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }, column: { flex: 1, minWidth: 300, gap: spacing.md }, flex: { flex: 1, gap: 4 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }, log: { minHeight: 110, borderRadius: radius.input, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, gap: spacing.sm }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs } });
