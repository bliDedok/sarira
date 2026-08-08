import { ReactNode, useEffect } from 'react';
import { router, useSegments } from 'expo-router';
import { Loading } from '@sarira/ui';
import { useAuth } from './AuthProvider';
import { resolveAuthRedirect } from '@/utils/auth-routing';

export function RouteGuard({ children }: { children: ReactNode }) {
  const segments = useSegments();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const redirect = resolveAuthRedirect({ group: segments[0], authenticated: Boolean(session), onboardingCompleted: Boolean(session?.onboardingCompleted), currentStep: session?.currentStep });
    if (redirect) router.replace(redirect as never);
  }, [loading, segments, session]);

  if (loading) return <Loading label="Memulihkan sesi dengan aman…" />;
  return children;
}
