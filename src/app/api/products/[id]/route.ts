import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const body = await request.json();
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        icon: body.icon,
        price: Math.round(parseFloat(body.price) * 100),
        isFree: body.isFree,
        isNew: body.isNew,
        requiresMembership: body.requiresMembership || null,
        artifactUrl: body.artifactUrl || null,
        githubUrl: body.githubUrl || null,
        showGithub: body.showGithub ?? false,
        vercelUrl: body.vercelUrl || null,
        gradient: body.gradient,
        order: body.order,
      },
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
