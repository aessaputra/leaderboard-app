import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function NewTrophyPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role === 'ADMIN') redirect('/admin/trophies/requests');

  async function submit(formData: FormData) {
    'use server';
    const s = await getServerSession(authOptions);
    if (!s) throw new Error('Unauthorized');
    if (s.user.role === 'ADMIN')
      throw new Error('Admin dilarang menambahkan trophy sendiri');

    const season = String(formData.get('season') || '').trim();
    const competition = String(formData.get('competition') || '');
    if (!season) throw new Error('Season wajib diisi');
    if (competition !== 'UCL' && competition !== 'EUROPA') {
      throw new Error('Kompetisi tidak valid');
    }

    await prisma.trophyAward.create({
      data: {
        userId: s.user.id,
        season,
        competition: competition as 'UCL' | 'EUROPA',
        approved: false,
        createdBy: s.user.id,
      },
    });

    revalidatePath('/me');
    redirect('/me');
  }

  return (
    <main className="mx-auto w-full max-w-md p-4 md:max-w-lg md:p-6">
      <h1 className="text-xl md:text-2xl font-bold">Ajukan Trophy 🏆</h1>
      <p className="mt-2 text-sm text-gray-600">
        Setelah diajukan, trophy akan menunggu persetujuan admin.
      </p>

      <form action={submit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Musim (contoh: 2025/26)</label>
          <input
            name="season"
            placeholder="2025/26"
            required
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Kompetisi</label>
          <select
            name="competition"
            required
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
            defaultValue=""
          >
            <option value="" disabled>
              Pilih kompetisi
            </option>
            <option value="UCL">UCL</option>
            <option value="EUROPA">Europa</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white"
        >
          Kirim Pengajuan
        </button>
      </form>
    </main>
  );
}
