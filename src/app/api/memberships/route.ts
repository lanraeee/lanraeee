import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const DEFAULTS = [
  {
    tier: 'explorer', name: 'Explorer', price: 0, order: 1,
    description: 'Browse every launch and join the community',
    features: ['Browse every launch', 'Free product: PromptDeck', 'Community changelog'],
  },
  {
    tier: 'supporter', name: 'Supporter', price: 500, order: 2,
    description: 'Back the build and get your name on the wall',
    features: ['Everything in Explorer', 'Early access to launches', 'Name on Supporters wall', 'Vote on the roadmap'],
  },
  {
    tier: 'insider', name: 'Insider', price: 1500, order: 3,
    description: 'Full library, source access, monthly office hours',
    features: ['Everything in Supporter', 'Entire product library', 'Top 10 Fans eligible', 'Source access + build logs', 'Monthly office hours'],
  },
];

export async function GET() {
  try {
    let memberships = await prisma.membership.findMany({ orderBy: { order: 'asc' } });
    if (memberships.length === 0) {
      memberships = await Promise.all(DEFAULTS.map(m => prisma.membership.create({ data: m })));
    }
    return NextResponse.json(memberships);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch memberships' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = await prisma.membership.update({
      where: { id: body.id },
      data: {
        name: body.name,
        price: body.price,
        description: body.description,
        features: body.features,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update membership' }, { status: 500 });
  }
}
