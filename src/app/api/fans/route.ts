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
      orderBy: [{ sortOrder: 'asc' }, { totalSpent: 'desc' }],
      take: 20,
      include: { user: { select: { email: true } } },
    });
    return NextResponse.json(fans.map((fan, i) => ({ ...fan, rank: i + 1 })));
  } catch {
    return NextResponse.json({ error: 'Failed to fetch fans' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { email, displayName, initials, avatarColor, membershipTier, totalSpent } = await req.json();
    if (!email || !displayName) return NextResponse.json({ error: 'email and displayName required' }, { status: 400 });

    const user = await prisma.user.upsert({
      where: { email: email.trim().toLowerCase() },
      update: {},
      create: { email: email.trim().toLowerCase() },
    });

    const existing = await prisma.fan.findUnique({ where: { userId: user.id } });
    const maxOrder = await prisma.fan.aggregate({ _max: { sortOrder: true } });
    const nextOrder = (maxOrder._max.sortOrder ?? 0) + 1;

    const fan = existing
      ? await prisma.fan.update({
          where: { userId: user.id },
          data: { displayName, initials: initials || displayName.slice(0, 2).toUpperCase(), avatarColor, membershipTier, totalSpent: Math.round((totalSpent || 0) * 100) },
          include: { user: { select: { email: true } } },
        })
      : await prisma.fan.create({
          data: { userId: user.id, displayName, initials: initials || displayName.slice(0, 2).toUpperCase(), avatarColor: avatarColor || '#9d90ff', membershipTier, totalSpent: Math.round((totalSpent || 0) * 100), sortOrder: nextOrder },
          include: { user: { select: { email: true } } },
        });

    return NextResponse.json(fan);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create fan' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id, direction } = await req.json();
    const fans = await prisma.fan.findMany({ orderBy: [{ sortOrder: 'asc' }, { totalSpent: 'desc' }] });
    const idx = fans.findIndex(f => f.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Fan not found' }, { status: 404 });

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= fans.length) return NextResponse.json({ ok: true });

    const a = fans[idx];
    const b = fans[swapIdx];
    const aOrder = a.sortOrder || idx;
    const bOrder = b.sortOrder || swapIdx;

    await prisma.$transaction([
      prisma.fan.update({ where: { id: a.id }, data: { sortOrder: bOrder === aOrder ? (direction === 'up' ? aOrder - 1 : aOrder + 1) : bOrder } }),
      prisma.fan.update({ where: { id: b.id }, data: { sortOrder: aOrder } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Reorder failed' }, { status: 500 });
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
