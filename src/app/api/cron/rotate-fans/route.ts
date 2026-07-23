import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

function isAuthorised(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;
  const adminPw = process.env.ADMIN_PASSWORD;
  if (adminPw && req.cookies.get('admin_token')?.value === adminPw) return true;
  return false;
}

// 50-person pool — diverse, realistic UK/international names with real-world email patterns
const FAN_POOL = [
  { email: 'emeka.okafor@gmail.com',        display: 'Emeka Okafor',        initials: 'EO', color: '#7c6cff', tier: 'insider' },
  { email: 'charlotte.b@hotmail.co.uk',     display: 'Charlotte Blake',      initials: 'CB', color: '#f5c451', tier: 'insider' },
  { email: 'adaeze.williams@icloud.com',    display: 'Adaeze Williams',      initials: 'AW', color: '#35d6c7', tier: 'insider' },
  { email: 'j.thornton@outlook.com',        display: 'James Thornton',       initials: 'JT', color: '#3ddc97', tier: 'supporter' },
  { email: 'olumide.a@gmail.com',           display: 'Olumide Adeyemi',      initials: 'OA', color: '#ff6ba8', tier: 'insider' },
  { email: 'marcus.obiC@gmail.com',         display: 'Marcus Obi-Clarke',    initials: 'MO', color: '#e0895a', tier: 'supporter' },
  { email: 'chisom.eze@yahoo.com',          display: 'Chisom Eze',           initials: 'CE', color: '#9d90ff', tier: 'supporter' },
  { email: 's.henderson@live.co.uk',        display: 'Sophie Henderson',     initials: 'SH', color: '#1f6feb', tier: 'supporter' },
  { email: 'tolu.b@gmail.com',              display: 'Tolu Babatunde',       initials: 'TB', color: '#ff5757', tier: 'supporter' },
  { email: 'aisha.m@proton.me',             display: 'Aisha Mohammed',       initials: 'AM', color: '#52b7ff', tier: 'supporter' },
  { email: 'daniel.osei@gmail.com',         display: 'Daniel Osei',          initials: 'DO', color: '#a78bfa', tier: 'insider' },
  { email: 'priya.sharma@gmail.com',        display: 'Priya Sharma',         initials: 'PS', color: '#f472b6', tier: 'insider' },
  { email: 'liam.o@icloud.com',             display: 'Liam O\'Brien',        initials: 'LO', color: '#34d399', tier: 'supporter' },
  { email: 'fatima.hassan@outlook.com',     display: 'Fatima Hassan',        initials: 'FH', color: '#fbbf24', tier: 'insider' },
  { email: 'ryan.campbell@gmail.com',       display: 'Ryan Campbell',        initials: 'RC', color: '#60a5fa', tier: 'supporter' },
  { email: 'ngozi.okonkwo@gmail.com',       display: 'Ngozi Okonkwo',        initials: 'NO', color: '#4ade80', tier: 'insider' },
  { email: 'hannah.white@hotmail.co.uk',    display: 'Hannah White',         initials: 'HW', color: '#fb923c', tier: 'supporter' },
  { email: 'kwame.asante@gmail.com',        display: 'Kwame Asante',         initials: 'KA', color: '#c084fc', tier: 'insider' },
  { email: 'jessica.m@yahoo.co.uk',        display: 'Jessica Mitchell',     initials: 'JM', color: '#f87171', tier: 'supporter' },
  { email: 'chidi.nwosu@gmail.com',         display: 'Chidi Nwosu',          initials: 'CN', color: '#22d3ee', tier: 'insider' },
  { email: 'grace.lawson@icloud.com',       display: 'Grace Lawson',         initials: 'GL', color: '#a3e635', tier: 'supporter' },
  { email: 'david.okonkwo@gmail.com',       display: 'David Okonkwo',        initials: 'DK', color: '#818cf8', tier: 'insider' },
  { email: 'amara.diallo@gmail.com',        display: 'Amara Diallo',         initials: 'AD', color: '#fdba74', tier: 'supporter' },
  { email: 'callum.r@live.co.uk',           display: 'Callum Reid',          initials: 'CR', color: '#6ee7b7', tier: 'insider' },
  { email: 'blessing.u@gmail.com',          display: 'Blessing Udeh',        initials: 'BU', color: '#fcd34d', tier: 'supporter' },
  { email: 'noah.jenkins@outlook.com',      display: 'Noah Jenkins',         initials: 'NJ', color: '#7dd3fc', tier: 'insider' },
  { email: 'zainab.ali@proton.me',          display: 'Zainab Ali',           initials: 'ZA', color: '#d8b4fe', tier: 'supporter' },
  { email: 'tobi.adegoke@gmail.com',        display: 'Tobi Adegoke',         initials: 'TA', color: '#86efac', tier: 'insider' },
  { email: 'emily.clark@hotmail.co.uk',     display: 'Emily Clark',          initials: 'EC', color: '#fca5a5', tier: 'supporter' },
  { email: 'ifeanyi.okeke@gmail.com',       display: 'Ifeanyi Okeke',        initials: 'IO', color: '#93c5fd', tier: 'insider' },
  { email: 'sarah.f@icloud.com',            display: 'Sarah Fletcher',       initials: 'SF', color: '#f9a8d4', tier: 'supporter' },
  { email: 'akosua.mensah@gmail.com',       display: 'Akosua Mensah',        initials: 'AM', color: '#6ee7b7', tier: 'insider' },
  { email: 'adam.k@live.co.uk',             display: 'Adam Khan',            initials: 'AK', color: '#c4b5fd', tier: 'supporter' },
  { email: 'ifeoma.eze@yahoo.com',          display: 'Ifeoma Eze',           initials: 'IE', color: '#fde68a', tier: 'insider' },
  { email: 'oliver.s@gmail.com',            display: 'Oliver Stephens',      initials: 'OS', color: '#a5f3fc', tier: 'supporter' },
  { email: 'yetunde.a@gmail.com',           display: 'Yetunde Adeyemi',      initials: 'YA', color: '#bbf7d0', tier: 'insider' },
  { email: 'thomas.nwachukwu@gmail.com',    display: 'Thomas Nwachukwu',     initials: 'TN', color: '#fecdd3', tier: 'supporter' },
  { email: 'maya.p@hotmail.co.uk',          display: 'Maya Patel',           initials: 'MP', color: '#bfdbfe', tier: 'insider' },
  { email: 'kehinde.a@gmail.com',           display: 'Kehinde Afolabi',      initials: 'KA', color: '#ddd6fe', tier: 'supporter' },
  { email: 'ben.watson@outlook.com',        display: 'Ben Watson',           initials: 'BW', color: '#fed7aa', tier: 'insider' },
  { email: 'chidinma.ike@gmail.com',        display: 'Chidinma Ike',         initials: 'CI', color: '#d1fae5', tier: 'supporter' },
  { email: 'jack.moore@icloud.com',         display: 'Jack Moore',           initials: 'JM', color: '#e0e7ff', tier: 'insider' },
  { email: 'seun.t@gmail.com',              display: 'Seun Taiwo',           initials: 'ST', color: '#fef3c7', tier: 'supporter' },
  { email: 'lucy.brown@live.co.uk',         display: 'Lucy Brown',           initials: 'LB', color: '#cffafe', tier: 'insider' },
  { email: 'babatunde.o@gmail.com',         display: 'Babatunde Olawale',    initials: 'BO', color: '#ede9fe', tier: 'supporter' },
  { email: 'isla.m@icloud.com',             display: 'Isla Morrison',        initials: 'IM', color: '#fce7f3', tier: 'insider' },
  { email: 'chukwuemeka.i@gmail.com',       display: 'Chukwuemeka Ibe',      initials: 'CI', color: '#dcfce7', tier: 'supporter' },
  { email: 'chloe.t@hotmail.co.uk',         display: 'Chloe Turner',         initials: 'CT', color: '#f0f9ff', tier: 'insider' },
  { email: 'uche.nwosu@gmail.com',          display: 'Uche Nwosu',           initials: 'UN', color: '#fff7ed', tier: 'supporter' },
  { email: 'georgia.h@gmail.com',           display: 'Georgia Hughes',       initials: 'GH', color: '#fdf4ff', tier: 'insider' },
];

// Generate realistic weekly spend amounts — vary every rotation
function weeklySpend(rank: number): number {
  const base = [18000, 14500, 11200, 8800, 6400, 4900, 3600, 2400, 1600, 900];
  const variance = Math.floor((Math.random() - 0.5) * base[rank] * 0.3);
  return Math.max(500, base[rank] + variance);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function POST(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const picks = shuffle(FAN_POOL).slice(0, 10);

    // Reset all existing fans to spent=0 and high sortOrder so they drop off the visible list
    await prisma.fan.updateMany({ data: { totalSpent: 0, sortOrder: 999 } });

    let rotated = 0;

    for (let i = 0; i < picks.length; i++) {
      const f = picks[i];
      const spent = weeklySpend(i);

      const membership = await prisma.membership.findFirst({
        where: { tier: f.tier },
      });

      const user = await prisma.user.upsert({
        where: { email: f.email },
        update: {},
        create: { email: f.email },
      });

      if (membership) {
        await prisma.transaction.upsert({
          where: { stripeId: `fan_pool_${user.id}` },
          update: {},
          create: {
            userId: user.id,
            type: 'membership',
            membershipId: membership.id,
            amount: membership.price,
            stripeId: `fan_pool_${user.id}`,
            status: 'completed',
          },
        });
      }

      await prisma.fan.upsert({
        where: { userId: user.id },
        update: {
          displayName: f.display,
          initials: f.initials,
          avatarColor: f.color,
          membershipTier: f.tier,
          totalSpent: spent,
          sortOrder: i + 1,
        },
        create: {
          userId: user.id,
          displayName: f.display,
          initials: f.initials,
          avatarColor: f.color,
          membershipTier: f.tier,
          totalSpent: spent,
          sortOrder: i + 1,
        },
      });

      rotated++;
    }

    return NextResponse.json({ ok: true, rotated, week: new Date().toISOString() });
  } catch (err) {
    console.error('[rotate-fans]', err);
    return NextResponse.json({ error: 'Rotation failed' }, { status: 500 });
  }
}

// Vercel cron calls GET
export async function GET(req: NextRequest) {
  return POST(req);
}
