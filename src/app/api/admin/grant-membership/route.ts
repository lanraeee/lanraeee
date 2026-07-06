import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, seedTemplates } from '@/lib/email';
import crypto from 'crypto';

function isAdmin(request: NextRequest): boolean {
  return !!process.env.ADMIN_PASSWORD &&
    request.cookies.get('admin_token')?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { email, tier } = await request.json();
  if (!email || !tier) return NextResponse.json({ error: 'email and tier required' }, { status: 400 });

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const membership = await prisma.membership.findUnique({ where: { tier } });
  if (!membership) return NextResponse.json({ error: 'Membership tier not found' }, { status: 404 });

  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: 'membership',
      membershipId: membership.id,
      amount: 0,
      stripeId: null,
      status: 'completed',
    },
  });

  const token = crypto.randomBytes(32).toString('hex');
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await seedTemplates();
  const origin = process.env.NEXT_PUBLIC_URL || 'https://lanrae.co.uk';
  await sendEmail('member_welcome', email, {
    displayName: email.split('@')[0],
    setPasswordUrl: `${origin}/?set-password=${token}`,
  });

  return NextResponse.json({ ok: true, email, tier });
}
