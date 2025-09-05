import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  // Middleware Anda sudah urus redirect login;
  // di sini cukup cegah render jika bukan ADMIN
  if (!session || session.user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-dvh bg-black text-gray-100">
      {/* Header Admin */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/admin/trophies/requests" className="font-semibold">
            Admin Panel ⚙️
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/admin/trophies/requests"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 hover:bg-white/10"
            >
              Requests
            </Link>
            <Link
              href="/admin/users"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 hover:bg-white/10"
            >
              Users
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4 pb-20">{children}</main>

      {/* Footer/tabs Admin (opsional) */}
      <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2 p-3 text-sm">
          <Link
            href="/admin/trophies/requests"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center font-medium hover:bg-white/10"
          >
            Approve Trophy
          </Link>
          <Link
            href="/admin/users"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center font-medium hover:bg-white/10"
          >
            Approve Users
          </Link>
        </div>
      </footer>
    </div>
  );
}
