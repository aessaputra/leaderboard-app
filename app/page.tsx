import {
  Trophy,
  ListOrdered,
  WifiOff,
  User2,
  LogIn,
  UserPlus,
  Sparkles,
  Settings2,
} from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Card, CTA } from '@/components/ui/cta';

export default async function Home() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name ?? 'Teman';

  return (
    <main>
      <header className="mb-5">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          PES Trophy Leaderboard ⚽️
        </h1>
        <p className="mt-2 text-sm text-gray-300">
          Catat piala <b>UCL</b> & <b>Europa</b>. PWA siap offline & instal
          seperti aplikasi.
        </p>
      </header>

      <Card className="p-3">
        <div className="flex items-center gap-2 text-sm text-gray-100">
          <div className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-white/10 px-2 font-semibold">
            {name[0]?.toUpperCase() ?? 'U'}
          </div>
          <p>
            Halo, <b>{name}</b>!{' '}
            {session?.user?.approved ? (
              <span className="text-emerald-300">Akun disetujui ✅</span>
            ) : session ? (
              <span className="text-yellow-300">
                Menunggu persetujuan admin ⏳
              </span>
            ) : (
              <span className="text-sky-300">Silakan login/registrasi</span>
            )}
          </p>
        </div>
      </Card>

      <div className="mt-5 space-y-3">
        <CTA href="/trophies/new" variant="primary">
          <Trophy className="h-4 w-4" />
          Ajukan Trophy
        </CTA>

        <CTA href="/leaderboard">
          <ListOrdered className="h-4 w-4" />
          Lihat Leaderboard
        </CTA>

        <CTA href="/offline">
          <WifiOff className="h-4 w-4" />
          Coba Halaman Offline
        </CTA>

        <CTA href="/me">
          <User2 className="h-4 w-4" />
          Profil Saya
        </CTA>

        {!session && (
          <>
            <CTA href="/login">
              <LogIn className="h-4 w-4" />
              Login
            </CTA>
            <CTA href="/register">
              <UserPlus className="h-4 w-4" />
              Register
            </CTA>
          </>
        )}
      </div>

      {session?.user?.role === 'ADMIN' && (
        <div className="mt-6">
          <Card className="p-3">
            <div className="mb-2 text-xs uppercase tracking-wide text-gray-400">
              Admin
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CTA href="/admin/trophies/requests">Review Trophy</CTA>
              <CTA href="/admin/trophies/manage">
                <Settings2 className="h-4 w-4" />
                Kelola Trophy
              </CTA>
              <CTA href="/admin/users">Approve Users</CTA>
            </div>
          </Card>
        </div>
      )}

      <p className="mt-6 text-[11px] leading-relaxed text-gray-400">
        UI mobile-first konsisten (rounded-xl, glass card, hover halus). Nikmati
        PWA + offline cache{' '}
        <Sparkles className="ml-1 inline h-3 w-3 align-[-2px]" />.
      </p>
    </main>
  );
}
