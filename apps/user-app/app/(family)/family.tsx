import { View } from 'react-native';
import { UsersRound } from 'lucide-react-native';
import { spacing } from '@sarira/design-tokens';
import { AppText, Card, EmptyState, SimulatedBadge } from '@sarira/ui';
import { AppShell } from '@/layouts/AppShell';

export default function FamilyFoundationPage() {
  return <AppShell title="Keluarga" subtitle="Fondasi profil tanggungan"><Card tone="mint" style={{ gap: spacing.md }}><UsersRound size={30} /><AppText variant="h2">Satu akun, beberapa profil tanggungan.</AppText><AppText variant="body">Database dan authorization boundary menyiapkan profil tanggungan. Family Growth dan analisis pertumbuhan tetap di luar Phase 3.</AppText><View><SimulatedBadge label="DEMO · FOUNDATION ONLY" /></View></Card><EmptyState title="Belum ada dependent production" description="Gunakan profil demo untuk visual testing sampai fase Family Growth disetujui." /></AppShell>;
}
