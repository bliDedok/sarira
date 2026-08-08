import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Camera, ChefHat, ChevronRight, Clock3, Coins, Search, Sparkles, Utensils } from 'lucide-react-native';
import { breakpoints, colors, radius, spacing } from '@sarira/design-tokens';
import { AppText, Button, Card, Chip, ProgressBar, ProgressRing, SectionHeader } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { meals, nutritionSummary } from '@/mocks/data';
import { screenHref } from '@/utils/routes';

export default function FoodScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= breakpoints.desktop;
  const protein = nutritionSummary.find((metric) => metric.id === 'protein')!;
  return (
    <AppShell title="Makanan" subtitle="Rencana dan catatan konsumsi">
      <View style={styles.titleRow}>
        <View style={{ flex: 1, gap: 4 }}><AppText variant="eyebrow">PILIHAN YANG FLEKSIBEL</AppText><AppText variant={desktop ? 'h1' : 'h2'}>Makan terarah, tetap terasa nyata.</AppText><AppText variant="body">Menu dan angka di prototype ini adalah simulasi, bukan rencana diet personal.</AppText></View>
        <Button label="Scan makanan" icon={Camera} variant="secondary" onPress={() => router.push(screenHref('food-scan') as never)} />
      </View>

      <View style={styles.topGrid}>
        <Card tone="dark" style={styles.nutritionHero}>
          <View style={styles.rowBetween}>
            <View style={{ gap: 5 }}><AppText variant="eyebrow" style={{ color: colors.lime }}>RINGKASAN NUTRISI</AppText><AppText variant="h2" style={{ color: colors.white }}>Energi hari ini</AppText><AppText variant="body" style={{ color: '#C9D7CD' }}>1.420 dari rentang demo 1.800–2.000 kkal</AppText></View>
            <ProgressRing value={74} size={86} label="Energi 74 persen dari target demo" />
          </View>
          <View style={{ gap: spacing.xs }}><View style={styles.rowBetween}><AppText variant="label" style={{ color: colors.white }}>Protein · minimum</AppText><AppText variant="caption" style={{ color: '#C9D7CD' }}>{protein.value} / {protein.target} g</AppText></View><ProgressBar value={protein.value} max={protein.target} tone="lime" label="Protein minimum" /></View>
          <Button label="Lihat 10 indikator" variant="lime" onPress={() => router.push(screenHref('nutrition-indicator') as never)} />
        </Card>
        <View style={styles.modeColumn}>
          <Pressable onPress={() => router.push(screenHref('guided-meal') as never)} style={({ pressed }) => [styles.modePress, pressed && { opacity: 0.76 }]}><Card tone="lime" style={styles.modeCard}><View style={styles.modeIcon}><Utensils size={24} color={colors.primaryDark} /></View><View style={{ flex: 1 }}><AppText variant="h3">Guided Meal</AppText><AppText variant="caption">Menu demo terarah untuk hari ini.</AppText></View><ChevronRight size={20} color={colors.primaryDark} /></Card></Pressable>
          <Pressable onPress={() => router.push(screenHref('flex-kitchen') as never)} style={({ pressed }) => [styles.modePress, pressed && { opacity: 0.76 }]}><Card tone="mint" style={styles.modeCard}><View style={styles.modeIcon}><ChefHat size={24} color={colors.primary} /></View><View style={{ flex: 1 }}><AppText variant="h3">Flex Kitchen</AppText><AppText variant="caption">Susun resep dari bahan yang tersedia.</AppText></View><ChevronRight size={20} color={colors.primary} /></Card></Pressable>
        </View>
      </View>

      <SectionHeader title="Rencana hari ini" action="Food log" onAction={() => router.push(screenHref('food-log') as never)} />
      <View style={styles.mealGrid}>
        {meals.map((meal, index) => (
          <Pressable key={meal.id} accessibilityRole="button" accessibilityLabel={`Buka resep ${meal.name}`} onPress={() => router.push(screenHref('recipe-detail') as never)} style={({ pressed }) => [styles.mealPress, pressed && { opacity: 0.76 }]}>
            <Card tone={meal.tone} style={styles.mealCard}>
              <View style={[styles.foodVisual, { backgroundColor: index === 0 ? '#F5D48B' : index === 1 ? '#CEE3B7' : '#E8D7B9' }]} accessible={false} importantForAccessibility="no-hide-descendants">
                <View style={styles.plate}><View style={[styles.foodShape, { backgroundColor: index === 0 ? '#F7F0DE' : index === 1 ? '#73964E' : '#D2A659' }]} /><View style={[styles.foodDot, { backgroundColor: index === 0 ? '#F5C33B' : index === 1 ? '#E2A44D' : '#87AA67' }]} /></View>
              </View>
              <View style={styles.rowBetween}><Chip label={meal.time.toUpperCase()} tone="neutral" />{meal.consumed ? <Chip label="SUDAH DICATAT" tone="mint" /> : null}</View>
              <AppText variant="h3">{meal.name}</AppText>
              <View style={styles.metaRow}><Clock3 size={15} color={colors.textMuted} /><AppText variant="caption">{meal.duration}</AppText><Coins size={15} color={colors.textMuted} /><AppText variant="caption">{meal.price}</AppText></View>
              <View style={styles.metaRow}><AppText variant="caption">{meal.energy}</AppText><AppText variant="caption">•</AppText><AppText variant="caption">{meal.protein}</AppText></View>
            </Card>
          </Pressable>
        ))}
      </View>

      <Card tone="peach" style={styles.suggestionCard}>
        <View style={[styles.modeIcon, { backgroundColor: colors.white }]}><Sparkles size={24} color={colors.warning} /></View>
        <View style={{ flex: 1, gap: 3 }}><AppText variant="h3">Punya bahan sendiri?</AppText><AppText variant="body">Cari bahan dan lihat bagaimana perubahan berat atau porsi memengaruhi kalkulasi demo.</AppText></View>
        <Button label="Buka Recipe Builder" icon={Search} variant="secondary" onPress={() => router.push(screenHref('recipe-builder') as never)} />
      </Card>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md },
  topGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  nutritionHero: { flex: 1.2, minWidth: 310, minHeight: 280, borderColor: colors.primaryDark, justifyContent: 'space-between', gap: spacing.lg, padding: spacing.xl },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  modeColumn: { flex: 0.8, minWidth: 300, gap: spacing.md },
  modePress: { flex: 1, borderRadius: radius.card },
  modeCard: { minHeight: 132, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  modeIcon: { width: 50, height: 50, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.68)', alignItems: 'center', justifyContent: 'center' },
  mealGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  mealPress: { flex: 1, minWidth: 250, borderRadius: radius.card },
  mealCard: { minHeight: 350, gap: spacing.sm },
  foodVisual: { height: 130, borderRadius: radius.input, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  plate: { width: 112, height: 112, borderRadius: 56, backgroundColor: colors.white, borderWidth: 8, borderColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center' },
  foodShape: { width: 72, height: 58, borderRadius: 28, transform: [{ rotate: '-8deg' }] },
  foodDot: { position: 'absolute', width: 34, height: 34, borderRadius: 17, right: 13, bottom: 12 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs },
  suggestionCard: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
});
