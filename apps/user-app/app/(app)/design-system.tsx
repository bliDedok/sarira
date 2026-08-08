import React, { useState } from 'react';
import { StyleSheet, Switch, View, useWindowDimensions } from 'react-native';
import { ArrowRight, Check, Heart, Plus, TriangleAlert } from 'lucide-react-native';
import { breakpoints, colors, radius, spacing, typography } from '@sarira/design-tokens';
import { AppText, Button, Card, Chip, Field, IconButton, InlineNotice, LimitIndicator, ProgressBar, ProgressRing, SelectionCard, StatusPill } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';

const swatches = [
  ['Primary Green', colors.primary], ['Primary Dark', colors.primaryDark], ['Lime Accent', colors.lime],
  ['Soft Lime', colors.softLime], ['Soft Mint', colors.softMint], ['Warm Cream', colors.warmCream],
  ['Surface Soft', colors.surfaceSoft], ['Information', colors.information], ['Warning', colors.warning], ['Danger', colors.danger],
];

export default function DesignSystemPage() {
  const { width } = useWindowDimensions();
  const desktop = width >= breakpoints.desktop;
  const [toggle, setToggle] = useState(true);
  const [selected, setSelected] = useState('guided');
  return (
    <AppShell title="Design system" subtitle="SARIRA Active Balance · v0.1">
      <View style={styles.intro}><View style={{flex:1,gap:4}}><AppText variant="eyebrow">FOUNDATIONS & COMPONENTS</AppText><AppText variant={desktop?'h1':'h2'}>Aktif, ramah, premium—tetap aman.</AppText><AppText variant="body">Lime digunakan untuk action, selected state, progress, Weekly Action, dan success marker; bukan sebagai latar dominan.</AppText></View><Chip label="INTER · RESPONSIVE" tone="lime" /></View>

      <Card style={styles.section}><AppText variant="h2">Warna</AppText><View style={styles.swatchGrid}>{swatches.map(([name,color]) => <View key={name} style={styles.swatchItem}><View style={[styles.swatch,{backgroundColor:color}]} /><AppText variant="label">{name}</AppText><AppText variant="caption">{color}</AppText></View>)}</View></Card>

      <Card style={styles.section}><AppText variant="h2">Tipografi</AppText><View style={styles.typeList}><AppText variant="display">Display · {typography.display}</AppText><AppText variant="h1">Heading 1 · {typography.h1}</AppText><AppText variant="h2">Heading 2 · {typography.h2}</AppText><AppText variant="h3">Heading 3 · {typography.h3}</AppText><AppText variant="bodyLarge">Body Large nyaman untuk konteks penting.</AppText><AppText variant="body">Body menjaga keterbacaan pada mobile, tablet, dan desktop.</AppText><AppText variant="caption">Caption · sumber, unit, dan limitation tetap dapat dibaca.</AppText></View></Card>

      <Card style={styles.section}><AppText variant="h2">Button states</AppText><View style={styles.wrap}><Button label="Primary" icon={ArrowRight} /><Button label="Lime action" icon={Plus} variant="lime" /><Button label="Secondary" variant="secondary" /><Button label="Ghost" variant="ghost" /><Button label="Danger" variant="danger" /><Button label="Disabled" disabled /><Button label="Loading" loading /><IconButton icon={Heart} label="Favorit" selected /></View><InlineNotice title="Touch target minimum 44 × 44" text="Focus ring terlihat, label screen reader tersedia, dan state tidak hanya dibedakan dengan warna." tone="success" /></Card>

      <Card style={styles.section}><AppText variant="h2">Input & selection</AppText><View style={styles.fieldGrid}><Field label="Text input" placeholder="Masukkan catatan" helper="Helper text yang jelas." /><Field label="Search" placeholder="Cari bahan" /></View><View style={styles.wrap}><Chip label="Default" /><Chip label="Selected" selected /><Chip label="Warning" tone="warning" icon={TriangleAlert} /><Chip label="Success" tone="mint" icon={Check} /></View><View style={styles.selectionGrid}><SelectionCard title="Guided Meal" description="Menu terarah" selected={selected==='guided'} onPress={()=>setSelected('guided')} tone="lime" /><SelectionCard title="Flex Kitchen" description="Susun dari bahan yang ada" selected={selected==='flex'} onPress={()=>setSelected('flex')} tone="mint" /></View><View style={styles.toggleRow}><View><AppText variant="label">Toggle contoh</AppText><AppText variant="caption">Label menjelaskan dampak perubahan.</AppText></View><Switch accessibilityLabel="Toggle contoh" value={toggle} onValueChange={setToggle} trackColor={{false:colors.border,true:colors.primary}} thumbColor={toggle?colors.lime:colors.white}/></View></Card>

      <Card style={styles.section}><AppText variant="h2">Progress & status</AppText><View style={styles.wrap}><ProgressRing value={70} trackColor={colors.primaryDark}/><View style={{minWidth:240,gap:spacing.sm}}><AppText variant="label">Protein · minimum</AppText><ProgressBar value={48} max={72} label="Protein 48 dari minimum 72 gram" /><LimitIndicator label="Natrium" value={1650} max={2000}/></View></View><View style={styles.wrap}><StatusPill status="green"/><StatusPill status="yellow"/><StatusPill status="red"/><StatusPill status="unknown"/></View></Card>

      <View style={styles.cardGrid}><Card tone="dark" style={styles.sampleCard}><Chip label="WEEKLY ACTION" tone="lime"/><AppText variant="h2" style={{color:colors.white}}>Satu sumber protein pada sarapan.</AppText><AppText variant="body" style={{color:'#CAD8CE'}}>2 dari 4 hari · Data confidence sedang.</AppText><Button label="Catat hari ini" variant="lime" /></Card><Card tone="mint" style={styles.sampleCard}><Chip label="PATTERN MAP" tone="neutral"/><AppText variant="h2">Pola dapat dijelaskan.</AppText><AppText variant="body">Data, rule, evidence, limitation, dan sumber ditampilkan terpisah.</AppText><Button label="Mengapa?" variant="secondary" /></Card><Card tone="peach" style={styles.sampleCard}><Chip label="REFERRAL" tone="danger"/><AppText variant="h2">Bantuan lebih dulu.</AppText><AppText variant="body">Saran terkait dibekukan dan next step tetap tersedia tanpa AI.</AppText><Button label="Lihat langkah aman" variant="danger" /></Card></View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  intro:{flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:spacing.md},
  section:{gap:spacing.lg,padding:spacing.xl},
  swatchGrid:{flexDirection:'row',flexWrap:'wrap',gap:spacing.md},
  swatchItem:{width:130,gap:4},
  swatch:{height:76,borderRadius:radius.input,borderWidth:1,borderColor:colors.border},
  typeList:{gap:spacing.md},
  wrap:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',gap:spacing.sm},
  fieldGrid:{flexDirection:'row',flexWrap:'wrap',gap:spacing.md},
  selectionGrid:{gap:spacing.sm},
  toggleRow:{minHeight:64,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:spacing.sm},
  cardGrid:{flexDirection:'row',flexWrap:'wrap',gap:spacing.md},
  sampleCard:{flex:1,minWidth:270,minHeight:280,justifyContent:'space-between',gap:spacing.md},
});
