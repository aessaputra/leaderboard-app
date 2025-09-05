import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  Trophy,
  ListOrdered,
  UserRound,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default async function Home() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  let counts = { ucl: 0, europa: 0, total: 0 };
  if (user) {
    const grouped = await prisma.trophyAward.groupBy({
      by: ['competition'],
      where: { userId: user.id, approved: true },
      _count: { _all: true },
    });
    const ucl = grouped.find((g) => g.competition === 'UCL')?._count._all ?? 0;
    const europa =
      grouped.find((g) => g.competition === 'EUROPA')?._count._all ?? 0;
    counts = { ucl, europa, total: ucl + europa };
  }

  return (
    <main className="relative mx-auto max-w-md p-5 pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_360px_at_50%_-120px,rgba(255,255,255,0.08),transparent)]"
      />

      {/* Title only */}
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent text-center">
        Trophy Leaderboard
    </h1>

      {/* Quick stats (opsional, hanya saat login) */}
      {user && (
        <section className="mt-5 grid grid-cols-3 gap-3">
          <Stat label="UCL" value={counts.ucl} />
          <Stat label="Europa" value={counts.europa} />
          <Stat label="Total" value={counts.total} />
        </section>
      )}

      {/* Aksi utama */}
      <nav className="mt-6 space-y-3">
        <Primary href="/trophies/new" icon={<Trophy className="h-4 w-4" />}>
          Ajukan Trophy
        </Primary>
        <Secondary
          href="/leaderboard"
          icon={<ListOrdered className="h-4 w-4" />}
        >
          Lihat Leaderboard
        </Secondary>
        <Secondary href="/offline" icon={<Sparkles className="h-4 w-4" />}>
          Coba Halaman Offline
        </Secondary>
        <Secondary href="/me" icon={<UserRound className="h-4 w-4" />}>
          Profil Saya
        </Secondary>
      </nav>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center shadow-sm backdrop-blur">
      <div className="text-[11px] uppercase tracking-wide text-gray-400">
        {label}
      </div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Primary({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex w-full items-center justify-between rounded-xl border border-white/10 bg-white px-4 py-3 text-sm font-medium text-black shadow-sm transition active:scale-[0.99]"
    >
      <span className="inline-flex items-center gap-2">
        {icon}
        {children}
      </span>
      <ChevronRight className="h-4 w-4 opacity-60 transition group-hover:translate-x-0.5" />
    </Link>
  );
}

function Secondary({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium hover:bg-white/10"
    >
      <span className="inline-flex items-center gap-2">
        {icon}
        {children}
      </span>
      <ChevronRight className="h-4 w-4 opacity-50 transition group-hover:translate-x-0.5" />
    </Link>
  );
}
