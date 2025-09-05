import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import LogoutButton from '@/components/auth/LogoutButton';

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
    <main className="mx-auto max-w-4xl p-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Approve Users</h1>
        <LogoutButton label="Logout (ganti akun)" />
      </header>

      {pending.length === 0 ? (
        <p className="text-sm text-gray-400">Tidak ada user pending.</p>
      ) : (
        <ul className="space-y-3">
          {pending.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <div>
                <div className="font-medium">{u.name ?? '(Tanpa nama)'}</div>
                <div className="text-sm text-gray-400">{u.email}</div>
                <div className="text-xs text-gray-500">
                  Daftar: {new Date(u.createdAt).toLocaleString()}
                </div>
              </div>
              <form action={approveUser}>
                <input type="hidden" name="id" value={u.id} />
                <button className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20">
                  Approve
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
