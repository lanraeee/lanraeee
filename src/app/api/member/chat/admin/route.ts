import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

function isAdmin(request: NextRequest): boolean {
  return (
    !!process.env.ADMIN_PASSWORD &&
    request.cookies.get('admin_token')?.value === process.env.ADMIN_PASSWORD
  );
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const messages = await prisma.chatMessage.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true } } },
  });

  const result = messages.map(m => ({
    id: m.id,
    userId: m.userId,
    userEmail: m.user.email,
    content: m.content,
    fromAdmin: m.fromAdmin,
    read: m.read,
    createdAt: m.createdAt,
  }));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { userId, content } = await request.json();
  if (!userId || !content?.trim()) {
    return NextResponse.json({ error: 'userId and content required' }, { status: 400 });
  }

  const msg = await prisma.chatMessage.create({
    data: { userId, content: content.trim(), fromAdmin: true },
    include: { user: { select: { email: true } } },
  });

  return NextResponse.json({
    id: msg.id,
    userId: msg.userId,
    userEmail: msg.user.email,
    content: msg.content,
    fromAdmin: msg.fromAdmin,
    createdAt: msg.createdAt,
  });
}
