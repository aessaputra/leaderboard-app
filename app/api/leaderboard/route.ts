import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

type CompetitionParam = 'UCL' | 'EUROPA';
const isCompetition = (v: string | null): v is CompetitionParam =>
  v === 'UCL' || v === 'EUROPA';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const compParam = searchParams.get('competition');

  const where: Partial<Prisma.TrophyAwardWhereInput> = { approved: true };
  if (isCompetition(compParam)) {
    (where as Prisma.TrophyAwardWhereInput).competition =
      compParam as unknown as Prisma.TrophyAwardWhereInput['competition'];
  }

  const grouped = await prisma.trophyAward.groupBy({
    by: ['userId'],
    _count: { _all: true },
    where: where as Prisma.TrophyAwardWhereInput,
  });

  const userIds = grouped.map((g) => g.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });

  const nameMap = new Map(users.map((u) => [u.id, u.name ?? '']));

  const data = grouped
    .map((g) => ({
      userId: g.userId,
      name: nameMap.get(g.userId) || 'Unknown',
      total: g._count._all,
    }))
    .sort((a, b) => b.total - a.total);

  return NextResponse.json({ data });
}
