// Lightweight server-only client for API-FOOTBALL v3
// All requests go through the server. Never expose the key to client bundles.
import 'server-only';

export const BASE = 'https://v3.football.api-sports.io';

type Dict = Record<string, string | number | undefined>;

// Generic fetch wrapper with Next.js ISR-style revalidation.
export async function af(
  path: string,
  params: Dict = {},
  revalidateSec = 1800,
) {
  const key = process.env.APISPORTS_KEY;
  if (!key) {
    throw new Error('Missing APISPORTS_KEY env. Set it in Vercel Project Settings.');
  }

  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    usp.set(k, String(v));
  }
  const qs = usp.toString();
  const url = `${BASE}${path}${qs ? `?${qs}` : ''}`;

  const res = await fetch(url, {
    headers: {
      'x-apisports-key': key,
      // Hint to CDNs and proxies that this is server-to-server.
      'accept': 'application/json',
    },
    // Let Next cache the successful responses for a period.
    next: { revalidate: revalidateSec },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API-FOOTBALL error ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export type FixtureUI = {
  id: number;
  ts: number; // epoch ms
  status: {
    short: string; // NS, 1H, HT, 2H, FT, etc.
    long?: string;
  };
  league: {
    id: number;
    name: string;
    round?: string | null;
    logo?: string | null;
  };
  home: { id: number; name: string; logo?: string | null };
  away: { id: number; name: string; logo?: string | null };
  goals: { home: number | null; away: number | null };
  venue?: { name?: string | null; city?: string | null };
};

export async function getFixtures(args: {
  league?: string;
  season?: number;
  date?: string; // YYYY-MM-DD
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  next?: number;
  last?: number;
  timezone?: string;
}) {
  const params: Dict = { ...args };
  params.timezone = params.timezone || 'Asia/Jakarta';

  // 30 minutes default revalidate for non-live fixtures
  const json = await af('/fixtures', params, 1800);

  // API-FOOTBALL response shape: { response: [ { fixture, league, teams, goals } ] }
  const list: FixtureUI[] = (json?.response || []).map((it: any) => {
    const tsSec: number | undefined = it?.fixture?.timestamp;
    const dateISO: string | undefined = it?.fixture?.date;
    const ts = tsSec ? tsSec * 1000 : (dateISO ? Date.parse(dateISO) : Date.now());
    return {
      id: it?.fixture?.id,
      ts,
      status: {
        short: it?.fixture?.status?.short || 'NS',
        long: it?.fixture?.status?.long,
      },
      league: {
        id: it?.league?.id,
        name: it?.league?.name,
        round: it?.league?.round ?? null,
        logo: it?.league?.logo ?? null,
      },
      home: {
        id: it?.teams?.home?.id,
        name: it?.teams?.home?.name,
        logo: it?.teams?.home?.logo ?? null,
      },
      away: {
        id: it?.teams?.away?.id,
        name: it?.teams?.away?.name,
        logo: it?.teams?.away?.logo ?? null,
      },
      goals: {
        home: it?.goals?.home ?? null,
        away: it?.goals?.away ?? null,
      },
      venue: {
        name: it?.fixture?.venue?.name ?? null,
        city: it?.fixture?.venue?.city ?? null,
      },
    } as FixtureUI;
  });

  return list;
}

export async function getTimezones() {
  const json = await af('/timezone', {}, 86400); // 24 hours
  const tzs: string[] = json?.response || [];
  return tzs as string[];
}

