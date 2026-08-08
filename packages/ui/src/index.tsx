import React, { ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Modal as NativeModal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput as NativeTextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
  Platform,
  Switch,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Check, ChevronRight, Info, Search, TriangleAlert, WifiOff, X } from 'lucide-react-native';
import { accessibility, colors, radius, spacing, typography } from '@sarira/design-tokens';
import type { SafetyDisplayStatus, SafetyStatus } from '@sarira/shared-types';

type IconComponent = React.ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;

const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const textStyles = StyleSheet.create({
  display: {
    fontFamily: font.bold,
    fontSize: typography.display,
    lineHeight: 46,
    letterSpacing: -1.2,
    color: colors.textPrimary,
  },
  h1: {
    fontFamily: font.bold,
    fontSize: typography.h1,
    lineHeight: 38,
    letterSpacing: -0.7,
    color: colors.textPrimary,
  },
  h2: {
    fontFamily: font.bold,
    fontSize: typography.h2,
    lineHeight: 32,
    letterSpacing: -0.4,
    color: colors.textPrimary,
  },
  h3: {
    fontFamily: font.semibold,
    fontSize: typography.h3,
    lineHeight: 27,
    color: colors.textPrimary,
  },
  bodyLarge: {
    fontFamily: font.regular,
    fontSize: typography.bodyLarge,
    lineHeight: 27,
    color: colors.textSecondary,
  },
  body: {
    fontFamily: font.regular,
    fontSize: typography.body,
    lineHeight: 23,
    color: colors.textSecondary,
  },
  label: {
    fontFamily: font.semibold,
    fontSize: typography.body,
    lineHeight: 21,
    color: colors.textPrimary,
  },
  caption: {
    fontFamily: font.regular,
    fontSize: typography.caption,
    lineHeight: 18,
    color: colors.textMuted,
  },
  eyebrow: {
    fontFamily: font.bold,
    fontSize: typography.micro,
    lineHeight: 15,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.primary,
  },
});

export function AppText({
  children,
  variant = 'body',
  style,
  ...props
}: React.ComponentProps<typeof Text> & { variant?: keyof typeof textStyles }) {
  return (
    <Text style={[textStyles[variant], style]} {...props}>
      {children}
    </Text>
  );
}

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'lime' | 'secondary' | 'ghost' | 'inverse' | 'danger';
  icon?: IconComponent;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityHint?: string;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon: Icon,
  iconPosition = 'right',
  disabled,
  loading,
  fullWidth,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const palette = {
    primary: { background: colors.primary, foreground: colors.white, border: colors.primary },
    lime: { background: colors.lime, foreground: colors.primaryDark, border: colors.lime },
    secondary: { background: colors.white, foreground: colors.primaryDark, border: colors.border },
    ghost: { background: 'transparent', foreground: colors.primary, border: 'transparent' },
    inverse: { background: 'transparent', foreground: colors.white, border: '#52705E' },
    danger: { background: '#FFF3F1', foreground: colors.danger, border: '#F4CECA' },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: Boolean(disabled || loading), busy: Boolean(loading) }}
      testID={testID}
      disabled={disabled || loading}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: palette.background,
          borderColor: focused ? colors.primary : palette.border,
          opacity: disabled ? 0.45 : pressed ? 0.84 : 1,
          transform: pressed ? [{ scale: 0.985 }] : undefined,
        },
        hovered && !disabled && styles.hovered,
        focused && styles.focused,
        fullWidth && styles.fullWidth,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.foreground} />
      ) : (
        <>
          {Icon && iconPosition === 'left' ? <Icon color={palette.foreground} size={19} strokeWidth={2.4} /> : null}
          <AppText variant="label" style={{ color: palette.foreground }}>
            {label}
          </AppText>
          {Icon && iconPosition === 'right' ? <Icon color={palette.foreground} size={19} strokeWidth={2.4} /> : null}
        </>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon: Icon,
  label,
  onPress,
  selected,
}: {
  icon: IconComponent;
  label: string;
  onPress?: () => void;
  selected?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.iconButton,
        selected && styles.iconButtonSelected,
        focused && styles.focused,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Icon color={selected ? colors.primaryDark : colors.textPrimary} size={22} strokeWidth={2.2} />
    </Pressable>
  );
}

export function Card({
  children,
  style,
  tone = 'white',
  accessibilityLabel,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'white' | 'soft' | 'mint' | 'lime' | 'cream' | 'dark' | 'blue' | 'peach' | 'lilac';
  accessibilityLabel?: string;
}) {
  const backgrounds = {
    white: colors.white,
    soft: colors.surfaceSoft,
    mint: colors.softMint,
    lime: colors.softLime,
    cream: colors.warmCream,
    dark: colors.primaryDark,
    blue: colors.pastelBlue,
    peach: colors.pastelPeach,
    lilac: colors.pastelLilac,
  };
  return (
    <View accessible={Boolean(accessibilityLabel)} accessibilityLabel={accessibilityLabel} style={[styles.card, { backgroundColor: backgrounds[tone] }, style]}>
      {children}
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  icon: Icon,
  tone = 'neutral',
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconComponent;
  tone?: 'neutral' | 'lime' | 'mint' | 'warning' | 'danger';
}) {
  const toneStyle = {
    neutral: { background: colors.surfaceSoft, foreground: colors.textSecondary, border: colors.border },
    lime: { background: colors.softLime, foreground: colors.primaryDark, border: '#D5E996' },
    mint: { background: colors.softMint, foreground: colors.primary, border: '#CFE9D8' },
    warning: { background: '#FFF6DF', foreground: '#8A5B00', border: '#F4D997' },
    danger: { background: '#FFF0EF', foreground: '#9D3434', border: '#F2C6C4' },
  }[tone];
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={{ selected }}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.lime : toneStyle.background,
          borderColor: selected ? colors.lime : toneStyle.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      {Icon ? <Icon size={15} color={selected ? colors.primaryDark : toneStyle.foreground} /> : null}
      <AppText variant="caption" style={{ color: selected ? colors.primaryDark : toneStyle.foreground, fontFamily: font.semibold }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function ProgressBar({
  value,
  max = 100,
  label,
  tone = 'primary',
}: {
  value: number;
  max?: number;
  label?: string;
  tone?: 'primary' | 'lime' | 'warning' | 'danger' | 'info';
}) {
  const percent = Math.max(0, Math.min(100, (value / Math.max(max, 1)) * 100));
  const fill = {
    primary: colors.primary,
    lime: colors.lime,
    warning: colors.warning,
    danger: colors.danger,
    info: colors.information,
  }[tone];
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max, now: value }}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: fill }]} />
      </View>
    </View>
  );
}

export function LimitIndicator({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  const ratio = value / Math.max(max, 1);
  const status = ratio >= 1 ? 'Batas tercapai' : ratio >= 0.8 ? 'Mendekati batas' : 'Masih dalam batas';
  const tone = ratio >= 1 ? 'danger' : ratio >= 0.8 ? 'warning' : 'primary';
  return (
    <View style={styles.metricBlock}>
      <View style={styles.rowBetween}>
        <AppText variant="label">{label}</AppText>
        <AppText variant="caption">{status}</AppText>
      </View>
      <ProgressBar value={Math.min(value, max)} max={max} tone={tone} label={`${label}: ${value} dari batas ${max}`} />
    </View>
  );
}

export function ProgressRing({
  value,
  size = 72,
  strokeWidth = 8,
  label,
  color = colors.lime,
  trackColor = '#315541',
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
  trackColor?: string;
}) {
  const normalized = Math.max(0, Math.min(100, value));
  const radiusValue = (size - strokeWidth) / 2;
  const circumference = radiusValue * 2 * Math.PI;
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'Progres'}
      accessibilityValue={{ min: 0, max: 100, now: normalized }}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={radiusValue} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference - (normalized / 100) * circumference}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <AppText variant="label" style={{ color: trackColor === '#315541' ? colors.white : colors.textPrimary }}>
        {Math.round(normalized)}%
      </AppText>
    </View>
  );
}

export function SimulatedBadge({ label = 'SIMULASI' }: { label?: string }) {
  return <Chip label={label} tone="lime" />;
}

export function StatusPill({ status }: { status: SafetyStatus | SafetyDisplayStatus }) {
  const normalized = status.toLowerCase() as SafetyDisplayStatus;
  const settings = {
    green: { label: 'Hijau · dapat melanjutkan', tone: 'mint' as const, icon: Check },
    yellow: { label: 'Kuning · perlu kehati-hatian', tone: 'warning' as const, icon: TriangleAlert },
    red: { label: 'Merah · perlu bantuan', tone: 'danger' as const, icon: TriangleAlert },
    unknown: { label: 'Belum dapat ditentukan', tone: 'neutral' as const, icon: Info },
  }[normalized];
  return <Chip label={settings.label} tone={settings.tone} icon={settings.icon} />;
}

export function Field({
  label,
  helper,
  error,
  ...props
}: TextInputProps & { label: string; helper?: string; error?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <AppText variant="label">{label}</AppText>
      <NativeTextInput
        accessibilityLabel={label}
        accessibilityHint={helper}
        style={[styles.input, focused && styles.inputFocused, error && styles.inputError]}
        placeholderTextColor={colors.textMuted}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        {...props}
      />
      {error ? (
        <AppText variant="caption" accessibilityLiveRegion="polite" style={{ color: colors.danger }}>
          {error}
        </AppText>
      ) : helper ? (
        <AppText variant="caption">{helper}</AppText>
      ) : null}
    </View>
  );
}

export function TextInput(props: TextInputProps & { label: string; helper?: string; error?: string }) {
  return <Field {...props} />;
}

export function NumberInput(props: Omit<TextInputProps, 'keyboardType'> & { label: string; helper?: string; error?: string }) {
  return <Field {...props} keyboardType="numeric" />;
}

export function SearchInput(props: Omit<TextInputProps, 'accessibilityLabel'> & { label?: string }) {
  const label = props.label ?? 'Cari';
  return (
    <View style={styles.searchWrap}>
      <Search size={19} color={colors.textMuted} />
      <NativeTextInput
        {...props}
        accessibilityLabel={label}
        placeholder={props.placeholder ?? label}
        placeholderTextColor={colors.textMuted}
        style={styles.searchInput}
      />
    </View>
  );
}

export function Checkbox({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange?: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      style={({ pressed }) => [styles.choiceRow, pressed && { opacity: 0.72 }, disabled && { opacity: 0.45 }]}
    >
      <View style={[styles.checkbox, checked && styles.choiceSelected]}>{checked ? <Check size={15} color={colors.primaryDark} strokeWidth={3} /> : null}</View>
      <AppText variant="body" style={{ flex: 1 }}>{label}</AppText>
    </Pressable>
  );
}

export function Radio({ label, selected, onPress, disabled }: { label: string; selected: boolean; onPress?: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.choiceRow, pressed && { opacity: 0.72 }, disabled && { opacity: 0.45 }]}
    >
      <View style={[styles.radio, selected && styles.choiceSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
      <AppText variant="body" style={{ flex: 1 }}>{label}</AppText>
    </Pressable>
  );
}

export function Toggle({ label, description, value, onValueChange, disabled }: { label: string; description?: string; value: boolean; onValueChange?: (value: boolean) => void; disabled?: boolean }) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, gap: 2 }}><AppText variant="label">{label}</AppText>{description ? <AppText variant="caption">{description}</AppText> : null}</View>
      <Switch accessibilityLabel={label} value={value} onValueChange={onValueChange} disabled={disabled} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={value ? colors.lime : colors.white} />
    </View>
  );
}

export function Modal({ visible, title, children, onClose }: { visible: boolean; title: string; children: ReactNode; onClose: () => void }) {
  return (
    <NativeModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View accessibilityViewIsModal accessibilityLabel={title} style={styles.modalCard}>
          <View style={styles.rowBetween}><AppText variant="h3">{title}</AppText><IconButton icon={X} label="Tutup" onPress={onClose} /></View>
          {children}
        </View>
      </View>
    </NativeModal>
  );
}

export function BottomSheet({ visible, title, children, onClose }: { visible: boolean; title: string; children: ReactNode; onClose: () => void }) {
  return (
    <NativeModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, styles.sheetOverlay]}>
        <View accessibilityViewIsModal accessibilityLabel={title} style={styles.sheetCard}>
          <View style={styles.sheetHandle} />
          <View style={styles.rowBetween}><AppText variant="h3">{title}</AppText><IconButton icon={X} label="Tutup" onPress={onClose} /></View>
          {children}
        </View>
      </View>
    </NativeModal>
  );
}

export function Toast({ message, tone = 'info', action }: { message: string; tone?: 'info' | 'success' | 'danger'; action?: { label: string; onPress: () => void } }) {
  const color = tone === 'danger' ? colors.danger : tone === 'success' ? colors.success : colors.information;
  return <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.toast, { borderLeftColor: color }]}><AppText variant="body" style={{ flex: 1 }}>{message}</AppText>{action ? <Button label={action.label} variant="ghost" onPress={action.onPress} /> : null}</View>;
}

export function Loading({ label = 'Memuat…' }: { label?: string }) {
  return <View accessibilityRole="progressbar" accessibilityLabel={label} style={styles.state}><ActivityIndicator color={colors.primary} /><AppText variant="body">{label}</AppText></View>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: { label: string; onPress: () => void } }) {
  return <View style={styles.state}><Info size={30} color={colors.textMuted} /><AppText variant="h3">{title}</AppText><AppText variant="body" style={{ textAlign: 'center' }}>{description}</AppText>{action ? <Button {...action} variant="secondary" /> : null}</View>;
}

export function ErrorState({ title = 'Terjadi kendala', description, onRetry, offline = false }: { title?: string; description: string; onRetry?: () => void; offline?: boolean }) {
  const Icon = offline ? WifiOff : TriangleAlert;
  return <View accessibilityRole="alert" style={styles.state}><Icon size={30} color={colors.danger} /><AppText variant="h3">{title}</AppText><AppText variant="body" style={{ textAlign: 'center' }}>{description}</AppText>{onRetry ? <Button label="Coba lagi" variant="secondary" onPress={onRetry} /> : null}</View>;
}

export function NavigationItem({ label, selected, icon: Icon, onPress }: { label: string; selected?: boolean; icon?: IconComponent; onPress?: () => void }) {
  return <Pressable accessibilityRole="link" accessibilityLabel={label} accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.navigationItem, selected && styles.navigationSelected, pressed && { opacity: 0.72 }]}>{Icon ? <Icon size={20} color={selected ? colors.primaryDark : colors.textSecondary} /> : null}<AppText variant="label" style={{ flex: 1 }}>{label}</AppText></Pressable>;
}

export function SelectionCard({
  title,
  description,
  icon: Icon,
  selected,
  onPress,
  tone = 'mint',
}: {
  title: string;
  description?: string;
  icon?: IconComponent;
  selected?: boolean;
  onPress?: () => void;
  tone?: 'mint' | 'lime' | 'cream' | 'blue' | 'peach' | 'lilac';
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.selectionPressable, pressed && { opacity: 0.78 }]}
    >
      <Card tone={tone} style={[styles.selectionCard, selected && styles.selectionSelected]}>
        {Icon ? (
          <View style={styles.selectionIcon}>
            <Icon size={23} color={colors.primary} strokeWidth={2.2} />
          </View>
        ) : null}
        <View style={{ flex: 1, gap: 3 }}>
          <AppText variant="label">{title}</AppText>
          {description ? <AppText variant="caption">{description}</AppText> : null}
        </View>
        {selected ? (
          <View style={styles.selectedCheck}>
            <Check size={16} color={colors.primaryDark} strokeWidth={3} />
          </View>
        ) : (
          <ChevronRight size={19} color={colors.textMuted} />
        )}
      </Card>
    </Pressable>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.rowBetween}>
      <AppText variant="h3">{title}</AppText>
      {action ? <Button label={action} variant="ghost" onPress={onAction} /> : null}
    </View>
  );
}

export function InlineNotice({
  title,
  text,
  tone = 'info',
}: {
  title: string;
  text: string;
  tone?: 'info' | 'warning' | 'danger' | 'success';
}) {
  const toneSetting = {
    info: { background: colors.pastelBlue, foreground: colors.information, Icon: Info },
    warning: { background: '#FFF6DF', foreground: '#8A5B00', Icon: TriangleAlert },
    danger: { background: '#FFF0EF', foreground: colors.danger, Icon: TriangleAlert },
    success: { background: colors.softMint, foreground: colors.primary, Icon: Check },
  }[tone];
  return (
    <View style={[styles.notice, { backgroundColor: toneSetting.background }]} accessibilityRole="alert">
      <toneSetting.Icon size={20} color={toneSetting.foreground} />
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="label" style={{ color: toneSetting.foreground }}>
          {title}
        </AppText>
        <AppText variant="caption" style={{ color: colors.textSecondary }}>
          {text}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: accessibility.minimumTouchTarget + 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.button,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  fullWidth: { width: '100%' },
  hovered: Platform.select({ web: { opacity: 0.92 } as ViewStyle, default: {} }),
  focused: {
    borderWidth: accessibility.focusWidth,
    borderColor: colors.primary,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconButtonSelected: { backgroundColor: colors.lime },
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 10px 30px rgba(14,42,27,0.06)' } as ViewStyle)
      : { shadowColor: colors.primaryDark, shadowOpacity: 0.07, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } }),
  },
  chip: {
    minHeight: 32,
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressTrack: {
    height: 9,
    borderRadius: radius.pill,
    backgroundColor: '#E7ECE8',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: radius.pill },
  metricBlock: { gap: spacing.xs },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  fieldWrap: { gap: spacing.xs },
  input: {
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontFamily: font.regular,
    fontSize: typography.body,
  },
  inputFocused: { borderColor: colors.primary, borderWidth: accessibility.focusWidth },
  inputError: { borderColor: colors.danger },
  selectionPressable: { borderRadius: radius.card },
  selectionCard: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  selectionSelected: { borderWidth: 2, borderColor: colors.primary },
  selectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notice: {
    borderRadius: radius.input,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  searchWrap: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, borderRadius: radius.input, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white },
  searchInput: { flex: 1, minHeight: 48, color: colors.textPrimary, fontFamily: font.regular, fontSize: typography.body },
  choiceRow: { minHeight: accessibility.minimumTouchTarget, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primaryDark },
  choiceSelected: { backgroundColor: colors.lime, borderColor: colors.primary },
  toggleRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  overlay: { flex: 1, padding: spacing.lg, backgroundColor: 'rgba(14,42,27,0.48)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { width: '100%', maxWidth: 560, maxHeight: '90%', borderRadius: radius.cardLarge, backgroundColor: colors.white, padding: spacing.lg, gap: spacing.lg },
  sheetOverlay: { justifyContent: 'flex-end', padding: 0 },
  sheetCard: { width: '100%', maxHeight: '90%', borderTopLeftRadius: radius.cardLarge, borderTopRightRadius: radius.cardLarge, backgroundColor: colors.white, padding: spacing.lg, gap: spacing.lg },
  sheetHandle: { width: 52, height: 5, borderRadius: radius.pill, alignSelf: 'center', backgroundColor: colors.border },
  toast: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.input, borderLeftWidth: 4, backgroundColor: colors.white },
  state: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xl },
  navigationItem: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.input },
  navigationSelected: { backgroundColor: colors.lime },
});

export const uiFontFamilies = font;
