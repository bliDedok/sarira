import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { spacing } from '@sarira/design-tokens';
import { AppText, Button, Field, InlineNotice } from '@sarira/ui';
import { emailSchema } from '@sarira/validation';
import { PublicScreen } from '@/components/ScreenLayout';
import { useAuth } from '@/providers/AuthProvider';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string>();
  const { resetPassword } = useAuth();
  const submit = async () => {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) return setMessage(parsed.error.issues[0]?.message);
    try { await resetPassword(parsed.data); setMessage('Jika akun tersedia, petunjuk reset telah dikirim.'); }
    catch { setMessage('Permintaan belum dapat diproses. Coba kembali nanti.'); }
  };
  return <PublicScreen showBack maxWidth={560}><View style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}><AppText variant="h1">Reset kata sandi</AppText><AppText variant="bodyLarge">Kami selalu menggunakan respons netral agar keberadaan akun tidak terungkap.</AppText>{message ? <InlineNotice title="Status" text={message} tone="info" /> : null}<Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /><Button label="Kirim petunjuk reset" variant="lime" onPress={() => void submit()} /><Button label="Kembali ke login" variant="ghost" onPress={() => router.replace('/login' as never)} /></View></PublicScreen>;
}
