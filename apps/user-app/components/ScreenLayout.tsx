import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { breakpoints, colors, spacing } from '@sarira/design-tokens';
import { AppText, Button, IconButton, SimulatedBadge } from '@sarira/ui';

export function PublicScreen({
  children,
  showBack = false,
  maxWidth = 1120,
  scroll = true,
}: {
  children: ReactNode;
  showBack?: boolean;
  maxWidth?: number;
  scroll?: boolean;
}) {
  const content = (
    <View style={[styles.publicInner, { maxWidth }]}>
      {showBack ? (
        <View style={styles.backRow}>
          <IconButton icon={ChevronLeft} label="Kembali" onPress={() => router.back()} />
          <BrandMark compact />
        </View>
      ) : null}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.publicScroll} keyboardShouldPersistTaps="handled">
          {content}
        </ScrollView>
      ) : (
        <View style={styles.publicScroll}>{content}</View>
      )}
    </SafeAreaView>
  );
}

export function BrandMark({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <View style={styles.brandRow} accessibilityLabel="SARIRA">
      <View style={[styles.brandSymbol, inverse && { backgroundColor: colors.lime }]}>
        <View style={styles.brandLeafOne} />
        <View style={styles.brandLeafTwo} />
      </View>
      {!compact ? (
        <AppText variant="h3" style={{ color: inverse ? colors.white : colors.primaryDark, letterSpacing: 1.4 }}>
          SARIRA
        </AppText>
      ) : null}
    </View>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  simulated,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  simulated?: boolean;
  action?: { label: string; onPress: () => void };
}) {
  const { width } = useWindowDimensions();
  const desktop = width >= breakpoints.tablet;
  return (
    <View style={[styles.pageIntro, desktop && styles.pageIntroDesktop]}>
      <View style={{ flex: 1, gap: spacing.xs }}>
        <View style={styles.eyebrowRow}>
          <AppText variant="eyebrow">{eyebrow}</AppText>
          {simulated ? <SimulatedBadge /> : null}
        </View>
        <AppText variant={desktop ? 'h1' : 'h2'}>{title}</AppText>
        {description ? <AppText variant="body">{description}</AppText> : null}
      </View>
      {action ? <Button label={action.label} onPress={action.onPress} variant="secondary" /> : null}
    </View>
  );
}

export function ResponsiveColumns({
  children,
  columns = 2,
  tabletColumns = 2,
}: {
  children: ReactNode;
  columns?: 2 | 3;
  tabletColumns?: 1 | 2;
}) {
  const { width } = useWindowDimensions();
  const count = width >= breakpoints.desktop ? columns : width >= breakpoints.tablet ? tabletColumns : 1;
  return <View style={styles.columns}>{React.Children.map(children, (child) => <View style={{ flexBasis: count === 1 ? '100%' : `${100 / count - 2}%`, flexGrow: 1 }}>{child}</View>)}</View>;
}

export function PrototypeFooter({ nextLabel, onNext }: { nextLabel?: string; onNext?: () => void }) {
  return (
    <View style={styles.prototypeFooter}>
      <AppText variant="caption">Semua data di layar ini adalah data contoh untuk uji prototype.</AppText>
      {nextLabel && onNext ? <Button label={nextLabel} onPress={onNext} variant="lime" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  publicScroll: { flexGrow: 1, alignItems: 'center', backgroundColor: colors.white },
  publicInner: { width: '100%', flex: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  backRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  brandSymbol: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.primaryDark, overflow: 'hidden' },
  brandLeafOne: { position: 'absolute', width: 22, height: 11, borderRadius: 12, backgroundColor: colors.lime, transform: [{ rotate: '-32deg' }], top: 8, left: 5 },
  brandLeafTwo: { position: 'absolute', width: 13, height: 20, borderRadius: 12, backgroundColor: colors.white, transform: [{ rotate: '24deg' }], top: 11, left: 14 },
  pageIntro: { gap: spacing.md, marginBottom: spacing.xl },
  pageIntroDesktop: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignItems: 'stretch' },
  prototypeFooter: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.xl, paddingTop: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignItems: 'center', justifyContent: 'space-between' },
});
