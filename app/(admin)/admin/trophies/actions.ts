// app/(admin)/admin/trophies/actions.ts
'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

type Competition = 'UCL' | 'EUROPA';
function isCompetition(v: unknown): v is Competition {
  return v === 'UCL' || v === 'EUROPA';
}

export async function createTrophy(formData: FormData) {
  const userId = String(formData.get('userId') ?? '');
  const competitionRaw = formData.get('competition');
  const approvedRaw = formData.get('approved');

  if (!userId) throw new Error('userId wajib diisi');
  if (!isCompetition(competitionRaw))
    throw new Error('competition tidak valid');
  const approved = approvedRaw === 'on';

  await prisma.trophyAward.create({
    data: { userId, competition: competitionRaw, approved },
  });

  revalidatePath('/admin/trophies');
}

export async function updateTrophy(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const competitionRaw = formData.get('competition');
  const approvedRaw = formData.get('approved');

  if (!id) throw new Error('id wajib diisi');
  if (!isCompetition(competitionRaw))
    throw new Error('competition tidak valid');
  const approved = approvedRaw === 'on';

  await prisma.trophyAward.update({
    where: { id },
    data: { competition: competitionRaw, approved },
  });

  revalidatePath('/admin/trophies');
}

export async function deleteTrophy(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) throw new Error('id wajib diisi');

  await prisma.trophyAward.delete({ where: { id } });
  revalidatePath('/admin/trophies');
}
