import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { colors, spacing } from '@sarira/design-tokens';
import { AppText, Button, Chip, Field, InlineNotice } from '@sarira/ui';
import { registerSchema } from '@sarira/validation';
import { PublicScreen } from '@/components/ScreenLayout';
import { useAuth } from '@/providers/AuthProvider';
import { useMockData } from '@/services/environment';

export default function RegisterPage() {
  const [name, setName] = useState(useMockData ? 'Ayu' : '');
  const [email, setEmail] = useState(useMockData ? 'ayu@contoh.id' : '');
  const [password, setPassword] = useState(useMockData ? 'DemoPassword1' : '');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const submit = async () => {
    const parsed = registerSchema.safeParse({ name, email, password });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? 'Periksa isian.');
    setLoading(true); setError(undefined);
    try { const session = await signUp(parsed.data.email, parsed.data.password, parsed.data.name); router.replace(`/setup/${session.currentStep}` as never); }
    catch { setError('Akun belum dapat dibuat. Periksa konfigurasi auth atau coba kembali.'); }
    finally { setLoading(false); }
  };

  return (
    <PublicScreen showBack maxWidth={580}>
      <View style={styles.form}>
        <Chip label="LANGKAH 1 DARI 9" tone="lime" />
        <View style={{ gap: spacing.xs }}><AppText variant="h1">Buat akun</AppText><AppText variant="bodyLarge">Mulai dengan identitas dasar. Setelah itu, kamu dapat memilih peran, mengonfirmasi usia, dan mengatur persetujuan data dengan jelas.</AppText></View>
        {error ? <InlineNotice title="Registrasi belum selesai" text={error} tone="danger" /> : null}
        <Field label="Nama panggilan" value={name} onChangeText={setName} autoComplete="name" />
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        <Field label="Kata sandi" value={password} onChangeText={setPassword} secureTextEntry helper="Minimal 12 karakter, huruf besar, huruf kecil, dan angka." autoComplete="new-password" />
        <Button label="Buat akun dan pilih peran" icon={ArrowRight} variant="lime" onPress={() => void submit()} loading={loading} fullWidth />
        <View style={styles.divider} /><Button label="Sudah punya akun" variant="ghost" onPress={() => router.replace('/login' as never)} />
      </View>
    </PublicScreen>
  );
}

const styles = StyleSheet.create({ form: { flex: 1, justifyContent: 'center', gap: spacing.lg, paddingBottom: spacing.xl }, divider: { height: 1, backgroundColor: colors.border } });
