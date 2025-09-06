export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type Competition = 'UCL' | 'EUROPA';
function isCompetition(x: unknown): x is Competition {
  return x === 'UCL' || x === 'EUROPA';
}
function parseBool(x: string | null): boolean | undefined {
  if (x === null) return undefined;
  if (x === 'true') return true;
  if (x === 'false') return false;
  return undefined;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pageParam = Number(searchParams.get('page'));
  const page = pageParam > 0 ? Math.floor(pageParam) : 1;

  const pageSizeParam = Number(searchParams.get('pageSize'));
  const pageSize = pageSizeParam > 0
    ? Math.min(Math.floor(pageSizeParam), 100)
    : 20;
  const userId = searchParams.get('userId') ?? undefined;
  const comp = searchParams.get('competition');
  const approved = parseBool(searchParams.get('approved'));

  const where = {
    ...(userId ? { userId } : {}),
    ...(isCompetition(comp) ? { competition: comp } : {}),
    ...(approved === undefined ? {} : { approved }),
  };

  const [total, items] = await Promise.all([
    prisma.trophyAward.count({ where }),
    prisma.trophyAward.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const mapped = items.map((t) => ({
    id: t.id as unknown as string,
    userId: t.userId,
    userName: t.user?.name ?? '',
    competition: t.competition as Competition,
    approved: t.approved,
    createdAt: t.createdAt.toISOString(),
  }));

  return NextResponse.json({ items: mapped, total, page, pageSize });
}

interface CreatePayload {
  userId: string;
  competition: Competition;
  approved?: boolean;
}
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await req.json()) as unknown;
  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as { userId?: unknown }).userId !== 'string' ||
    !isCompetition((body as { competition?: unknown }).competition)
  ) {
    return NextResponse.json({ error: 'Payload tidak valid' }, { status: 400 });
  }

  const { userId, competition, approved = false } = body as CreatePayload;

  if (userId === session.user.id) {
    return NextResponse.json(
      { error: 'Admin tidak boleh menambahkan trophy untuk dirinya sendiri' },
      { status: 403 }
    );
  }

  const created = await prisma.trophyAward.create({
    data: { userId, competition, approved, createdBy: session.user.id },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json({
    id: created.id as unknown as string,
    userId: created.userId,
    userName: created.user?.name ?? '',
    competition: created.competition as Competition,
    approved: created.approved,
    createdAt: created.createdAt.toISOString(),
  });
}
