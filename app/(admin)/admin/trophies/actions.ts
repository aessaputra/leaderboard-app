'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';

type Competition = 'UCL' | 'EUROPA';

export async function createTrophy(formData: FormData) {
  const session = await auth();
  const adminId = session?.user?.id;
  if (!adminId) throw new Error('Unauthorized');

  const userId = String(formData.get('userId') ?? '');
  const competition = String(formData.get('competition') ?? '') as Competition;
  const approved = formData.get('approved') === 'on';

  if (!userId || !competition) {
    throw new Error('userId dan competition wajib diisi');
  }

  await prisma.trophyAward.create({
    data: {
      userId,
      competition,
      approved,
      createdBy: adminId,
    },
  });

  revalidatePath('/admin/trophies');
  revalidatePath('/leaderboard');
}

export async function adjustTrophyCount(
  userId: string,
  competition: Competition,
  delta: number
) {
  const session = await auth();
  const adminId = session?.user?.id;
  if (!adminId) throw new Error('Unauthorized');

  if (delta > 0) {
    await prisma.trophyAward.createMany({
      data: Array.from({ length: delta }).map(() => ({
        userId,
        competition,
        approved: true,
        createdBy: adminId,
      })),
    });
  } else if (delta < 0) {
    const take = Math.abs(delta);
    const latest = await prisma.trophyAward.findMany({
      where: { userId, competition, approved: true },
      select: { id: true },
      orderBy: { createdAt: 'desc' },
      take,
    });
    if (latest.length) {
      await prisma.trophyAward.deleteMany({
        where: { id: { in: latest.map((x) => x.id) } },
      });
    }
  }

  revalidatePath('/admin/trophies/manage');
  revalidatePath('/leaderboard');
}

export async function deleteTrophy(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await prisma.trophyAward.delete({ where: { id } });
  revalidatePath('/admin/trophies');
  revalidatePath('/leaderboard');
}
