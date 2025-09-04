import Link from 'next/link';

export default function Home() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">PES Trophy Leaderboard ⚽️</h1>
      <p className="mt-2 text-sm text-gray-600">
        Catat piala UCL & Europa. Install sebagai aplikasi (PWA) dan tetap bisa
        lihat leaderboard saat offline.
      </p>

      <div className="mt-6 space-y-3">
        <a
          href="/trophies/new"
          className="inline-flex w-full items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium hover:bg-gray-50"
        >
          Ajukan Trophy 🏆
        </a>
        <Link
          href="/leaderboard"
          className="inline-flex w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Lihat Leaderboard
        </Link>
        <Link
          href="/offline"
          className="inline-flex w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Coba Halaman Offline
        </Link>
        <a
          href="/admin/trophies/new"
          className="inline-flex w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Admin: Tambah Trophy
        </a>
        <a
          href="/admin/users"
          className="inline-flex w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Admin: Approve Users
        </a>
        <a
          href="/leaderboard"
          className="inline-flex w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Lihat Leaderboard
        </a>
        <a
          href="/me"
          className="inline-flex w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Profil Saya
        </a>
      </div>

      <p className="mt-6 text-xs text-gray-500">
        (Menu admin, auth, dan input trophy akan kita aktifkan di langkah
        berikutnya.)
      </p>
    </main>
  );
}
