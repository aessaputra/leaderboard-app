export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

async function doCleanup() {
  const now = new Date();
  // Hard purge expired or soft-deleted rows
  const purged = await prisma.galleryImage.deleteMany({
    where: { OR: [{ deletedAt: { not: null } }, { expiresAt: { lte: now } }] },
  });

  // Optional: revalidate a small random sample of active rows
  const sampleSize = 25;
  const candidates = await prisma.$queryRawUnsafe<
    { id: string; displayUrl: string }[]
  >(
    `SELECT id, "displayUrl" FROM "GalleryImage" WHERE "deletedAt" IS NULL AND "expiresAt" > NOW() ORDER BY random() LIMIT ${sampleSize}`
  );

  let revalidated = 0;
  let markedDeleted = 0;
  for (const c of candidates) {
    revalidated++;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const url = c.displayUrl + (c.displayUrl.includes('?') ? `&_r=${Date.now()}` : `?_r=${Date.now()}`);
      const res = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });
      clearTimeout(timeout);
      if (res.status === 404 || res.status === 410) {
        await prisma.galleryImage.update({ where: { id: c.id }, data: { deletedAt: new Date(), caption: null } });
        markedDeleted++;
      }
    } catch {
      // ignore temporary failures
    }
  }

  return { purged: purged.count, revalidated, markedDeleted };
}

// For external schedulers (GH Actions, etc.) using Authorization header
export async function POST(req: Request) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token || token !== process.env.GALLERY_CLEANUP_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const summary = await doCleanup();
  return NextResponse.json(summary);
}

// For Vercel Cron (GET). Pass token as query param set from Vercel Dashboard (not committed).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token || token !== process.env.GALLERY_CLEANUP_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const summary = await doCleanup();
  return NextResponse.json(summary);
}
