export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const now = new Date();

  // quick cleanup: remove captions for expired (privacy)
  await prisma.galleryImage.updateMany({
    where: { expiresAt: { lte: now }, caption: { not: null } },
    data: { caption: null },
  });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const takeParam = Number(searchParams.get('take') || '8');
  // enforce max 8 per page to keep payloads small
  const take = Math.min(Math.max(takeParam, 1), 8);

  const where = { expiresAt: { gt: now }, deletedAt: null as null | Date | undefined };

  const items = await prisma.galleryImage.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      url: true,
      displayUrl: true,
      thumbUrl: true,
      caption: true,
      width: true,
      height: true,
      size: true,
      createdAt: true,
      expiresAt: true,
      uploader: { select: { id: true, name: true } },
    },
  });

  let nextCursor: string | null = null;
  if (items.length > take) {
    const next = items.pop();
    nextCursor = next?.id ?? null;
  }

  return NextResponse.json({ data: items, nextCursor });
}
