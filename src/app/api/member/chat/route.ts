import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, getAdminEmail } from '@/lib/email';

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

  // Alert admin of the new member message (non-blocking).
  const member = await prisma.user.findUnique({ where: { id: userId } });
  await sendEmail('admin_new_chat', await getAdminEmail(), {
    email: member?.email || 'a member',
    messagePreview: content.trim().slice(0, 100),
  });

  return NextResponse.json(msg);
}
