import { useWindowDimensions } from 'react-native';
import { breakpoints } from '@sarira/design-tokens';

export type ResponsiveMode = 'mobile' | 'tablet' | 'desktop' | 'wide';

export function getResponsiveMode(width: number): ResponsiveMode {
  if (width >= breakpoints.wide) return 'wide';
  if (width >= breakpoints.desktop) return 'desktop';
  if (width >= breakpoints.tablet) return 'tablet';
  return 'mobile';
}

export function useResponsiveLayout() {
  const dimensions = useWindowDimensions();
  const mode = getResponsiveMode(dimensions.width);
  return { ...dimensions, mode, isMobile: mode === 'mobile', isTablet: mode === 'tablet', isDesktop: mode === 'desktop' || mode === 'wide', isWide: mode === 'wide' };
}
