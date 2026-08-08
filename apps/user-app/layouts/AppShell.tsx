import React, { ReactNode, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, usePathname } from 'expo-router';
import {
  Activity,
  Bell,
  ChartNoAxesCombined,
  Compass,
  Home,
  PanelsTopLeft,
  SwatchBook,
  UserRound,
  Utensils,
} from 'lucide-react-native';
import { colors, radius, spacing } from '@sarira/design-tokens';
import { AppText, Chip, IconButton } from '@sarira/ui';
import { BrandMark } from '@/components/ScreenLayout';
import { usePrototype } from '@/features/prototype/PrototypeContext';
import { screenHref } from '@/utils/routes';
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

const prototypeNav = [
  { label: 'Semua layar', path: '/screens', icon: PanelsTopLeft },
  { label: 'User flow', path: '/flows', icon: Compass },
  { label: 'Design system', path: '/design-system', icon: SwatchBook },
];

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
  const selected = path === '/home' ? pathname === '/home' : pathname.startsWith(path);
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
          const selected = pathname === path;
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
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.shell}>
        {!isMobile ? (
          <View style={[styles.sidebar, isTablet && styles.sidebarCompact]}>
            <View style={styles.sidebarBrand}>
              <BrandMark compact={isTablet} inverse />
            </View>
            <View style={styles.sidebarSection}>
              {primaryNav.map((item) => <NavItem key={item.path} {...item} compact={isTablet} />)}
            </View>
            <View style={styles.sidebarDivider} />
            <View style={styles.sidebarSection}>
              {!isTablet ? <AppText variant="eyebrow" style={{ color: '#91A498', paddingHorizontal: spacing.sm }}>PROTOTYPE</AppText> : null}
              {prototypeNav.map((item) => <NavItem key={item.path} {...item} compact={isTablet} />)}
            </View>
            {!isTablet ? (
              <View style={styles.sidebarDemoCard}>
                <Chip label="PHASE 4" tone="lime" />
                <AppText variant="label" style={{ color: colors.white }}>Baseline nyata</AppText>
                <AppText variant="caption" style={{ color: '#BDD0C4' }}>Tracking, kelengkapan data, checkpoint, dan readiness aktif. AI, Pattern Map, nutrition engine, kamera, dan wearable tetap Demo.</AppText>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.main}>
          <View style={[styles.header, elderMode && { minHeight: 92 }]}>
            <View style={styles.headerTitle}>
              {isMobile ? <BrandMark compact /> : null}
              {title ? (
                <View style={{ gap: 1 }}>
                  <AppText variant="h3">{title}</AppText>
                  {subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}
                </View>
              ) : null}
            </View>
            <View style={styles.headerActions}>
              <IconButton icon={Bell} label="Notifikasi, 2 belum dibaca" onPress={() => router.push(screenHref('weekly-action') as never)} />
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
  sidebarDivider: { height: 1, backgroundColor: '#294535', marginVertical: spacing.xs },
  navItem: { minHeight: 48, borderRadius: radius.input, paddingHorizontal: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 2, borderColor: 'transparent' },
  navItemCompact: { width: 52, justifyContent: 'center', paddingHorizontal: 0 },
  navItemSelected: { backgroundColor: colors.lime },
  navItemFocused: { borderColor: colors.white },
  sidebarDemoCard: { marginTop: 'auto', borderWidth: 1, borderColor: '#365643', borderRadius: radius.card, padding: spacing.md, gap: spacing.sm, backgroundColor: '#153624' },
  main: { flex: 1, minWidth: 0, backgroundColor: colors.surfaceSoft },
  header: { minHeight: 76, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  profileSwitcher: { minHeight: 48, borderRadius: radius.pill, padding: 5, paddingRight: spacing.sm, backgroundColor: colors.surfaceSoft, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  content: { width: '100%', alignSelf: 'center', padding: spacing.xl, paddingBottom: spacing.huge, gap: spacing.lg },
  contentMobile: { padding: spacing.md, paddingBottom: 118 },
  mobileNavWrap: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.sm, alignItems: 'center' },
  mobileNav: { width: '100%', maxWidth: 520, minHeight: 72, borderRadius: radius.floating, backgroundColor: colors.primaryDark, padding: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...(Platform.OS === 'web' ? ({ boxShadow: '0 16px 40px rgba(14,42,27,0.24)' } as const) : { shadowColor: colors.primaryDark, shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } }) },
  mobileTab: { flex: 1, minWidth: 44, minHeight: 57, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', gap: 3 },
  mobileTabSelected: { backgroundColor: colors.lime },
});
