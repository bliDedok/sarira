import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabasePublicConfig } from './config';

const adminRoles = new Set(['ADMIN', 'CONTENT_REVIEWER', 'NUTRITION_REVIEWER', 'SUPER_ADMIN']);

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isLogin = path === '/login';
  const isDenied = path === '/access-denied';
  const isProtected = !isLogin && !isDenied;
  const config = getSupabasePublicConfig();
  if (!config) return isProtected ? NextResponse.redirect(new URL('/login?reason=configuration', request.url)) : NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (values) => {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as { sub?: string; app_metadata?: { roles?: string[] } } | undefined;
  if (isProtected && !claims?.sub) return NextResponse.redirect(new URL('/login', request.url));
  if (isLogin && claims?.sub) return NextResponse.redirect(new URL('/dashboard', request.url));
  if (isProtected) {
    const roles = claims?.app_metadata?.roles ?? [];
    if (!roles.some((role) => adminRoles.has(role))) return NextResponse.redirect(new URL('/access-denied', request.url));
  }
  return response;
}
