import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { BarChart3, ChevronRight, RefreshCw, ShieldCheck } from 'lucide-react-native';
import type { PatternMapFeedbackValue, PatternMapRecord } from '@sarira/shared-types';
import { colors, spacing } from '@sarira/design-tokens';
import { AppText, Button, Card, Chip, InlineNotice, Loading } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { api } from '@/services/api';
import { messageFor, useBaseline } from '@/features/baseline/useBaseline';

const strengthLabel = { LOW: 'Ringan', MODERATE: 'Cukup terlihat', STRONG: 'Paling terlihat', NOT_AVAILABLE: 'Belum tersedia' } as const;
const qualityLabel = { HIGH: 'Data kuat', MEDIUM: 'Data cukup', LOW: 'Data terbatas', INSUFFICIENT: 'Data belum cukup' } as const;
const domainLabel = { PORTION_INTAKE: 'Porsi & asupan', SUGARY_ENERGY_DENSE: 'Minuman manis & padat energi', SLEEP: 'Tidur', ACTIVITY_SEDENTARY: 'Aktivitas & sedentary', CONTEXTUAL_EATING: 'Konteks makan', MEAL_BALANCE_REGULARITY: 'Keseimbangan & keteraturan makan' } as const;
const feedbackOptions: { value: PatternMapFeedbackValue; label: string }[] = [{ value: 'VERY_ACCURATE', label: 'Sangat sesuai' }, { value: 'FAIRLY_ACCURATE', label: 'Cukup sesuai' }, { value: 'LESS_ACCURATE', label: 'Kurang sesuai' }, { value: 'UNSURE', label: 'Belum yakin' }];

export default function PatternMapScreen() {
  const { current } = useBaseline();
  const [pattern, setPattern] = useState<PatternMapRecord>();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>();
  const load = useCallback(async () => { setLoading(true); setError(undefined); try { setPattern(await api.getCurrentPatternMap()); } catch (cause) { setPattern(undefined); setError(messageFor(cause)); } finally { setLoading(false); } }, []);
  useEffect(() => { const timer = setTimeout(() => void load(), 0); return () => clearTimeout(timer); }, [load]);
  const generate = async () => { setGenerating(true); setError(undefined); try { const result = await api.generatePatternMap(); setPattern(result.patternMap); } catch (cause) { setError(messageFor(cause)); } finally { setGenerating(false); } };
  const feedback = async (value: PatternMapFeedbackValue) => { if (!pattern) return; try { setPattern(await api.savePatternMapFeedback(pattern.id, value)); } catch (cause) { setError(messageFor(cause)); } };

  return <AppShell title="Pattern Map" subtitle="Pola deskriptif dari baseline 14 hari">
    {loading ? <Loading label="Memuat Pattern Map…" /> : !pattern ? <Card tone="cream" style={styles.empty}><BarChart3 size={40} color={colors.primary} /><AppText variant="h1">Pattern Map belum tersedia</AppText><AppText variant="body">Analisis final hanya berjalan setelah readiness hari ke-14. Jika data belum cukup, SARIRA akan abstain dan tidak membuat pola palsu.</AppText>{error ? <InlineNotice title="Belum dapat dianalisis" text={error} tone="warning" /> : null}<Button label={current?.day14Available ? 'Analisis data 14 hari' : 'Menunggu hari ke-14'} icon={RefreshCw} loading={generating} disabled={!current?.day14Available} onPress={() => void generate()} /></Card> : <>
      <Card tone={pattern.status === 'INSUFFICIENT_DATA' ? 'cream' : 'dark'} style={styles.hero} accessibilityLabel={`Pattern Map versi ${pattern.version}, status ${pattern.status}`}>
        <View style={styles.row}><Chip label={`VERSI ${pattern.version}`} tone="lime" /><Chip label={qualityLabel[pattern.dataQuality]} tone={pattern.dataQuality === 'INSUFFICIENT' ? 'warning' : 'mint'} /></View>
        {pattern.primaryPattern ? <><AppText variant="eyebrow" style={styles.lime}>POLA UTAMA</AppText><AppText variant="h1" style={styles.white}>{pattern.primaryPattern.label}</AppText><AppText variant="body" style={styles.muted}>{pattern.primaryPattern.explanation}</AppText><View style={styles.rowStart}><Chip label={strengthLabel[pattern.primaryPattern.strength]} tone="lime" /><Chip label={qualityLabel[pattern.primaryPattern.dataQuality]} tone="neutral" /></View></> : <><AppText variant="h1" style={styles.darkTitle}>Data belum cukup untuk pola utama</AppText><AppText variant="body">SARIRA tidak menarik kesimpulan saat bukti per-domain belum memenuhi policy minimum.</AppText></>}
        <Button label="Analisis ulang" variant={pattern.primaryPattern ? 'lime' : 'primary'} icon={RefreshCw} loading={generating} onPress={() => void generate()} />
      </Card>

      <View style={styles.grid}>{pattern.domains.map((domain) => <Card key={domain.domain} tone={domain.availability === 'AVAILABLE' ? 'white' : 'soft'} style={styles.domain} accessibilityLabel={`${domainLabel[domain.domain]}, ${strengthLabel[domain.strength]}, ${qualityLabel[domain.dataQuality]}`}><View style={styles.row}><AppText variant="h3" style={styles.flex}>{domainLabel[domain.domain]}</AppText><Chip label={strengthLabel[domain.strength]} tone={domain.strength === 'STRONG' ? 'lime' : domain.availability === 'AVAILABLE' ? 'mint' : 'warning'} /></View><AppText variant="caption">{qualityLabel[domain.dataQuality]} · {domain.matchedRuleIds.length} rule cocok</AppText>{domain.evidence.slice(0, 2).map((item) => <AppText key={item} variant="body">• {item}</AppText>)}{domain.limitations[0] ? <AppText variant="caption">Batasan: {domain.limitations[0]}</AppText> : null}</Card>)}</View>

      {pattern.supportingPatterns.length > 0 ? <Card tone="mint" style={styles.stack}><AppText variant="eyebrow">POLA PENDUKUNG</AppText>{pattern.supportingPatterns.map((item) => <View key={item.code} style={styles.support}><View style={styles.flex}><AppText variant="h3">{item.label}</AppText><AppText variant="caption">{strengthLabel[item.strength]} · {qualityLabel[item.dataQuality]}</AppText></View></View>)}</Card> : null}

      {pattern.limitations.length > 0 ? <InlineNotice title="Keterbatasan analisis" text={`${pattern.limitations.slice(0, 3).join(' ')} Analisis ini bukan diagnosis atau pengganti arahan tenaga kesehatan.`} tone="warning" /> : <InlineNotice title="Batas penggunaan" text="Pattern Map bersifat deskriptif, bukan diagnosis dan bukan penilaian kesehatan." tone="info" />}

      <Card style={styles.stack}><View style={styles.rowStart}><ShieldCheck size={24} color={colors.primary} /><AppText variant="h2">Apakah ini terasa sesuai?</AppText></View><View style={styles.rowStart}>{feedbackOptions.map((item) => <Chip key={item.value} label={item.label} selected={pattern.feedback?.value === item.value} onPress={() => void feedback(item.value)} tone={pattern.feedback?.value === item.value ? 'lime' : 'neutral'} />)}</View><Button label="Buka Weekly Action" icon={ChevronRight} onPress={() => router.push('/weekly-action' as never)} /></Card>
    </>}
  </AppShell>;
}

const styles = StyleSheet.create({ empty: { maxWidth: 760, alignSelf: 'center', alignItems: 'flex-start', gap: spacing.md, padding: spacing.xl }, hero: { gap: spacing.md, padding: spacing.xl }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' }, rowStart: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }, flex: { flex: 1 }, white: { color: colors.white }, lime: { color: colors.lime }, muted: { color: '#C8D6CC' }, darkTitle: { color: colors.textPrimary }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }, domain: { flexGrow: 1, flexBasis: 310, minWidth: 280, gap: spacing.sm }, stack: { gap: spacing.md }, support: { minHeight: 60, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: spacing.xs, flexDirection: 'row' } });
