// app/(admin)/admin/trophies/page.tsx
export const runtime = 'nodejs';

import Link from 'next/link';
import { prisma } from '@/lib/db';
import { createTrophy, updateTrophy, deleteTrophy } from './actions';

type Competition = 'UCL' | 'EUROPA';

export default async function AdminTrophiesPage() {
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, email: true },
  });

  const trophies = await prisma.trophyAward.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kelola Trophy (CRUD)</h1>
        <Link
          href="/admin"
          className="rounded-xl border border-white/10 px-3 py-1.5"
        >
          ← Kembali ke Dashboard
        </Link>
      </div>

      {/* Create */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4 space-y-4">
        <div className="text-lg font-semibold">Tambah Trophy</div>
        <form action={createTrophy} className="grid gap-3 sm:grid-cols-4">
          <label className="sm:col-span-2">
            <div className="text-sm text-gray-400 mb-1">User</div>
            <select
              name="userId"
              required
              className="w-full rounded-lg border border-white/10 bg-transparent p-2"
              defaultValue=""
            >
              <option value="" disabled>
                -- pilih user --
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name ?? u.email ?? u.id}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div className="text-sm text-gray-400 mb-1">Competition</div>
            <select
              name="competition"
              required
              className="w-full rounded-lg border border-white/10 bg-transparent p-2"
              defaultValue=""
            >
              <option value="" disabled>
                -- pilih --
              </option>
              <option value="UCL">UCL</option>
              <option value="EUROPA">EUROPA</option>
            </select>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="approved"
              className="h-4 w-4"
              defaultChecked
            />
            <span className="text-sm">Approved</span>
          </label>

          <div className="sm:col-span-4">
            <button
              type="submit"
              className="rounded-xl border border-white/10 px-4 py-2"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>

      {/* List + Inline Update */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4">
        <div className="text-lg font-semibold mb-3">Daftar Trophy</div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-400">
              <tr>
                <th className="px-2 py-2">ID</th>
                <th className="px-2 py-2">User</th>
                <th className="px-2 py-2">Competition &amp; Approved</th>
                <th className="px-2 py-2">Created</th>
                <th className="px-2 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {trophies.map((t) => {
                const userLabel =
                  t.user?.name ?? t.user?.email ?? t.user?.id ?? 'Unknown';
                const created =
                  t.createdAt instanceof Date
                    ? t.createdAt.toISOString()
                    : String(t.createdAt);

                return (
                  <tr key={t.id} className="border-t border-white/5">
                    <td className="px-2 py-2 align-top">{t.id}</td>
                    <td className="px-2 py-2 align-top">{userLabel}</td>
                    <td className="px-2 py-2 align-top">
                      <form
                        action={updateTrophy}
                        className="flex flex-wrap items-center gap-2"
                      >
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
                          <input
                            type="checkbox"
                            name="approved"
                            className="h-4 w-4"
                            defaultChecked={Boolean(t.approved)}
                          />
                          <span className="text-xs">Approved</span>
                        </label>
                        <button
                          type="submit"
                          className="rounded-lg border border-white/10 px-2 py-1"
                          title="Simpan perubahan"
                        >
                          Simpan
                        </button>
                      </form>
                    </td>
                    <td className="px-2 py-2 align-top">{created}</td>
                    <td className="px-2 py-2 align-top">
                      <form action={deleteTrophy}>
                        <input type="hidden" name="id" value={t.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-500/40 px-2 py-1 text-red-300 hover:bg-red-500/10"
                          title="Hapus"
                        >
                          Hapus
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}

              {trophies.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-2 py-6 text-center text-gray-400"
                  >
                    Belum ada trophy.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
