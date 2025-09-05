import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function RequestsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/');

  const pending = await prisma.trophyAward.findMany({
    where: { approved: false },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      season: true,
      competition: true,
      user: { select: { name: true, email: true } },
      createdBy: true,
      createdAt: true,
    },
  });

  async function approve(formData: FormData) {
    'use server';
    const s = await getServerSession(authOptions);
    if (!s || s.user.role !== 'ADMIN') throw new Error('Unauthorized');
    const id = String(formData.get('id') ?? '');
    await prisma.trophyAward.update({
      where: { id },
      data: { approved: true },
    });
    revalidatePath('/admin/trophies/requests');
  }

  async function reject(formData: FormData) {
    'use server';
    const s = await getServerSession(authOptions);
    if (!s || s.user.role !== 'ADMIN') throw new Error('Unauthorized');
    const id = String(formData.get('id') ?? '');
    await prisma.trophyAward.delete({ where: { id } });
    revalidatePath('/admin/trophies/requests');
  }

  return (
    <main className="mx-auto w-full max-w-md md:max-w-2xl p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold">Permintaan Trophy ⏳</h1>
      {pending.length === 0 ? (
        <p className="mt-4 text-sm text-gray-600">Tidak ada permintaan.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {pending.map((t) => (
            <li
              key={t.id}
              className="rounded-2xl border p-4 shadow-sm bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{t.user.name}</div>
                  <div className="text-xs text-gray-500">{t.user.email}</div>
                  <div className="mt-1 text-sm">
                    <span className="inline-block rounded-full border px-2 py-0.5 mr-2">
                      {t.competition}
                    </span>
                    <span className="inline-block rounded-full border px-2 py-0.5">
                      {t.season}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <form action={approve}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="w-full rounded-xl bg-green-600 px-3 py-2 text-white">
                    Approve
                  </button>
                </form>
                <form action={reject}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="w-full rounded-xl bg-red-600 px-3 py-2 text-white">
                    Reject
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
