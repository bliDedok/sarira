import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LogIn } from 'lucide-react-native';
import { colors, spacing } from '@sarira/design-tokens';
import { AppText, Button, Chip, Field, InlineNotice } from '@sarira/ui';
import { loginSchema } from '@sarira/validation';
import { PublicScreen } from '@/components/ScreenLayout';
import { useAuth } from '@/providers/AuthProvider';
import { useMockData } from '@/services/environment';

export default function LoginPage() {
  const [email, setEmail] = useState(useMockData ? 'ayu@contoh.id' : '');
  const [password, setPassword] = useState(useMockData ? 'DemoPassword1' : '');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const submit = async () => {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? 'Periksa isian.');
    setLoading(true); setError(undefined);
    try { const session = await signIn(parsed.data.email, parsed.data.password); router.replace((session.onboardingCompleted ? '/home' : `/setup/${session.currentStep}`) as never); }
    catch { setError('Email atau kata sandi tidak valid, atau layanan auth belum tersedia.'); }
    finally { setLoading(false); }
  };

  return (
    <PublicScreen showBack maxWidth={560}>
      <View style={styles.form}>
        <Chip label={useMockData ? 'DEVELOPMENT AUTH ADAPTER' : 'SUPABASE AUTH'} tone="lime" />
        <View style={{ gap: spacing.xs }}><AppText variant="h1">Masuk ke SARIRA</AppText><AppText variant="bodyLarge">Sesi dipulihkan otomatis dan route pribadi dilindungi oleh auth guard.</AppText></View>
        {useMockData ? <InlineNotice title="Development mode" text="Akun dan onboarding tetap berjalan melalui API; hanya identity provider yang diganti adapter lokal karena credential Supabase tidak disimpan di repository." tone="info" /> : null}
        {error ? <InlineNotice title="Tidak dapat masuk" text={error} tone="danger" /> : null}
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        <Field label="Kata sandi" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" />
        <Button label="Masuk" icon={LogIn} variant="lime" onPress={() => void submit()} loading={loading} fullWidth />
        <Button label="Lupa kata sandi?" variant="ghost" onPress={() => router.push('/reset-password' as never)} />
        <View style={styles.divider} /><AppText variant="caption" style={{ textAlign: 'center' }}>Belum punya akun?</AppText>
        <Button label="Buat akun" variant="secondary" onPress={() => router.replace('/register' as never)} fullWidth />
      </View>
    </PublicScreen>
  );
}

const styles = StyleSheet.create({ form: { flex: 1, justifyContent: 'center', gap: spacing.lg, paddingBottom: spacing.xl }, divider: { height: 1, backgroundColor: colors.border } });
