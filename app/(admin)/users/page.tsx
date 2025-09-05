import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/');

  const pending = await prisma.user.findMany({
    where: { approved: false },
    select: { id: true, name: true, email: true },
    orderBy: { createdAt: 'asc' },
  });

  async function approve(formData: FormData) {
    'use server';
    const s = await getServerSession(authOptions);
    if (!s || s.user.role !== 'ADMIN') throw new Error('Unauthorized');
    const id = String(formData.get('id') ?? '');
    await prisma.user.update({ where: { id }, data: { approved: true } });
    revalidatePath('/admin/users');
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Approve Users</h1>
      {pending.length === 0 ? (
        <p className="mt-4 text-sm text-gray-600">Tidak ada user pending.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {pending.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between rounded border p-3"
            >
              <div>
                <div className="font-medium">{u.name}</div>
                <div className="text-sm text-gray-600">{u.email}</div>
              </div>
              <form action={approve}>
                <input type="hidden" name="id" value={u.id} />
                <button className="rounded bg-black px-3 py-2 text-white">
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
