import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SiteBottomNav from '@/components/SiteBottomNav';
import { ThemeProvider } from '@/context/ThemeContext';

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role === 'ADMIN') redirect('/admin');

  return (
    <ThemeProvider>
      <div className="min-h-dvh bg-gray-50 text-gray-900 dark:bg-black dark:text-gray-100">
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur header-safe dark:border-white/10 dark:bg-black/70">
          <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between px-10 sm:px-12 sm:max-w-3xl safe-px">
            <Link href="/" className="font-semibold ml-2 sm:ml-3">
              PES Trophy ⚽
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-md p-4 pb-24 sm:max-w-3xl sm:pb-20 safe-px">{children}</main>

        <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/85 backdrop-blur toolbar-safe dark:border-white/10 dark:bg-black/70">
          <SiteBottomNav />
        </footer>
      </div>
    </ThemeProvider>
  );
}
