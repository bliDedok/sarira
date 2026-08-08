import React, { useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, Check, ChevronRight, GitBranch } from 'lucide-react-native';
import { breakpoints, colors, radius, spacing } from '@sarira/design-tokens';
import { AppText, Button, Card, Chip, InlineNotice } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';
import { flowGroups } from '@/mocks/data';
import { prototypeScreenMap } from '@/mocks/prototypeScreens';
import { screenHref } from '@/utils/routes';

export default function FlowsPage() {
  const { width } = useWindowDimensions();
  const desktop = width >= breakpoints.desktop;
  const [active, setActive] = useState(flowGroups[0]!.id);
  return (
    <AppShell title="User flow" subtitle="Tujuh flow prioritas dapat diklik">
      <View style={styles.intro}><View style={{ flex: 1, gap: 4 }}><AppText variant="eyebrow">CLICKABLE FLOW</AppText><AppText variant={desktop ? 'h1' : 'h2'}>Uji alur, guard, dan jalur aman.</AppText><AppText variant="body">Setiap node membuka layar prototype. Jalur safety merah selalu mengutamakan referral.</AppText></View><Button label="Mulai flow dewasa" icon={ArrowRight} variant="lime" onPress={() => router.push('/' as never)} /></View>
      <InlineNotice title="Data dan rule tetap simulasi" text="Flow dapat diuji, tetapi tidak memvalidasi trigger klinis, legal consent, atau formula nutrisi." tone="warning" />
      <View style={styles.tabs}>{flowGroups.map((flow) => <Chip key={flow.id} label={flow.title.replace(/Flow \d · /, '')} selected={active === flow.id} onPress={() => setActive(flow.id)} />)}</View>
      {flowGroups.map((flow) => active === flow.id ? <Card key={flow.id} tone="white" style={styles.flowCard}><View style={styles.flowHeader}><View style={styles.flowIcon}><GitBranch size={24} color={colors.primary} /></View><View style={{ flex: 1 }}><AppText variant="h2">{flow.title}</AppText><AppText variant="body">{flow.steps.length} node · klik untuk membuka layar</AppText></View><Chip label="CLICKABLE" tone="lime" /></View><View style={styles.flowNodes}>{flow.steps.map((slug, index) => { const screen=prototypeScreenMap.get(slug); return <React.Fragment key={slug}><Pressable accessibilityRole="link" accessibilityLabel={screen?.title ?? slug} onPress={() => router.push(screenHref(slug) as never)} style={({ pressed }) => [styles.node, pressed && { opacity:.7 }]}><View style={styles.nodeNumber}><AppText variant="caption" style={{ fontFamily:'Inter_700Bold' }}>{index+1}</AppText></View><View style={{ flex:1 }}><AppText variant="label">{screen?.title ?? slug}</AppText><AppText variant="caption">{screen?.category ?? 'Flow'}</AppText></View><ChevronRight size={18} color={colors.textMuted}/></Pressable>{index < flow.steps.length-1 ? <View style={styles.connector}/> : null}</React.Fragment>; })}</View><Button label="Mulai flow ini" icon={ArrowRight} variant="secondary" onPress={()=>router.push(screenHref(flow.steps[0]!) as never)} /></Card> : null)}
      <Card tone="mint" style={styles.guardCard}><View style={styles.checkIcon}><Check size={22} color={colors.primaryDark} strokeWidth={3}/></View><View style={{flex:1}}><AppText variant="h3">Guard yang dapat diperiksa</AppText><AppText variant="body">Usia remaja → consent wali; safety unknown → bukan hijau; red → referral; wearable ditolak → manual fallback; data kurang → insufficient; makanan → tanpa transaksi.</AppText></View></Card>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  intro: { flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:spacing.md },
  tabs: { flexDirection:'row',flexWrap:'wrap',gap:spacing.xs },
  flowCard: { gap:spacing.xl,padding:spacing.xl },
  flowHeader: { flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:spacing.md },
  flowIcon: { width:52,height:52,borderRadius:18,backgroundColor:colors.softMint,alignItems:'center',justifyContent:'center' },
  flowNodes: { gap:0 },
  node: { minHeight:68,borderWidth:1,borderColor:colors.border,borderRadius:radius.input,padding:spacing.sm,flexDirection:'row',alignItems:'center',gap:spacing.sm,backgroundColor:colors.white },
  nodeNumber: { width:34,height:34,borderRadius:17,backgroundColor:colors.softLime,alignItems:'center',justifyContent:'center' },
  connector: { width:2,height:20,backgroundColor:colors.primary,marginLeft:29 },
  guardCard: { flexDirection:'row',alignItems:'center',gap:spacing.md },
  checkIcon: { width:48,height:48,borderRadius:18,backgroundColor:colors.lime,alignItems:'center',justifyContent:'center' },
});
