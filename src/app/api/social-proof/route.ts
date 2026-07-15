import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const since = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const [txns, memberCount, weekCount] = await Promise.all([
      prisma.transaction.findMany({
        where: { status: 'completed', createdAt: { gte: since } },
        select: {
          type: true,
          amount: true,
          createdAt: true,
          membership: { select: { name: true, tier: true } },
          product: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),
      prisma.transaction.count({ where: { type: 'membership', status: 'completed' } }),
      prisma.transaction.count({
        where: {
          type: 'membership',
          status: 'completed',
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    const events = txns.map(t => ({
      type: t.type,
      tier: t.membership?.name ?? null,
      tierLevel: t.membership?.tier ?? null,
      product: t.product?.name ?? null,
      amount: t.amount,
      minutesAgo: Math.floor((Date.now() - new Date(t.createdAt).getTime()) / 60000),
    }));

    return NextResponse.json({ events, memberCount, weekCount });
  } catch {
    return NextResponse.json({ events: [], memberCount: 0, weekCount: 0 });
  }
}
