import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, LogIn, ShieldCheck } from 'lucide-react-native';
import { breakpoints, colors, radius, spacing } from '@sarira/design-tokens';
import { AppText, Button, Card, Chip } from '@sarira/ui';
import { BrandMark, PublicScreen } from '@/components/ScreenLayout';

export default function WelcomePage() {
  const { width } = useWindowDimensions();
  const desktop = width >= breakpoints.tablet;
  return (
    <PublicScreen showBack>
      <View style={[styles.layout, desktop && styles.layoutDesktop]}>
        <View style={styles.copy}><Chip label="SELAMAT DATANG" tone="lime" /><AppText variant={desktop ? 'display' : 'h1'}>Mulai dari kondisi yang sebenarnya.</AppText><AppText variant="bodyLarge">Kamu dapat mengubah jawaban nanti. Akun dan setiap tahap onboarding disimpan sehingga perjalananmu dapat dilanjutkan dengan aman.</AppText><View style={styles.actions}><Button label="Buat akun" icon={ArrowRight} variant="lime" onPress={() => router.push('/register' as never)} fullWidth /><Button label="Masuk" icon={LogIn} variant="secondary" onPress={() => router.push('/login' as never)} fullWidth /></View><View style={styles.notice}><ShieldCheck size={20} color={colors.primary} /><AppText variant="caption" style={{ flex: 1 }}>Mode development memakai data uji. Konten safety masih memerlukan validasi ahli sebelum production.</AppText></View></View>
        <Card tone="dark" style={styles.preview}><BrandMark inverse /><View style={styles.previewShape}><View style={styles.previewLineOne} /><View style={styles.previewLineTwo} /><View style={styles.previewDot} /></View><View><AppText variant="eyebrow" style={{ color: colors.lime }}>ACTIVE BALANCE</AppText><AppText variant="h2" style={{ color: colors.white }}>Ramah untuk diri dan keluarga.</AppText></View><AppText variant="body" style={{ color: '#C8D6CC' }}>Usia, peran, safety, consent, dan akses profil selalu diperiksa sebelum rekomendasi.</AppText></Card>
      </View>
    </PublicScreen>
  );
}

const styles = StyleSheet.create({
  layout: { flex: 1, justifyContent: 'center', gap: spacing.xl, paddingBottom: spacing.xl },
  layoutDesktop: { flexDirection: 'row', alignItems: 'center', gap: spacing.huge },
  copy: { flex: 1, maxWidth: 540, gap: spacing.lg },
  actions: { gap: spacing.sm },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  preview: { flex: 1, maxWidth: 500, minHeight: 460, justifyContent: 'space-between', gap: spacing.lg, padding: spacing.xl, borderColor: colors.primaryDark },
  previewShape: { height: 190, borderRadius: radius.card, backgroundColor: '#193A28', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  previewLineOne: { position: 'absolute', width: 230, height: 26, borderRadius: 13, backgroundColor: colors.lime, transform: [{ rotate: '-24deg' }] },
  previewLineTwo: { position: 'absolute', width: 230, height: 26, borderRadius: 13, backgroundColor: colors.white, transform: [{ rotate: '24deg' }] },
  previewDot: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.primaryDark, borderWidth: 10, borderColor: colors.softMint },
});
