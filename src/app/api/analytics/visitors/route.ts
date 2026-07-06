import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const since = request.nextUrl.searchParams.get('since');
  const where = since ? { createdAt: { gt: new Date(since) } } : { createdAt: { gt: new Date(Date.now() - 30000) } };

  const views = await prisma.pageView.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, city: true, country: true, browser: true, device: true, createdAt: true },
  });

  return NextResponse.json(views);
}
