export const runtime = 'nodejs';

import Link from 'next/link';
import { prisma } from '@/lib/db';

export default async function AdminDashboardPage() {
  // Sesuaikan filter ini dengan skema kamu.
  // Asumsi: User dan TrophyAward punya field boolean `approved`.
  const [pendingUsers, pendingTrophies] = await Promise.all([
    prisma.user.count({ where: { approved: false } }),
    prisma.trophyAward.count({ where: { approved: false } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl p-4 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Admin Panel ⚙️</div>
        <nav className="flex gap-2">
          <Link
            href="/admin/requests"
            className="rounded-xl border border-white/10 px-3 py-1.5"
          >
            Requests
          </Link>
          <Link
            href="/admin/users"
            className="rounded-xl border border-white/10 px-3 py-1.5"
          >
            Users
          </Link>
        </nav>
      </div>

      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4 space-y-3">
          <div className="text-sm text-gray-400">Pending Users</div>
          <div className="text-3xl font-bold">{pendingUsers}</div>
          <Link
            href="/admin/approve-users"
            className="inline-block rounded-xl border border-white/10 px-3 py-2"
          >
            Kelola Users
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4 space-y-3">
          <div className="text-sm text-gray-400">Pending Trophy</div>
          <div className="text-3xl font-bold">{pendingTrophies}</div>
          <Link
            href="/admin/approve-trophy"
            className="inline-block rounded-xl border border-white/10 px-3 py-2"
          >
            Approve Trophy
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4">
        <div className="text-sm text-gray-400 mb-3">Aksi Cepat</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/leaderboard"
            className="rounded-xl border border-white/10 px-3 py-2 text-center"
          >
            Lihat Leaderboard (User)
          </Link>

          <Link
            href="/admin/trophies"
            className="rounded-xl border border-white/10 px-3 py-2 text-center"
          >
            Kelola Trophy (CRUD)
          </Link>

          <Link
            href="/admin/approve-trophy"
            className="rounded-xl border border-white/10 px-3 py-2 text-center"
          >
            Tinjau Trophy (Approve)
          </Link>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="sticky bottom-4 flex gap-3 justify-center">
        <Link
          href="/admin/approve-trophy"
          className="rounded-2xl border border-white/10 px-4 py-2"
        >
          Approve Trophy
        </Link>
        <Link
          href="/admin/approve-users"
          className="rounded-2xl border border-white/10 px-4 py-2"
        >
          Approve Users
        </Link>
      </div>
    </div>
  );
}
