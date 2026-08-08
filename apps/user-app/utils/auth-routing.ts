export type RouteGroup = '(public)' | '(auth)' | '(onboarding)' | '(app)' | '(family)' | '(settings)' | string | undefined;

export function resolveAuthRedirect(input: { group: RouteGroup; authenticated: boolean; onboardingCompleted: boolean; currentStep?: string }) {
  const privateGroup = ['(onboarding)', '(app)', '(family)', '(settings)'].includes(input.group ?? '');
  const completedOnlyGroup = ['(app)', '(family)', '(settings)'].includes(input.group ?? '');
  if (!input.authenticated && privateGroup) return '/login';
  if (input.authenticated && !input.onboardingCompleted && completedOnlyGroup) return `/setup/${input.currentStep ?? 'role-selection'}`;
  if (input.authenticated && input.onboardingCompleted && input.group === '(onboarding)') return '/home';
  if (input.authenticated && input.onboardingCompleted && input.group === '(auth)') return '/home';
  return null;
}
