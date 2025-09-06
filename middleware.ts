// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_PATHS = new Set([
  '/login',
  '/register',
  '/offline',
  '/manifest.webmanifest',
  '/manifest.json',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]);

function isAlwaysPublic(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname === '/sw.js'
  ); // worker
}

function isPublic(pathname: string) {
  if (isAlwaysPublic(pathname)) return true;
  if (pathname.startsWith('/api/auth')) return true;
  if (PUBLIC_PATHS.has(pathname)) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (isPublic(pathname)) {
    if (token && (pathname === '/login' || pathname === '/register')) {
      const to = token.role === 'ADMIN' ? '/admin' : '/';
      return NextResponse.redirect(new URL(to, req.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', pathname + search);
    return NextResponse.redirect(url);
  }

  const isAdminArea = pathname.startsWith('/admin');

  if (isAdminArea && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (!isAdminArea && token.role === 'ADMIN') {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
