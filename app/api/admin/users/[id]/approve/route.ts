import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = new RegExp('/api/admin/users/([^/]+)/approve').exec(
    new URL(req.url).pathname
  )?.[1];
  if (!id) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id },
    data: { approved: true },
  });

  return NextResponse.json({ ok: true });
}
