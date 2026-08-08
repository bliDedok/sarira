export const colors = {
  primary: '#176B52',
  primaryDark: '#0E2A1B',
  lime: '#C8F238',
  softLime: '#EAF8B8',
  softMint: '#EAF8EF',
  warmCream: '#F8F7EF',
  white: '#FFFFFF',
  surfaceSoft: '#F5F7F4',
  textPrimary: '#121814',
  textSecondary: '#667069',
  textMuted: '#8A938D',
  textInverse: '#FFFFFF',
  success: '#3D8A62',
  warning: '#E7A52A',
  danger: '#D95B5B',
  information: '#4F7CAC',
  border: '#E2E8E3',
  darkBackground: '#111412',
  darkSurface: '#1A1F1C',
  darkElevated: '#222824',
  darkText: '#F4F7F4',
  pastelBlue: '#E8F3FB',
  pastelPeach: '#FCEFE5',
  pastelLilac: '#F2ECFA',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 56,
} as const;

export const radius = {
  input: 16,
  button: 20,
  card: 24,
  cardLarge: 28,
  floating: 32,
  pill: 999,
} as const;

export const typography = {
  display: 40,
  h1: 32,
  h2: 26,
  h3: 21,
  bodyLarge: 18,
  body: 16,
  caption: 13,
  micro: 11,
  lineHeight: {
    tight: 1.15,
    body: 1.45,
    relaxed: 1.6,
  },
} as const;

export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

export const motion = {
  fast: 120,
  normal: 220,
  slow: 360,
} as const;

export const zIndex = {
  base: 0,
  navigation: 20,
  overlay: 40,
  modal: 50,
  toast: 60,
} as const;

export const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export const shadow = {
  card: {
    boxShadow: '0 10px 30px rgba(14,42,27,0.07)',
  },
  floating: {
    boxShadow: '0 16px 40px rgba(14,42,27,0.16)',
  },
} as const;

export const accessibility = {
  minimumTouchTarget: 44,
  focusWidth: 3,
  reducedMotionDuration: 0,
} as const;

export type ColorToken = keyof typeof colors;
