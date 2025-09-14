import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { formatDateTimeWIB } from '@/lib/time';
import { revalidatePath } from 'next/cache';
// Logout dipindah ke header layout admin; BackButton dihilangkan (ada nav di footer)
import { UserPlus, Mail, Clock, Check } from 'lucide-react';

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/');

  const pending = await prisma.user.findMany({
    where: { approved: false },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  async function approveUser(formData: FormData) {
    'use server';
    const s = await getServerSession(authOptions);
    if (!s || s.user.role !== 'ADMIN') throw new Error('Unauthorized');

    const id = String(formData.get('id') || '');
    if (!id) throw new Error('Invalid user id');

    await prisma.user.update({
      where: { id },
      data: { approved: true },
    });

    revalidatePath('/admin/users');
  }

  return (
    <main className="mx-auto w-full max-w-md px-3 py-6 sm:max-w-4xl sm:px-4 sm:py-8">
      <header className="mb-5 sm:mb-6">
        <h1 className="text-xl font-semibold sm:text-2xl">Approve Users</h1>
      </header>

      {pending.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
          Tidak ada user pending.
        </div>
      ) : (
        <>
          <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
              <UserPlus className="h-4 w-4" /> {pending.length} user menunggu persetujuan
            </span>
          </div>
          <ul className="space-y-3">
            {pending.map((u) => (
              <li
                key={u.id}
                className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="truncate text-base font-medium">
                      {u.name ?? '(Tanpa nama)'}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{u.email}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
                      <Clock className="h-3.5 w-3.5" />
                      Daftar: {formatDateTimeWIB(u.createdAt, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </div>
                  </div>

                  <form action={approveUser} className="sm:ml-3">
                    <input type="hidden" name="id" value={u.id} />
                    <button
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium 
                        border-emerald-600/20 bg-emerald-50 text-emerald-700 hover:bg-emerald-100
                        dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/25 sm:w-auto"
                      aria-label={`Approve ${u.email}`}
                    >
                      <Check className="h-4 w-4" /> Approve
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
