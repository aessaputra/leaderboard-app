import { NextRequest, NextResponse } from 'next/server';
import { getFixturesFD } from '@/lib/footballData';

// Revalidate at most once every 30 minutes for each unique query
export const revalidate = 1800; // 30 minutes

function pickInt(sp: URLSearchParams, key: string): number | undefined {
  const v = sp.get(key);
  if (v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

// Optional legacy mapping from API-FOOTBALL numeric ids to Football-Data codes
const LEGACY_TO_FD: Record<string, string> = {
  '39': 'PL',
  '140': 'PD',
  '2': 'CL',
  '78': 'BL1',
  '135': 'SA',
  '61': 'FL1',
  '3': 'EL',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const competitionsIncoming = searchParams.get('competitions') || undefined;
  const dateFrom = searchParams.get('dateFrom') || searchParams.get('from') || undefined;
  const dateTo = searchParams.get('dateTo') || searchParams.get('to') || undefined;
  const status = searchParams.get('status') || undefined;
  const next = pickInt(searchParams, 'next');
  // Keep timezone for downstream display only
  const timezone = searchParams.get('timezone') || 'Asia/Jakarta';

  // Legacy support: ?league= or ?leagues=
  let competitions = competitionsIncoming;
  if (!competitions) {
    const legacy = [searchParams.get('league'), searchParams.get('leagues')]
      .filter(Boolean)
      .join(',');
    if (legacy) {
      const codes = legacy
        .split(',')
        .map((s) => s.trim())
        .map((id) => LEGACY_TO_FD[id])
        .filter(Boolean);
      if (codes.length) competitions = codes.join(',');
    }
  }

  try {
    const effectiveNext = next || (!dateFrom && !dateTo ? 10 : undefined);

    // When filtering for a single local day, widen the fetch window by ±1 day
    // to avoid timezone edge misses, then filter locally by the provided timezone.
    function shift(day: string, deltaDays: number) {
      const d = new Date(`${day}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() + deltaDays);
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    }

    const isSingleDay = !!dateFrom && !!dateTo && dateFrom === dateTo;
    const fetchFrom = isSingleDay ? shift(dateFrom!, -1) : dateFrom || undefined;
    const fetchTo = isSingleDay ? shift(dateTo!, +1) : dateTo || undefined;

    let fixtures = await getFixturesFD({
      competitions: competitions || undefined,
      dateFrom: fetchFrom,
      dateTo: fetchTo,
      status: status || undefined,
      next: effectiveNext,
    });

    if (isSingleDay) {
      const fmt = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      fixtures = fixtures.filter((fx: any) => fmt.format(new Date(fx.ts)) === dateFrom);
    }
    const body = { fixtures };
    const res = NextResponse.json(body);
    res.headers.set('Cache-Control', 's-maxage=1800, stale-while-revalidate=60');
    res.headers.set('Vary', 'Accept-Encoding');
    res.headers.set('X-Timezone-Display', timezone);
    return res;
  } catch (err: any) {
    const message = err?.message || 'Failed to fetch fixtures';
    const res = NextResponse.json({ fixtures: [], error: message }, { status: 502 });
    res.headers.set('Cache-Control', 's-maxage=120, stale-while-revalidate=60');
    return res;
  }
}
