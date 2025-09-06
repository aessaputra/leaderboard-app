import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
// Logout dipindah ke header layout admin; BackButton dihilangkan (ada nav di footer)
import { Clock, Check, X } from 'lucide-react';

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
    <main className="mx-auto w-full max-w-md px-3 py-6 sm:max-w-4xl sm:px-4 sm:py-8">
      <header className="mb-5 sm:mb-6">
        <h1 className="text-xl font-semibold sm:text-2xl">Trophy Requests</h1>
      </header>

      {pending.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">
          Tidak ada pengajuan trophy yang menunggu persetujuan.
        </div>
      ) : (
        <ul className="space-y-3">
          {pending.map((t) => (
            <li
              key={t.id}
              className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Left: info */}
                <div className="min-w-0">
                  <div className="truncate text-base font-medium">
                    {t.user?.name ?? '(Tanpa nama)'}
                  </div>
                  <div className="truncate text-xs text-gray-400">{t.user?.email}</div>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-semibold">
                      {t.competition}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(t.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-gray-500">
                    Dibuat oleh: {t.createdBy}
                  </div>
                </div>

                {/* Right: actions */}
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
                  <form action={approve} className="contents sm:contents">
                    <input type="hidden" name="id" value={t.id} />
                    <button
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-500/25 sm:w-auto"
                      aria-label="Approve trophy"
                    >
                      <Check className="h-4 w-4" /> Approve
                    </button>
                  </form>
                  <form action={reject} className="contents sm:contents">
                    <input type="hidden" name="id" value={t.id} />
                    <button
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-2 text-sm font-medium text-red-200 hover:bg-red-500/25 sm:w-auto"
                      aria-label="Reject trophy"
                    >
                      <X className="h-4 w-4" /> Reject
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
