import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AddMyTrophyClient from './AddMyTrophyClient';
import { redirect } from 'next/navigation';

export default async function NewMyTrophyPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <main className="mx-auto w-full max-w-md md:max-w-lg p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold">Ajukan Trophy 🏆</h1>
      <p className="mt-1 text-sm text-gray-600">
        Admin akan meninjau & menyetujui.
      </p>
      <AddMyTrophyClient userId={session.user.id} />
    </main>
  );
}
