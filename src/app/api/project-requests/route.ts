import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, getAdminEmail, seedTemplates } from '@/lib/email';

export async function POST(request: NextRequest) {
  const { name, email, title, description } = await request.json();
  if (!name?.trim() || !email?.trim() || !title?.trim() || !description?.trim()) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const trimmed = {
    name: name.trim(),
    email: email.trim(),
    title: title.trim(),
    description: description.trim(),
  };

  const entry = await prisma.projectRequest.create({ data: trimmed });

  await seedTemplates();

  // 1. Alert admin by email
  sendEmail('admin_new_request', await getAdminEmail(), {
    name: trimmed.name,
    email: trimmed.email,
    title: trimmed.title,
    description: trimmed.description.slice(0, 300),
  }).catch(console.error);

  // 2. Confirmation email to requester
  sendEmail('request_confirmation', trimmed.email, {
    name: trimmed.name,
    title: trimmed.title,
    description: trimmed.description.slice(0, 300),
  }).catch(console.error);

  // 3. If requester is a member, create an inbox notification (ChatMessage)
  try {
    const user = await prisma.user.findUnique({ where: { email: trimmed.email } });
    if (user) {
      const membership = await prisma.transaction.findFirst({
        where: { userId: user.id, type: 'membership', status: 'completed' },
      });
      if (membership) {
        await prisma.chatMessage.create({
          data: {
            userId: user.id,
            content: `📋 Your project request "${trimmed.title}" has been received. I review every request personally — top requests shape the roadmap. Watch this space!`,
            fromAdmin: true,
            read: false,
          },
        });
      }
    }
  } catch (err) {
    console.error('[request] member notification failed:', err);
  }

  return NextResponse.json(entry, { status: 201 });
}

export async function GET() {
  const requests = await prisma.projectRequest.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(requests);
}
