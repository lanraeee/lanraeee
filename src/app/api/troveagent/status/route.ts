import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

const LIMITS: Record<string, number | null> = {
  free: 3,
  supporter: 100,
  insider: null,
};

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('member_token')?.value;

  if (!userId) {
    return NextResponse.json({ tier: 'free', tierName: 'Free', limit: LIMITS.free, loggedIn: false });
  }

  try {
    const tx = await prisma.transaction.findFirst({
      where: { userId, type: 'membership', status: 'completed' },
      include: { membership: { select: { tier: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    if (!tx?.membership) {
      return NextResponse.json({ tier: 'free', tierName: 'Free', limit: LIMITS.free, loggedIn: true });
    }

    const tier = tx.membership.tier;
    return NextResponse.json({
      tier,
      tierName: tx.membership.name,
      limit: LIMITS[tier] ?? null,
      loggedIn: true,
    });
  } catch {
    return NextResponse.json({ tier: 'free', tierName: 'Free', limit: LIMITS.free, loggedIn: false });
  }
}
