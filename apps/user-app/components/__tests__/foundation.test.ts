import { accessibility, breakpoints, colors, zIndex } from '@sarira/design-tokens';
import { emailSchema, profileSchema } from '@sarira/validation';
import { getResponsiveMode } from '@/hooks/useResponsiveLayout';
import { resolveAuthRedirect } from '@/utils/auth-routing';

describe('production foundation user app', () => {
  it('mengimpor token production dan breakpoint konsisten', () => {
    expect(colors.primary).toBe('#176B52');
    expect(accessibility.minimumTouchTarget).toBeGreaterThanOrEqual(44);
    expect(zIndex.toast).toBeGreaterThan(zIndex.modal);
    expect(getResponsiveMode(breakpoints.tablet)).toBe('tablet');
    expect(getResponsiveMode(breakpoints.desktop)).toBe('desktop');
  });

  it('memvalidasi form profile dan email', () => {
    expect(emailSchema.safeParse('bukan-email').success).toBe(false);
    expect(profileSchema.safeParse({ fullName: 'Ayu', dateOfBirth: '1996-04-14' }).success).toBe(true);
    expect(profileSchema.safeParse({ fullName: 'A', dateOfBirth: '2099-01-01' }).success).toBe(false);
  });

  it('melindungi route berdasarkan auth dan onboarding', () => {
    expect(resolveAuthRedirect({ group: '(app)', authenticated: false, onboardingCompleted: false })).toBe('/login');
    expect(resolveAuthRedirect({ group: '(app)', authenticated: true, onboardingCompleted: false })).toBe('/setup/role-selection');
    expect(resolveAuthRedirect({ group: '(app)', authenticated: true, onboardingCompleted: false, currentStep: 'questionnaire' })).toBe('/setup/questionnaire');
    expect(resolveAuthRedirect({ group: '(auth)', authenticated: true, onboardingCompleted: true })).toBe('/home');
  });
});
