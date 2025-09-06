import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { LogOut, CheckCheck, Hourglass } from 'lucide-react';
import LogoutButton from '@/components/auth/LogoutButton';

export default async function MePage() {
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

  const recent = await prisma.trophyAward.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { competition: true, createdAt: true, approved: true, id: true },
  });

  const ucl = grouped.find((g) => g.competition === 'UCL')?._count._all ?? 0;
  const europa =
    grouped.find((g) => g.competition === 'EUROPA')?._count._all ?? 0;
  const total = ucl + europa;

  return (
    <main className="mx-auto w-full max-w-md p-5 pb-28">
      {/* --- NEW: header dengan nama --- */}
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-semibold">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none">Profil Saya</h1>
            <p className="mt-0.5 text-xs text-gray-400">Halo, {displayName}</p>
          </div>
        </div>

        <LogoutButton label="Logout" />
      </header>

      {/* statistik singkat */}
      <section className="grid grid-cols-3 gap-3">
        <Stat label="UCL" value={ucl} />
        <Stat label="Europa" value={europa} />
        <Stat label="Total" value={total} />
      </section>

      <h2 className="mt-6 mb-2 text-sm font-semibold tracking-wide text-gray-300">
        Riwayat Terakhir
      </h2>

      <ul className="space-y-3">
        {recent.length === 0 ? (
          <li className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">
            Belum ada trophy.
          </li>
        ) : (
          recent.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-white/10 bg-gradient-to-b from-white/6 to-white/4 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold">
                  {r.competition}
                </span>

                {r.approved ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                    <CheckCheck className="h-3.5 w-3.5" />
                    Approved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200">
                    <Hourglass className="h-3.5 w-3.5" />
                    Menunggu
                  </span>
                )}
              </div>

              <div className="mt-2 text-xs text-gray-400">
                {new Date(r.createdAt).toLocaleString()}
              </div>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-gray-400">
        {label}
      </div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
