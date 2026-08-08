import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { router } from 'expo-router';
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  Database,
  Info,
  Leaf,
  Link2,
  ListChecks,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  Timer,
  TriangleAlert,
} from 'lucide-react-native';
import { colors, radius, spacing } from '@sarira/design-tokens';
import type { PrototypeScreenDefinition } from '@sarira/shared-types';
import { AppText, Button, Card, Chip, Field, InlineNotice, ProgressBar, ProgressRing, SelectionCard, StatusPill } from '@sarira/ui';
import { citations, nutritionSummary, patternData } from '@/mocks/data';

function HighlightList({ items }: { items: string[] }) {
  return <View style={styles.list}>{items.map((item) => <View key={item} style={styles.listItem}><View style={styles.listCheck}><Check size={14} color={colors.primaryDark} strokeWidth={3} /></View><AppText variant="body" style={{ flex: 1 }}>{item}</AppText></View>)}</View>;
}

function FormDemo({ screen }: { screen: PrototypeScreenDefinition }) {
  const [selected, setSelected] = useState('realistic');
  if (screen.slug === 'food-scan') {
    return <><Card tone="soft" style={styles.cameraMock}><View style={styles.cameraCorners}><Camera size={52} color={colors.primary} strokeWidth={1.5} /><AppText variant="h3">Area kamera simulasi</AppText><AppText variant="body" style={{ textAlign: 'center' }}>Pilih foto contoh lalu konfirmasi makanan dan bahan. Prototype tidak menebak kandungan gizi.</AppText><Button label="Pilih foto demo" icon={Camera} variant="secondary" onPress={() => undefined} /></View></Card><InlineNotice title="Konfirmasi selalu diperlukan" text="Foto bukan input langsung untuk diagnosis, allergen, atau angka nutrisi." tone="warning" /></>;
  }
  if (screen.slug === 'digestive-support') {
    return <><View style={styles.twoColumns}><Field label="Waktu keluhan" value="14.30" /><Field label="Intensitas demo" value="3 dari 5" /></View><Field label="Keluhan yang dicatat" value="Perut terasa tidak nyaman" helper="Label penyakit tidak diberikan." /><Field label="Makanan terdekat" value="Makan siang · 12.45" helper="Hubungan ini hanya temporal, bukan sebab." /><InlineNotice title="Safety diperiksa saat disimpan" text="Red flag tidak menunggu Hari 7 atau 14. Trigger klinis belum diimplementasikan dalam prototype." tone="warning" /></>;
  }
  if (screen.slug === 'mobility-check-in') {
    return <><AppText variant="label">Bagaimana kenyamanan bergerak hari ini?</AppText><View style={styles.selectionGrid}>{['Nyaman seperti biasa','Ada sedikit perubahan','Perlu bantuan'].map((label, index) => <SelectionCard key={label} title={label} description={index === 2 ? 'Akan membuka pemeriksaan safety tambahan.' : 'Jawaban dapat diubah.'} selected={selected === label} onPress={() => setSelected(label)} tone={index === 2 ? 'peach' : 'mint'} />)}</View><Field label="Catatan opsional" placeholder="Ceritakan perubahan yang terasa" multiline numberOfLines={3} /><InlineNotice title="Simpan sebagian tersedia" text="Mode lansia memperbesar teks, tombol, dan jarak antar komponen." tone="info" /></>;
  }
  return <><Field label="Catatan demo" value={screen.description} multiline numberOfLines={3} helper="Data ini hanya hidup selama sesi prototype." /><AppText variant="label">Pilih kondisi yang paling mendekati</AppText><View style={styles.chipRow}>{['Sesuai kondisi', 'Belum yakin', 'Lewati dulu'].map((label, index) => <Chip key={label} label={label} selected={selected === String(index)} onPress={() => setSelected(String(index))} />)}</View><InlineNotice title="Jawaban dapat diubah" text="Perubahan data yang dipakai hasil akan memicu evaluasi ulang yang terlihat." tone="info" /></>;
}

function DashboardDemo({ screen }: { screen: PrototypeScreenDefinition }) {
  return <><View style={styles.heroGrid}><Card tone="dark" style={styles.dashboardHero}><View style={styles.rowBetween}><Chip label={screen.eyebrow} tone="lime" /><ProgressRing value={71} /></View><AppText variant="h2" style={{ color: colors.white }}>{screen.title}</AppText><AppText variant="body" style={{ color: '#CAD8CE' }}>{screen.description}</AppText><ProgressBar value={10} max={14} tone="lime" label="Baseline 10 dari 14 hari" /></Card><Card tone="lime" style={styles.dashboardSide}><View style={styles.iconCircle}><ListChecks size={24} color={colors.primary} /></View><AppText variant="h3">Tiga hal utama</AppText><HighlightList items={screen.highlights} /></Card></View><InlineNotice title="Tidak ada health score" text="Data, Rule, dan Evidence confidence tidak digabung menjadi satu angka kesehatan." tone="success" /></>;
}

function StatusDemo({ screen }: { screen: PrototypeScreenDefinition }) {
  const status = screen.slug.includes('guardian') ? 'unknown' : 'green';
  return <><Card tone={status === 'unknown' ? 'cream' : 'mint'} style={styles.statusCard}><StatusPill status={status} /><AppText variant="h2">{screen.title}</AppText><AppText variant="bodyLarge">{screen.description}</AppText><HighlightList items={screen.highlights} /></Card><InlineNotice title="State selalu memiliki teks" text="Warna membantu hierarki, tetapi arti, pembatasan, dan next step selalu ditulis." tone="info" /></>;
}

function PatternDemo({ screen }: { screen: PrototypeScreenDefinition }) {
  if (screen.slug === 'citation-card') {
    const citation = citations[0]!;
    return <><Card tone="cream" style={styles.citation}><View style={styles.rowBetween}><View style={styles.iconCircle}><BookOpen size={23} color={colors.primary} /></View><Chip label="METADATA SIMULASI" tone="lime" /></View><AppText variant="h2">{citation.title}</AppText><View style={styles.metaTable}>{[['Publisher',citation.publisher],['Tahun / review',citation.year],['Jenis bukti',citation.evidenceType],['Kelompok usia',citation.ageGroup],['Mendukung',citation.supports],['Keterbatasan',citation.limitation]].map(([label,value]) => <View key={label} style={styles.metaRow}><AppText variant="caption">{label}</AppText><AppText variant="body" style={{ flex: 1 }}>{value}</AppText></View>)}</View><Button label="Tautan asli belum diaktifkan" icon={Link2} variant="secondary" disabled /></Card><InlineNotice title="Approved-only pada production" text="Draft, expired, withdrawn, atau sumber yang tidak applicable tidak boleh diambil oleh RAG." tone="warning" /></>;
  }
  const digestive = screen.slug === 'complaint-pattern';
  const growth = screen.slug.includes('growth');
  return <><Card tone="dark" style={styles.patternHero}><View style={styles.rowBetween}><Chip label={screen.eyebrow} tone="lime" /><Chip label="HASIL SIMULASI" tone="mint" /></View><AppText variant="h2" style={{ color: colors.white }}>{digestive ? 'Keluhan tercatat di sekitar waktu makan' : growth ? 'Kebiasaan tidur lebih konsisten' : patternData.title}</AppText><AppText variant="bodyLarge" style={{ color: '#D1DED5' }}>{digestive ? '4 observasi tercatat dalam jendela waktu demo setelah makan. Data ini tidak menunjukkan makanan sebagai penyebab.' : growth ? '6 dari 8 catatan terakhir memiliki waktu tidur yang lebih serupa. Tidak ada prediksi atau janji pertambahan tinggi.' : patternData.observation}</AppText></Card><View style={styles.confidenceGrid}>{[['Data Confidence',patternData.dataConfidence,'Cakupan dan kualitas data pengguna'],['Rule Confidence',patternData.ruleConfidence,'Kecocokan input dengan rule berversi'],['Evidence Strength',patternData.evidenceStrength,'Kekuatan dan relevansi sumber']].map(([title,value,description], index) => <Card key={title} tone={index===0?'mint':index===1?'lime':'blue'} style={styles.confidenceCard}><CircleDot size={21} color={colors.primary} /><AppText variant="label">{title}</AppText><AppText variant="h3">{value}</AppText><AppText variant="caption">{description}</AppText></Card>)}</View><View style={styles.twoColumns}><Card style={{ flex: 1, gap: spacing.sm }}><AppText variant="h3">Data yang dipakai</AppText><HighlightList items={patternData.used} /></Card><Card tone="cream" style={{ flex: 1, gap: spacing.sm }}><AppText variant="h3">Data yang masih kurang</AppText><HighlightList items={patternData.missing} /></Card></View><InlineNotice title="Bukan diagnosis" text={digestive ? 'Association temporal tidak berarti kausalitas, intoleransi, alergi, atau penyakit.' : 'Hasil menjelaskan pola yang tercatat dan keterbatasannya.'} tone="warning" /></>;
}

function NutritionDemo({ screen }: { screen: PrototypeScreenDefinition }) {
  const [servings, setServings] = useState(2);
  const fullMetrics = [...nutritionSummary, { id:'carbs',label:'Karbohidrat',value:176,target:250,unit:'g',type:'rentang',status:'Berada dalam rentang demo' }, {id:'fat',label:'Lemak',value:48,target:67,unit:'g',type:'rentang',status:'Berada dalam rentang demo'}, {id:'fluid',label:'Cairan',value:1250,target:2000,unit:'ml',type:'rentang',status:'Masih perlu dilengkapi'}, {id:'diversity',label:'Keragaman',value:4,target:6,unit:'kelompok',type:'minimum',status:'Masih membutuhkan variasi'}];
  const builder = screen.slug === 'recipe-builder' || screen.slug === 'adjustment-suggestion';
  return <>{builder ? <Card tone="mint" style={{ gap: spacing.md }}><View style={styles.rowBetween}><View><AppText variant="eyebrow">RECIPE BUILDER</AppText><AppText variant="h3">Sup tahu sayur · demo</AppText></View><Chip label="KALKULASI SIMULASI" tone="lime" /></View>{[['Tahu putih','160 g'],['Wortel','100 g'],['Jagung','120 g']].map(([name,amount]) => <View key={name} style={styles.ingredientRow}><View style={styles.ingredientIcon}><Leaf size={18} color={colors.primary} /></View><AppText variant="label" style={{ flex: 1 }}>{name}</AppText><AppText variant="body">{amount}</AppText><Button label="Ubah" variant="ghost" onPress={() => undefined} /></View>)}<View style={styles.servingRow}><AppText variant="label">Jumlah porsi</AppText><View style={styles.counter}><Button label="−" variant="secondary" onPress={() => setServings((value)=>Math.max(1,value-1))} /><AppText variant="h3">{servings}</AppText><Button label="+" variant="secondary" onPress={() => setServings((value)=>value+1)} /></View></View></Card> : null}<View style={styles.nutritionGrid}><Card tone="dark" style={styles.energyCard}><AppText variant="eyebrow" style={{ color: colors.lime }}>ENERGI · RENTANG</AppText><ProgressRing value={74} size={96} /><AppText variant="h2" style={{ color: colors.white }}>1.420 kkal</AppText><AppText variant="caption" style={{ color: '#CAD8CE' }}>Target demo 1.800–2.000 kkal</AppText></Card>{fullMetrics.slice(1).map((metric) => <Card key={metric.id} tone={metric.type==='batas'?'cream':'white'} style={styles.metricCard}><View style={styles.rowBetween}><AppText variant="label">{metric.label}</AppText><Chip label={metric.type.toUpperCase()} tone={metric.type==='batas'?'warning':'neutral'} /></View><AppText variant="h3">{Math.round(metric.value/servings*2).toLocaleString('id-ID')} <AppText variant="caption">{metric.unit}</AppText></AppText><ProgressBar value={metric.value} max={metric.target} tone={metric.type==='batas' && metric.value/metric.target>.8?'warning':'primary'} label={`${metric.label} ${metric.value} dari ${metric.target} ${metric.unit}`} /><AppText variant="caption">{metric.status}.</AppText></Card>)}</View><InlineNotice title="Angka adalah mock data" text="Formula, target, dataset, definisi gula, keragaman, dan toleransi menu belum disetujui ahli. AI tidak menghitung atau menebak angka." tone="warning" /></>;
}

function RecipeDemo({ screen }: { screen: PrototypeScreenDefinition }) {
  const cooking = screen.slug === 'cooking-mode';
  return <><Card tone="cream" style={styles.recipeHero}><View style={styles.recipeVisual}><View style={styles.plate}><View style={styles.recipeFood} /><View style={styles.recipeAccent} /></View></View><View style={{ flex: 1, minWidth: 240, gap: spacing.sm }}><Chip label={screen.eyebrow} tone="lime" /><AppText variant="h2">{cooking ? 'Masukkan sayur setelah kuah mendidih' : 'Nasi merah, ayam bumbu kuning & urap'}</AppText><AppText variant="body">{cooking ? 'Langkah 2 dari 5 · gunakan timer sesuai kebutuhan.' : '2 porsi · 35 menit · ± Rp28.000 per porsi · sumber resep demo.'}</AppText><View style={styles.chipRow}><Chip label="610 kkal" tone="neutral" /><Chip label="32 g protein" tone="mint" /><Chip label="Allergen: udang tidak ada" tone="lime" /></View></View></Card>{cooking ? <Card tone="dark" style={styles.timerCard}><Timer size={32} color={colors.lime} /><View style={{ flex: 1 }}><AppText variant="h1" style={{ color: colors.white }}>08:00</AppText><AppText variant="caption" style={{ color: '#CAD8CE' }}>Timer lokal · simulasi</AppText></View><Button label="Mulai timer" variant="lime" onPress={() => undefined} /></Card> : <View style={styles.twoColumns}><Card style={{ flex: 1, gap: spacing.sm }}><AppText variant="h3">Bahan</AppText><HighlightList items={['Nasi merah · 140 g matang','Ayam tanpa kulit · 120 g','Sayur urap · 180 g','Bumbu terstruktur · demo']} /></Card><Card tone="mint" style={{ flex: 1, gap: spacing.sm }}><AppText variant="h3">Alternatif approved demo</AppText><HighlightList items={['Tempe panggang 140 g','Sesuaikan sayur dengan musim','Tidak ada bahan allergen aktif']} /><Button label="Ganti menu" icon={ArrowLeftRight} variant="secondary" onPress={() => undefined} /></Card></View>}<InlineNotice title="Tidak ada pembelian" text="Aksi yang tersedia hanya lihat, ganti menu, mulai memasak, dan tandai dikonsumsi." tone="info" /></>;
}

function ActivityDemo({ screen }: { screen: PrototypeScreenDefinition }) {
  const coach = ['motion-coach','form-feedback'].includes(screen.slug);
  return <><Card tone="dark" style={styles.activityHero}><View style={styles.motionFrame}><View style={styles.poseHead} /><View style={styles.poseBody} /><View style={styles.poseArm} /><View style={styles.poseLeg} />{coach ? <View style={styles.guideLine} /> : null}</View><View style={{ flex: 1, minWidth: 240, gap: spacing.sm }}><View style={styles.chipRow}><Chip label={screen.eyebrow} tone="lime" />{screen.simulation ? <Chip label="SIMULASI" tone="mint" /> : null}</View><AppText variant="h2" style={{ color: colors.white }}>{screen.title}</AppText><AppText variant="body" style={{ color: '#CAD8CE' }}>{screen.description}</AppText><View style={styles.chipRow}><Chip label="Ringan" tone="neutral" /><Chip label="12–18 menit" tone="neutral" /><Chip label="Tanpa alat" tone="neutral" /></View></View></Card>{coach ? <View style={styles.feedbackGrid}>{[['Gerakan stabil','Pertahankan tempo yang nyaman',Check,'mint'],['Ruang untuk menyesuaikan','Kurangi rentang bila terasa tidak nyaman',Info,'blue'],['Hentikan bila perlu','Safety selalu lebih penting dari menyelesaikan sesi',TriangleAlert,'peach']].map(([title,text,Icon,tone]) => { const FeedbackIcon=Icon as typeof Check; return <Card key={String(title)} tone={tone as 'mint'} style={styles.feedbackCard}><FeedbackIcon size={22} color={colors.primary} /><AppText variant="label">{String(title)}</AppText><AppText variant="caption">{String(text)}</AppText></Card>; })}</View> : <View style={styles.twoColumns}><Card style={{ flex: 1, gap: spacing.sm }}><AppText variant="h3">Sebelum mulai</AppText><HighlightList items={['Siapkan ruang aman','Gunakan dukungan bila perlu','Hentikan bila muncul keluhan']} /></Card><Card tone="lime" style={{ flex: 1, gap: spacing.sm }}><AppText variant="h3">Target sesi demo</AppText><View style={styles.statRow}><Clock3 size={21} color={colors.primary} /><AppText variant="h3">16 menit</AppText></View><View style={styles.statRow}><Activity size={21} color={colors.primary} /><AppText variant="h3">Intensitas ringan</AppText></View></Card></View>}<InlineNotice title="Bukan rehabilitasi klinis" text="Motion Coach berfokus pada gerakan dan teknik, bukan tubuh ideal, diagnosis, atau terapi." tone="warning" /></>;
}

function SettingsDemo({ screen }: { screen: PrototypeScreenDefinition }) {
  const [enabled, setEnabled] = useState(screen.slug !== 'connected-devices' && screen.slug !== 'wearable-connection');
  const rows = screen.slug.includes('privacy') ? [['Pemrosesan inti','Aktif · consent demo'],['Sharing keluarga','Hanya profil Ayu'],['Ekspor data','Belum ada permintaan'],['Hapus data','Workflow simulasi']] : screen.slug.includes('device') || screen.slug.includes('wearable') ? [['Input manual','Aktif'],['Apple Health','Tidak diizinkan · bukan nol'],['Health Connect','Tidak tersedia di perangkat demo'],['Sync terakhir','Belum pernah']] : [['Mode lansia','Teks dan tombol lebih besar'],['Kurangi gerakan','Hormati preferensi sistem'],['Kontras','Target WCAG 2.2 AA'],['Pembaca layar','Label tersedia']];
  return <><Card tone="mint" style={styles.settingHero}><View style={styles.settingIcon}>{screen.slug.includes('privacy')?<LockKeyhole size={26} color={colors.primary}/>:screen.slug.includes('device')||screen.slug.includes('wearable')?<Smartphone size={26} color={colors.primary}/>:<ShieldCheck size={26} color={colors.primary}/>}</View><View style={{ flex: 1, minWidth: 220 }}><AppText variant="h2">{screen.title}</AppText><AppText variant="body">{screen.description}</AppText></View><Switch accessibilityLabel={`${screen.title} contoh`} value={enabled} onValueChange={setEnabled} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={enabled?colors.lime:colors.white} /></Card><Card style={{ gap: spacing.xs }}>{rows.map(([label,value]) => <Pressable key={label} accessibilityRole="button" onPress={() => undefined} style={({pressed})=>[styles.settingRow,pressed&&{opacity:.7}]}><View style={styles.settingIconSmall}><Database size={18} color={colors.primary}/></View><View style={{flex:1}}><AppText variant="label">{label}</AppText><AppText variant="caption">{value}</AppText></View><ChevronRight size={18} color={colors.textMuted}/></Pressable>)}</Card><InlineNotice title="Fallback selalu dijelaskan" text={screen.slug.includes('device')||screen.slug.includes('wearable')?'Izin denied, unavailable, delayed, missing, dan true-zero adalah state berbeda. Input manual tetap tersedia.':'Perubahan izin menjelaskan fitur terdampak dan data historis tanpa dark pattern.'} tone="info" /></>;
}

function ReferralDemo() {
  return <><Card tone="peach" style={styles.referralHero}><View style={styles.referralIcon}><AlertTriangle size={34} color={colors.danger} /></View><Chip label="REFERRAL · SIMULASI" tone="danger" /><AppText variant="h2">Kami menyarankan bantuan profesional sebelum melanjutkan.</AppText><AppText variant="bodyLarge">Prototype tidak menetapkan diagnosis, daftar gejala, tingkat urgensi klinis, nomor, atau layanan lokal nyata.</AppText><InlineNotice title="Saran terkait dibekukan" text="Acknowledgement tidak mengubah status dan bukan clearance untuk melanjutkan program." tone="danger" /></Card><Card style={{ gap: spacing.md }}><AppText variant="h3">Next step yang akan tersedia setelah validasi</AppText><HighlightList items={['Alasan netral tanpa label penyakit','Tindakan segera dan yang perlu dihindari','Jenis tenaga atau layanan yang tepat','Tautan resmi dengan owner dan tanggal review']} /><Button label="Saya memahami · demo" variant="danger" onPress={()=>undefined} /><Button label="Kembali ke informasi keselamatan" variant="secondary" onPress={()=>router.push('/setup/safety-screening' as never)} /></Card></>;
}

export function PrototypeScreenRenderer({ screen }: { screen: PrototypeScreenDefinition }) {
  switch (screen.kind) {
    case 'form': return <FormDemo screen={screen} />;
    case 'dashboard': return <DashboardDemo screen={screen} />;
    case 'status': return <StatusDemo screen={screen} />;
    case 'pattern': return <PatternDemo screen={screen} />;
    case 'nutrition': return <NutritionDemo screen={screen} />;
    case 'recipe': return <RecipeDemo screen={screen} />;
    case 'activity': return <ActivityDemo screen={screen} />;
    case 'settings': return <SettingsDemo screen={screen} />;
    case 'referral': return <ReferralDemo />;
  }
}

const styles = StyleSheet.create({
  list: { gap: spacing.xs },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  listCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.softLime, alignItems: 'center', justifyContent: 'center' },
  cameraMock: { minHeight: 390, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: colors.primary },
  cameraCorners: { maxWidth: 380, alignItems: 'center', gap: spacing.md },
  twoColumns: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  selectionGrid: { gap: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  heroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  dashboardHero: { flex: 1.25, minWidth: 300, minHeight: 300, justifyContent: 'space-between', gap: spacing.lg, borderColor: colors.primaryDark },
  dashboardSide: { flex: .75, minWidth: 280, gap: spacing.md, justifyContent: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  iconCircle: { width: 48, height: 48, borderRadius: 17, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  statusCard: { minHeight: 330, justifyContent: 'center', gap: spacing.lg, padding: spacing.xl },
  citation: { gap: spacing.lg, padding: spacing.xl },
  metaTable: { gap: 0 },
  metaRow: { minHeight: 62, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: spacing.xs, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
  patternHero: { minHeight: 280, justifyContent: 'space-between', gap: spacing.lg, padding: spacing.xl, borderColor: colors.primaryDark },
  confidenceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  confidenceCard: { flex: 1, minWidth: 210, gap: spacing.xs },
  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  energyCard: { flex: 1, minWidth: 220, minHeight: 250, alignItems: 'center', justifyContent: 'space-between', borderColor: colors.primaryDark },
  metricCard: { flex: 1, minWidth: 220, minHeight: 180, justifyContent: 'space-between', gap: spacing.xs },
  ingredientRow: { minHeight: 58, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ingredientIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  servingRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', gap:spacing.sm },
  counter: { flexDirection:'row', alignItems:'center', gap:spacing.sm },
  recipeHero: { minHeight: 300, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl, alignItems: 'center', padding: spacing.xl },
  recipeVisual: { width: 260, height: 220, borderRadius: radius.card, backgroundColor: '#E6D5A3', alignItems: 'center', justifyContent: 'center' },
  plate: { width: 170, height: 170, borderRadius: 85, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  recipeFood: { width: 110, height: 90, borderRadius: 45, backgroundColor: '#7BA263', transform: [{ rotate: '-8deg' }] },
  recipeAccent: { position: 'absolute', width: 58, height: 58, borderRadius: 29, backgroundColor: '#E7A52A', right: 21, bottom: 24 },
  timerCard: { flexDirection:'row',alignItems:'center',gap:spacing.md,borderColor:colors.primaryDark },
  activityHero: { minHeight: 360, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl, alignItems: 'center', padding: spacing.xl, borderColor: colors.primaryDark },
  motionFrame: { width: 280, height: 280, borderRadius: radius.cardLarge, backgroundColor: '#244833', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  poseHead: { position:'absolute', width: 38, height: 38, borderRadius: 19, backgroundColor: colors.lime, top: 38 },
  poseBody: { position:'absolute', width: 30, height: 112, borderRadius: 16, backgroundColor: colors.white, top: 80 },
  poseArm: { position:'absolute', width: 172, height: 20, borderRadius: 10, backgroundColor: colors.white, transform:[{rotate:'-18deg'}], top: 116 },
  poseLeg: { position:'absolute', width: 174, height: 22, borderRadius: 11, backgroundColor: colors.lime, transform:[{rotate:'20deg'}], bottom: 49 },
  guideLine: { position:'absolute', width:220, height:220, borderWidth:2,borderColor:colors.lime,borderRadius:110,borderStyle:'dashed' },
  feedbackGrid: { flexDirection:'row',flexWrap:'wrap',gap:spacing.md },
  feedbackCard: { flex:1,minWidth:220,gap:spacing.xs },
  statRow: { flexDirection:'row',alignItems:'center',gap:spacing.sm },
  settingHero: { flexDirection:'row',flexWrap:'wrap',alignItems:'center',gap:spacing.md,padding:spacing.xl },
  settingIcon: { width:56,height:56,borderRadius:20,backgroundColor:colors.white,alignItems:'center',justifyContent:'center' },
  settingIconSmall: { width:42,height:42,borderRadius:14,backgroundColor:colors.softMint,alignItems:'center',justifyContent:'center' },
  settingRow: { minHeight:68,flexDirection:'row',alignItems:'center',gap:spacing.sm,borderBottomWidth:1,borderBottomColor:colors.border,paddingVertical:spacing.xs },
  referralHero: { minHeight:340,justifyContent:'center',gap:spacing.md,padding:spacing.xl,borderColor:'#F2C6C4' },
  referralIcon: { width:72,height:72,borderRadius:26,backgroundColor:colors.white,alignItems:'center',justifyContent:'center' },
});
