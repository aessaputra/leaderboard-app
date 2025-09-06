export const runtime = 'nodejs';

import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/trophies"
          className="rounded-xl border border-white/10 bg-neutral-900/60 p-4 hover:bg-neutral-900/80"
        >
          <div className="text-lg font-semibold">CRUD Trophy</div>
          <div className="text-sm text-gray-400">
            Tambah, edit, dan hapus trophy milik user.
          </div>
        </Link>

        <Link
          href="/admin/approve-trophy"
          className="rounded-xl border border-white/10 bg-neutral-900/60 p-4 hover:bg-neutral-900/80"
        >
          <div className="text-lg font-semibold">Approve Trophy</div>
          <div className="text-sm text-gray-400">
            Tinjau dan setujui pengajuan trophy.
          </div>
        </Link>

        <Link
          href="/admin/approve-users"
          className="rounded-xl border border-white/10 bg-neutral-900/60 p-4 hover:bg-neutral-900/80"
        >
          <div className="text-lg font-semibold">Approve Users</div>
          <div className="text-sm text-gray-400">
            Verifikasi/aktifkan akun user.
          </div>
        </Link>

        <Link
          href="/"
          className="rounded-xl border border-white/10 bg-neutral-900/60 p-4 hover:bg-neutral-900/80"
        >
          <div className="text-lg font-semibold">← Kembali ke Situs</div>
          <div className="text-sm text-gray-400">Kembali ke halaman utama.</div>
        </Link>
      </div>
    </div>
  );
}
