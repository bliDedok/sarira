import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, Check, HeartPulse, ShieldCheck, Sparkles } from 'lucide-react-native';
import { breakpoints, colors, radius, spacing } from '@sarira/design-tokens';
import { AppText, Button, Card, Chip } from '@sarira/ui';
import { BrandMark, PublicScreen } from '@/components/ScreenLayout';

function BalanceHero() {
  return (
    <View style={styles.heroVisual} accessible={false} importantForAccessibility="no-hide-descendants">
      <View style={styles.heroOrbOne} />
      <View style={styles.heroOrbTwo} />
      <View style={styles.balanceCircle}>
        <View style={styles.balanceHead} />
        <View style={styles.balanceBody} />
        <View style={styles.balanceArmLeft} />
        <View style={styles.balanceArmRight} />
        <View style={styles.balanceLegLeft} />
        <View style={styles.balanceLegRight} />
      </View>
      <Card tone="white" style={[styles.floatingCard, styles.floatingTop]}><HeartPulse size={20} color={colors.primary} /><View><AppText variant="label">Kebiasaan harian</AppText><AppText variant="caption">Lihat polanya</AppText></View></Card>
      <Card tone="white" style={[styles.floatingCard, styles.floatingBottom]}><Sparkles size={20} color={colors.warning} /><View><AppText variant="label">Satu prioritas</AppText><AppText variant="caption">Terasa mungkin</AppText></View></Card>
    </View>
  );
}

export default function SplashPage() {
  const { width } = useWindowDimensions();
  const desktop = width >= breakpoints.tablet;
  return (
    <PublicScreen scroll>
      <View style={styles.header}><BrandMark /><Chip label="PHASE 3 · ONBOARDING NYATA" tone="lime" /></View>
      <View style={[styles.content, desktop && styles.contentDesktop]}>
        <View style={styles.copy}>
          <AppText variant="eyebrow">SARIRA ACTIVE BALANCE</AppText>
          <AppText variant="display">Kenali polamu.{desktop ? '\n' : ' '}Seimbangkan tubuhmu.</AppText>
          <AppText variant="bodyLarge">Pendamping keseimbangan tubuh dan pertumbuhan keluarga yang membantu memilih satu perubahan realistis, aman, dan dapat dijelaskan.</AppText>
          <View style={styles.promiseList}>{['Rules decide', 'Evidence supports', 'AI explains'].map((label) => <View key={label} style={styles.promise}><View style={styles.check}><Check size={15} color={colors.primaryDark} strokeWidth={3} /></View><AppText variant="label">{label}</AppText></View>)}</View>
          <View style={styles.buttons}><Button label="Mulai perjalanan" icon={ArrowRight} variant="lime" onPress={() => router.push('/register' as never)} /><Button label="Masuk ke aplikasi" variant="secondary" onPress={() => router.push('/login' as never)} /></View>
          <View style={styles.safetyLine}><ShieldCheck size={18} color={colors.primary} /><AppText variant="caption" style={{ flex: 1 }}>SARIRA bukan alat diagnosis dan tidak menggantikan dokter atau ahli gizi. Onboarding tersimpan nyata; fitur setelah onboarding yang berlabel Demo tetap simulasi.</AppText></View>
        </View>
        <View style={styles.heroWrap}><BalanceHero /></View>
      </View>
    </PublicScreen>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  content: { flex: 1, gap: spacing.xl, justifyContent: 'center', paddingVertical: spacing.xl },
  contentDesktop: { flexDirection: 'row', alignItems: 'center', gap: spacing.huge },
  copy: { flex: 1, maxWidth: 620, gap: spacing.lg },
  promiseList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  promise: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  check: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.softLime, alignItems: 'center', justifyContent: 'center' },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  safetyLine: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, paddingTop: spacing.xs },
  heroWrap: { flex: 1, minWidth: 300, maxWidth: 560, width: '100%' },
  heroVisual: { height: 520, borderRadius: radius.cardLarge, backgroundColor: colors.warmCream, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  heroOrbOne: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: colors.softMint, top: -90, right: -60 },
  heroOrbTwo: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: colors.softLime, bottom: -75, left: -65 },
  balanceCircle: { width: 310, height: 310, borderRadius: 155, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  balanceHead: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.lime, top: -65 },
  balanceBody: { position: 'absolute', width: 34, height: 115, borderRadius: 18, backgroundColor: colors.white },
  balanceArmLeft: { position: 'absolute', width: 126, height: 20, borderRadius: 10, backgroundColor: colors.white, transform: [{ rotate: '-22deg' }], left: 54, top: 136 },
  balanceArmRight: { position: 'absolute', width: 126, height: 20, borderRadius: 10, backgroundColor: colors.white, transform: [{ rotate: '22deg' }], right: 54, top: 136 },
  balanceLegLeft: { position: 'absolute', width: 128, height: 22, borderRadius: 11, backgroundColor: colors.lime, transform: [{ rotate: '-46deg' }], left: 62, bottom: 72 },
  balanceLegRight: { position: 'absolute', width: 128, height: 22, borderRadius: 11, backgroundColor: colors.lime, transform: [{ rotate: '46deg' }], right: 62, bottom: 72 },
  floatingCard: { position: 'absolute', padding: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minWidth: 168 },
  floatingTop: { top: 52, left: 22 },
  floatingBottom: { bottom: 44, right: 18 },
});
