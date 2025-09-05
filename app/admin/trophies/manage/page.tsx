import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Card, CTA } from '@/components/ui/cta';

export default async function ManageTrophiesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/');

  const users = await prisma.user.findMany({
    where: { approved: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, email: true },
  });

  const latest = await prisma.trophyAward.findMany({
    orderBy: { createdAt: 'desc' },
    take: 30,
    include: { user: { select: { name: true, email: true } } },
  });

  async function addTrophy(formData: FormData) {
    'use server';
    const s = await getServerSession(authOptions);
    if (!s || s.user.role !== 'ADMIN') throw new Error('Unauthorized');

    const userId = String(formData.get('userId') || '');
    const competition = String(formData.get('competition') || '');
    if (!userId) throw new Error('User wajib dipilih');
    if (userId === s.user.id)
      throw new Error(
        'Admin tidak boleh menambah trophy untuk dirinya sendiri'
      );
    if (competition !== 'UCL' && competition !== 'EUROPA')
      throw new Error('Kompetisi tidak valid');

    await prisma.trophyAward.create({
      data: {
        userId,
        competition: competition as 'UCL' | 'EUROPA',
        approved: true,
        createdBy: s.user.id,
      },
    });
    revalidatePath('/admin/trophies/manage');
  }

  async function deleteTrophy(formData: FormData) {
    'use server';
    const s = await getServerSession(authOptions);
    if (!s || s.user.role !== 'ADMIN') throw new Error('Unauthorized');
    const id = String(formData.get('id') || '');
    await prisma.trophyAward.delete({ where: { id } });
    revalidatePath('/admin/trophies/manage');
  }

  return (
    <main>
      <header className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold">Kelola Trophy</h1>
        <p className="mt-1 text-sm text-gray-300">
          Admin dapat menambah & menghapus trophy (kecuali miliknya sendiri).
        </p>
      </header>

      <Card className="p-4">
        <form
          action={addTrophy}
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <select
            name="userId"
            className="rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2"
            defaultValue=""
          >
            <option value="" disabled className="bg-gray-900">
              Pilih user
            </option>
            {users.map((u) => (
              <option key={u.id} value={u.id} className="bg-gray-900">
                {u.name ?? u.email}
              </option>
            ))}
          </select>

          <select
            name="competition"
            className="rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2"
            defaultValue=""
          >
            <option value="" disabled className="bg-gray-900">
              Kompetisi
            </option>
            <option value="UCL" className="bg-gray-900">
              UCL
            </option>
            <option value="EUROPA" className="bg-gray-900">
              Europa
            </option>
          </select>

          <CTA variant="primary">Tambah Trophy</CTA>
        </form>
      </Card>

      <h2 className="mt-6 mb-2 text-sm font-semibold text-gray-300">
        Trophy Terbaru
      </h2>
      <Card className="divide-y divide-white/10">
        <ul>
          {latest.map((t) => (
            <li key={t.id} className="flex items-center justify-between p-4">
              <div className="text-sm">
                <div className="font-medium">
                  {t.user?.name ?? t.user?.email ?? 'User'}
                </div>
                <div className="text-gray-400">{t.competition}</div>
              </div>
              <form action={deleteTrophy}>
                <input type="hidden" name="id" value={t.id} />
                <CTA variant="outline" className="px-3 py-2 text-xs">
                  Hapus
                </CTA>
              </form>
            </li>
          ))}
        </ul>
      </Card>
    </main>
  );
}
