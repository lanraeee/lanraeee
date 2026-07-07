import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

function isAdmin(req: NextRequest) {
  return !!process.env.ADMIN_PASSWORD &&
    req.cookies.get('admin_token')?.value === process.env.ADMIN_PASSWORD;
}

export async function GET() {
  try {
    const tools = await prisma.securityTool.findMany({
      where: { enabled: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(tools);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch security tools' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const tool = await prisma.securityTool.create({
      data: {
        name: body.name,
        icon: body.icon || '🛡️',
        category: body.category,
        language: body.language,
        stars: body.stars || '—',
        description: body.description,
        githubUrl: body.githubUrl,
        demoUrl: body.demoUrl || null,
        gradient: body.gradient || 'linear-gradient(135deg,#1e3a8a,#1a3270)',
        order: body.order ?? 0,
        enabled: body.enabled ?? true,
      },
    });
    return NextResponse.json(tool);
  } catch {
    return NextResponse.json({ error: 'Failed to create tool' }, { status: 500 });
  }
}
