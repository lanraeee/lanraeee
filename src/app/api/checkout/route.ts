import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const { type, productId, membershipTier, amount } = await request.json();
  const origin = request.headers.get('origin') || 'https://lanrae.co.uk';

  let name: string;
  let unitAmount: number;
  const metadata: Record<string, string> = { type };

  if (type === 'product' && productId) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    name = product.name;
    unitAmount = product.price;
    metadata.productId = productId;

  } else if (type === 'membership' && membershipTier) {
    const membership = await prisma.membership.findUnique({ where: { tier: membershipTier } });
    if (!membership) return NextResponse.json({ error: 'Membership not found' }, { status: 404 });
    name = `${membership.name} Membership`;
    unitAmount = membership.price;
    metadata.membershipId = membership.id;
    metadata.membershipTier = membershipTier;

  } else if (type === 'donate' && amount) {
    name = 'Support lanrae';
    unitAmount = Math.round(Number(amount) * 100);

  } else {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'gbp',
        product_data: { name },
        unit_amount: unitAmount,
      },
      quantity: 1,
    }],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: origin,
    metadata,
    billing_address_collection: 'auto',
  });

  return NextResponse.json({ url: session.url });
}
