import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Activity, CheckCircle2, HeartPulse, MoonStar, Utensils } from 'lucide-react-native';
import type { BaselineDayRecord } from '@sarira/shared-types';
import { colors, spacing } from '@sarira/design-tokens';
import { AppText, Button, Card, Chip, ErrorState, Loading } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { api } from '@/services/api';
import { messageFor, useBaseline } from '@/features/baseline/useBaseline';

export default function BaselineDayScreen() {
  const { day } = useLocalSearchParams<{ day?: string }>(); const dayIndex = Number(day ?? 1);
  const { current, loading: baselineLoading, error: baselineError } = useBaseline(); const [value, setValue] = useState<BaselineDayRecord>(); const [loading, setLoading] = useState(true); const [error, setError] = useState<string>();
  const baselineId = current?.baseline.id;
  const load = useCallback(async () => { if (!baselineId) return; setLoading(true); try { setValue(await api.getBaselineDay(baselineId, dayIndex)); } catch (cause) { setError(messageFor(cause)); } finally { setLoading(false); } }, [baselineId, dayIndex]);
  useEffect(() => {
    if (!baselineId) return;
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [baselineId, load]);
  const open = (path: string) => value && router.push({ pathname: path as never, params: { date: value.localDate } } as never);
  return <AppShell title={`Baseline · Hari ${dayIndex}`} subtitle={value?.localDate}>
    {baselineLoading ? <Loading label="Memuat baseline…" /> : baselineError ? <ErrorState description={baselineError} /> : loading ? <Loading label="Memuat catatan hari…" /> : error ? <ErrorState description={error} onRetry={() => void load()} /> : value ? <>
      <Card tone={value.completenessStatus === 'COMPLETE' ? 'mint' : value.completenessStatus === 'PARTIAL' ? 'cream' : 'soft'} style={styles.hero}><View style={styles.flex}><AppText variant="eyebrow">{value.completenessStatus === 'COMPLETE' ? 'LENGKAP' : value.completenessStatus === 'PARTIAL' ? 'SEBAGIAN TERCATAT' : 'BELUM TERCATAT'}</AppText><AppText variant="h2">{value.categoryCount} dari 4 kategori tercatat</AppText><AppText variant="body">Masih ada beberapa catatan yang dapat dilengkapi. Tidak ada label gagal.</AppText></View><Chip label={value.localDate} tone="neutral" /></Card>
      <View style={styles.grid}><Card style={styles.card}><CheckCircle2 size={28} color={colors.primary} /><AppText variant="h3">Daily Check-in</AppText><AppText variant="body">{value.checkIn ? `${value.checkIn.mood.replaceAll('_', ' ')} · lapar ${value.checkIn.hunger}/5 · kenyang ${value.checkIn.fullness}/5` : 'Belum tercatat'}</AppText><Button label={value.checkIn ? 'Edit check-in' : 'Isi check-in'} variant="secondary" onPress={() => open('/daily-check-in')} /></Card><Card style={styles.card}><Utensils size={28} color={colors.primary} /><AppText variant="h3">Makanan</AppText><AppText variant="body">{value.mealLogs.length} catatan</AppText><Button label="Buka makanan" variant="secondary" onPress={() => open('/food')} /></Card><Card style={styles.card}><MoonStar size={28} color={colors.information} /><AppText variant="h3">Tidur</AppText><AppText variant="body">{value.sleepLogs.length ? `${value.sleepLogs.length} catatan · ${value.sleepLogs[0]?.durationMinutes ?? 0} menit` : 'Belum tercatat'}</AppText><Button label="Buka tidur" variant="secondary" onPress={() => open('/sleep')} /></Card><Card style={styles.card}><Activity size={28} color={colors.primary} /><AppText variant="h3">Aktivitas</AppText><AppText variant="body">{value.activityLogs.length} catatan</AppText><Button label="Buka aktivitas" variant="secondary" onPress={() => open('/activity')} /></Card><Card tone="peach" style={styles.card}><HeartPulse size={28} color={colors.danger} /><AppText variant="h3">Pencernaan</AppText><AppText variant="body">{value.digestiveLogs.length} keluhan tercatat</AppText><Button label="Buka keluhan" variant="secondary" onPress={() => open('/digestive')} /></Card></View>
    </> : null}
  </AppShell>;
}
const styles = StyleSheet.create({ hero: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.md }, flex: { flex: 1, gap: 4 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }, card: { flex: 1, minWidth: 230, minHeight: 220, justifyContent: 'space-between', gap: spacing.sm } });
