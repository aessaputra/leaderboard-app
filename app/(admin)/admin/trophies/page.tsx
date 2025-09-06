// app/(admin)/admin/trophies/page.tsx
export const runtime = 'nodejs';

import Link from 'next/link';
import { prisma } from '@/lib/db';
import { createTrophy, updateTrophy, deleteTrophy } from './actions';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Trophy, Trash2, Save, Filter, CheckCircle2, Clock } from 'lucide-react';

type Competition = 'UCL' | 'EUROPA';

export default async function AdminTrophiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    userId?: string;
    competition?: string;
    approved?: string;
  }>;
}) {
  const session = await getServerSession(authOptions);
  const adminId = session?.user?.id ?? '';

  const sp = await searchParams;
  const selectedUserId = sp?.userId ?? '';
  const selectedComp = sp?.competition ?? '';
  const approvedParam = sp?.approved ?? '';
  const approvedFilter = approvedParam === 'true' ? true : approvedParam === 'false' ? false : undefined;

  const [usersForFilter, usersForCreate, trophies] = await Promise.all([
    prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, approved: true },
    }),
    prisma.user.findMany({
      where: { approved: true, ...(adminId ? { NOT: { id: adminId } } : {}) },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true },
    }),
    prisma.trophyAward.findMany({
      where: {
        ...(selectedUserId ? { userId: selectedUserId } : {}),
        ...(selectedComp === 'UCL' || selectedComp === 'EUROPA' ? { competition: selectedComp as Competition } : {}),
        ...(approvedFilter === undefined ? {} : { approved: approvedFilter }),
      },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-md px-3 py-6 sm:max-w-5xl sm:px-4 sm:py-8 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">Kelola Trophy (CRUD)</h1>
        <div className="hidden sm:block text-sm text-gray-400">Total: {trophies.length}</div>
      </header>

      {/* Filter */}
      <section className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-300">
          <Filter className="h-4 w-4" /> Filter
        </div>
        <form method="GET" className="grid gap-3 sm:grid-cols-4">
          <label className="sm:col-span-2">
            <div className="mb-1 text-sm text-gray-400">User</div>
            <select name="userId" className="w-full rounded-lg border border-white/10 bg-transparent p-2" defaultValue={selectedUserId}>
              <option value="">Semua user</option>
              {usersForFilter.map((u) => (
                <option key={u.id} value={u.id}>
                  {(u.name ?? u.email ?? u.id) + (u.approved ? '' : ' (pending)')}
                </option>
              ))}
            </select>
          </label>
          <label>
            <div className="mb-1 text-sm text-gray-400">Competition</div>
            <select name="competition" className="w-full rounded-lg border border-white/10 bg-transparent p-2" defaultValue={selectedComp}>
              <option value="">Semua</option>
              <option value="UCL">UCL</option>
              <option value="EUROPA">EUROPA</option>
            </select>
          </label>
          <label>
            <div className="mb-1 text-sm text-gray-400">Status</div>
            <select name="approved" className="w-full rounded-lg border border-white/10 bg-transparent p-2" defaultValue={approvedParam}>
              <option value="">Semua</option>
              <option value="true">Approved</option>
              <option value="false">Pending</option>
            </select>
          </label>
          <div className="sm:col-span-4 flex items-center gap-2">
            <button className="rounded-xl border border-white/10 px-4 py-2 text-sm">Terapkan</button>
            <Link href="/admin/trophies" className="rounded-xl border border-white/10 px-3 py-2 text-sm">
              Reset
            </Link>
          </div>
        </form>
      </section>

      {/* Create */}
      <section className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Trophy className="h-5 w-5" /> Tambah Trophy
        </div>
        <form action={createTrophy} className="grid gap-3 sm:grid-cols-4">
          <label className="sm:col-span-2">
            <div className="mb-1 text-sm text-gray-400">User</div>
            <select name="userId" required className="w-full rounded-lg border border-white/10 bg-transparent p-2" defaultValue="">
              <option value="" disabled>
                -- pilih user --
              </option>
              {usersForCreate.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name ?? u.email ?? u.id}
                </option>
              ))}
            </select>
          </label>
          <label>
            <div className="mb-1 text-sm text-gray-400">Competition</div>
            <select name="competition" required className="w-full rounded-lg border border-white/10 bg-transparent p-2" defaultValue="">
              <option value="" disabled>
                -- pilih --
              </option>
              <option value="UCL">UCL</option>
              <option value="EUROPA">EUROPA</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="approved" className="h-4 w-4" defaultChecked />
            <span className="text-sm">Approved</span>
          </label>
          <div className="sm:col-span-4">
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2">
              <Save className="h-4 w-4" /> Simpan
            </button>
          </div>
        </form>
      </section>

      {/* List */}
      <section className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4">
        <div className="mb-3 text-lg font-semibold">Daftar Trophy</div>
        {trophies.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">Belum ada trophy.</div>
        ) : (
          <ul className="space-y-3">
            {trophies.map((t) => {
              const userLabel = t.user?.name ?? t.user?.email ?? t.user?.id ?? 'Unknown';
              const created = t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt);
              return (
                <li key={t.id} className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="truncate text-base font-medium">{userLabel}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-semibold">{t.competition}</span>
                        <span
                          className={
                            'inline-flex items-center gap-1 rounded px-2 py-0.5 ' +
                            (t.approved
                              ? 'border border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                              : 'border border-amber-400/40 bg-amber-500/10 text-amber-200')
                          }
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> {t.approved ? 'Approved' : 'Pending'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-gray-400">
                          <Clock className="h-3.5 w-3.5" /> {created}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
                      <form action={updateTrophy} className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
                        <input type="hidden" name="id" value={t.id} />
                        <select
                          name="competition"
                          className="rounded-lg border border-white/10 bg-transparent p-1"
                          defaultValue={t.competition as Competition}
                        >
                          <option value="UCL">UCL</option>
                          <option value="EUROPA">EUROPA</option>
                        </select>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" name="approved" className="h-4 w-4" defaultChecked={Boolean(t.approved)} />
                          <span className="text-xs">Approved</span>
                        </label>
                        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-2 py-1 text-sm" title="Simpan perubahan">
                          <Save className="h-4 w-4" /> Simpan
                        </button>
                      </form>
                      <form action={deleteTrophy}>
                        <input type="hidden" name="id" value={t.id} />
                        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/40 px-2 py-1 text-sm text-red-300 hover:bg-red-500/10" title="Hapus">
                          <Trash2 className="h-4 w-4" /> Hapus
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
