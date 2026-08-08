import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import type { ConsentDefinition } from '@sarira/shared-types';
import { spacing } from '@sarira/design-tokens';
import { AppText, Card, Chip, ErrorState, InlineNotice, Loading, Toast, Toggle } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { api } from '@/services/api';
import { useAutosave } from '@/features/onboarding/useAutosave';
import { useAuth } from '@/providers/AuthProvider';

export default function SettingsFoundationPage() {
  const [definitions, setDefinitions] = useState<ConsentDefinition[]>([]);
  const [granted, setGranted] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const autosave = useAutosave(150);
  const { refreshSession } = useAuth();
  const load = async () => {
    setLoading(true); setError(undefined);
    try {
      const [available, records] = await Promise.all([api.getAvailableConsents(), api.getConsents()]);
      setDefinitions(available);
      setGranted(Object.fromEntries(available.map((item) => [item.type, records.some((record) => record.type === item.type && record.status === 'GRANTED')])));
    } catch { setError('Consent belum dapat dimuat. Periksa koneksi dan coba kembali.'); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    let active = true;
    void Promise.all([api.getAvailableConsents(), api.getConsents()])
      .then(([available, records]) => {
        if (!active) return;
        setDefinitions(available);
        setGranted(Object.fromEntries(available.map((item) => [item.type, records.some((record) => record.type === item.type && record.status === 'GRANTED')])));
      })
      .catch(() => { if (active) setError('Consent belum dapat dimuat. Periksa koneksi dan coba kembali.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const toggle = (definition: ConsentDefinition, value: boolean) => {
    setGranted((current) => ({ ...current, [definition.type]: value }));
    autosave.schedule(definition.type, async () => {
      if (value) await api.updateConsent(definition.type, { granted: true, version: definition.version, source: 'SETTINGS' });
      else await api.revokeConsent(definition.type);
      if (definition.required) await refreshSession();
    }, true);
  };
  return <AppShell title="Pengaturan" subtitle="Consent dan kontrol data"><Card style={{ gap: spacing.md }}><View style={{ gap: spacing.xs }}><AppText variant="h2">Consent aktif</AppText><AppText variant="body">Optional consent tidak memblokir fitur lain. Menarik consent wajib akan mengembalikan akun ke tahap consent.</AppText></View>{autosave.status === 'saving' ? <Toast message="Menyimpan…" /> : autosave.status === 'saved' ? <Toast message="Tersimpan" tone="success" /> : autosave.status === 'failed' ? <Toast message="Gagal menyimpan — Coba lagi" tone="danger" action={{ label: 'Coba lagi', onPress: autosave.retry }} /> : null}{loading ? <Loading label="Memuat consent…" /> : error ? <ErrorState description={error} onRetry={() => void load()} /> : definitions.map((definition) => <View key={definition.type} style={{ gap: spacing.xs, paddingVertical: spacing.sm }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' }}><AppText variant="label">{definition.displayName}</AppText><Chip label={definition.required ? 'WAJIB' : 'OPSIONAL'} tone={definition.required ? 'neutral' : 'mint'} /></View><Toggle label={definition.displayName} description={`${definition.description} · versi ${definition.version}`} value={Boolean(granted[definition.type])} onValueChange={(next) => toggle(definition, next)} /></View>)}</Card><InlineNotice title="Izin perangkat terpisah" text="Lokasi, kamera, wearable, dan foto tubuh tidak diaktifkan paksa. Izin platform akan diminta hanya saat fitur terkait digunakan." tone="info" /><InlineNotice title="Legal review" text="Kebijakan retention, export, deletion, dan parental consent masih memerlukan keputusan Legal/Privacy sebelum production release." tone="warning" /></AppShell>;
}
