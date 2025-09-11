import Image from 'next/image';
import StatusBadge from './StatusBadge';
import type { FixtureUI } from '@/lib/football';

function formatDate(ts: number | string) {
  try {
    const dt = new Date(typeof ts === 'string' ? ts : Number(ts));
    // Convert UTC to WIB only for display
    const d = dt.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      timeZone: 'Asia/Jakarta',
    });
    const t = dt.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta',
    });
    return `${d}, ${t} WIB`;
  } catch {
    return '';
  }
}

function Team({ name, logo }: { name: string; logo?: string | null }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {logo ? (
        // Using next/image for optimization; fall back to text if fails
        <Image
          src={logo}
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 rounded-sm object-contain ring-1 ring-black/5 dark:ring-white/10"
        />
      ) : (
        <div className="h-5 w-5 rounded-sm bg-gray-200 dark:bg-white/10" aria-hidden />
      )}
      <div className="truncate text-sm font-medium">{name}</div>
    </div>
  );
}

export default function FixtureCard({ fx }: { fx: FixtureUI }) {
  const when = formatDate(fx.ts);
  const showScore = fx.status.short !== 'NS' && fx.goals.home !== null && fx.goals.away !== null;
  const scoreText = showScore ? `${fx.goals.home} - ${fx.goals.away}` : 'vs';

  return (
    <article
      className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5"
      role="group"
      aria-label={`${fx.home.name} vs ${fx.away.name}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-gray-500 dark:text-gray-400">{when}</div>
        <StatusBadge status={fx.status.short} />
      </div>
      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Team name={fx.home.name} logo={fx.home.logo} />
        <div className="text-center text-base font-semibold tabular-nums px-1">{scoreText}</div>
        <div className="flex justify-end">
          <Team name={fx.away.name} logo={fx.away.logo} />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
        {fx.league.logo ? (
          <Image
            src={fx.league.logo}
            alt=""
            width={14}
            height={14}
            className="h-3.5 w-3.5 shrink-0 rounded-sm object-contain ring-1 ring-black/5 dark:ring-white/10"
          />
        ) : (
          <span className="h-3.5 w-3.5 shrink-0 rounded-sm bg-gray-200 dark:bg-white/10" aria-hidden />
        )}
        <span className="truncate" title={`${fx.league.name}${fx.league.round ? ` • ${fx.league.round}` : ''}`}>
          {fx.league.name}{fx.league.round ? ` • ${fx.league.round}` : ''}
        </span>
      </div>
    </article>
  );
}
