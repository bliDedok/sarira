import React, { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, Database, Fingerprint, Target } from 'lucide-react-native';
import { breakpoints, colors, radius, spacing } from '@sarira/design-tokens';
import { AppText, Button, Chip } from '@sarira/ui';
import { BrandMark, PublicScreen } from '@/components/ScreenLayout';

const slides = [
  { eyebrow: '01 · KENALI', title: 'Catatan kecil menjadi pola yang lebih jelas.', description: 'Makan, tidur, aktivitas, mood, dan keluhan tetap dilihat bersama konteksnya—bukan sebagai penilaian.', icon: Database, tone: colors.softMint },
  { eyebrow: '02 · PRIORITASKAN', title: 'Satu Weekly Action, bukan banjir saran.', description: 'SARIRA memilih satu perubahan yang aman dan realistis. Kamu tetap dapat menerima, menunda, atau memilih alternatif setara.', icon: Target, tone: colors.softLime },
  { eyebrow: '03 · KENDALIKAN', title: 'Alasan terlihat. Data tetap dalam kendalimu.', description: 'Lihat data, rule, confidence, keterbatasan, dan sumber. Koreksi, cabut izin, atau berhenti kapan saja.', icon: Fingerprint, tone: colors.pastelBlue },
];

export default function OnboardingPage() {
  const [index, setIndex] = useState(0);
  const { width } = useWindowDimensions();
  const slide = slides[index]!;
  const Icon = slide.icon;
  const desktop = width >= breakpoints.tablet;
  const next = () => index === slides.length - 1 ? router.push('/welcome' as never) : setIndex((value) => value + 1);
  return (
    <PublicScreen scroll={false}>
      <View style={styles.header}><BrandMark /><Button label="Lewati" variant="ghost" onPress={() => router.push('/welcome' as never)} /></View>
      <View style={[styles.content, desktop && styles.contentDesktop]}>
        <View style={[styles.visual, { backgroundColor: slide.tone }]}>
          <View style={styles.visualCircle}><Icon size={76} color={colors.lime} strokeWidth={1.5} /></View>
          <View style={styles.orbitOne} /><View style={styles.orbitTwo} />
        </View>
        <View style={styles.copy}>
          <Chip label={slide.eyebrow} tone="lime" />
          <AppText variant={desktop ? 'display' : 'h1'}>{slide.title}</AppText>
          <AppText variant="bodyLarge">{slide.description}</AppText>
          <View style={styles.dots}>{slides.map((_, dotIndex) => <View key={dotIndex} style={[styles.dot, dotIndex === index && styles.dotActive]} />)}</View>
          <Button label={index === slides.length - 1 ? 'Lanjut ke SARIRA' : 'Lanjut'} icon={ArrowRight} variant="lime" onPress={next} fullWidth />
        </View>
      </View>
    </PublicScreen>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  content: { flex: 1, justifyContent: 'center', gap: spacing.xl, paddingBottom: spacing.xl },
  contentDesktop: { flexDirection: 'row', alignItems: 'center', gap: spacing.huge },
  visual: { flex: 1, minHeight: 330, maxHeight: 520, borderRadius: radius.cardLarge, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  visualCircle: { width: 230, height: 230, borderRadius: 115, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  orbitOne: { position: 'absolute', width: 330, height: 150, borderRadius: 165, borderWidth: 2, borderColor: 'rgba(23,107,82,0.25)', transform: [{ rotate: '25deg' }] },
  orbitTwo: { position: 'absolute', width: 330, height: 150, borderRadius: 165, borderWidth: 2, borderColor: 'rgba(23,107,82,0.18)', transform: [{ rotate: '-25deg' }] },
  copy: { flex: 1, maxWidth: 540, gap: spacing.lg },
  dots: { flexDirection: 'row', gap: 7 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.border },
  dotActive: { width: 28, backgroundColor: colors.lime },
});
