const explicitRoutes: Record<string, string> = {
  splash: '/',
  onboarding: '/onboarding',
  welcome: '/welcome',
  login: '/login',
  registration: '/register',
  'role-selection': '/setup/role-selection',
  'birth-date': '/setup/birth-date',
  'guardian-consent': '/setup/guardian-consent',
  'privacy-consent': '/setup/privacy-consent',
  'safety-screening': '/setup/safety-screening',
  'safety-green': '/setup/safety-green',
  'safety-yellow': '/setup/safety-yellow',
  'safety-red': '/setup/safety-red',
  'goal-selection': '/setup/goal-selection',
  'profile-questionnaire': '/setup/profile-questionnaire',
  'food-preferences': '/setup/food-preferences',
  allergies: '/setup/allergies',
  'food-mode': '/setup/food-mode',
  'profile-summary': '/setup/profile-summary',
  'starter-journey': '/starter-journey',
  'daily-check-in': '/daily-check-in',
  'baseline-journey': '/baseline-journey',
  'day-7-checkpoint': '/day-7-checkpoint',
  'home-day-1': '/home?day=1',
  'food-dashboard': '/food',
  'activity-dashboard': '/activity',
  'progress-dashboard': '/progress',
  'digestive-support': '/digestive',
  profile: '/profile',
};

export function screenPath(slug: string) {
  return explicitRoutes[slug] ?? `/prototype/${slug}`;
}

export function screenHref(slug: string) {
  return explicitRoutes[slug] ?? { pathname: '/prototype/[slug]' as const, params: { slug } };
}
