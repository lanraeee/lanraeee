import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

async function getMemberUserId(request: NextRequest): Promise<string | null> {
  const userId = request.cookies.get('member_token')?.value;
  if (!userId) return null;
  const membership = await prisma.transaction.findFirst({
    where: { userId, type: 'membership', status: 'completed' },
  });
  return membership ? userId : null;
}

export async function GET(request: NextRequest) {
  const userId = await getMemberUserId(request);
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const messages = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  const userId = await getMemberUserId(request);
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { content } = await request.json();
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 });

  const msg = await prisma.chatMessage.create({
    data: { userId, content: content.trim(), fromAdmin: false },
  });
  return NextResponse.json(msg);
}
