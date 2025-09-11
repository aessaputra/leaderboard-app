import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import BackButton from '@/components/BackButton';
import Link from 'next/link';
import { CheckCheck, Hourglass } from 'lucide-react';

type SearchParams = { page?: string; pageSize?: string };

export default async function RiwayatPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const userId = session.user.id;

  const sp = (await searchParams) ?? {};

  const page = Math.max(1, Number(sp.page ?? '1') || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, Number(sp.pageSize ?? '10') || 10)
  );
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.trophyAward.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      select: { id: true, competition: true, approved: true, createdAt: true },
    }),
    prisma.trophyAward.count({ where: { userId } }),
  ]);

  const maxPage = Math.max(1, Math.ceil(total / pageSize));

  function pageHref(p: number) {
    const qs = new URLSearchParams();
    qs.set('page', String(p));
    if (pageSize !== 10) qs.set('pageSize', String(pageSize));
    const query = qs.toString();
    return `/me/riwayat${query ? `?${query}` : ''}`;
  }

  return (
    <main className="mx-auto w-full max-w-md p-5 pb-28">
      <header className="mb-4 flex items-center justify-between">
        <BackButton fallback="/me" />
        <h1 className="text-lg font-bold">Riwayat Saya</h1>
        <div />
      </header>

      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
            Belum ada trophy.
          </li>
        ) : (
          items.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-gray-200 bg-white p-4 transition-colors dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold dark:border-white/15 dark:bg-white/5">
                  {r.competition}
                </span>

                {r.approved ? (
                  <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                    <CheckCheck className="h-3.5 w-3.5" />
                    Approved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold border-amber-600/20 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200">
                    <Hourglass className="h-3.5 w-3.5" />
                    Menunggu
                  </span>
                )}
              </div>

              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {new Date(r.createdAt).toLocaleString()}
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Halaman {page} / {maxPage} • Total {total}
        </div>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link
              href={pageHref(page - 1)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs shadow-sm hover:bg-gray-50 dark:border-white/10 dark:bg-white/10"
            >
              ← Prev
            </Link>
          ) : (
            <span className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-1.5 text-xs text-gray-400 dark:border-white/5 dark:bg-white/5">
              ← Prev
            </span>
          )}

          {page < maxPage ? (
            <Link
              href={pageHref(page + 1)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs shadow-sm hover:bg-gray-50 dark:border-white/10 dark:bg-white/10"
            >
              Next →
            </Link>
          ) : (
            <span className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-1.5 text-xs text-gray-400 dark:border-white/5 dark:bg-white/5">
              Next →
            </span>
          )}
        </div>
      </div>
    </main>
  );
}
