export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

type Body = { id?: string };

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Body;
  if (!body?.id) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const row = await prisma.galleryImage.findUnique({
    where: { id: body.id },
    select: { id: true, displayUrl: true, thumbUrl: true },
  });
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  let res: Response | null = null;
  try {
    const buster = `_r=${Date.now()}`;
    const url = row.displayUrl + (row.displayUrl.includes('?') ? `&${buster}` : `?${buster}`);
    res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    });
    if (res.status === 405 || res.status === 501) {
      // some CDNs disallow HEAD
      res = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: { Range: 'bytes=0-0', 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
        cache: 'no-store',
      });
    }
  } catch (e) {
    clearTimeout(timeout);
    return NextResponse.json({ ok: true, deleted: false, retry: true });
  }
  clearTimeout(timeout);

  const status = res.status;
  if (status === 404 || status === 410) {
    await prisma.galleryImage.update({ where: { id: row.id }, data: { deletedAt: new Date(), caption: null } });
    return NextResponse.json({ ok: true, deleted: true });
  }
  if (status >= 400) {
    // Try thumbUrl as a secondary signal; if 404/410 => mark deleted
    if (row.thumbUrl) {
      try {
        const buster = `_r=${Date.now()}`;
        const turl = row.thumbUrl + (row.thumbUrl.includes('?') ? `&${buster}` : `?${buster}`);
        const tres = await fetch(turl, {
          method: 'HEAD',
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
          signal: AbortSignal.timeout(3000),
        });
        if (tres.status === 404 || tres.status === 410) {
          await prisma.galleryImage.update({ where: { id: row.id }, data: { deletedAt: new Date(), caption: null } });
          return NextResponse.json({ ok: true, deleted: true });
        }
      } catch {
        // ignore
      }
    }
    // 403/401/429/5xx: treat as temporary
    return NextResponse.json({ ok: true, deleted: false, retry: true, status });
  }

  return NextResponse.json({ ok: true, deleted: false });
}
