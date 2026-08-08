import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, Search } from 'lucide-react-native';
import { breakpoints, colors, radius, spacing } from '@sarira/design-tokens';
import { AppText, Card, Chip, Field } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { prototypeScreens, screenCategories } from '@/mocks/prototypeScreens';
import { screenHref } from '@/utils/routes';

export default function ScreenInventoryPage() {
  const [query, setQuery] = useState('');
  const { width } = useWindowDimensions();
  const desktop = width >= breakpoints.desktop;
  const filtered = useMemo(() => prototypeScreens.filter((screen) => `${screen.number} ${screen.title} ${screen.category}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <AppShell title="Inventaris layar" subtitle={`${prototypeScreens.length} layar prioritas Phase 1`}>
      <View style={styles.intro}><View style={{ flex: 1, gap: 4 }}><AppText variant="eyebrow">SCREEN INVENTORY</AppText><AppText variant={desktop ? 'h1' : 'h2'}>Seluruh layar dapat dibuka dan diklik.</AppText><AppText variant="body">Layar inti memiliki route khusus. Layar domain lain menggunakan template reusable dengan state dan mock data yang relevan.</AppText></View><Chip label="60 / 60 TERSEDIA" tone="lime" /></View>
      <Field label="Cari layar" value={query} onChangeText={setQuery} placeholder="Contoh: nutrisi, safety, profil" />
      {screenCategories.map((category) => {
        const categoryScreens = filtered.filter((screen) => screen.category === category);
        if (!categoryScreens.length) return null;
        return <View key={category} style={styles.category}><View style={styles.categoryTitle}><AppText variant="h3">{category}</AppText><Chip label={`${categoryScreens.length} layar`} tone="neutral" /></View><View style={styles.grid}>{categoryScreens.map((screen) => <Pressable key={screen.slug} accessibilityRole="link" accessibilityLabel={`Layar ${screen.number}, ${screen.title}`} onPress={() => router.push(screenHref(screen.slug) as never)} style={({ pressed }) => [styles.pressable, pressed && { opacity: .72 }]}><Card tone={screen.simulation ? 'cream' : 'white'} style={styles.screenCard}><View style={styles.number}><AppText variant="caption" style={{ fontFamily: 'Inter_700Bold', color: colors.primaryDark }}>{String(screen.number).padStart(2, '0')}</AppText></View><View style={{ flex: 1, gap: 3 }}><View style={styles.titleRow}><AppText variant="label" style={{ flex: 1 }}>{screen.title}</AppText>{screen.simulation ? <Chip label="DEMO" tone="lime" /> : null}</View><AppText variant="caption" numberOfLines={2}>{screen.description}</AppText></View><ChevronRight size={19} color={colors.textMuted} /></Card></Pressable>)}</View></View>;
      })}
      {!filtered.length ? <Card tone="soft" style={{ alignItems: 'center', gap: spacing.sm }}><Search size={28} color={colors.textMuted} /><AppText variant="h3">Layar tidak ditemukan</AppText><AppText variant="body">Coba kata kunci lain.</AppText></Card> : null}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  intro: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md },
  category: { gap: spacing.sm },
  categoryTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pressable: { flexGrow: 1, flexBasis: 300, maxWidth: 520, borderRadius: radius.card },
  screenCard: { minHeight: 104, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  number: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.softLime, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
