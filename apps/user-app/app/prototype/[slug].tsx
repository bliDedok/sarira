import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, InlineNotice } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { PageIntro, PrototypeFooter } from '@/components/ScreenLayout';
import { prototypeScreenMap } from '@/mocks/prototypeScreens';
import { PrototypeScreenRenderer } from '@/features/prototype/PrototypeScreenRenderer';
import { screenHref } from '@/utils/routes';

export default function DynamicPrototypeScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0]! : params.slug ?? '';
  const screen = prototypeScreenMap.get(slug);
  if (!screen) {
    return <AppShell title="Layar tidak ditemukan"><InlineNotice title="Route tidak tersedia" text="Buka inventaris untuk memilih salah satu dari 60 layar prototype." tone="danger" /><Button label="Buka inventaris" variant="lime" onPress={() => router.replace('/screens' as never)} /></AppShell>;
  }
  return (
    <AppShell title={screen.title} subtitle={`${screen.category} · Layar ${screen.number} dari 60`}>
      <PageIntro eyebrow={screen.eyebrow} title={screen.title} description={screen.description} simulated={screen.simulation} action={{ label: 'Inventaris layar', onPress: () => router.push('/screens' as never) }} />
      <PrototypeScreenRenderer screen={screen} />
      <PrototypeFooter nextLabel={screen.next ? `Lanjut · ${prototypeScreenMap.get(screen.next)?.title ?? 'layar berikutnya'}` : 'Kembali ke Beranda'} onNext={() => router.push((screen.next ? screenHref(screen.next) : '/home') as never)} />
    </AppShell>
  );
}
