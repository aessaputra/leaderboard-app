import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export default async function ManageTrophiesPage({ searchParams }: { searchParams: any }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/');

  const sp = await searchParams;
  const selectedUserId = String(sp?.userId ?? '');

  const adminId = session.user.id;

  const [users, selected, counts] = await Promise.all([
    prisma.user.findMany({
      where: { approved: true, role: 'USER', NOT: { id: adminId } },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
    selectedUserId
      ? prisma.user.findUnique({
          where: { id: selectedUserId },
          select: { id: true, name: true, email: true, role: true },
        })
      : Promise.resolve(null),
    (async () => {
      if (!selectedUserId) return { UCL: 0, EUROPA: 0 } as const;
      const [ucl, europa] = await Promise.all([
        prisma.trophyAward.count({ where: { userId: selectedUserId, competition: 'UCL', approved: true } }),
        prisma.trophyAward.count({ where: { userId: selectedUserId, competition: 'EUROPA', approved: true } }),
      ]);
      return { UCL: ucl, EUROPA: europa } as const;
    })(),
  ]);

  // If someone manipulates URL to point to an admin, ignore it
  if (selected && selected.role === 'ADMIN') {
    redirect('/admin/trophies/manage');
  }

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
    // keep selection
    redirect(`/admin/trophies/manage?userId=${userId}`);
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
      redirect(`/admin/trophies/manage?userId=${userId}`);
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6">
      <h1 className="text-2xl font-semibold">Manage Trophy</h1>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {/* Users List */}
        <section className="rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
          <div className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">Users</div>
          <ul className="max-h-[60dvh] space-y-1 overflow-auto">
            {users.map((u) => {
              const active = u.id === selectedUserId;
              return (
                <li key={u.id}>
                  <Link
                    href={`/admin/trophies/manage?userId=${u.id}`}
                    className={
                      'flex items-center justify-between rounded-lg border px-3 py-2 text-sm ' +
                      (active
                        ? 'border-brand-300 bg-brand-50 text-brand-600 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-300'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/5')
                    }
                  >
                    <span className="truncate">{u.name ?? u.email}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Detail */}
        <section className="md:col-span-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          {!selected ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">Pilih user untuk melihat dan mengelola trophy.</div>
          ) : (
            <div className="space-y-4">
              <header>
                <div className="text-lg font-semibold">{selected.name ?? selected.email}</div>
                <div className="text-xs text-gray-500">ID: {selected.id}</div>
              </header>

              {/* Counts */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                  <div className="text-xs text-gray-500 dark:text-gray-400">UCL</div>
                  <div className="text-2xl font-semibold">{counts.UCL}</div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                  <div className="text-xs text-gray-500 dark:text-gray-400">EUROPA</div>
                  <div className="text-2xl font-semibold">{counts.EUROPA}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {(['UCL', 'EUROPA'] as const).map((comp) => (
                  <div key={comp} className="flex gap-2">
                    <form action={add}>
                      <input type="hidden" name="userId" value={selected.id} />
                      <input type="hidden" name="competition" value={comp} />
                      <button className="rounded-lg border px-3 py-1.5 text-sm 
                        border-emerald-600/20 bg-emerald-50 text-emerald-700 hover:bg-emerald-100
                        dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/25">
                        + {comp}
                      </button>
                    </form>
                    <form action={remove}>
                      <input type="hidden" name="userId" value={selected.id} />
                      <input type="hidden" name="competition" value={comp} />
                      <button className="rounded-lg border px-3 py-1.5 text-sm 
                        border-rose-600/20 bg-rose-50 text-rose-700 hover:bg-rose-100
                        dark:border-rose-400/30 dark:bg-rose-500/15 dark:text-rose-200 dark:hover:bg-rose-500/25">
                        − {comp}
                      </button>
                    </form>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">Catatan: Admin tidak dapat menambahkan atau mengurangi trophy untuk dirinya sendiri.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
