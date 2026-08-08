import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Clock3, Pencil, Plus, Trash2, Utensils } from 'lucide-react-native';
import type { MealLogRecord, MealType } from '@sarira/shared-types';
import { colors, radius, spacing } from '@sarira/design-tokens';
import { AppText, Button, Card, Chip, ErrorState, Field, InlineNotice, Loading, SimulatedBadge, Toggle } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { api } from '@/services/api';
import { messageFor, useBaseline } from '@/features/baseline/useBaseline';
import { isoToLocalTime, localDateTimeToIso } from '@/utils/timezone';

const mealTypes: { value: MealType; label: string }[] = [{ value: 'BREAKFAST', label: 'Sarapan' }, { value: 'LUNCH', label: 'Makan siang' }, { value: 'DINNER', label: 'Makan malam' }, { value: 'SNACK', label: 'Camilan' }, { value: 'OTHER', label: 'Lainnya' }];

export default function FoodScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { profile, current, loading: baselineLoading, error: baselineError, reload: reloadBaseline } = useBaseline();
  const [logs, setLogs] = useState<MealLogRecord[]>([]);
  const [editingId, setEditingId] = useState<string>();
  const [mealType, setMealType] = useState<MealType>('BREAKFAST'); const [time, setTime] = useState(''); const [description, setDescription] = useState(''); const [notes, setNotes] = useState('');
  const [skipped, setSkipped] = useState(false); const [sugary, setSugary] = useState(false); const [late, setLate] = useState(false); const [homeCooked, setHomeCooked] = useState(false);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState<string>();

  const trackingDate = date ?? current?.localDate;
  const load = useCallback(async () => { if (!trackingDate) return; setLoading(true); setError(undefined); try { setLogs(await api.getMealLogs(trackingDate)); } catch (cause) { setError(messageFor(cause)); } finally { setLoading(false); } }, [trackingDate]);
  useEffect(() => {
    if (!trackingDate) return;
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load, trackingDate]);
  const reset = () => { setEditingId(undefined); setMealType('BREAKFAST'); setTime(''); setDescription(''); setNotes(''); setSkipped(false); setSugary(false); setLate(false); setHomeCooked(false); };
  const edit = (log: MealLogRecord) => { setEditingId(log.id); setMealType(log.mealType); setTime(isoToLocalTime(log.eatenAt, profile?.timezone ?? 'Asia/Makassar')); setDescription(log.description ?? ''); setNotes(log.notes ?? ''); setSkipped(log.skipped); setSugary(Boolean(log.sugaryDrinkConsumed)); setLate(Boolean(log.lateMeal)); setHomeCooked(Boolean(log.homeCooked)); };
  const save = async () => {
    if (!current || !profile) return; setSaving(true); setError(undefined);
    try {
      const selectedDate = trackingDate!; const payload = { localDate: selectedDate, mealType, ...(time ? { eatenAt: localDateTimeToIso(selectedDate, time, profile.timezone) } : {}), description, skipped, sugaryDrinkConsumed: sugary, lateMeal: late, homeCooked, notes };
      if (editingId) await api.updateMealLog(editingId, payload); else await api.createMealLog(payload);
      reset(); await Promise.all([load(), reloadBaseline()]);
    } catch (cause) { setError(messageFor(cause)); } finally { setSaving(false); }
  };
  const remove = async (id: string) => { setError(undefined); try { await api.deleteMealLog(id); await Promise.all([load(), reloadBaseline()]); } catch (cause) { setError(messageFor(cause)); } };

  return <AppShell title="Catatan Makanan" subtitle="Pencatatan dasar tanpa kalkulasi nutrisi">
    {baselineLoading ? <Loading label="Memuat baseline…" /> : baselineError ? <ErrorState description={baselineError} onRetry={() => void reloadBaseline()} /> : !current ? <ErrorState title="Baseline belum dimulai" description="Mulai dari Starter Journey sebelum mencatat makanan." /> : <>
      <Card tone="lime" style={styles.intro}><View style={styles.row}><Utensils size={30} color={colors.primaryDark} /><View style={styles.flex}><AppText variant="h2">Makanan · {trackingDate}</AppText><AppText variant="body">Catat waktu dan deskripsi sederhana. Tidak ada angka kalori atau makro yang dibuat dari catatan ini.</AppText></View></View></Card>
      {error ? <View accessibilityLiveRegion="assertive"><InlineNotice title="Catatan belum tersimpan" text={error} tone="danger" /></View> : null}
      <View style={styles.grid}>
        <Card style={styles.column}>
          <View style={styles.row}><AppText variant="h2">{editingId ? 'Edit catatan' : 'Tambah catatan'}</AppText>{editingId ? <Button label="Batal edit" variant="ghost" onPress={reset} /> : null}</View>
          <View style={styles.chips}>{mealTypes.map((item) => <Chip key={item.value} label={item.label} selected={mealType === item.value} onPress={() => setMealType(item.value)} />)}</View>
          <Field label="Waktu makan (opsional)" value={time} onChangeText={setTime} placeholder="07:30" keyboardType="numbers-and-punctuation" helper={`Waktu lokal ${profile?.timezone}`} />
          <Toggle label="Waktu makan dilewati" value={skipped} onValueChange={setSkipped} />
          <Field label="Nama atau deskripsi makanan" value={description} onChangeText={setDescription} maxLength={200} editable={!skipped} placeholder={skipped ? 'Tidak perlu diisi' : 'Contoh: nasi, ayam, dan sayur'} />
          <View style={styles.chips}><Chip label="Minuman manis" selected={sugary} onPress={() => setSugary((value) => !value)} /><Chip label="Makan larut" selected={late} onPress={() => setLate((value) => !value)} /><Chip label="Dimasak di rumah" selected={homeCooked} onPress={() => setHomeCooked((value) => !value)} /></View>
          <Field label="Catatan (opsional)" value={notes} onChangeText={setNotes} maxLength={500} multiline />
          <Button label={editingId ? 'Simpan perubahan' : 'Tambah catatan'} icon={editingId ? Pencil : Plus} loading={saving} variant="lime" disabled={!skipped && description.trim().length === 0} onPress={() => void save()} />
        </Card>
        <Card tone="mint" style={styles.column}>
          <AppText variant="h2">Riwayat hari ini</AppText>
          {loading ? <Loading label="Memuat catatan…" /> : logs.length === 0 ? <AppText variant="body">Belum ada makanan yang tercatat.</AppText> : logs.map((log) => <View key={log.id} style={styles.log}><Pressable accessibilityRole="button" accessibilityLabel={`Edit ${log.mealType}`} onPress={() => edit(log)} style={({ pressed }) => [styles.logContent, pressed && { opacity: 0.72 }]}><View style={styles.chips}><Chip label={mealTypes.find((item) => item.value === log.mealType)?.label ?? log.mealType} tone="neutral" />{log.skipped ? <Chip label="DILEWATI" tone="warning" /> : null}</View><AppText variant="label">{log.skipped ? 'Tidak makan pada waktu ini' : log.description}</AppText><View style={styles.rowStart}><Clock3 size={15} color={colors.textMuted} /><AppText variant="caption">{isoToLocalTime(log.eatenAt, profile?.timezone ?? 'Asia/Makassar') || 'Waktu tidak dicatat'} · Sumber manual</AppText></View></Pressable><Button label="Hapus" icon={Trash2} variant="danger" onPress={() => void remove(log.id)} /></View>)}
        </Card>
      </View>
      <Card tone="cream" style={styles.column}><View style={styles.row}><View><AppText variant="eyebrow">NUTRITION ENGINE</AppText><AppText variant="h3">Indikator dan rekomendasi nutrisi belum dihitung</AppText></View><SimulatedBadge label="DEMO" /></View><AppText variant="body">Kalori, protein, karbohidrat, lemak, natrium, serat, Guided Meal, dan Flex Kitchen tetap berada di luar Phase 4.</AppText></Card>
    </>}
  </AppShell>;
}

const styles = StyleSheet.create({ intro: { gap: spacing.sm }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }, column: { flex: 1, minWidth: 300, gap: spacing.md }, flex: { flex: 1, gap: 4 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' }, rowStart: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }, log: { minHeight: 92, borderRadius: radius.input, backgroundColor: colors.white, padding: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border }, logContent: { flex: 1, minWidth: 0, minHeight: 64, justifyContent: 'center', gap: 4 } });
