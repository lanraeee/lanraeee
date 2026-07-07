import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isAdmin(req: NextRequest) {
  return !!process.env.ADMIN_PASSWORD &&
    req.cookies.get('admin_token')?.value === process.env.ADMIN_PASSWORD;
}

export async function GET() {
  try {
    const fans = await prisma.fan.findMany({
      orderBy: { totalSpent: 'desc' },
      take: 10,
      include: { user: { select: { email: true } } },
    });
    return NextResponse.json(fans.map((fan, i) => ({ ...fan, rank: i + 1 })));
  } catch {
    return NextResponse.json({ error: 'Failed to fetch fans' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await req.json();
    await prisma.fan.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete fan' }, { status: 500 });
  }
}
