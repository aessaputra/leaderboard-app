// Single admin layout used for all admin routes
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import type { ReactNode } from 'react';
import SkipLink from '@/components/a11y/SkipLink';
import LogoutButton from '@/components/auth/LogoutButton';
import AdminMobileNav from '@/components/admin/AdminMobileNav';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-dvh bg-black text-zinc-100">
      <SkipLink target="#admin-main" />

      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-black/70 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between px-3 sm:max-w-5xl sm:px-4">
          <Link
            href="/admin"
            className="rounded font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            aria-label="Buka Dashboard Admin"
          >
            Admin Panel
          </Link>
          <LogoutButton label="Logout" />
        </div>
      </header>

      <main
        id="admin-main"
        tabIndex={-1}
        className="mx-auto w-full max-w-md px-3 py-6 pb-24 outline-none sm:max-w-5xl sm:px-4 sm:py-8"
        aria-live="polite"
      >
        {children}
      </main>

      {/* Mobile bottom nav */}
      <AdminMobileNav />
    </div>
  );
}
