export const runtime = 'nodejs';

import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Trophy, ShieldCheck, Users2, CheckCircle2, Clock } from 'lucide-react';

export default async function AdminDashboardPage() {
  const [pendingTrophies, pendingUsers, totals, recent] = await Promise.all([
    prisma.trophyAward.count({ where: { approved: false } }),
    prisma.user.count({ where: { approved: false } }),
    (async () => {
      const [users, trophies, ucl, europa] = await Promise.all([
        prisma.user.count(),
        prisma.trophyAward.count(),
        prisma.trophyAward.count({ where: { competition: 'UCL' } }),
        prisma.trophyAward.count({ where: { competition: 'EUROPA' } }),
      ]);
      return { users, trophies, ucl, europa };
    })(),
    prisma.trophyAward.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        competition: true,
        approved: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Quick stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-neutral-900/60">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users2 className="h-4 w-4" /> Users
          </div>
          <div className="mt-2 text-2xl font-semibold">{totals.users}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-neutral-900/60">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Trophy className="h-4 w-4" /> Total Trophy
          </div>
          <div className="mt-2 text-2xl font-semibold">{totals.trophies}</div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">UCL {totals.ucl} • EUROPA {totals.europa}</div>
        </div>
        <Link
          href="/admin/trophies/requests"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:hover:bg-amber-500/15"
        >
          <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
            <Clock className="h-4 w-4" /> Pending Trophy
          </div>
          <div className="mt-2 text-2xl font-semibold text-amber-700 dark:text-amber-200">
            {pendingTrophies}
          </div>
          <div className="mt-1 text-xs text-amber-700/80 dark:text-amber-300/80">Klik untuk review</div>
        </Link>
        <Link
          href="/admin/users"
          className="rounded-xl border border-sky-200 bg-sky-50 p-4 hover:bg-sky-100 dark:border-sky-500/30 dark:bg-sky-500/10 dark:hover:bg-sky-500/15"
        >
          <div className="flex items-center gap-2 text-sm text-sky-700 dark:text-sky-300">
            <CheckCircle2 className="h-4 w-4" /> Pending Users
          </div>
          <div className="mt-2 text-2xl font-semibold text-sky-700 dark:text-sky-200">
            {pendingUsers}
          </div>
          <div className="mt-1 text-xs text-sky-700/80 dark:text-sky-300/80">Klik untuk approve</div>
        </Link>
      </section>

      {/* Quick actions section removed; use sidebar navigation instead */}

      {/* Kembali ke situs dihapus sesuai permintaan */}
    </div>
  );
}
