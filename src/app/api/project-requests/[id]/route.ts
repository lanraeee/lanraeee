import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, seedTemplates } from '@/lib/email';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending review',
  'in-review': 'Under review',
  building: 'In development',
  done: 'Completed',
  declined: 'Declined',
};

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await request.json();

  const updated = await prisma.projectRequest.update({
    where: { id },
    data: { status },
  });

  // Notify requester of status change (skip "pending" — that's just the initial state)
  if (status !== 'pending') {
    await seedTemplates();
    const statusLabel = STATUS_LABELS[status] ?? status;
    const vars = { name: updated.name, title: updated.title, statusLabel };

    // Email the requester
    sendEmail('request_status_update', updated.email, vars).catch(console.error);

    // If requester is a member, add inbox notification
    try {
      const user = await prisma.user.findUnique({ where: { email: updated.email } });
      if (user) {
        const membership = await prisma.transaction.findFirst({
          where: { userId: user.id, type: 'membership', status: 'completed' },
        });
        if (membership) {
          const inboxMessages: Record<string, string> = {
            'in-review': `🔍 Your request "${updated.title}" is now under review.`,
            building: `⚒️ We've started building "${updated.title}"! Updates coming soon.`,
            done: `✅ "${updated.title}" is complete! Check the latest tools on the platform.`,
            declined: `❌ Your request "${updated.title}" won't be picked up at this time. Thank you for suggesting it.`,
          };
          const content = inboxMessages[status];
          if (content) {
            await prisma.chatMessage.create({
              data: { userId: user.id, content, fromAdmin: true, read: false },
            });
          }
        }
      }
    } catch (err) {
      console.error('[request-status] member notification failed:', err);
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.projectRequest.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
