import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/auth/LogoutButton';
import ThemeToggleButton from '@/components/common/ThemeToggleButton';

export default async function MePage({ searchParams }: { searchParams: any }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = session.user.id;

  const userFromDb = session.user.name
    ? null
    : await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });

  const displayName =
    session.user.name ??
    userFromDb?.name ??
    (session.user.email ? session.user.email.split('@')[0] : 'User');

  const grouped = await prisma.trophyAward.groupBy({
    by: ['competition'],
    where: { userId, approved: true },
    _count: { _all: true },
  });

  // riwayat ringkas di halaman ini dihapus; lihat /me/riwayat

  const ucl = grouped.find((g) => g.competition === 'UCL')?._count._all ?? 0;
  const europa =
    grouped.find((g) => g.competition === 'EUROPA')?._count._all ?? 0;
  const total = ucl + europa;

  const sp = await searchParams;
  const showSubmittedAlert = sp?.submitted === '1';

  return (
    <main className="mx-auto w-full max-w-md p-5 pb-28">
      {/* --- NEW: header dengan nama --- */}
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-sm font-semibold dark:border-white/10 dark:bg-white/10">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none">{displayName}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <LogoutButton label="Logout" />
        </div>
      </header>

      {showSubmittedAlert && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 shadow-sm dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200">
          Pengajuan trophy berhasil. Menunggu FIFA memberikan trophy.
        </div>
      )}

      {/* statistik singkat */}
      <section className="grid grid-cols-3 gap-3">
        <Stat label="UCL" value={ucl} />
        <Stat label="Europa" value={europa} />
        <Stat label="Total" value={total} />
      </section>

      <div className="mt-6">
        <a
          href="/me/riwayat"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-white/10 dark:bg-white/10 dark:text-white"
        >
          Riwayat Saya
        </a>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
