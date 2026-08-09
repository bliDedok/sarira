import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { CalendarDays, CheckCircle2, ClipboardCheck, ShieldCheck, Target } from 'lucide-react-native';
import type { ConsentDefinition, ConsentRecord, StarterJourneyRecord } from '@sarira/shared-types';
import { colors, spacing } from '@sarira/design-tokens';
import { AppText, Button, Card, Chip, ErrorState, InlineNotice, Loading, StatusPill, Toggle } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { api } from '@/services/api';
import { messageFor } from '@/features/baseline/useBaseline';

const domainConsentTypes = ['NUTRITION_DATA', 'SLEEP_DATA', 'ACTIVITY_DATA'] as const;

export default function StarterJourneyScreen() {
  const [journey, setJourney] = useState<StarterJourneyRecord>();
  const [definitions, setDefinitions] = useState<ConsentDefinition[]>([]);
  const [records, setRecords] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true); setError(undefined);
    try {
      const [journeyValue, definitionsValue, recordsValue] = await Promise.all([api.getStarterJourney(), api.getAvailableConsents(), api.getConsents()]);
      setJourney(journeyValue); setDefinitions(definitionsValue.filter((item) => domainConsentTypes.includes(item.type as typeof domainConsentTypes[number]))); setRecords(recordsValue);
    } catch (cause) { setError(messageFor(cause)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  const active = (type: ConsentDefinition['type']) => records.some((record) => record.type === type && record.status === 'GRANTED');
  const toggle = async (definition: ConsentDefinition, granted: boolean) => {
    setError(undefined);
    try {
      const value = await api.updateConsent(definition.type, { granted, version: definition.version, source: 'FEATURE_PROMPT' });
      setRecords((current) => [value, ...current.filter((item) => item.type !== definition.type)]);
    } catch (cause) { setError(messageFor(cause)); }
  };
  const start = async () => {
    setStarting(true); setError(undefined);
    try { await api.startBaseline(); router.replace('/home' as never); }
    catch (cause) { setError(messageFor(cause)); }
    finally { setStarting(false); }
  };

  return (
    <AppShell title="Starter Journey" subtitle="Awal baseline 14 hari">
      {loading ? <Loading label="Menyiapkan perjalananmu…" /> : error && !journey ? <ErrorState description={error} onRetry={() => void load()} /> : journey ? <>
        <Card tone="dark" style={styles.hero} accessibilityLabel="Penjelasan baseline 14 hari">
          <View style={styles.row}><Chip label="BASELINE 14 HARI" tone="lime" /><CalendarDays size={34} color={colors.lime} /></View>
          <AppText variant="h1" style={styles.white}>Kenali kebiasaanmu dari catatan nyata.</AppText>
          <AppText variant="bodyLarge" style={styles.muted}>Selama 14 hari, SARIRA akan membantu mencatat pola harianmu. Tidak perlu sempurna. Catat sesuai kondisi sebenarnya.</AppText>
          <InlineNotice title="Belum ada kesimpulan final" text="Semakin lengkap catatanmu, semakin baik gambaran pola yang dapat dibuat nanti. Phase ini tidak membuat diagnosis atau Pattern Map final." tone="info" />
        </Card>

        <View style={styles.grid}>
          <Card style={styles.column}>
            <AppText variant="h2">Konteks yang sudah siap</AppText>
            <View style={styles.item}><CheckCircle2 size={22} color={colors.success} /><View style={styles.flex}><AppText variant="label">{journey.profile.fullName}</AppText><AppText variant="caption">{journey.ageGroup.replaceAll('_', ' ')} · {journey.profile.timezone}</AppText></View></View>
            <View style={styles.item}><Target size={22} color={colors.primary} /><View style={styles.flex}><AppText variant="label">Tujuan: {journey.goal.label}</AppText><AppText variant="caption">Tujuan aktif dari onboarding</AppText></View></View>
            <View style={styles.item}><ShieldCheck size={22} color={colors.primary} /><View style={styles.flex}><AppText variant="label">Safety screening selesai</AppText><StatusPill status={journey.safetyResult.status} /></View></View>
            <View style={styles.item}><ClipboardCheck size={22} color={colors.primary} /><View style={styles.flex}><AppText variant="label">Preferensi program</AppText><AppText variant="caption">{journey.programPreference?.program.replaceAll('_', ' ') ?? 'Tidak dipilih'}</AppText></View></View>
          </Card>
          <Card tone="mint" style={styles.column}>
            <AppText variant="h2">Pilih data yang ingin dicatat</AppText>
            <AppText variant="body">Izin ini opsional dan dapat dicabut dari Settings. Jika dimatikan, catatan baru pada domain terkait akan dihentikan; data lama tidak otomatis dihapus.</AppText>
            {definitions.map((definition) => <View key={definition.id} style={styles.consent}><View style={styles.flex}><AppText variant="label">{definition.displayName}</AppText><AppText variant="caption">{definition.description}</AppText></View><Toggle label={`Izin ${definition.displayName}`} value={active(definition.type)} onValueChange={(value) => void toggle(definition, value)} /></View>)}
          </Card>
        </View>
        {error ? <InlineNotice title="Belum dapat menyimpan" text={error} tone="danger" /> : null}
        <Card tone="lime" style={styles.cta}><View style={styles.flex}><AppText variant="h2">Siap mulai Hari 1?</AppText><AppText variant="body">Timeline mengikuti tanggal lokal {journey.profile.timezone}. Hari yang terlewat tetap ditandai, tidak menggeser perjalanan.</AppText></View><Button label={journey.baseline ? 'Lanjutkan baseline' : 'Mulai baseline'} loading={starting} variant="primary" onPress={() => void start()} /></Card>
      </> : null}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.lg, padding: spacing.xl, borderColor: colors.primaryDark },
  white: { color: colors.white },
  muted: { color: '#C8D6CC' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  column: { flex: 1, minWidth: 300, gap: spacing.md },
  item: { minHeight: 60, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  flex: { flex: 1, gap: 3 },
  consent: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  cta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.md },
});
