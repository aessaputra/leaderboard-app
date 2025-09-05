import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Trophy, ShieldCheck } from 'lucide-react';
import SubmitButton from './submit-button';

export default async function NewTrophyPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  async function submit(formData: FormData) {
    'use server';
    const s = await getServerSession(authOptions);
    if (!s) throw new Error('Unauthorized');

    const comp = String(formData.get('competition') ?? '');
    if (comp !== 'UCL' && comp !== 'EUROPA') {
      throw new Error('Kompetisi tidak valid');
    }

    await prisma.trophyAward.create({
      data: {
        userId: s.user.id,
        competition: comp as 'UCL' | 'EUROPA',
        approved: false,
        createdBy: s.user.id, // pengaju = pembuat
      },
    });

    // refresh data profil & leaderboard
    revalidatePath('/me');
    revalidatePath('/leaderboard');

    redirect('/me?submitted=1');
  }

  return (
    <main className="mx-auto w-full max-w-md p-5">
      <h1 className="mb-4 text-2xl font-semibold">Ajukan Trophy</h1>

      <form action={submit} className="space-y-4">
        {/* Segmented toggle */}
        <div
          role="radiogroup"
          aria-label="Pilih kompetisi"
          className="grid grid-cols-2 gap-3"
        >
          <label className="relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] p-0.5">
            <input
              type="radio"
              name="competition"
              value="UCL"
              required
              className="peer sr-only"
            />
            <div
              className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[15px] font-semibold transition
                            peer-checked:bg-blue-500/15 peer-checked:text-blue-200
                            peer-checked:border-blue-400/40 border border-transparent"
            >
              <Trophy className="h-4 w-4" />
              UCL
            </div>
          </label>

          <label className="relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] p-0.5">
            <input
              type="radio"
              name="competition"
              value="EUROPA"
              className="peer sr-only"
            />
            <div
              className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[15px] font-semibold transition
                            peer-checked:bg-amber-500/15 peer-checked:text-amber-200
                            peer-checked:border-amber-400/40 border border-transparent"
            >
              <ShieldCheck className="h-4 w-4" />
              EUROPA
            </div>
          </label>
        </div>

        {/* Submit */}
        <SubmitButton label="Kirim Pengajuan" />

        <p className="text-xs text-white/60">
          Pengajuan akan menunggu persetujuan admin sebelum masuk leaderboard.
        </p>
      </form>
    </main>
  );
}
