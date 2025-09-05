import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const BodySchema = z.object({
  competition: z.enum(['UCL', 'EUROPA']),
  userId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid body', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { competition, userId } = parsed.data;
  const isAdmin = session.user.role === 'ADMIN';

  const targetUserId = isAdmin && userId ? userId : session.user.id;

  if (isAdmin && targetUserId === session.user.id) {
    return NextResponse.json(
      { error: 'Admin tidak boleh menambahkan trophy untuk dirinya sendiri' },
      { status: 403 }
    );
  }

  const award = await prisma.trophyAward.create({
    data: {
      competition,
      userId: targetUserId,
      createdBy: session.user.id,
      approved: isAdmin ? true : false,
    },
  });

  return NextResponse.json({ id: award.id }, { status: 201 });
}
