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
    where: { userId },
    _count: { _all: true },
  });

  const recent = await prisma.trophyAward.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { competition: true, season: true, createdAt: true },
  });

  const ucl = grouped.find((g) => g.competition === 'UCL')?._count._all ?? 0;
  const europa =
    grouped.find((g) => g.competition === 'EUROPA')?._count._all ?? 0;
  const total = ucl + europa;

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">Profil Saya 👤</h1>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded border p-3 text-center">
          <div className="text-xs text-gray-500">UCL</div>
          <div className="text-2xl font-semibold">{ucl}</div>
        </div>
        <div className="rounded border p-3 text-center">
          <div className="text-xs text-gray-500">Europa</div>
          <div className="text-2xl font-semibold">{europa}</div>
        </div>
        <div className="rounded border p-3 text-center">
          <div className="text-xs text-gray-500">Total</div>
          <div className="text-2xl font-semibold">{total}</div>
        </div>
      </div>

      <h2 className="mt-6 text-lg font-semibold">Riwayat Terakhir</h2>
      <ul className="mt-2 space-y-2">
        {recent.length === 0 ? (
          <li className="text-sm text-gray-600">Belum ada trophy.</li>
        ) : (
          recent.map((r, i) => (
            <li key={i} className="rounded border p-2 text-sm">
              <div className="font-medium">{r.competition}</div>
              <div className="text-gray-600">{r.season}</div>
              <div className="text-gray-400">
                {new Date(r.createdAt).toLocaleString()}
              </div>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
