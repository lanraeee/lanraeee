import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

function isAdmin(req: NextRequest) {
  return !!process.env.ADMIN_PASSWORD &&
    req.cookies.get('admin_token')?.value === process.env.ADMIN_PASSWORD;
}

const SEED_FANS = [
  { email: 'emeka.okafor@gmail.com',     display: 'Emeka Okafor',     initials: 'EO', color: '#7c6cff', tier: 'insider',   spent: 14800 },
  { email: 'charlotte.b@hotmail.co.uk',  display: 'Charlotte B.',      initials: 'CB', color: '#f5c451', tier: 'insider',   spent: 12400 },
  { email: 'adaeze.williams@icloud.com', display: 'Adaeze Williams',   initials: 'AW', color: '#35d6c7', tier: 'insider',   spent: 9600  },
  { email: 'j.thornton@outlook.com',     display: 'James Thornton',    initials: 'JT', color: '#3ddc97', tier: 'supporter', spent: 7200  },
  { email: 'olumide.a@gmail.com',        display: 'Olumide Adeyemi',   initials: 'OA', color: '#ff6ba8', tier: 'insider',   spent: 6500  },
  { email: 'marcus.obiC@gmail.com',      display: 'Marcus Obi-Clarke', initials: 'MO', color: '#e0895a', tier: 'supporter', spent: 4500  },
  { email: 'chisom.eze@yahoo.com',       display: 'Chisom Eze',        initials: 'CE', color: '#9d90ff', tier: 'supporter', spent: 3200  },
  { email: 's.henderson@live.co.uk',     display: 'Sophie Henderson',  initials: 'SH', color: '#1f6feb', tier: 'supporter', spent: 2100  },
  { email: 'tolu.b@gmail.com',           display: 'Tolu Babatunde',    initials: 'TB', color: '#ff5757', tier: 'supporter', spent: 1500  },
  { email: 'aisha.m@proton.me',          display: 'Aisha Mohammed',    initials: 'AM', color: '#52b7ff', tier: 'supporter', spent: 1000  },
];

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let seeded = 0;

    for (const f of SEED_FANS) {
      const membership = await prisma.membership.findUnique({ where: { tier: f.tier } });
      if (!membership) continue;

      const user = await prisma.user.upsert({
        where: { email: f.email },
        update: {},
        create: { email: f.email },
      });

      await prisma.transaction.upsert({
        where: { stripeId: `seed_fan_${user.id}` },
        update: {},
        create: {
          userId: user.id,
          type: 'membership',
          membershipId: membership.id,
          amount: membership.price,
          stripeId: `seed_fan_${user.id}`,
          status: 'completed',
        },
      });

      await prisma.fan.upsert({
        where: { userId: user.id },
        update: { totalSpent: f.spent, membershipTier: f.tier },
        create: {
          userId: user.id,
          displayName: f.display,
          initials: f.initials,
          avatarColor: f.color,
          totalSpent: f.spent,
          membershipTier: f.tier,
        },
      });

      seeded++;
    }

    return NextResponse.json({ ok: true, seeded });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
