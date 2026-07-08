import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

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

  const { userId: rawUserId, email, content } = await request.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: 'content required' }, { status: 400 });
  }

  let userId = rawUserId;
  if (!userId && email) {
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) return NextResponse.json({ error: 'No member found with that email' }, { status: 404 });
    userId = user.id;
  }

  if (!userId) {
    return NextResponse.json({ error: 'userId or email required' }, { status: 400 });
  }

  const msg = await prisma.chatMessage.create({
    data: { userId, content: content.trim(), fromAdmin: true },
    include: { user: { select: { email: true } } },
  });

  // Notify the member of the new reply (non-blocking).
  const memberUser = await prisma.user.findUnique({ where: { id: userId } });
  if (memberUser) {
    await sendEmail('member_chat_reply', memberUser.email, {
      displayName: memberUser.email.split('@')[0],
      replyContent: content.trim(),
      profileUrl: 'https://lanrae.co.uk',
    });
  }

  return NextResponse.json({
    id: msg.id,
    userId: msg.userId,
    userEmail: msg.user.email,
    content: msg.content,
    fromAdmin: msg.fromAdmin,
    createdAt: msg.createdAt,
  });
}
