import { prisma } from '@/lib/db';
import { Card } from '@/components/ui/cta';
import { Trophy } from 'lucide-react';

type LBParams = { competition?: 'UCL' | 'EUROPA' };

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<LBParams>;
}) {
  const { competition } = await searchParams;

  const where = {
    approved: true,
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
    <main>
      <header className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold inline-flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Leaderboard
        </h1>
        <p className="mt-1 text-sm text-gray-300">
          {competition ?? 'Semua kompetisi'}
        </p>
      </header>

      <Card className="mb-4 p-3">
        <form className="grid grid-cols-3 gap-2" method="get">
          <select
            name="competition"
            defaultValue={competition ?? ''}
            className="col-span-3 rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2"
          >
            <option value="">Semua Kompetisi</option>
            <option value="UCL">UCL</option>
            <option value="EUROPA">Europa</option>
          </select>
        </form>
      </Card>

      {rows.length === 0 ? (
        <Card className="p-6 text-center text-sm text-gray-300">
          Belum ada trophy disetujui.
        </Card>
      ) : (
        <Card className="divide-y divide-white/10">
          <ul>
            {rows.map((r, i) => (
              <li
                key={r.name}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold">
                    {i + 1}
                  </span>
                  <div className="font-medium">{r.name}</div>
                </div>
                <div className="text-xs text-gray-200">
                  <span className="mr-2 rounded-full border border-indigo-300/30 px-2 py-0.5">
                    UCL {r.UCL}
                  </span>
                  <span className="mr-2 rounded-full border border-amber-300/30 px-2 py-0.5">
                    Europa {r.EUROPA}
                  </span>
                  <span className="rounded-full bg-white text-gray-900 px-2 py-0.5 font-semibold">
                    Total {r.total}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </main>
  );
}
