import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { seedTemplates } from '@/lib/email';

function isAdmin(request: NextRequest): boolean {
  return (
    !!process.env.ADMIN_PASSWORD &&
    request.cookies.get('admin_token')?.value === process.env.ADMIN_PASSWORD
  );
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let templates = await prisma.emailTemplate.findMany({ orderBy: { name: 'asc' } });
  if (templates.length === 0) {
    await seedTemplates();
    templates = await prisma.emailTemplate.findMany({ orderBy: { name: 'asc' } });
  }
  return NextResponse.json(templates);
}

export async function PUT(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, subject, html, enabled } = await request.json();
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });

  const template = await prisma.emailTemplate.upsert({
    where: { name },
    update: { subject, html, enabled },
    create: { name, subject: subject || '', html: html || '', enabled: enabled ?? true },
  });
  return NextResponse.json(template);
}
