import { prisma } from '@/lib/db';

type LeaderboardRow = {
  id: string;
  name: string;
  ucl: number;
  europa: number;
  total: number;
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const season = typeof sp.season === 'string' ? sp.season : undefined;

  const compRaw = sp.competition;
  const comp =
    compRaw === 'UCL' || compRaw === 'EUROPA'
      ? (compRaw as 'UCL' | 'EUROPA')
      : undefined;

  const group = await prisma.trophyAward.groupBy({
    by: ['userId', 'competition'],
    where: {
      ...(season ? { season } : {}),
      ...(comp ? { competition: comp } : {}),
    },
    _count: { _all: true },
  });

  const userIds = [...new Set(group.map((g) => g.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const byId = new Map(users.map((u) => [u.id, u.name]));

  const rowsMap = new Map<string, LeaderboardRow>();
  for (const g of group) {
    const cur = rowsMap.get(g.userId) ?? {
      id: g.userId,
      name: byId.get(g.userId) ?? '(unknown)',
      ucl: 0,
      europa: 0,
      total: 0,
    };
    if (g.competition === 'UCL') cur.ucl += g._count._all;
    if (g.competition === 'EUROPA') cur.europa += g._count._all;
    cur.total = cur.ucl + cur.europa;
    rowsMap.set(g.userId, cur);
  }

  const rows = Array.from(rowsMap.values()).sort(
    (a, b) => b.total - a.total || b.ucl - a.ucl || a.name.localeCompare(b.name)
  );

  return (
    <main className="mx-auto w-full max-w-md md:max-w-2xl p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold">Leaderboard</h1>
      <p className="mt-1 text-sm text-gray-600">
        {season ? `Musim ${season}` : 'Semua musim'}
        {comp ? ` · Kompetisi ${comp}` : ''}
      </p>

      {/* Mobile cards */}
      <ul className="mt-4 space-y-3 md:hidden">
        {rows.length === 0 ? (
          <li className="rounded-2xl border p-4 text-sm text-gray-600">
            Belum ada data trophy.
          </li>
        ) : (
          rows.map((r, i) => (
            <li
              key={r.id}
              className="rounded-2xl border p-4 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">
                  {i + 1}. {r.name}
                </div>
                <div className="text-xs text-gray-500">{r.total} total</div>
              </div>
              <div className="mt-2 flex gap-2 text-sm">
                <span className="inline-block rounded-full border px-2 py-0.5">
                  UCL: {r.ucl}
                </span>
                <span className="inline-block rounded-full border px-2 py-0.5">
                  Europa: {r.europa}
                </span>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Desktop table */}
      <div className="mt-4 overflow-x-auto rounded border hidden md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Pemain</th>
              <th className="px-3 py-2 text-right">UCL</th>
              <th className="px-3 py-2 text-right">Europa</th>
              <th className="px-3 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-3" colSpan={5}>
                  Belum ada data trophy.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2 text-right">{r.ucl}</td>
                  <td className="px-3 py-2 text-right">{r.europa}</td>
                  <td className="px-3 py-2 text-right font-medium">
                    {r.total}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
