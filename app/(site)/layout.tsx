import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SiteBottomNav from '@/components/SiteBottomNav';

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
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur header-safe">
        <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between px-4 sm:max-w-3xl safe-px">
          <Link href="/" className="font-semibold">
            PES Trophy ⚽
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md p-4 pb-24 sm:max-w-3xl sm:pb-20 safe-px">{children}</main>

      <footer
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/70 backdrop-blur toolbar-safe"
      >
        <SiteBottomNav />
      </footer>
    </div>
  );
}
