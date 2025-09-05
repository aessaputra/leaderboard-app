import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function MePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = session.user.id;

  const grouped = await prisma.trophyAward.groupBy({
    by: ['competition'],
    where: { userId, approved: true },
    _count: { _all: true },
  });

  const recent = await prisma.trophyAward.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { competition: true, createdAt: true, approved: true },
  });

  const ucl = grouped.find((g) => g.competition === 'UCL')?._count._all ?? 0;
  const europa =
    grouped.find((g) => g.competition === 'EUROPA')?._count._all ?? 0;
  const total = ucl + europa;

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">Profil Saya 👤</h1>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/15 bg-white/5 p-3 text-center shadow-sm backdrop-blur">
          <div className="text-xs text-gray-400">UCL</div>
          <div className="text-2xl font-semibold">{ucl}</div>
        </div>
        <div className="rounded-xl border border-white/15 bg-white/5 p-3 text-center shadow-sm backdrop-blur">
          <div className="text-xs text-gray-400">Europa</div>
          <div className="text-2xl font-semibold">{europa}</div>
        </div>
        <div className="rounded-xl border border-white/15 bg-white/5 p-3 text-center shadow-sm backdrop-blur">
          <div className="text-xs text-gray-400">Total</div>
          <div className="text-2xl font-semibold">{total}</div>
        </div>
      </div>

      <h2 className="mt-6 text-lg font-semibold">Riwayat Terakhir</h2>
      <ul className="mt-2 space-y-2">
        {recent.length === 0 ? (
          <li className="text-sm text-gray-400">Belum ada trophy.</li>
        ) : (
          recent.map((r, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 p-3 text-sm"
            >
              <div>
                <div className="font-medium">{r.competition}</div>
                <div className="text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleString()}
                </div>
              </div>
              <span
                className={[
                  'text-xs rounded-full px-2 py-1 border',
                  r.approved
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                    : 'bg-yellow-500/15 text-yellow-300 border-yellow-400/30',
                ].join(' ')}
              >
                {r.approved ? 'Approved ✅' : 'Menunggu ⏳'}
              </span>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
