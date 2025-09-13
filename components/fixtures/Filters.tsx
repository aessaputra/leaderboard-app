"use client";

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import FixtureCard from './FixtureCard';

type Fixture = any;

const TOP_LEAGUES: { code: string; name: string }[] = [
  { code: 'PL', name: 'Premier League' },
  { code: 'PD', name: 'La Liga' },
  { code: 'SA', name: 'Serie A' },
  { code: 'BL1', name: 'Bundesliga' },
  { code: 'FL1', name: 'Ligue 1' },
  { code: 'CL', name: 'UEFA Champions League' },
  { code: 'EL', name: 'UEFA Europa League' },
];

// Stable fallbacks for league emblems (PNG works reliably for most codes).
const CREST_BY_CODE: Record<string, string> = {
  PL: 'https://crests.football-data.org/PL.png',
  PD: 'https://crests.football-data.org/PD.png',
  SA: 'https://crests.football-data.org/SA.png',
  BL1: 'https://crests.football-data.org/BL1.png',
  FL1: 'https://crests.football-data.org/FL1.png',
  CL: 'https://crests.football-data.org/CL.png',
  EL: 'https://crests.football-data.org/EL.png',
};

function fmt(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Filters({ initialFixtures }: { initialFixtures: Fixture[] }) {
  // Default state: Top leagues selected, preset 7 hari
  const [selected, setSelected] = useState<string[]>(TOP_LEAGUES.map((l) => l.code));
  const [preset, setPreset] = useState<'today' | '7d'>('7d');

  const { from, to } = useMemo(() => {
    const now = new Date();
    const from = new Date(now);
    const to = new Date(now);
    if (preset === '7d') to.setDate(now.getDate() + 7);
    return { from: fmt(from), to: fmt(to) };
  }, [preset]);

  const [debouncedKey, setDebouncedKey] = useState<string | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);
  useEffect(() => {
    const competitions = selected.join(',');
    const key = `/api/fixtures?dateFrom=${from}&dateTo=${to}&competitions=${competitions}`;
    setIsDebouncing(true);
    const h = setTimeout(() => {
      setDebouncedKey(key);
      setIsDebouncing(false);
    }, 500);
    return () => clearTimeout(h);
  }, [from, to, selected]);

  const { data, isLoading } = useSWR<{ fixtures: Fixture[] }>(debouncedKey, fetcher, {
    dedupingInterval: 30_000,
    revalidateOnFocus: false,
    keepPreviousData: false,
    fallbackData: debouncedKey ? undefined : { fixtures: initialFixtures },
  });

  const fixtures = data?.fixtures ?? initialFixtures ?? [];
  const loading = isDebouncing || isLoading;
  const crestMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const fx of fixtures) {
      const code = fx?.league?.code;
      const logo = fx?.league?.logo;
      if (code && logo && !map[code]) map[code] = logo;
    }
    return map;
  }, [fixtures]);

  const countBadge = (
    <span className="ml-auto inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 dark:bg-white/10 dark:text-gray-300">
      {fixtures.length} pertandingan
    </span>
  );

  return (
    <section className="space-y-4">
      <form className="rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-white/5" onSubmit={(e) => e.preventDefault()}>
        {/* Emblem bar (quick visual toggle) */}
        <div className="mb-3 flex flex-wrap gap-2">
          {TOP_LEAGUES.map((l) => {
            const active = selected.includes(l.code);
            const crest = crestMap[l.code] || CREST_BY_CODE[l.code];
            return (
              <button
                key={l.code}
                type="button"
                title={l.name}
                aria-label={`Toggle ${l.name}`}
                onClick={() =>
                  setSelected((prev) =>
                    prev.includes(l.code) ? prev.filter((id) => id !== l.code) : [...prev, l.code]
                  )
                }
                className={`h-8 w-8 rounded-full p-1 ring-1 transition ${
                  active
                    ? 'ring-brand-400/60 bg-brand-50 dark:bg-brand-400/10'
                    : 'ring-black/10 hover:bg-gray-100 dark:ring-white/10 dark:hover:bg-white/10'
                }`}
              >
                {crest ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={crest} alt="" className="h-full w-full object-contain" />
                ) : (
                  <span className="block h-full w-full rounded-full bg-gray-200 dark:bg-white/10" />
                )}
              </button>
            );
          })}
        </div>
        <fieldset>
          <div className="mb-2 flex items-center justify-between gap-2">
            <legend className="text-sm font-medium">Top Leagues</legend>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-md border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/10"
                onClick={() => setSelected(TOP_LEAGUES.map((l) => l.code))}
                aria-label="Pilih semua liga"
              >
                Pilih semua
              </button>
              <button
                type="button"
                className="rounded-md border border-gray-300 px-2 py-1 text-[11px] hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/10"
                onClick={() => setSelected([])}
                aria-label="Kosongkan pilihan liga"
              >
                Kosongkan
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {TOP_LEAGUES.map((l) => {
              const active = selected.includes(l.code);
              return (
                <button
                  type="button"
                  key={l.code}
                  onClick={() =>
                    setSelected((prev) =>
                      prev.includes(l.code) ? prev.filter((id) => id !== l.code) : [...prev, l.code]
                    )
                  }
                  className={
                    'rounded-full border px-3 py-1 text-[12px]' +
                    (active
                      ? ' border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-400/30 dark:bg-brand-400/10 dark:text-brand-300'
                      : ' border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10')
                  }
                  aria-pressed={active}
                  aria-label={`Toggle ${l.name}`}
                >
                  {l.name}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Rentang</label>
            <div className="flex gap-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="preset"
                  value="today"
                  checked={preset === 'today'}
                  onChange={() => setPreset('today')}
                />
                Hari ini
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="preset"
                  value="7d"
                  checked={preset === '7d'}
                  onChange={() => setPreset('7d')}
                />
              7 Hari
              </label>
            </div>
          </div>
          {/* Timezone intentionally hidden; default Asia/Jakarta handled server-side */}
        </div>
      </form>

      <div className="mb-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span>Hasil</span>
        {countBadge}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : fixtures.length === 0 ? (
        <EmptySuggestions onPick7d={() => setPreset('7d')} onResetLeagues={() => setSelected(TOP_LEAGUES.map(l => l.code))} />
      ) : (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fixtures.map((fx: any) => (
            <FixtureCard key={fx.id} fx={fx} />
          ))}
        </section>
      )}
    </section>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-10" aria-busy>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-brand-600 dark:border-white/20 dark:border-t-brand-400" />
      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Memuat jadwal…</span>
    </div>
  );
}

function EmptySuggestions({ onPick7d, onResetLeagues }: { onPick7d: () => void; onResetLeagues: () => void }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
      <p className="mb-2">Tidak ada jadwal untuk pilihan ini.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <button onClick={onPick7d} className="rounded-lg border border-gray-300 px-3 py-1 text-[12px] hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/10">Lihat 7 Hari</button>
        <button onClick={onResetLeagues} className="rounded-lg border border-gray-300 px-3 py-1 text-[12px] hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/10">Reset Top Leagues</button>
      </div>
    </div>
  );
}
