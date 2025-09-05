// app/(site)/admin/layout.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Jaga-jaga di sisi server (middleware kamu juga sudah membatasi)
  if (!session) {
    // Biarkan middleware mengarahkan ke /login
    // atau bisa pakai redirect('/login') jika ingin hard redirect di sini.
    return null;
  }
  if (session.user.role !== 'ADMIN') {
    // Jika bukan admin, jangan render layout admin
    // (middleware juga akan cegah akses, ini sebagai double guard)
    return null;
  }

  return (
    <div className="min-h-dvh bg-black text-gray-100">
      {/* Header Admin */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          {/* Arahkan langsung ke halaman utama admin & matikan prefetch */}
          <Link
            href="/admin/trophies/requests"
            prefetch={false}
            className="font-semibold tracking-wide"
          >
            Admin Panel ⚙️
          </Link>

          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/admin/trophies/requests"
              prefetch={false}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 hover:bg-white/10"
            >
              Requests
            </Link>
            <Link
              href="/admin/users"
              prefetch={false}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 hover:bg-white/10"
            >
              Users
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4 pb-20">{children}</main>

      {/* Footer/tabs khusus admin (opsional) */}
      <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2 p-3 text-sm">
          <Link
            href="/admin/trophies/requests"
            prefetch={false}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center font-medium hover:bg-white/10"
          >
            Approve Trophy
        </Link>
          <Link
            href="/admin/users"
            prefetch={false}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center font-medium hover:bg-white/10"
          >
            Approve Users
          </Link>
        </div>
      </footer>
    </div>
  );
}
