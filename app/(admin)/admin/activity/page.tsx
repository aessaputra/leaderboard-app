export const runtime = 'nodejs';

import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export default async function AdminActivityPage({ searchParams }: { searchParams: any }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/');

  const sp = await searchParams;
  const page = Math.max(1, Number(sp?.page ?? 1));
  const limit = Math.min(50, Math.max(5, Number(sp?.limit ?? 10)));
  const skip = (page - 1) * limit;

  const [total, recent] = await Promise.all([
    prisma.trophyAward.count(),
    prisma.trophyAward.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        competition: true,
        approved: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Aktivitas</h1>

      <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-neutral-900/60">
        {recent.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">Belum ada aktivitas.</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-white/5">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {t.user?.name ?? t.user?.email ?? 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t.competition} • {new Date(t.createdAt).toLocaleString('id-ID', {
                      timeZone: 'Asia/Jakarta',
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
                <span
                  className={
                    'ml-3 shrink-0 rounded-full px-2 py-0.5 text-xs ' +
                    (t.approved
                      ? 'border border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200'
                      : 'border border-amber-600/20 bg-amber-50 text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200')
                  }
                >
                  {t.approved ? 'Approved' : 'Pending'}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Menampilkan {recent.length > 0 ? skip + 1 : 0}–{Math.min(skip + recent.length, total)} dari {total}
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
            {page > 1 ? (
              <Link
                href={`/admin/activity?page=${page - 1}&limit=${limit}`}
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 sm:flex-none"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </Link>
            ) : (
              <span className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-400 dark:border-white/5 dark:bg-white/5 dark:text-gray-600 sm:flex-none">
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </span>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
              {page}/{pageCount}
            </span>
            {page < pageCount ? (
              <Link
                href={`/admin/activity?page=${page + 1}&limit=${limit}`}
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 sm:flex-none"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-400 dark:border-white/5 dark:bg-white/5 dark:text-gray-600 sm:flex-none">
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
            <span className="hidden text-sm sm:inline">
              Page {page} of {pageCount}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
