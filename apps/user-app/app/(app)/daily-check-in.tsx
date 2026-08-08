import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import { CheckCircle2, RotateCcw } from 'lucide-react-native';
import type { BarrierCode, MoodLevel } from '@sarira/shared-types';
import { spacing } from '@sarira/design-tokens';
import { AppText, Button, Card, Chip, ErrorState, Field, InlineNotice, Loading } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { api } from '@/services/api';
import { messageFor } from '@/features/baseline/useBaseline';

const moods: { value: MoodLevel; label: string }[] = [{ value: 'VERY_LOW', label: 'Sangat rendah' }, { value: 'LOW', label: 'Rendah' }, { value: 'NEUTRAL', label: 'Netral' }, { value: 'GOOD', label: 'Baik' }, { value: 'VERY_GOOD', label: 'Sangat baik' }];
const barrierOptions: { value: BarrierCode; label: string }[] = [{ value: 'BUSY', label: 'Sibuk' }, { value: 'FORGOT', label: 'Lupa' }, { value: 'FOOD_UNAVAILABLE', label: 'Makanan sulit tersedia' }, { value: 'LACK_OF_SLEEP', label: 'Kurang tidur' }, { value: 'NO_TIME_FOR_ACTIVITY', label: 'Tidak sempat olahraga' }, { value: 'NONE', label: 'Tidak ada hambatan' }, { value: 'OTHER', label: 'Lainnya' }];

type Draft = { mood: MoodLevel; hunger: number; fullness: number; energy: number; bodyFeeling: string; barriers: BarrierCode[]; notes: string };
const initial: Draft = { mood: 'NEUTRAL', hunger: 3, fullness: 3, energy: 3, bodyFeeling: '', barriers: [], notes: '' };

function Scale({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <View style={styles.stack}><View style={styles.row}><AppText variant="label">{label}</AppText><Chip label={`${value} dari 5`} tone="mint" /></View><View style={styles.chips}>{[1, 2, 3, 4, 5].map((option) => <Chip key={option} label={String(option)} selected={value === option} onPress={() => onChange(option)} />)}</View></View>;
}

export default function DailyCheckInScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const [localDate, setLocalDate] = useState('');
  const [draft, setDraft] = useState<Draft>(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true); setError(undefined);
    try {
      const current = await api.getCurrentBaseline(); const selectedDate = date ?? current.localDate; setLocalDate(selectedDate);
      const key = `sarira.checkin-draft.${selectedDate}`;
      const [existing, local] = await Promise.all([api.getDailyCheckIn(selectedDate), AsyncStorage.getItem(key)]);
      if (existing) setDraft({ mood: existing.mood, hunger: existing.hunger, fullness: existing.fullness, energy: existing.energy ?? 3, bodyFeeling: existing.bodyFeeling ?? '', barriers: existing.barriers, notes: existing.notes ?? '' });
      else if (local) setDraft(JSON.parse(local) as Draft);
    } catch (cause) { setError(messageFor(cause)); }
    finally { setLoading(false); }
  }, [date]);
  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);
  useEffect(() => { if (localDate) void AsyncStorage.setItem(`sarira.checkin-draft.${localDate}`, JSON.stringify(draft)); }, [draft, localDate]);

  const toggleBarrier = (value: BarrierCode) => setDraft((current) => ({ ...current, barriers: value === 'NONE' ? ['NONE'] : current.barriers.includes(value) ? current.barriers.filter((item) => item !== value) : [...current.barriers.filter((item) => item !== 'NONE'), value] }));
  const save = async () => {
    setSaving(true); setSaved(false); setError(undefined);
    try {
      await api.saveDailyCheckIn(localDate, { mood: draft.mood, hunger: draft.hunger, fullness: draft.fullness, energy: draft.energy, ...(draft.bodyFeeling.trim() ? { bodyFeeling: draft.bodyFeeling.trim() } : {}), barriers: draft.barriers, ...(draft.notes.trim() ? { notes: draft.notes.trim() } : {}) });
      await AsyncStorage.removeItem(`sarira.checkin-draft.${localDate}`); setSaved(true);
    } catch (cause) { setError(messageFor(cause)); }
    finally { setSaving(false); }
  };

  return <AppShell title="Daily Check-in" subtitle={localDate || 'Catatan hari ini'}>
    {loading ? <Loading label="Memulihkan check-in…" /> : error && !localDate ? <ErrorState description={error} onRetry={() => void load()} /> : <>
      <Card tone="lime" style={styles.intro}><AppText variant="eyebrow">CATAT SESUAI KONDISI SEBENARNYA</AppText><AppText variant="h2">Bagaimana harimu?</AppText><AppText variant="body">Jawaban ini tidak digunakan untuk mendiagnosis kondisi kesehatan.</AppText></Card>
      {saved ? <InlineNotice title="Check-in tersimpan" text="Tugas dan kelengkapan data hari ini sudah diperbarui." tone="success" /> : null}
      {error ? <View accessibilityLiveRegion="assertive"><InlineNotice title="Gagal menyimpan" text={`${error} Jawaban tetap ada di layar dan dapat dicoba lagi.`} tone="danger" /></View> : null}
      <Card style={styles.stack}>
        <View style={styles.stack}><AppText variant="label">Mood</AppText><View style={styles.chips}>{moods.map((item) => <Chip key={item.value} label={item.label} selected={draft.mood === item.value} onPress={() => setDraft((current) => ({ ...current, mood: item.value }))} />)}</View></View>
        <Scale label="Rasa lapar" value={draft.hunger} onChange={(value) => setDraft((current) => ({ ...current, hunger: value }))} />
        <Scale label="Rasa kenyang" value={draft.fullness} onChange={(value) => setDraft((current) => ({ ...current, fullness: value }))} />
        <Scale label="Energi / rasa tubuh" value={draft.energy} onChange={(value) => setDraft((current) => ({ ...current, energy: value }))} />
        <Field label="Keluhan tubuh singkat (opsional)" value={draft.bodyFeeling} onChangeText={(bodyFeeling) => setDraft((current) => ({ ...current, bodyFeeling }))} maxLength={120} placeholder="Contoh: bahu terasa tegang" />
        <View style={styles.stack}><AppText variant="label">Hambatan hari ini</AppText><View style={styles.chips}>{barrierOptions.map((item) => <Chip key={item.value} label={item.label} selected={draft.barriers.includes(item.value)} onPress={() => toggleBarrier(item.value)} />)}</View></View>
        <Field label="Catatan tambahan (opsional)" value={draft.notes} onChangeText={(notes) => setDraft((current) => ({ ...current, notes }))} maxLength={500} multiline numberOfLines={4} />
        <View style={styles.actions}><Button label="Simpan check-in" icon={CheckCircle2} loading={saving} variant="lime" onPress={() => void save()} /><Button label="Muat ulang" icon={RotateCcw} variant="secondary" onPress={() => void load()} /></View>
      </Card>
    </>}
  </AppShell>;
}

const styles = StyleSheet.create({
  intro: { gap: spacing.sm }, stack: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
