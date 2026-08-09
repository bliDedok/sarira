import React, { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, layout, spacing } from '@sarira/design-tokens';
import { AppText, Card, IconButton } from '@sarira/ui';
import type { LucideIcon } from 'lucide-react-native';

export function KeyboardAwareScreen({ children, backgroundColor = colors.white }: { children: ReactNode; backgroundColor?: string }) {
  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={[styles.safe, { backgroundColor }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function ScrollableScreen({ children, contentStyle }: { children: ReactNode; contentStyle?: StyleProp<ViewStyle> }) {
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      contentInsetAdjustmentBehavior="automatic"
    >
      {children}
    </ScrollView>
  );
}

export function MobileScreen({ children, backgroundColor = colors.white }: { children: ReactNode; backgroundColor?: string }) {
  return <KeyboardAwareScreen backgroundColor={backgroundColor}><View style={[styles.flex, { backgroundColor }]}>{children}</View></KeyboardAwareScreen>;
}

export function FormScreen({ children, maxWidth = layout.formMaxWidth }: { children: ReactNode; maxWidth?: number }) {
  return <View style={[styles.form, { maxWidth }]}>{children}</View>;
}

export function StickyActionArea({ children, maxWidth = layout.formMaxWidth }: { children: ReactNode; maxWidth?: number }) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.stickyAction, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}><View style={[styles.stickyActionInner, { maxWidth }]}>{children}</View></View>;
}

export function AppHeader({ title, subtitle, backIcon, onBack, action }: { title: string; subtitle?: string; backIcon?: LucideIcon; onBack?: () => void; action?: ReactNode }) {
  return (
    <View style={styles.header}>
      {backIcon && onBack ? <IconButton icon={backIcon} label="Kembali" onPress={onBack} /> : null}
      <View style={styles.headerCopy}>
        <AppText variant="h3" numberOfLines={2}>{title}</AppText>
        {subtitle ? <AppText variant="caption" numberOfLines={2}>{subtitle}</AppText> : null}
      </View>
      {action ? <View style={styles.headerAction}>{action}</View> : null}
    </View>
  );
}

export function MobileCard({ children, style }: { children: ReactNode; style?: React.ComponentProps<typeof Card>['style'] }) {
  return <Card style={style}>{children}</Card>;
}

export function Section({ title, description, children }: { title?: string; description?: string; children: ReactNode }) {
  return <View style={styles.section}>{title ? <AppText variant="h3">{title}</AppText> : null}{description ? <AppText variant="body">{description}</AppText> : null}{children}</View>;
}

export function BottomSafeSpacer({ minimum = spacing.md }: { minimum?: number }) {
  const insets = useSafeAreaInsets();
  return <View aria-hidden style={{ height: Math.max(insets.bottom, minimum) }} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  form: { width: '100%', alignSelf: 'center', paddingHorizontal: layout.mobilePagePadding, paddingVertical: spacing.lg },
  stickyAction: { minHeight: layout.stickyActionMinHeight, paddingHorizontal: layout.mobilePagePadding, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white },
  stickyActionInner: { width: '100%', alignSelf: 'center' },
  header: { minHeight: 68, paddingHorizontal: layout.mobilePagePadding, paddingVertical: spacing.xs, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.white },
  headerCopy: { flex: 1, minWidth: 0, gap: 2 },
  headerAction: { flexShrink: 0 },
  section: { width: '100%', gap: spacing.sm },
});
