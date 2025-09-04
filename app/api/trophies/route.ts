import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { TrophySchema } from '@/lib/validators';

function deriveSeasonFromDate(d = new Date()): string {
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth(); // 0-11
  const startYear = month >= 7 ? year : year - 1;
  const endYear2 = String((startYear + 1) % 100).padStart(2, '0');
  return `${startYear}/${endYear2}`;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
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
    const season = parsed.data.season?.trim() || deriveSeasonFromDate();
    const isAdmin = session.user.role === 'ADMIN';

    // ❌ Admin dilarang membuat trophy untuk dirinya sendiri
    if (isAdmin && userId === session.user.id) {
      return NextResponse.json(
        {
          error: 'Admin tidak boleh menambahkan trophy untuk dirinya sendiri.',
        },
        { status: 403 }
      );
    }

    const approved = isAdmin; // user biasa -> pending; admin -> langsung approve
    await prisma.trophyAward.create({
      data: {
        userId,
        competition,
        season,
        createdBy: session.user.id,
        approved,
      },
    });

    return NextResponse.json(
      { ok: true, approved },
      { status: approved ? 201 : 202 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
