import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  const publicPaths = ['/login', '/onboarding', '/_next', '/api', '/favicon.ico'];
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // For protected routes, let the client-side handle auth
  // (since we're using localStorage which is not accessible in middleware)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
