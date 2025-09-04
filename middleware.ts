// middleware.ts
import { NextResponse } from 'next/server';

// Passthrough middleware (tidak mengubah request)
export function middleware() {
  return NextResponse.next();
}

// Nanti saat Auth siap, kita ubah untuk proteksi /admin
// export const config = { matcher: ["/admin/:path*"] };
