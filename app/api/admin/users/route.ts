import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const pending = await prisma.user.findMany({
    where: { approved: false },
    select: { id: true, name: true, email: true, approved: true },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json({ users: pending });
}
