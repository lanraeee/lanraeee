import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { sendEmail, seedTemplates } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email;
    if (!email) return NextResponse.json({ ok: true });

    const meta = session.metadata || {};
    const amountPaid = session.amount_total || 0;

    try {
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email },
      });

      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: meta.type || 'purchase',
          productId: meta.productId || null,
          membershipId: meta.membershipId || null,
          amount: amountPaid,
          stripeId: session.id,
          status: 'completed',
        },
      });

      if (meta.type === 'product' || meta.type === 'donate') {
        await prisma.fan.upsert({
          where: { userId: user.id },
          update: { totalSpent: { increment: amountPaid } },
          create: {
            userId: user.id,
            displayName: email.split('@')[0],
            initials: email.slice(0, 2).toUpperCase(),
            avatarColor: '#7c6cff',
            totalSpent: amountPaid,
          },
        });
      }

      // Fire off notification emails — never let these break the webhook.
      await seedTemplates();

      if (meta.type === 'membership') {
        const crypto = await import('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        await prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            token,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });
        const origin = 'https://lanrae.co.uk';
        const setPasswordUrl = `${origin}/?set-password=${token}`;
        await sendEmail('member_welcome', email, {
          displayName: email.split('@')[0],
          setPasswordUrl,
        });
        await sendEmail('admin_new_member', process.env.ADMIN_EMAIL || '', {
          email,
          tier: meta.membershipTier || 'membership',
          amount: (amountPaid / 100).toFixed(2),
        });
      } else {
        // product / donate receipt + admin alert
        await sendEmail('admin_new_payment', process.env.ADMIN_EMAIL || '', {
          email,
          amount: (amountPaid / 100).toFixed(2),
          productName: meta.productName || 'product',
        });
      }
    } catch (err) {
      console.error('Webhook DB error:', err);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
