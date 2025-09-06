export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

type Competition = 'UCL' | 'EUROPA';
function isCompetition(x: unknown): x is Competition {
  return x === 'UCL' || x === 'EUROPA';
}

function asId(param: string): string | number {
  return /^\d+$/.test(param) ? Number(param) : param;
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = asId(params.id);
  const t = await prisma.trophyAward.findUnique({
    where: { id: id as any },
    include: { user: { select: { name: true } } },
  });
  if (!t) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    id: t.id as unknown as string,
    userId: t.userId,
    userName: t.user?.name ?? '',
    competition: t.competition as Competition,
    approved: t.approved,
    createdAt: t.createdAt.toISOString(),
  });
}

interface UpdatePayload {
  competition?: Competition;
  approved?: boolean;
}
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = asId(params.id);
  const body = (await req.json()) as unknown;

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Payload tidak valid' }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if ('competition' in body) {
    const c = (body as { competition?: unknown }).competition;
    if (!isCompetition(c)) {
      return NextResponse.json(
        { error: 'competition tidak valid' },
        { status: 400 }
      );
    }
    data.competition = c;
  }
  if ('approved' in body) {
    const a = (body as { approved?: unknown }).approved;
    if (typeof a !== 'boolean') {
      return NextResponse.json(
        { error: 'approved harus boolean' },
        { status: 400 }
      );
    }
    data.approved = a;
  }

  const updated = await prisma.trophyAward.update({
    where: { id: id as any },
    data,
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json({
    id: updated.id as unknown as string,
    userId: updated.userId,
    userName: updated.user?.name ?? '',
    competition: updated.competition as Competition,
    approved: updated.approved,
    createdAt: updated.createdAt.toISOString(),
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = asId(params.id);
  await prisma.trophyAward.delete({ where: { id: id as any } });
  return NextResponse.json({ ok: true });
}
