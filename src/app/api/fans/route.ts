import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const fans = await prisma.fan.findMany({
      orderBy: { totalSpent: 'desc' },
      take: 10,
      include: { user: { select: { email: true } } },
    });
    return NextResponse.json(fans.map((fan, i) => ({ ...fan, rank: i + 1 })));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch fans' }, { status: 500 });
  }
}
