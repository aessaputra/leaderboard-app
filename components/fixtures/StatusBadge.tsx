import React from 'react';

export type StatusShort =
  | 'NS'
  | 'TBD'
  | '1H'
  | 'HT'
  | '2H'
  | 'ET'
  | 'P'
  | 'BT'
  | 'SUSP'
  | 'INT'
  | 'LIVE'
  | 'FT'
  | 'AET'
  | 'PEN'
  | 'PST'
  | 'CANC'
  | 'ABD'
  | 'AWD'
  | 'WO'
  | string;

function classify(s: string): 'neutral' | 'live' | 'done' | 'warn' {
  const up = s.toUpperCase();
  if (['FT', 'AET', 'PEN'].includes(up)) return 'done';
  if (['PST', 'CANC', 'ABD', 'AWD', 'WO'].includes(up)) return 'warn';
  if (['1H', '2H', 'ET', 'P', 'HT', 'SUSP', 'INT', 'BT', 'LIVE'].includes(up)) return 'live';
  return 'neutral';
}

function label(s: string) {
  const up = s.toUpperCase();
  const map: Record<string, string> = {
    NS: 'Belum mulai',
    TBD: 'Jadwal menyusul',
    '1H': 'Babak pertama berlangsung',
    HT: 'Istirahat babak pertama',
    '2H': 'Babak kedua berlangsung',
    ET: 'Perpanjangan waktu',
    P: 'Adu penalti',
    BT: 'Babak istirahat',
    SUSP: 'Pertandingan ditunda sementara',
    INT: 'Pertandingan dihentikan sementara',
    LIVE: 'Sedang berlangsung',
    FT: 'Selesai',
    AET: 'Selesai (extra time)',
    PEN: 'Selesai (adu penalti)',
    PST: 'Ditunda',
    CANC: 'Dibatalkan',
    ABD: 'Dihentikan',
    AWD: 'Kemenangan WO',
    WO: 'Walkover',
  };
  return map[up] || up;
}

export default function StatusBadge({ status }: { status: string }) {
  const kind = classify(status);
  const base =
    'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium';
  const cls =
    kind === 'live'
      ? base + ' bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300'
      : kind === 'done'
      ? base + ' bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
      : kind === 'warn'
      ? base + ' bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
      : base + ' bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300';

  return (
    <span className={cls} aria-label={`Status pertandingan: ${label(status)}`}>
      {status.toUpperCase()}
    </span>
  );
}

