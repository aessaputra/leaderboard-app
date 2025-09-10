import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export default async function ManageUsersPage({ searchParams }: { searchParams: any }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/');

  const sp = await searchParams;
  const selectedUserId = String(sp?.userId ?? '');
  const adminId = session.user.id;

  const [users, selected] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'USER', NOT: { id: adminId } },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, approved: true, createdAt: true },
    }),
    selectedUserId
      ? prisma.user.findFirst({
          where: { id: selectedUserId, role: 'USER', NOT: { id: adminId } },
          select: { id: true, name: true, email: true, approved: true, createdAt: true },
        })
      : Promise.resolve(null),
  ]);

  async function updateUser(formData: FormData) {
    'use server';
    const s = await getServerSession(authOptions);
    if (!s || s.user.role !== 'ADMIN') throw new Error('Unauthorized');

    const id = String(formData.get('id') ?? '');
    const name = String(formData.get('name') ?? '');
    const email = String(formData.get('email') ?? '');
    const approved = formData.get('approved') ? true : false;

    if (!id) throw new Error('Invalid user id');
    if (id === s.user.id) throw new Error('Tidak boleh mengubah akun admin saat ini');

    await prisma.user.update({ where: { id }, data: { name, email, approved } });
    revalidatePath('/admin/users/manage');
    redirect(`/admin/users/manage?userId=${id}`);
  }

  async function deleteUser(formData: FormData) {
    'use server';
    const s = await getServerSession(authOptions);
    if (!s || s.user.role !== 'ADMIN') throw new Error('Unauthorized');

    const id = String(formData.get('id') ?? '');
    if (!id) throw new Error('Invalid user id');
    if (id === s.user.id) throw new Error('Tidak boleh menghapus akun admin saat ini');

    // Hapus trophy terkait agar tidak ada constraint error
    await prisma.trophyAward.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });
    revalidatePath('/admin/users/manage');
    redirect(`/admin/users/manage`);
  }

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6">
      <h1 className="text-2xl font-semibold">Manage Users</h1>

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
                    href={`/admin/users/manage?userId=${u.id}`}
                    className={
                      'flex items-center justify-between rounded-lg border px-3 py-2 text-sm ' +
                      (active
                        ? 'border-brand-300 bg-brand-50 text-brand-600 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-300'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/5')
                    }
                  >
                    <span className="truncate">{u.name ?? u.email}</span>
                    <span
                      className={
                        'ml-3 shrink-0 rounded-full px-2 py-0.5 text-[10px] ' +
                        (u.approved
                          ? 'border border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200'
                          : 'border border-amber-600/20 bg-amber-50 text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200')
                      }
                    >
                      {u.approved ? 'Approved' : 'Pending'}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Detail + Edit */}
        <section className="md:col-span-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          {!selected ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">Pilih user untuk melihat, edit, atau hapus.</div>
          ) : (
            <div className="space-y-4">
              <header>
                <div className="text-lg font-semibold">{selected.name ?? selected.email}</div>
                <div className="text-xs text-gray-500">ID: {selected.id}</div>
              </header>

              <form action={updateUser} className="space-y-3">
                <input type="hidden" name="id" value={selected.id} />
                <label className="block">
                  <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Name</div>
                  <input
                    name="name"
                    defaultValue={selected.name ?? ''}
                    className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm dark:border-white/10 dark:bg-white/5"
                  />
                </label>
                <label className="block">
                  <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Email</div>
                  <input
                    name="email"
                    type="email"
                    defaultValue={selected.email}
                    className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm dark:border-white/10 dark:bg-white/5"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="approved" defaultChecked={selected.approved} className="h-4 w-4" />
                  <span className="text-sm">Approved</span>
                </label>
                <div className="flex gap-2">
                  <button type="submit" className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                    Simpan
                  </button>
                </div>
              </form>
              <form action={deleteUser} className="mt-2">
                <input type="hidden" name="id" value={selected.id} />
                <button type="submit" className="rounded-lg border border-rose-600/30 bg-rose-50 px-4 py-2 text-sm text-rose-700 hover:bg-rose-100 dark:border-rose-400/40 dark:bg-rose-500/15 dark:text-rose-200 dark:hover:bg-rose-500/25">
                  Hapus User
                </button>
              </form>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
