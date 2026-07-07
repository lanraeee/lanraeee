import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Ctx = { params: Promise<{ id: string }> };

function isAdmin(req: NextRequest) {
  return !!process.env.ADMIN_PASSWORD &&
    req.cookies.get('admin_token')?.value === process.env.ADMIN_PASSWORD;
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const tool = await prisma.securityTool.update({
      where: { id },
      data: {
        name: body.name,
        icon: body.icon,
        category: body.category,
        language: body.language,
        stars: body.stars,
        description: body.description,
        githubUrl: body.githubUrl,
        demoUrl: body.demoUrl || null,
        gradient: body.gradient,
        order: body.order ?? 0,
        enabled: body.enabled ?? true,
      },
    });
    return NextResponse.json(tool);
  } catch {
    return NextResponse.json({ error: 'Failed to update tool' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    await prisma.securityTool.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete tool' }, { status: 500 });
  }
}
