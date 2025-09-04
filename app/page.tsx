// app/page.tsx
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  Trophy,
  ShieldCheck,
  Users,
  WifiOff,
  ListOrdered,
  User as UserIcon,
  LogIn,
  UserPlus,
} from 'lucide-react';

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isAuthed = Boolean(session);
  const isAdmin = session?.user.role === 'ADMIN';
  const approved = session?.user.approved ?? false;
  const displayName = session?.user.name || session?.user.email || 'Kamu';

  return (
    <main className="mx-auto w-full max-w-md md:max-w-lg p-4 md:p-6">
      <header>
        <h1 className="text-xl md:text-2xl font-bold">
          PES Trophy Leaderboard ⚽️
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Catat piala UCL & Europa. Install sebagai aplikasi (PWA) dan tetap
          bisa lihat leaderboard saat offline.
        </p>
      </header>

      {/* Banner status akun */}
      {isAuthed ? (
        <section className="mt-4 rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm">
            <span className="font-semibold">Halo, {displayName}!</span>{' '}
            {!approved ? (
              <span className="text-amber-700">
                Akun kamu sedang menunggu persetujuan admin. Beberapa fitur
                dibatasi.
              </span>
            ) : (
              <span className="text-green-700">Akun sudah disetujui ✅</span>
            )}
          </div>
        </section>
      ) : (
        <section className="mt-4 grid grid-cols-1 gap-3">
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100"
          >
            <UserPlus className="h-4 w-4" />
            Daftar
          </Link>
        </section>
      )}

      {/* Aksi utama (mobile-first buttons) */}
      <nav className="mt-6 grid grid-cols-1 gap-3">
        {/* User ajukan trophy */}
        {isAuthed && (
          <Link
            href="/trophies/new"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100"
          >
            <Trophy className="h-4 w-4" />
            Ajukan Trophy
          </Link>
        )}

        {/* Leaderboard & Offline */}
        <Link
          href="/leaderboard"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100"
        >
          <ListOrdered className="h-4 w-4" />
          Lihat Leaderboard
        </Link>
        <Link
          href="/offline"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100"
        >
          <WifiOff className="h-4 w-4" />
          Coba Halaman Offline
        </Link>

        {/* Menu Admin (hanya untuk ADMIN) */}
        {isAdmin && (
          <>
            <Link
              href="/admin/trophies/requests"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin: Permintaan Trophy
            </Link>
            <Link
              href="/admin/users"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100"
            >
              <Users className="h-4 w-4" />
              Admin: Approve Users
            </Link>
          </>
        )}

        {/* Profil */}
        {isAuthed && (
          <Link
            href="/me"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium hover:bg-gray-50 active:bg-gray-100"
          >
            <UserIcon className="h-4 w-4" />
            Profil Saya
          </Link>
        )}
      </nav>

      <footer className="mt-6 text-xs text-gray-500">
        UI mobile-first dengan gaya konsisten (rounded-xl, border halus, card
        putih, shadow-sm). Nikmati PWA + offline cache ✨
      </footer>
    </main>
  );
}
