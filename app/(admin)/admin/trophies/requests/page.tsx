import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import LogoutButton from '@/components/auth/LogoutButton';

export default async function RequestsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/');

  const pending = await prisma.trophyAward.findMany({
    where: { approved: false },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
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

    const id = String(formData.get('id') || '');
    if (!id) throw new Error('Invalid trophy id');

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

    const id = String(formData.get('id') || '');
    if (!id) throw new Error('Invalid trophy id');

    await prisma.trophyAward.delete({ where: { id } });
    revalidatePath('/admin/trophies/requests');
  }

  return (
    <main className="mx-auto max-w-4xl p-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Trophy Requests</h1>
        <LogoutButton label="Logout (ganti akun)" />
      </header>

      {pending.length === 0 ? (
        <p className="text-sm text-gray-400">
          Tidak ada pengajuan trophy yang menunggu persetujuan.
        </p>
      ) : (
        <ul className="space-y-3">
          {pending.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <div className="min-w-0">
                <div className="font-medium">
                  {t.user?.name ?? '(Tanpa nama)'}
                </div>
                <div className="text-xs text-gray-400">{t.user?.email}</div>
                <div className="mt-1 text-sm">
                  Ajukan: <span className="font-semibold">{t.competition}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Dibuat: {new Date(t.createdAt).toLocaleString()} • Dibuat
                  oleh: {t.createdBy}
                </div>
              </div>

              <div className="ml-3 flex shrink-0 items-center gap-2">
                <form action={approve}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20">
                    Approve
                  </button>
                </form>
                <form action={reject}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-300 hover:bg-red-500/20">
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
