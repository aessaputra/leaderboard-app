import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { TrophySchema } from '@/lib/validators';

function deriveSeasonFromDate(d = new Date()): string {
  // Asumsi musim Eropa: mulai Agustus (month >= 7)
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth(); // 0-11
  const startYear = month >= 7 ? year : year - 1;
  const endYear2 = String((startYear + 1) % 100).padStart(2, '0');
  return `${startYear}/${endYear2}`;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = TrophySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { userId, competition } = parsed.data;
    const season =
      parsed.data.season?.toString().trim() || deriveSeasonFromDate();

    await prisma.trophyAward.create({
      data: {
        userId,
        competition,
        season,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
