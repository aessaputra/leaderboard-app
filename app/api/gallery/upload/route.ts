export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const MAX_IMAGE_SIZE = 32 * 1024 * 1024; // 32MB
const IMGBB_EXPIRATION_SECONDS = 15552000; // ~180 days

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get('file');
    const rawCaption = form.get('caption');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!file.type?.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 32MB)' }, { status: 413 });
    }

    let caption: string | null = null;
    if (typeof rawCaption === 'string') {
      caption = rawCaption.trim().slice(0, 280);
      if (caption.length === 0) caption = null;
    }

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const fd = new FormData();
    // ImgBB expects the binary in `image` for multipart/form-data
    fd.append('image', file, file.name || 'upload.jpg');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const imgbbUrl = `https://api.imgbb.com/1/upload?expiration=${IMGBB_EXPIRATION_SECONDS}&key=${encodeURIComponent(
      apiKey
    )}`;
    let imgbbRes: Response;
    try {
      imgbbRes = await fetch(imgbbUrl, { method: 'POST', body: fd, signal: controller.signal });
    } catch (e) {
      clearTimeout(timeout);
      if ((e as any).name === 'AbortError') {
        return NextResponse.json({ error: 'Upload timeout' }, { status: 504 });
      }
      throw e;
    }
    clearTimeout(timeout);

    if (!imgbbRes.ok) {
      const text = await imgbbRes.text().catch(() => '');
      const code = imgbbRes.status;
      return NextResponse.json(
        { error: 'ImgBB upload failed', code, detail: text?.slice(0, 200) },
        { status: 502 }
      );
    }

    const json = (await imgbbRes.json()) as any;
    const d = json?.data;
    if (!d?.url || !d?.display_url) {
      return NextResponse.json({ error: 'Invalid ImgBB response' }, { status: 502 });
    }

    const expiresAt = new Date(Date.now() + IMGBB_EXPIRATION_SECONDS * 1000);

    const created = await prisma.galleryImage.create({
      data: {
        uploaderId: session.user.id,
        url: String(d.url),
        displayUrl: String(d.display_url),
        thumbUrl: d?.thumb?.url ? String(d.thumb.url) : null,
        deleteUrl: d?.delete_url ? String(d.delete_url) : null,
        width: d?.width ? Number(d.width) : null,
        height: d?.height ? Number(d.height) : null,
        size: d?.size ? Number(d.size) : null,
        caption,
        expiresAt,
      },
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

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error('Upload error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

