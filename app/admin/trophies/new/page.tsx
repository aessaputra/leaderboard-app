import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import AddTrophyClient from './AddTrophyClient';

export default async function AdminAddTrophyPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return <div className="p-6">Unauthorized</div>;
  }

  const approvedUsers = await prisma.user.findMany({
    where: { approved: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">Tambah Trophy 🏆</h1>
      <p className="mt-1 text-sm text-gray-600">
        Offline? Form ini tetap bisa dipakai — akan dikirim saat online.
      </p>
      <AddTrophyClient users={approvedUsers} />
    </main>
  );
}
