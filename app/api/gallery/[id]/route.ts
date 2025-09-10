export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const image = await prisma.galleryImage.findUnique({ where: { id }, select: { uploaderId: true, deleteUrl: true } });
  if (!image) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (image.uploaderId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.galleryImage.update({ where: { id }, data: { deletedAt: new Date(), caption: null } });

  // Optional: try delete remote resource via ImgBB deleteUrl (best-effort)
  if (image.deleteUrl) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      await fetch(image.deleteUrl, { method: 'GET', signal: controller.signal });
      clearTimeout(timeout);
    } catch {
      // ignore
    }
  }

  return NextResponse.json({ ok: true });
}
