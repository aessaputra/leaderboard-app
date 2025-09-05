import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function AdminAddTrophyPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/');

  const approvedUsers = await prisma.user.findMany({
    where: { approved: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, email: true },
  });

  async function add(formData: FormData) {
    'use server';
    const s = await getServerSession(authOptions);
    if (!s || s.user.role !== 'ADMIN') throw new Error('Unauthorized');

    const competition = String(formData.get('competition') || '');
    const userId = String(formData.get('userId') || '');

    if (!competition || !['UCL', 'EUROPA'].includes(competition)) {
      throw new Error('Kompetisi tidak valid');
    }
    if (!userId) throw new Error('User wajib dipilih');

    if (userId === s.user.id)
      throw new Error(
        'Admin tidak boleh menambahkan trophy untuk dirinya sendiri'
      );

    await prisma.trophyAward.create({
      data: {
        competition: competition as 'UCL' | 'EUROPA',
        userId,
        createdBy: s.user.id,
        approved: true,
      },
    });

    redirect('/admin');
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">Tambah Trophy (Admin)</h1>
      <form action={add} className="mt-4 space-y-3">
        <div className="rounded-lg border p-3">
          <label className="mb-1 block text-sm">Kompetisi</label>
          <select
            name="competition"
            className="w-full rounded-md border bg-black/40 p-2"
            required
            defaultValue="UCL"
          >
            <option value="UCL">UCL</option>
            <option value="EUROPA">Europa</option>
          </select>
        </div>
        <div className="rounded-lg border p-3">
          <label className="mb-1 block text-sm">Untuk User</label>
          <select
            name="userId"
            className="w-full rounded-md border bg-black/40 p-2"
            required
          >
            <option value="">— pilih user —</option>
            {approvedUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || u.email}
              </option>
            ))}
          </select>
        </div>

        <button className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black hover:opacity-90">
          Tambahkan
        </button>
      </form>
    </main>
  );
}
