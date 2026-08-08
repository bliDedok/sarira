import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BarChart3, CheckCircle2 } from 'lucide-react-native';
import type { BaselineDomain, Day7CheckpointRecord } from '@sarira/shared-types';
import { colors, spacing } from '@sarira/design-tokens';
import { AppText, Button, Card, Chip, ErrorState, Field, InlineNotice, Loading, ProgressBar, Toggle } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { api } from '@/services/api';
import { messageFor, useBaseline } from '@/features/baseline/useBaseline';

const domains: { value: BaselineDomain; label: string }[] = [{ value: 'checkIn', label: 'Check-in' }, { value: 'food', label: 'Makanan' }, { value: 'sleep', label: 'Tidur' }, { value: 'activity', label: 'Aktivitas' }];

export default function Day7CheckpointScreen() {
  const { current, loading: baselineLoading, error: baselineError } = useBaseline(); const [checkpoint, setCheckpoint] = useState<Day7CheckpointRecord>(); const [ease, setEase] = useState(3); const [hardest, setHardest] = useState<BaselineDomain[]>([]); const [continues, setContinues] = useState(true); const [notes, setNotes] = useState(''); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false); const [error, setError] = useState<string>();
  const load = useCallback(async () => { if (!current) return; setLoading(true); setError(undefined); try { setCheckpoint(await api.getDay7Checkpoint(current.baseline.id)); } catch (cause) { setError(messageFor(cause)); } finally { setLoading(false); } }, [current]);
  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [current, load]);
  const save = async () => { if (!current) return; setSaving(true); setError(undefined); try { await api.saveDay7Feedback(current.baseline.id, { easeRating: ease, hardestDomains: hardest, wantsToContinue: continues, ...(notes ? { notes } : {}) }); setSaved(true); } catch (cause) { setError(messageFor(cause)); } finally { setSaving(false); } };
  return <AppShell title="Checkpoint Hari 7" subtitle="Ringkasan deskriptif minggu pertama">
    {baselineLoading ? <Loading label="Memuat baseline…" /> : baselineError ? <ErrorState description={baselineError} /> : loading ? <Loading label="Menyiapkan checkpoint…" /> : error && !checkpoint ? <ErrorState description={error} onRetry={() => void load()} /> : checkpoint ? <>
      <Card tone="blue" style={styles.hero}><BarChart3 size={36} color={colors.information} /><View style={styles.flex}><AppText variant="eyebrow">EARLY OBSERVATION</AppText><AppText variant="h1">Satu minggu sudah tercatat.</AppText><AppText variant="body">{checkpoint.disclaimer}</AppText></View><Chip label={`${checkpoint.daysWithData} HARI BERDATA`} tone="neutral" /></Card>
      <View style={styles.grid}>{domains.map((domain) => <Card key={domain.value} style={styles.card}><AppText variant="label">{domain.label}</AppText><AppText variant="h2">{Math.round(checkpoint.domainCoverage[domain.value] * checkpoint.observedDays)} dari {checkpoint.observedDays} hari</AppText><ProgressBar value={checkpoint.domainCoverage[domain.value] * 100} label={`${domain.label} tersedia ${Math.round(checkpoint.domainCoverage[domain.value] * 100)} persen`} /><AppText variant="caption">Kelengkapan data, bukan kualitas kesehatan.</AppText></Card>)}</View>
      <Card tone="mint" style={styles.stack}><AppText variant="h2">Yang terlihat dari ketersediaan catatan</AppText>{checkpoint.observations.map((observation) => <View key={observation} style={styles.observation}><CheckCircle2 size={20} color={colors.primary} /><AppText variant="body" style={styles.flex}>{observation}</AppText></View>)}{checkpoint.missingDomains.length ? <InlineNotice title="Masih dapat dilengkapi" text={`Catatan yang sering kosong: ${checkpoint.missingDomains.map((domain) => domains.find((item) => item.value === domain)?.label).join(', ')}.`} tone="warning" /> : null}</Card>
      <Card style={styles.stack}><AppText variant="h2">Bagaimana pengalamanmu?</AppText><AppText variant="label">Seberapa mudah pencatatan minggu ini?</AppText><View style={styles.chips}>{[1, 2, 3, 4, 5].map((value) => <Chip key={value} label={`${value}`} selected={ease === value} onPress={() => setEase(value)} />)}</View><AppText variant="label">Bagian yang paling sulit dicatat</AppText><View style={styles.chips}>{domains.map((domain) => <Chip key={domain.value} label={domain.label} selected={hardest.includes(domain.value)} onPress={() => setHardest((current) => current.includes(domain.value) ? current.filter((item) => item !== domain.value) : [...current, domain.value])} />)}</View><Toggle label="Saya ingin melanjutkan baseline" value={continues} onValueChange={setContinues} /><Field label="Catatan pengalaman (opsional)" value={notes} onChangeText={setNotes} maxLength={500} multiline />{saved ? <InlineNotice title="Feedback tersimpan" text="Feedback digunakan untuk evaluasi UX, bukan untuk mengubah safety decision." tone="success" /> : null}{error ? <InlineNotice title="Feedback belum tersimpan" text={error} tone="danger" /> : null}<Button label="Simpan feedback" loading={saving} variant="lime" onPress={() => void save()} /></Card>
    </> : null}
  </AppShell>;
}
const styles = StyleSheet.create({ hero: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.md }, flex: { flex: 1, gap: 4 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }, card: { flex: 1, minWidth: 220, gap: spacing.sm }, stack: { gap: spacing.md }, observation: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs } });
