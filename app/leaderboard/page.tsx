import { prisma } from '@/lib/db';
import { Trophy } from 'lucide-react';

type LBParams = {
  season?: string;
  competition?: 'UCL' | 'EUROPA';
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<LBParams>;
}) {
  const { season, competition } = await searchParams;

  const where = {
    approved: true,
    ...(season ? { season } : {}),
    ...(competition ? { competition } : {}),
  } as const;

  const grouped = await prisma.trophyAward.groupBy({
    by: ['userId', 'competition'],
    where,
    _count: { _all: true },
  });

  const ids = [...new Set(grouped.map((g) => g.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u.name || 'User']));

  // Hitung total per user
  const agg = new Map<
    string,
    { name: string; UCL: number; EUROPA: number; total: number }
  >();
  for (const g of grouped) {
    const name = userMap.get(g.userId) ?? 'User';
    const cur = agg.get(g.userId) || { name, UCL: 0, EUROPA: 0, total: 0 };
    if (g.competition === 'UCL') cur.UCL += g._count._all;
    if (g.competition === 'EUROPA') cur.EUROPA += g._count._all;
    cur.total = cur.UCL + cur.EUROPA;
    agg.set(g.userId, cur);
  }

  const rows = [...agg.values()].sort((a, b) => b.total - a.total);

  return (
    <main className="mx-auto w-full max-w-md p-4 md:max-w-lg md:p-6">
      <h1 className="text-xl md:text-2xl font-bold inline-flex items-center gap-2">
        <Trophy className="h-5 w-5" />
        Leaderboard
      </h1>

      <div className="mt-3 text-xs text-gray-600">
        {season ? `Musim ${season}` : 'Semua musim'} •{' '}
        {competition ?? 'Semua kompetisi'}
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-gray-600">
          Belum ada trophy yang disetujui.
        </p>
      ) : (
        <ul className="mt-4 divide-y rounded-2xl border bg-white">
          {rows.map((r, i) => (
            <li key={r.name} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="w-6 text-center text-sm font-semibold">
                  {i + 1}
                </span>
                <div className="font-medium">{r.name}</div>
              </div>
              <div className="text-sm text-gray-700">
                <span className="rounded-full border px-2 py-0.5 text-xs mr-2">
                  UCL {r.UCL}
                </span>
                <span className="rounded-full border px-2 py-0.5 text-xs mr-2">
                  Europa {r.EUROPA}
                </span>
                <span className="rounded-full border px-2 py-0.5 text-xs font-semibold">
                  Total {r.total}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
