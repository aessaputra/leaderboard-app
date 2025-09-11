import FixtureCard from '@/components/fixtures/FixtureCard';
import Filters from '@/components/fixtures/Filters';
import { headers, cookies } from 'next/headers';

type FixturesResponse = {
  fixtures: any[];
  error?: string;
};

async function prefetchFixtures() {
  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host = h.get('host') ?? 'localhost:3000';
  const url = `${proto}://${host}/api/fixtures?competitions=PL,PD,SA,BL1,FL1&next=10`;

  // Forward session cookies so middleware/auth can authorize the internal call
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
    .join('; ');

  const res = await fetch(url, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    // Let the route handler and CDN caching do the heavy lifting
    next: { revalidate: 1800 },
  });
  if (!res.ok) {
    return { fixtures: [], error: 'Tidak dapat memuat jadwal saat ini.' } as FixturesResponse;
  }
  return (await res.json()) as FixturesResponse;
}

export const revalidate = 300; // Re-render this page occasionally; data cache is in the API route

export default async function FixturesPage() {
  const { fixtures } = await prefetchFixtures();

  return (
    <main className="relative mx-auto max-w-3xl p-5 pb-28">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Jadwal Pertandingan</h1>
      </div>

      {/* Hide generic error banner per request; filters provide helpful empty state */}

      <Filters initialFixtures={fixtures} />
    </main>
  );
}

// Empty state moved into Filters
