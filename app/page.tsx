// app/page.tsx
import { Trophy, ListOrdered, WifiOff, User2, Sparkles } from 'lucide-react';
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
          PES Trophy Leaderboard{' '}
          <span className="inline-block align-[-2px]">⚽️</span>
        </h1>
        <p className="mt-2 text-sm text-gray-300">
          Catat piala <b>UCL</b> & <b>Europa</b>. PWA siap offline & instal
          seperti aplikasi!
        </p>
      </header>

      <Card className="p-3">
        <div className="flex items-center gap-2 text-sm text-gray-100">
          <div className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-white/10 px-2 font-semibold">
            {name[0]?.toUpperCase() ?? 'U'}
          </div>
          <p>
            Halo, <b>{name}</b>!{' '}
            {session?.user.approved ? (
              <span className="text-emerald-300">Akun disetujui ✅</span>
            ) : (
              <span className="text-yellow-300">
                Menunggu persetujuan admin ⏳
              </span>
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
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-gray-400">
        UI <i>mobile-first</i> dengan gaya konsisten (rounded-xl, border halus,
        glass card, shadow-sm). Nikmati PWA + cache offline{' '}
        <Sparkles className="ml-1 inline h-3 w-3 align-[-2px]" />.
      </p>

      {session?.user?.role === 'ADMIN' && (
        <div className="mt-6">
          <Card className="p-3">
            <div className="mb-2 text-xs uppercase tracking-wide text-gray-400">
              Admin
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CTA href="/admin/trophies/requests" variant="outline">
                Review Trophy
              </CTA>
              <CTA href="/admin/users" variant="outline">
                Approve Users
              </CTA>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}
