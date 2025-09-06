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
        <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users2 className="h-4 w-4" /> Users
          </div>
          <div className="mt-2 text-2xl font-semibold">{totals.users}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Trophy className="h-4 w-4" /> Total Trophy
          </div>
          <div className="mt-2 text-2xl font-semibold">{totals.trophies}</div>
          <div className="mt-1 text-xs text-gray-400">UCL {totals.ucl} • EUROPA {totals.europa}</div>
        </div>
        <Link
          href="/admin/trophies/requests"
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 hover:bg-amber-500/15"
        >
          <div className="flex items-center gap-2 text-sm text-amber-300">
            <Clock className="h-4 w-4" /> Pending Trophy
          </div>
          <div className="mt-2 text-2xl font-semibold text-amber-200">
            {pendingTrophies}
          </div>
          <div className="mt-1 text-xs text-amber-300/80">Klik untuk review</div>
        </Link>
        <Link
          href="/admin/users"
          className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 hover:bg-sky-500/15"
        >
          <div className="flex items-center gap-2 text-sm text-sky-300">
            <CheckCircle2 className="h-4 w-4" /> Pending Users
          </div>
          <div className="mt-2 text-2xl font-semibold text-sky-200">
            {pendingUsers}
          </div>
          <div className="mt-1 text-xs text-sky-300/80">Klik untuk approve</div>
        </Link>
      </section>

      {/* Quick actions (mobile-first single column) */}
      <section className="grid gap-4">
        <Link
          href="/admin/trophies"
          className="rounded-xl border border-white/10 bg-neutral-900/60 p-4 hover:bg-neutral-900/80"
        >
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Trophy className="h-5 w-5" /> CRUD Trophy
          </div>
          <div className="text-sm text-gray-400">
            Tambah, edit, dan hapus trophy milik user.
          </div>
        </Link>
      </section>

      {/* Recent activity */}
      <section className="rounded-xl border border-white/10 bg-neutral-900/60 p-4">
        <div className="mb-3 text-lg font-semibold">Aktivitas Terbaru</div>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada aktivitas.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {t.user?.name ?? t.user?.email ?? 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {t.competition} • {new Date(t.createdAt).toLocaleString()}
                  </div>
                </div>
                <span
                  className={
                    'ml-3 shrink-0 rounded-full px-2 py-0.5 text-xs ' +
                    (t.approved
                      ? 'border border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                      : 'border border-amber-400/40 bg-amber-500/10 text-amber-200')
                  }
                >
                  {t.approved ? 'Approved' : 'Pending'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Kembali ke situs dihapus sesuai permintaan */}
    </div>
  );
}
