import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role === 'ADMIN') redirect('/admin');

  return (
    <div className="min-h-dvh bg-black text-gray-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between px-4 sm:max-w-3xl">
          <Link href="/" className="font-semibold">
            PES Trophy ⚽
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 hover:bg-white/10"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md p-4 pb-24 sm:max-w-3xl sm:pb-20">{children}</main>

      <footer
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/70 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <nav className="mx-auto grid w-full max-w-md grid-cols-3 gap-2 p-3 text-xs sm:max-w-3xl sm:text-sm">
          <Link
            href="/leaderboard"
            className="block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center hover:bg-white/10"
          >
            Leaderboard
          </Link>
          <Link
            href="/trophies/new"
            className="block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center hover:bg-white/10"
          >
            Ajukan
          </Link>
          <Link
            href="/me"
            className="block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center hover:bg-white/10"
          >
            Profil
          </Link>
        </nav>
      </footer>
    </div>
  );
}
