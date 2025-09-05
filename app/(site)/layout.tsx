// app/(site)/layout.tsx
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/60 backdrop-blur">
        <div className="mx-auto flex h-12 w-full max-w-md items-center justify-between px-4">
          <Link href="/" className="font-semibold">
            PES Trophy ⚽️
          </Link>
          {session && (
            <form action="/api/auth/signout" method="post">
              <button className="rounded-md border px-3 py-1 text-sm">
                Logout
              </button>
            </form>
          )}
        </div>
      </header>

      {/* Konten */}
      <main className="mx-auto w-full max-w-md flex-1 p-4">{children}</main>

      {/* Bottom tab hanya setelah login */}
      {session && (
        <nav className="sticky bottom-0 z-20 border-t border-white/10 bg-black/60 backdrop-blur">
          <div className="mx-auto grid w-full max-w-md grid-cols-3 text-sm">
            <Link href="/" className="py-3 text-center hover:bg-white/5">
              Home
            </Link>
            <Link
              href="/leaderboard"
              className="py-3 text-center hover:bg-white/5"
            >
              Leaderboard
            </Link>
            <Link href="/me" className="py-3 text-center hover:bg-white/5">
              Profil
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
