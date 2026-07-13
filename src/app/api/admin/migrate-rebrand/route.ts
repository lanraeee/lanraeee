import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  if (!process.env.ADMIN_PASSWORD || token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const updates: Record<string, string> = {
    'site.name': 'Lanrae.co.uk',
    'site.fromName': 'Lanrae.co.uk',
    'seo.title': 'Lanrae.co.uk — AI Product Development',
  };

  const results: string[] = [];
  for (const [key, value] of Object.entries(updates)) {
    const existing = await prisma.siteContent.findUnique({ where: { key } });
    if (existing) {
      await prisma.siteContent.update({ where: { key }, data: { value } });
      results.push(`updated ${key}: ${existing.value} → ${value}`);
    } else {
      results.push(`skipped ${key} (not in DB)`);
    }
  }

  return NextResponse.json({ ok: true, results });
}
