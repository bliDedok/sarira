import React from 'react';
import { Pressable, StyleSheet, Switch, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Accessibility, ChevronRight, Database, LockKeyhole, LogOut, MoonStar, ShieldCheck, Smartphone, UserRound, UsersRound } from 'lucide-react-native';
import { breakpoints, colors, radius, spacing } from '@sarira/design-tokens';
import { AppText, Button, Card, Chip, InlineNotice, SectionHeader } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { usePrototype } from '@/features/prototype/PrototypeContext';
import { screenHref } from '@/utils/routes';
import { useAuth } from '@/providers/AuthProvider';

const settingRows = [
  { title: 'Privasi & consent', description: 'Consent versioned dan penarikan izin', icon: LockKeyhole, slug: 'settings' },
  { title: 'Perangkat terhubung', description: 'Input manual dan izin perangkat', icon: Smartphone, slug: 'connected-devices' },
  { title: 'Sumber data', description: 'Provenance setiap catatan dan agregat', icon: Database, slug: 'connected-devices' },
];

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= breakpoints.desktop;
  const { activeProfile, profiles, setActiveProfile, elderMode, setElderMode, reducedMotion, setReducedMotion } = usePrototype();
  const { signOut } = useAuth();
  const logout = async () => { await signOut(); router.replace('/login' as never); };
  return (
    <AppShell title="Profil" subtitle="Akun, keluarga, dan pengaturan">
      <View style={styles.titleRow}><View style={{ flex: 1, gap: 4 }}><AppText variant="eyebrow">PROFIL AKTIF</AppText><AppText variant={desktop ? 'h1' : 'h2'}>{activeProfile.name}</AppText><AppText variant="body">Setiap catatan dan keputusan selalu terikat ke profil aktif.</AppText></View><Button label="Edit profil" icon={UserRound} variant="secondary" onPress={() => router.push(screenHref('profile') as never)} /></View>

      <View style={styles.profileGrid}>
        <Card tone="dark" style={styles.identityCard}>
          <View style={styles.avatarLarge}><AppText variant="h1" style={{ color: colors.primaryDark }}>{activeProfile.initials}</AppText></View>
          <View style={{ gap: 4 }}><Chip label={activeProfile.segment.toUpperCase()} tone="lime" /><AppText variant="h2" style={{ color: colors.white }}>{activeProfile.name}</AppText><AppText variant="body" style={{ color: '#CAD8CE' }}>Program demo · bukan hasil baseline</AppText></View>
          <InlineNotice title="Status safety demo · hijau" text="Artinya terbatas pada jawaban yang tersedia dan dapat dievaluasi ulang." tone="success" />
        </Card>
        <Card style={styles.familyCard}>
          <SectionHeader title="Ganti profil" />
          {profiles.map((profile) => (
            <Pressable key={profile.id} accessibilityRole="radio" accessibilityLabel={profile.name} accessibilityState={{ checked: activeProfile.id === profile.id }} onPress={() => setActiveProfile(profile)} style={({ pressed }) => [styles.profileRow, activeProfile.id === profile.id && styles.profileRowSelected, pressed && { opacity: 0.7 }]}>
              <View style={styles.avatarSmall}><AppText variant="caption" style={{ color: colors.white, fontFamily: 'Inter_700Bold' }}>{profile.initials}</AppText></View><View style={{ flex: 1 }}><AppText variant="label">{profile.name}</AppText><AppText variant="caption">{profile.relation} · {profile.segment}</AppText></View>{activeProfile.id === profile.id ? <ShieldCheck size={20} color={colors.primary} /> : <ChevronRight size={18} color={colors.textMuted} />}
            </Pressable>
          ))}
          <Button label="Tambah profil anak (demo)" icon={UsersRound} variant="secondary" onPress={() => router.push(screenHref('child-profile') as never)} />
        </Card>
      </View>

      <View style={styles.settingsGrid}>
        <Card style={{ flex: 1, minWidth: 300, gap: spacing.sm }}><SectionHeader title="Pengaturan data" />{settingRows.map(({ title, description, icon: Icon, slug }) => <Pressable key={title} accessibilityRole="button" accessibilityLabel={title} onPress={() => router.push((slug === 'settings' ? '/settings' : screenHref(slug)) as never)} style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.7 }]}><View style={styles.settingIcon}><Icon size={21} color={colors.primary} /></View><View style={{ flex: 1 }}><AppText variant="label">{title}</AppText><AppText variant="caption">{description}</AppText></View><ChevronRight size={18} color={colors.textMuted} /></Pressable>)}</Card>
        <Card tone="mint" style={{ flex: 1, minWidth: 300, gap: spacing.md }}><View style={styles.rowBetween}><View style={styles.settingIcon}><Accessibility size={22} color={colors.primary} /></View><Chip label="AKSESIBILITAS" tone="neutral" /></View><AppText variant="h3">Sesuaikan kenyamanan</AppText><View style={styles.toggleRow}><View style={{ flex: 1 }}><AppText variant="label">Mode lansia</AppText><AppText variant="caption">Ukuran lebih besar dan kepadatan lebih rendah.</AppText></View><Switch accessibilityLabel="Mode lansia" value={elderMode} onValueChange={setElderMode} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={elderMode ? colors.lime : colors.white} /></View><View style={styles.toggleRow}><View style={{ flex: 1 }}><AppText variant="label">Kurangi gerakan</AppText><AppText variant="caption">Mengurangi transisi yang tidak penting.</AppText></View><Switch accessibilityLabel="Kurangi gerakan" value={reducedMotion} onValueChange={setReducedMotion} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={reducedMotion ? colors.lime : colors.white} /></View><Button label="Pengaturan lengkap" variant="secondary" onPress={() => router.push(screenHref('accessibility-settings') as never)} /></Card>
      </View>

      <Card tone="cream" style={styles.footerCard}><View style={styles.settingIcon}><MoonStar size={21} color={colors.information} /></View><View style={{ flex: 1 }}><AppText variant="label">Fitur kesehatan masih memakai mock data terpisah.</AppText><AppText variant="caption">Keluar menghapus sesi auth lokal, bukan data server.</AppText></View><Button label="Keluar" icon={LogOut} variant="ghost" onPress={() => void logout()} /></Card>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md },
  profileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  identityCard: { flex: 1, minWidth: 300, minHeight: 320, gap: spacing.lg, borderColor: colors.primaryDark },
  avatarLarge: { width: 82, height: 82, borderRadius: 28, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  familyCard: { flex: 1, minWidth: 300, gap: spacing.sm },
  profileRow: { minHeight: 64, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.input, padding: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  profileRowSelected: { borderColor: colors.primary, backgroundColor: colors.softMint },
  avatarSmall: { width: 40, height: 40, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  settingsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  settingRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: spacing.xs },
  settingIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  toggleRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  footerCard: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.md },
});
