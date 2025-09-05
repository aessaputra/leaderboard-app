// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_SET = new Set([
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
    pathname.startsWith('/_next') || // next internals (static, image, dll)
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/api/auth') || // next-auth endpoints
    pathname === '/sw.js' ||
    pathname.startsWith('/workbox-') ||
    pathname.startsWith('/fallback-') ||
    /\.[a-z0-9]+$/i.test(pathname) // semua file statis: .png, .jpg, .css, ...
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // lewati route publik
  if (isAlwaysPublic(pathname) || PUBLIC_SET.has(pathname)) {
    return NextResponse.next();
  }

  // cek login
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = new URL('/login', req.url);
    // simpan tujuan agar balik lagi setelah login
    url.searchParams.set('callbackUrl', req.nextUrl.href);
    return NextResponse.redirect(url);
  }

  // gate admin
  if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/(.*)'],
};
