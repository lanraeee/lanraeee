import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
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
    } catch (err) {
      console.error('Webhook DB error:', err);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
