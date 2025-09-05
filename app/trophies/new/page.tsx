import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Card, CTA } from '@/components/ui/cta';

export default async function NewTrophyPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role === 'ADMIN') redirect('/admin/trophies/requests');

  async function submit(formData: FormData) {
    'use server';
    const s = await getServerSession(authOptions);
    if (!s) throw new Error('Unauthorized');
    if (s.user.role === 'ADMIN')
      throw new Error(
        'Admin dilarang menambahkan trophy untuk dirinya sendiri'
      );

    const competition = String(formData.get('competition') || '');
    if (competition !== 'UCL' && competition !== 'EUROPA') {
      throw new Error('Kompetisi tidak valid');
    }

    await prisma.trophyAward.create({
      data: {
        userId: s.user.id,
        competition: competition as 'UCL' | 'EUROPA',
        approved: false,
        createdBy: s.user.id,
      },
    });

    revalidatePath('/me');
    redirect('/me?submitted=1');
  }

  return (
    <main>
      <header className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold">Ajukan Trophy 🏆</h1>
        <p className="mt-1 text-sm text-gray-300">
          Menunggu persetujuan admin.
        </p>
      </header>

      <Card className="p-4">
        <form action={submit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Kompetisi</label>
            <select
              name="competition"
              required
              className="w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2"
              defaultValue=""
            >
              <option value="" disabled className="bg-gray-900">
                Pilih kompetisi
              </option>
              <option value="UCL" className="bg-gray-900">
                UCL
              </option>
              <option value="EUROPA" className="bg-gray-900">
                Europa
              </option>
            </select>
          </div>

          <CTA variant="primary">Kirim Pengajuan</CTA>
          <CTA href="/" variant="ghost">
            Batal
          </CTA>
        </form>
      </Card>
    </main>
  );
}
