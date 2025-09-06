// Single admin layout used for all admin routes
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import type { ReactNode } from 'react';
import SkipLink from '@/components/a11y/SkipLink';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-dvh bg-black text-zinc-100">
      <SkipLink target="#admin-main" />

      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-black/70 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link
            href="/admin"
            className="rounded font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            aria-label="Buka Dashboard Admin"
          >
            Admin Panel
          </Link>

          <nav aria-label="Menu admin">
            <ul className="flex gap-2">
              <li>
                <Link
                  href="/admin/trophies/requests"
                  className="inline-flex items-center rounded-xl px-3 py-1.5 ring-1 ring-zinc-700 hover:ring-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  Requests
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/users"
                  className="inline-flex items-center rounded-xl px-3 py-1.5 ring-1 ring-zinc-700 hover:ring-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  Users
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main
        id="admin-main"
        tabIndex={-1}
        className="mx-auto max-w-5xl px-4 py-8 outline-none"
        aria-live="polite"
      >
        {children}
      </main>
    </div>
  );
}
