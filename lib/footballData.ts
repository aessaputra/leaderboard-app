// Adapter for Football-Data.org v4
// All requests are server-only and cached via Next.js revalidate.
import 'server-only';

export const FD_BASE = 'https://api.football-data.org/v4';

type Dict = Record<string, string | number | undefined>;

export async function fd(
  path: string,
  params: Dict = {},
  revalidateSec = 1800,
) {
  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) throw new Error('Missing FOOTBALL_DATA_TOKEN');

  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    usp.set(k, String(v));
  }
  const qs = usp.toString();
  const url = `${FD_BASE}${path}${qs ? `?${qs}` : ''}`;

  const res = await fetch(url, {
    headers: {
      'X-Auth-Token': token,
      accept: 'application/json',
    },
    next: { revalidate: revalidateSec },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Football-Data error ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export function mapFdStatus(s: string):
  | 'NS'
  | '1H'
  | 'HT'
  | '2H'
  | 'FT'
  | 'PST'
  | 'SUSP'
  | 'CANC'
  | 'AWD'
  | 'LIVE' {
  const up = (s || '').toUpperCase();
  switch (up) {
    case 'SCHEDULED':
    case 'TIMED':
      return 'NS';
    case 'IN_PLAY':
      return 'LIVE';
    case 'PAUSED':
      return 'HT';
    case 'FINISHED':
      return 'FT';
    case 'POSTPONED':
      return 'PST';
    case 'SUSPENDED':
      return 'SUSP';
    case 'CANCELED':
      return 'CANC';
    case 'AWARDED':
      return 'AWD';
    default:
      return 'NS';
  }
}

export type GetFixturesArgs = {
  competitions?: string; // e.g. "PL,PD,CL"
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  status?: string; // SCHEDULED, IN_PLAY, FINISHED, etc.
  next?: number; // emulate next N within window
};

function toISODate(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function getFixturesFD(args: GetFixturesArgs) {
  const params: Dict = {};
  if (args.competitions) params.competitions = args.competitions;
  if (args.status) params.status = args.status;

  let dateFrom = args.dateFrom;
  let dateTo = args.dateTo;

  if (args.next && !dateFrom && !dateTo) {
    const from = new Date();
    const to = new Date();
    to.setUTCDate(to.getUTCDate() + 30);
    dateFrom = toISODate(from);
    dateTo = toISODate(to);
  }
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;

  const json = await fd('/matches', params, 1800);
  const matches: any[] = json?.matches || json?.resultSet || json?.response || [];

  let list = matches.map((m: any) => {
    const utc = m?.utcDate as string | undefined;
    const ts = utc ? Date.parse(utc) : Date.now();
    const ft = m?.score?.fullTime || {};
    const ht = m?.score?.halfTime || {};
    return {
      id: m?.id,
      ts, // epoch ms (UTC)
      status: { short: mapFdStatus(m?.status), long: m?.status },
      league: {
        id: m?.competition?.id,
        name: m?.competition?.name,
        code: m?.competition?.code,
        round: m?.stage || null,
        logo: m?.competition?.emblem || null,
      },
      home: {
        id: m?.homeTeam?.id,
        name: m?.homeTeam?.name,
        logo: m?.homeTeam?.crest || null,
        winner: m?.score?.winner === 'HOME_TEAM',
      },
      away: {
        id: m?.awayTeam?.id,
        name: m?.awayTeam?.name,
        logo: m?.awayTeam?.crest || null,
        winner: m?.score?.winner === 'AWAY_TEAM',
      },
      goals: {
        home: ft?.home ?? ht?.home ?? null,
        away: ft?.away ?? ht?.away ?? null,
      },
      venue: m?.area?.name ?? null,
    };
  });

  // Emulate next N upcoming by utcDate
  if (args.next) {
    const now = Date.now();
    list = list
      .filter((fx: any) => fx.ts >= now)
      .sort((a: any, b: any) => a.ts - b.ts)
      .slice(0, Math.max(0, args.next || 0));
  }

  return list;
}
