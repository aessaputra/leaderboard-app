import { prisma } from '@/lib/db';
import { Crown, Medal, Trophy } from 'lucide-react';
import FilterClient from './FilterClient';
import { Suspense } from 'react';

type Query = { competition?: 'UCL' | 'EUROPA' };

export default async function LeaderboardPage({ searchParams }: any) {
  // Next.js v15 provides searchParams as a Promise; older versions provide an object.
  const { competition } = await searchParams;

  const where = competition
    ? { approved: true, competition }
    : { approved: true as const };

  const grouped = await prisma.trophyAward.groupBy({
    by: ['userId', 'competition'],
    where,
    _count: { _all: true },
  });

  const userIds = Array.from(new Set(grouped.map((g) => g.userId)));
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const nameById = new Map(users.map((u) => [u.id, u.name ?? 'Tanpa Nama']));

  const byUser = new Map<
    string,
    { id: string; name: string; ucl: number; europa: number; total: number }
  >();
  for (const g of grouped) {
    const v = byUser.get(g.userId) ?? {
      id: g.userId,
      name: nameById.get(g.userId) ?? 'Tanpa Nama',
      ucl: 0,
      europa: 0,
      total: 0,
    };
    if (g.competition === 'UCL') v.ucl = g._count._all;
    if (g.competition === 'EUROPA') v.europa = g._count._all;
    v.total = v.ucl + v.europa;
    byUser.set(g.userId, v);
  }

  const rows = Array.from(byUser.values()).sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    if (b.ucl !== a.ucl) return b.ucl - a.ucl; // tie-break: UCL lebih prestis
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="mx-auto w-full max-w-md">
      <header className="mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-400" />
        <h1 className="text-xl font-semibold">Leaderboard</h1>
      </header>

      <div className="mb-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2">
          <Suspense fallback={null}>
            <FilterClient initial={competition} />
          </Suspense>
        </div>
        <p className="mt-2 text-xs text-white/60">
          {competition ? `Kompetisi: ${competition}` : 'Semua kompetisi'}
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <ol className="mt-3 space-y-3" aria-label="Peringkat pemain">
          {rows.map((r, idx) =>
            idx === 0 ? (
              <TopCard key={r.id} rank={1} data={r} />
            ) : (
              <RankCard key={r.id} rank={idx + 1} data={r} />
            )
          )}
        </ol>
      )}
    </div>
  );
}

/* ====== UI helpers (server-safe) ====== */
function Pill({
  children,
  tone = 'default',
  big = false,
}: {
  children: React.ReactNode;
  tone?: 'ucl' | 'europa' | 'total' | 'default';
  big?: boolean;
}) {
  const toneClass =
    tone === 'ucl'
      ? 'border-blue-400/50 bg-blue-400/10'
      : tone === 'europa'
      ? 'border-amber-400/50 bg-amber-400/10'
      : tone === 'total'
      ? 'border-slate-400/50 bg-slate-400/10'
      : 'border-white/15 bg-white/5';
  return (
    <span
      className={[
        'rounded-full border px-2 py-0.5 text-xs',
        big ? 'px-2.5 py-1 text-[13px] font-semibold' : '',
        toneClass,
      ].join(' ')}
    >
      {children}
    </span>
  );
}

function TopCard({
  rank,
  data,
}: {
  rank: number;
  data: { name: string; ucl: number; europa: number; total: number };
}) {
  return (
    <li className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-b from-yellow-500/10 to-amber-600/5 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
      <div className="absolute right-3 top-3">
        <Crown className="h-5 w-5 text-yellow-400" aria-label="Juara 1" />
      </div>
      <div className="flex items-start gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-full border border-yellow-400/40 bg-yellow-400/15 text-[13px] font-semibold">
          {rank}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold">{data.name}</div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Pill tone="ucl">UCL {data.ucl}</Pill>
            <Pill tone="europa">Europa {data.europa}</Pill>
            <Pill tone="total" big>
              Total {data.total}
            </Pill>
          </div>
        </div>
      </div>
    </li>
  );
}

function RankCard({
  rank,
  data,
}: {
  rank: number;
  data: { name: string; ucl: number; europa: number; total: number };
}) {
  return (
    <li className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center gap-3">
        <div className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-white/5 text-[12px] font-medium">
          {rank}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-medium">{data.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Pill tone="ucl">UCL {data.ucl}</Pill>
            <Pill tone="europa">Europa {data.europa}</Pill>
            <Pill tone="total">Total {data.total}</Pill>
          </div>
        </div>
      </div>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
      <Medal className="mx-auto mb-2 h-6 w-6 text-white/50" />
      <p className="text-sm text-white/70">
        Belum ada data leaderboard untuk filter ini.
      </p>
    </div>
  );
}
