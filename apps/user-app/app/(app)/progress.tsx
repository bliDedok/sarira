import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { CalendarDays, HeartPulse, Plus, Scale } from 'lucide-react-native';
import type { BodyMeasurementRecord } from '@sarira/shared-types';
import { colors, spacing } from '@sarira/design-tokens';
import { AppText, Button, Card, ErrorState, Field, InlineNotice, Loading, ProgressBar, SimulatedBadge } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { api } from '@/services/api';
import { messageFor, useBaseline } from '@/features/baseline/useBaseline';

export default function ProgressScreen() {
  const { current, loading: baselineLoading, error: baselineError, reload } = useBaseline(); const [measurements, setMeasurements] = useState<BodyMeasurementRecord[]>([]); const [weight, setWeight] = useState(''); const [waist, setWaist] = useState(''); const [notes, setNotes] = useState(''); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState<string>();
  const load = useCallback(async () => { if (!current) return; setLoading(true); try { setMeasurements(await api.getBodyMeasurements()); } catch (cause) { setError(messageFor(cause)); } finally { setLoading(false); } }, [current]);
  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [current, load]);
  const save = async () => { if (!current) return; setSaving(true); setError(undefined); try { await api.createBodyMeasurement({ localDate: current.localDate, measuredAt: new Date().toISOString(), weightKg: Number(weight), ...(waist ? { waistCm: Number(waist) } : {}), ...(notes ? { notes } : {}) }); setWeight(''); setWaist(''); setNotes(''); await load(); } catch (cause) { setError(messageFor(cause)); } finally { setSaving(false); } };
  return <AppShell title="Progres" subtitle="Kelengkapan data, bukan health score">
    {baselineLoading ? <Loading label="Memuat baseline…" /> : baselineError ? <ErrorState description={baselineError} onRetry={() => void reload()} /> : !current ? <ErrorState title="Baseline belum dimulai" description="Mulai dari Starter Journey terlebih dahulu." /> : <>
      <Card tone="dark" style={styles.hero}><View style={styles.row}><View style={styles.flex}><AppText variant="eyebrow" style={styles.lime}>BASELINE REAL</AppText><AppText variant="h1" style={styles.white}>Hari {Math.min(current.baseline.currentDay, current.baseline.targetDays)} dari {current.baseline.targetDays}</AppText><AppText variant="body" style={styles.muted}>Kelengkapan data {current.completeness.score}% · {current.completeness.completedDays} hari lengkap</AppText></View><CalendarDays size={38} color={colors.lime} /></View><ProgressBar value={current.completeness.score} tone="lime" label={`Kelengkapan data ${current.completeness.score} persen`} /><Button label="Lihat perjalanan 14 hari" variant="lime" onPress={() => router.push('/baseline-journey' as never)} /></Card>
      {error ? <InlineNotice title="Belum tersimpan" text={error} tone="danger" /> : null}
      <View style={styles.grid}><Card style={styles.column}><View style={styles.rowStart}><Scale size={28} color={colors.primary} /><View><AppText variant="h2">Pengukuran tubuh opsional</AppText><AppText variant="caption">Tidak wajib setiap hari · tanpa estimasi body-fat</AppText></View></View><Field label="Berat badan (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="Contoh: 65.5" /><Field label="Lingkar pinggang (cm, opsional)" value={waist} onChangeText={setWaist} keyboardType="decimal-pad" /><Field label="Catatan (opsional)" value={notes} onChangeText={setNotes} maxLength={500} /><Button label="Tambah pengukuran" icon={Plus} loading={saving} variant="lime" disabled={!Number.isFinite(Number(weight)) || Number(weight) < 20} onPress={() => void save()} /></Card><Card tone="mint" style={styles.column}><AppText variant="h2">Riwayat pengukuran</AppText>{loading ? <Loading label="Memuat pengukuran…" /> : measurements.length === 0 ? <AppText variant="body">Belum ada pengukuran tubuh.</AppText> : measurements.map((item) => <View key={item.id} style={styles.measure}><View><AppText variant="h3">{item.weightKg.toLocaleString('id-ID')} kg</AppText><AppText variant="caption">{item.localDate}{item.waistCm ? ` · pinggang ${item.waistCm} cm` : ''} · Manual</AppText></View></View>)}</Card></View>
      <Card tone="peach" style={styles.row}><HeartPulse size={30} color={colors.danger} /><View style={styles.flex}><AppText variant="h3">Keluhan pencernaan</AppText><AppText variant="body">Catat dan lihat histori dasar tanpa diagnosis atau klaim penyebab.</AppText></View><Button label="Buka pencatatan" variant="secondary" onPress={() => router.push('/digestive' as never)} /></Card>
      <Card tone="cream" style={styles.column}><View style={styles.row}><View><AppText variant="eyebrow">PATTERN MAP & WEEKLY ACTION</AppText><AppText variant="h3">Analisis pola final belum tersedia</AppText></View><SimulatedBadge label="DEMO" /></View><AppText variant="body">Phase 4 hanya menilai ketersediaan data. Rules kesehatan, evidence, dan penjelasan AI belum dijalankan.</AppText></Card>
    </>}
  </AppShell>;
}
const styles = StyleSheet.create({ hero: { gap: spacing.lg, borderColor: colors.primaryDark, padding: spacing.xl }, white: { color: colors.white }, lime: { color: colors.lime }, muted: { color: '#C8D6CC' }, flex: { flex: 1, gap: 4 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }, column: { flex: 1, minWidth: 300, gap: spacing.md }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, flexWrap: 'wrap' }, rowStart: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, measure: { minHeight: 64, borderBottomWidth: 1, borderBottomColor: colors.border, justifyContent: 'center' } });
