'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function FilterClient({
  initial,
}: {
  initial?: 'UCL' | 'EUROPA';
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const current = initial ?? '';

  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">Pilih kompetisi</span>
      <select
        defaultValue={current}
        onChange={(e) => {
          const v = e.target.value;
          const next = new URLSearchParams(sp.toString());
          if (!v) next.delete('competition');
          else next.set('competition', v);
          router.replace(
            next.toString() ? `/leaderboard?${next}` : '/leaderboard'
          );
        }}
        className="w-full appearance-none rounded-lg border px-3 py-2 text-sm outline-none ring-0
                   border-gray-200 bg-white text-gray-700 dark:border-white/10 dark:bg-black/60 dark:text-gray-200"
      >
        <option value="">Semua Kompetisi</option>
        <option value="UCL">UCL</option>
        <option value="EUROPA">Europa</option>
      </select>
    </label>
  );
}
