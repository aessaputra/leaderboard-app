import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function ManageTrophiesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/');

  const users = await prisma.user.findMany({
    where: { approved: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });

  async function add(formData: FormData) {
    'use server';
    const s = await getServerSession(authOptions);
    if (!s || s.user.role !== 'ADMIN') throw new Error('Unauthorized');

    const userId = String(formData.get('userId') ?? '');
    const comp = String(formData.get('competition') ?? '') as 'UCL' | 'EUROPA';
    if (userId === s.user.id)
      throw new Error('Admin tidak boleh menambah untuk diri sendiri');

    await prisma.trophyAward.create({
      data: { userId, competition: comp, approved: true, createdBy: s.user.id },
    });
    revalidatePath('/leaderboard');
    revalidatePath('/admin/trophies/manage');
  }

  async function remove(formData: FormData) {
    'use server';
    const s = await getServerSession(authOptions);
    if (!s || s.user.role !== 'ADMIN') throw new Error('Unauthorized');

    const userId = String(formData.get('userId') ?? '');
    const comp = String(formData.get('competition') ?? '') as 'UCL' | 'EUROPA';
    if (userId === s.user.id)
      throw new Error('Admin tidak boleh mengurangi untuk diri sendiri');

    const last = await prisma.trophyAward.findFirst({
      where: { userId, competition: comp, approved: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    if (last) {
      await prisma.trophyAward.delete({ where: { id: last.id } });
      revalidatePath('/leaderboard');
      revalidatePath('/admin/trophies/manage');
    }
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-semibold">Kelola Trophy (Admin)</h1>
      <ul className="mt-4 space-y-3">
        {users.map((u) => (
          <li
            key={u.id}
            className="rounded-xl border border-white/15 bg-white/5 p-3"
          >
            <div className="mb-2 font-medium">{u.name}</div>
            <div className="flex flex-wrap gap-2">
              {(['UCL', 'EUROPA'] as const).map((comp) => (
                <div key={comp} className="flex gap-2">
                  <form action={add}>
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="competition" value={comp} />
                    <button className="rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200 hover:bg-emerald-500/25">
                      + {comp}
                    </button>
                  </form>
                  <form action={remove}>
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="competition" value={comp} />
                    <button className="rounded-lg border border-rose-400/30 bg-rose-500/15 px-3 py-1 text-xs text-rose-200 hover:bg-rose-500/25">
                      − {comp}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
