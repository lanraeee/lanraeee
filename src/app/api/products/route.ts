import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        icon: body.icon || '🎨',
        price: Math.round(parseFloat(body.price) * 100),
        isFree: body.isFree || false,
        isNew: body.isNew || false,
        requiresMembership: body.requiresMembership || null,
        artifactUrl: body.artifactUrl || null,
        githubUrl: body.githubUrl || null,
        showGithub: body.showGithub ?? (body.isFree || false),
        vercelUrl: body.vercelUrl || null,
        gradient: body.gradient || 'linear-gradient(160deg,#7c6cff,#3a1d6e)',
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
