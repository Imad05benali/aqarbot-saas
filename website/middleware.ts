import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── PRESENTATION BYPASS ────────────────────────────────────
  // Both /auth/login and /auth/register are ALWAYS accessible regardless
  // of active session state. This allows free demonstration of the full
  // registration and login flow without being auto-redirected to dashboard.
  if (
    pathname === '/auth/login' ||
    pathname === '/auth/register' ||
    pathname === '/register'
  ) {
    return NextResponse.next();
  }

  // Retrieve session token from cookie
  const sessionToken = request.cookies.get('sb-access-token')?.value;

  // ── PRIVATE PATHS: guard unauthenticated users ─────────────
  const isPrivatePath = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  if (isPrivatePath && !sessionToken) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/auth/login',
    '/auth/register',
    '/register',
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};
