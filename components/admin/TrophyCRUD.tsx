'use client';

import { useEffect, useMemo, useState } from 'react';

type Competition = 'UCL' | 'EUROPA';
type UserMini = { id: string; name: string | null };

type TrophyItem = {
  id: string;
  userId: string;
  userName: string;
  competition: Competition;
  approved: boolean;
  createdAt: string; // ISO
};

type ListResp = {
  items: TrophyItem[];
  total: number;
  page: number;
  pageSize: number;
};

export default function TrophyCRUD({ users }: { users: UserMini[] }) {
  // Filters
  const [fUser, setFUser] = useState<string>('');
  const [fComp, setFComp] = useState<Competition | ''>('');
  const [fApproved, setFApproved] = useState<'all' | 'true' | 'false'>('all');

  // Paging + data
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [rows, setRows] = useState<TrophyItem[]>([]);
  const [total, setTotal] = useState(0);
  const maxPage = useMemo(
    () => Math.max(Math.ceil(total / pageSize), 1),
    [total, pageSize]
  );

  // Create form
  const [cUser, setCUser] = useState<string>(users[0]?.id ?? '');
  const [cComp, setCComp] = useState<Competition>('UCL');
  const [cApproved, setCApproved] = useState(false);

  const [busy, setBusy] = useState(false);
  const [editRow, setEditRow] = useState<string | null>(null);
  const [editComp, setEditComp] = useState<Competition>('UCL');
  const [editApproved, setEditApproved] = useState<boolean>(false);

  async function load() {
    const qs = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (fUser) qs.set('userId', fUser);
    if (fComp) qs.set('competition', fComp);
    if (fApproved !== 'all') qs.set('approved', fApproved);

    const res = await fetch(`/api/admin/trophies?${qs.toString()}`, {
      cache: 'no-store',
    });
    const json = (await res.json()) as ListResp;
    setRows(json.items);
    setTotal(json.total);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, fUser, fComp, fApproved]);

  function resetFilters() {
    setFUser('');
    setFComp('');
    setFApproved('all');
    setPage(1);
  }

  async function createOne() {
    if (!cUser) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/trophies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: cUser,
          competition: cComp,
          approved: cApproved,
        }),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        throw new Error(j.error ?? 'Gagal membuat trophy');
      }
      setPage(1);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Gagal');
    } finally {
      setBusy(false);
    }
  }

  function startEdit(t: TrophyItem) {
    setEditRow(t.id);
    setEditComp(t.competition);
    setEditApproved(t.approved);
  }

  async function saveEdit(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/trophies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ competition: editComp, approved: editApproved }),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        throw new Error(j.error ?? 'Gagal mengedit trophy');
      }
      setEditRow(null);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Gagal');
    } finally {
      setBusy(false);
    }
  }

  async function removeOne(id: string) {
    if (!confirm('Hapus trophy ini?')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/trophies/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Gagal menghapus trophy');
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Gagal');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="rounded-2xl border border-white/10 p-4 bg-neutral-900/60 space-y-3">
        <div className="text-lg font-semibold">Filter</div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-400">User</span>
            <select
              value={fUser}
              onChange={(e) => {
                setFUser(e.target.value);
                setPage(1);
              }}
              className="rounded-xl bg-black/40 border border-white/10 px-3 py-2"
            >
              <option value="">(Semua)</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name ?? '(tanpa nama)'} — {u.id}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-400">Kompetisi</span>
            <select
              value={fComp}
              onChange={(e) => {
                setFComp(e.target.value as Competition | '');
                setPage(1);
              }}
              className="rounded-xl bg-black/40 border border-white/10 px-3 py-2"
            >
              <option value="">(Semua)</option>
              <option value="UCL">UCL</option>
              <option value="EUROPA">EUROPA</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-400">Status</span>
            <select
              value={fApproved}
              onChange={(e) => {
                setFApproved(e.target.value as 'all' | 'true' | 'false');
                setPage(1);
              }}
              className="rounded-xl bg-black/40 border border-white/10 px-3 py-2"
            >
              <option value="all">(Semua)</option>
              <option value="true">Approved</option>
              <option value="false">Pending</option>
            </select>
          </label>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="rounded-2xl border border-white/10 px-3 py-2 w-full"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Create */}
      <div className="rounded-2xl border border-white/10 p-4 bg-neutral-900/60 space-y-3">
        <div className="text-lg font-semibold">Tambah Trophy</div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-400">User</span>
            <select
              value={cUser}
              onChange={(e) => setCUser(e.target.value)}
              className="rounded-xl bg-black/40 border border-white/10 px-3 py-2"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name ?? '(tanpa nama)'} — {u.id}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-400">Kompetisi</span>
            <select
              value={cComp}
              onChange={(e) => setCComp(e.target.value as Competition)}
              className="rounded-xl bg-black/40 border border-white/10 px-3 py-2"
            >
              <option value="UCL">UCL</option>
              <option value="EUROPA">EUROPA</option>
            </select>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={cApproved}
              onChange={(e) => setCApproved(e.target.checked)}
            />
            <span>Approved?</span>
          </label>

          <div className="flex items-end">
            <button
              onClick={createOne}
              disabled={busy || !cUser}
              className="rounded-2xl border border-white/10 px-3 py-2 w-full disabled:opacity-50"
            >
              Tambah
            </button>
          </div>
        </div>
      </div>

      {/* List + edit/delete */}
      <div className="rounded-2xl border border-white/10 p-4 bg-neutral-900/60 space-y-3">
        <div className="text-lg font-semibold">Daftar Trophy</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-400">
              <tr>
                <th className="py-2 pr-4">User</th>
                <th className="py-2 pr-4">Kompetisi</th>
                <th className="py-2 pr-4">Approved</th>
                <th className="py-2 pr-4">Dibuat</th>
                <th className="py-2 pr-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-t border-white/5">
                  <td className="py-2 pr-4">{t.userName || t.userId}</td>
                  <td className="py-2 pr-4">
                    {editRow === t.id ? (
                      <select
                        value={editComp}
                        onChange={(e) =>
                          setEditComp(e.target.value as Competition)
                        }
                        className="rounded-lg bg-black/40 border border-white/10 px-2 py-1"
                      >
                        <option value="UCL">UCL</option>
                        <option value="EUROPA">EUROPA</option>
                      </select>
                    ) : (
                      t.competition
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {editRow === t.id ? (
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editApproved}
                          onChange={(e) => setEditApproved(e.target.checked)}
                        />
                        <span>{editApproved ? 'Approved' : 'Pending'}</span>
                      </label>
                    ) : t.approved ? (
                      'Approved'
                    ) : (
                      'Pending'
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 pr-4">
                    {editRow === t.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(t.id)}
                          disabled={busy}
                          className="rounded-xl border border-white/10 px-2 py-1"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => setEditRow(null)}
                          className="rounded-xl border border-white/10 px-2 py-1"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(t)}
                          className="rounded-xl border border-white/10 px-2 py-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => removeOne(t.id)}
                          className="rounded-xl border border-white/10 px-2 py-1"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-400">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            Halaman {page} / {maxPage}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-xl border border-white/10 px-3 py-1 disabled:opacity-50"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
              disabled={page >= maxPage}
              className="rounded-xl border border-white/10 px-3 py-1 disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
