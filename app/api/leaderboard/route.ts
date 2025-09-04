import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { LeaderboardQuerySchema } from '@/lib/validators';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const competition = searchParams.get('competition') || undefined;
  const season = searchParams.get('season') || undefined;

  const parsed = LeaderboardQuerySchema.safeParse({ competition, season });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
  }

  const where: any = {};
  if (parsed.data.season) where.season = parsed.data.season;
  if (parsed.data.competition) where.competition = parsed.data.competition;

  const group = await prisma.trophyAward.groupBy({
    by: ['userId', 'competition'],
    where,
    _count: { _all: true },
  });

  const userIds = [...new Set(group.map((g) => g.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const byId = new Map(users.map((u) => [u.id, u.name]));

  const rowsMap = new Map<
    string,
    { id: string; name: string; ucl: number; europa: number; total: number }
  >();
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

  return NextResponse.json({ rows });
}
