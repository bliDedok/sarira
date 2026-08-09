import React, { ReactNode, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, usePathname } from 'expo-router';
import {
  Activity,
  Bell,
  ChartNoAxesCombined,
  Home,
  UserRound,
  Utensils,
} from 'lucide-react-native';
import { colors, layout, radius, spacing } from '@sarira/design-tokens';
import { AppText, IconButton } from '@sarira/ui';
import { BrandMark } from '@/components/ScreenLayout';
import { usePrototype } from '@/features/prototype/PrototypeContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useAuth } from '@/providers/AuthProvider';

type ShellIcon = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

const primaryNav = [
  { label: 'Beranda', path: '/home', icon: Home },
  { label: 'Makanan', path: '/food', icon: Utensils },
  { label: 'Aktivitas', path: '/activity', icon: Activity },
  { label: 'Progres', path: '/progress', icon: ChartNoAxesCombined },
  { label: 'Profil', path: '/profile', icon: UserRound },
];

const foodPaths = ['/food', '/guided-meal', '/recipe-detail', '/cooking', '/flex-kitchen'];
const isNavSelected = (pathname: string, path: string) => path === '/home'
  ? pathname === '/home'
  : path === '/food'
    ? foodPaths.some((candidate) => pathname.startsWith(candidate))
    : pathname.startsWith(path);

function NavItem({
  label,
  path,
  icon: Icon,
  compact,
}: {
  label: string;
  path: string;
  icon: ShellIcon;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const selected = isNavSelected(pathname, path);
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={() => router.push(path as never)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.navItem,
        compact && styles.navItemCompact,
        selected && styles.navItemSelected,
        focused && styles.navItemFocused,
        pressed && { opacity: 0.72 },
      ]}
    >
      <Icon size={21} color={selected ? colors.primaryDark : '#B7C8BD'} strokeWidth={selected ? 2.6 : 2} />
      {!compact ? (
        <AppText variant="label" style={{ color: selected ? colors.primaryDark : '#B7C8BD', flex: 1 }}>
          {label}
        </AppText>
      ) : null}
    </Pressable>
  );
}

function MobileNavigation() {
  const pathname = usePathname();
  return (
    <View style={styles.mobileNavWrap}>
      <View style={styles.mobileNav}>
        {primaryNav.map(({ label, path, icon: Icon }) => {
          const selected = isNavSelected(pathname, path);
          return (
            <Pressable
              key={path}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
              onPress={() => router.push(path as never)}
              style={({ pressed }) => [styles.mobileTab, selected && styles.mobileTabSelected, pressed && { opacity: 0.7 }]}
            >
              <Icon size={21} color={selected ? colors.primaryDark : colors.white} strokeWidth={selected ? 2.7 : 2} />
              <AppText variant="caption" style={{ color: selected ? colors.primaryDark : colors.white, fontSize: 10 }}>
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const { isDesktop, isTablet, isMobile } = useResponsiveLayout();
  const { elderMode } = usePrototype();
  const { session } = useAuth();
  const email = session?.email ?? 'Profil pengguna';
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.shell}>
        {!isMobile ? (
          <View style={[styles.sidebar, isTablet && styles.sidebarCompact]}>
            <View style={styles.sidebarBrand}>
              <BrandMark compact={isTablet} inverse />
            </View>
            <View style={styles.sidebarSection}>
              {primaryNav.map((item) => <NavItem key={item.path} {...item} compact={isTablet} />)}
            </View>
          </View>
        ) : null}

        <View style={styles.main}>
          <View style={[styles.header, elderMode && { minHeight: 92 }]}>
            <View style={styles.headerTitle}>
              {isMobile ? <BrandMark compact /> : null}
              {title ? (
                <View style={styles.headerCopy}>
                  <AppText variant="h3" numberOfLines={2}>{title}</AppText>
                  {subtitle ? <AppText variant="caption" numberOfLines={2}>{subtitle}</AppText> : null}
                </View>
              ) : null}
            </View>
            <View style={styles.headerActions}>
              <IconButton icon={Bell} label="Buka Weekly Action" onPress={() => router.push('/weekly-action' as never)} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Profil aktif ${email}. Buka profil.`}
                onPress={() => router.push('/profile' as never)}
                style={({ pressed }) => [styles.profileSwitcher, pressed && { opacity: 0.72 }]}
              >
                <View style={styles.avatar}><AppText variant="caption" style={{ color: colors.white, fontFamily: 'Inter_700Bold' }}>{initials}</AppText></View>
                {!isMobile ? (
                  <View style={{ gap: 1 }}>
                    <AppText variant="caption">Profil aktif</AppText>
                    <AppText variant="label" numberOfLines={1} style={{ maxWidth: 180 }}>{email}</AppText>
                  </View>
                ) : null}
              </Pressable>
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.content,
              isMobile && styles.contentMobile,
              { maxWidth: isDesktop ? 1400 : 1120 },
              elderMode && { gap: spacing.xl },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            contentInsetAdjustmentBehavior="automatic"
          >
            {children}
          </ScrollView>
          {isMobile ? <MobileNavigation /> : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  shell: { flex: 1, flexDirection: 'row', backgroundColor: colors.surfaceSoft },
  sidebar: { width: 248, backgroundColor: colors.primaryDark, padding: spacing.lg, gap: spacing.md },
  sidebarCompact: { width: 82, paddingHorizontal: spacing.sm, alignItems: 'center' },
  sidebarBrand: { minHeight: 56, justifyContent: 'center', paddingHorizontal: spacing.xs },
  sidebarSection: { gap: spacing.xs, width: '100%' },
  navItem: { minHeight: 48, borderRadius: radius.input, paddingHorizontal: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 2, borderColor: 'transparent' },
  navItemCompact: { width: 52, justifyContent: 'center', paddingHorizontal: 0 },
  navItemSelected: { backgroundColor: colors.lime },
  navItemFocused: { borderColor: colors.white },
  main: { flex: 1, minWidth: 0, backgroundColor: colors.surfaceSoft },
  header: { minHeight: 76, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md },
  headerTitle: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerCopy: { flex: 1, minWidth: 0, gap: 1 },
  headerActions: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  profileSwitcher: { minHeight: 48, borderRadius: radius.pill, padding: 5, paddingRight: spacing.sm, backgroundColor: colors.surfaceSoft, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  content: { width: '100%', alignSelf: 'center', padding: spacing.xl, paddingBottom: spacing.huge, gap: spacing.lg },
  contentMobile: { padding: layout.mobilePagePadding, paddingBottom: spacing.lg },
  mobileNavWrap: { flexShrink: 0, paddingHorizontal: spacing.md, paddingTop: spacing.xs, paddingBottom: spacing.sm, alignItems: 'center', backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
  mobileNav: { width: '100%', maxWidth: 520, minHeight: layout.mobileNavigationHeight, borderRadius: radius.floating, backgroundColor: colors.primaryDark, padding: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...(Platform.OS === 'web' ? ({ boxShadow: '0 10px 28px rgba(14,42,27,0.18)' } as const) : { shadowColor: colors.primaryDark, shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }) },
  mobileTab: { flex: 1, minWidth: 44, minHeight: 57, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', gap: 3 },
  mobileTabSelected: { backgroundColor: colors.lime },
});
