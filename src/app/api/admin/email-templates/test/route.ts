import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

function isAdmin(request: NextRequest): boolean {
  return (
    !!process.env.ADMIN_PASSWORD &&
    request.cookies.get('admin_token')?.value === process.env.ADMIN_PASSWORD
  );
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name } = await request.json();
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });

  const to = process.env.ADMIN_EMAIL;
  if (!to) return NextResponse.json({ error: 'ADMIN_EMAIL not configured' }, { status: 400 });

  const template = await prisma.emailTemplate.findUnique({ where: { name } });
  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

  // Collect every {{var}} used in subject + html and fill with a dummy value.
  const vars: Record<string, string> = {};
  const combined = `${template.subject} ${template.html}`;
  for (const m of combined.matchAll(/\{\{\s*(\w+)\s*\}\}/g)) {
    vars[m[1]] = '[test value]';
  }

  await sendEmail(name, to, vars);
  return NextResponse.json({ ok: true, sentTo: to });
}
