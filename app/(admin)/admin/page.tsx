import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/auth/LogoutButton';

export default async function AdminHomePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/');

  const [pendingUsers, pendingTrophies] = await Promise.all([
    prisma.user.count({ where: { approved: false } }),
    prisma.trophyAward.count({ where: { approved: false } }),
  ]);

  return (
    <main className="mx-auto max-w-4xl p-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <LogoutButton label="Logout (ganti akun)" />
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-gray-400">Pending Users</div>
          <div className="mt-1 text-3xl font-bold">{pendingUsers}</div>
          <Link
            href="/admin/users"
            className="mt-3 inline-block rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
          >
            Kelola Users
          </Link>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-gray-400">Pending Trophy</div>
          <div className="mt-1 text-3xl font-bold">{pendingTrophies}</div>
          <Link
            href="/admin/trophies/requests"
            className="mt-3 inline-block rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
          >
            Approve Trophy
          </Link>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-gray-400">Aksi Cepat</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href="/leaderboard"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
            >
              Lihat Leaderboard (User)
            </Link>
            <Link
              href="/admin/trophies/requests"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
            >
              Tinjau Trophy
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
