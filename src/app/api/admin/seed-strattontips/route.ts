import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  if (!process.env.ADMIN_PASSWORD || token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await prisma.product.findFirst({ where: { name: 'StrattonTips' } });
  if (existing) {
    return NextResponse.json({ ok: true, message: 'StrattonTips already exists', id: existing.id });
  }

  const maxOrder = await prisma.product.aggregate({ _max: { order: true } });
  const order = (maxOrder._max.order ?? 0) + 1;

  const product = await prisma.product.create({
    data: {
      name: 'StrattonTips',
      description: 'A curated tips & insights web app built on Vercel. Browse, learn, and stay sharp.',
      icon: '💡',
      price: 0,
      isFree: true,
      isNew: true,
      requiresMembership: null,
      artifactUrl: null,
      githubUrl: null,
      vercelUrl: 'https://strattontips.vercel.app',
      gradient: 'linear-gradient(160deg,#f59e0b,#92400e)',
      order,
    },
  });

  return NextResponse.json({ ok: true, message: 'StrattonTips product created', id: product.id });
}
