import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const post = await prisma.post.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const post = await prisma.post.update({
      where: { id },
      data: {
        title: body.title ?? existing.title,
        slug: body.slug ?? existing.slug,
        excerpt: body.excerpt ?? existing.excerpt,
        content: body.content ?? existing.content,
        category: body.category ?? existing.category,
        tags: body.tags ?? existing.tags,
        published: body.published ?? existing.published,
        publishedAt: body.published && !existing.publishedAt ? new Date() : existing.publishedAt,
        readTime: body.readTime ?? existing.readTime,
        icon: body.icon ?? existing.icon,
        gradient: body.gradient ?? existing.gradient,
        order: body.order ?? existing.order,
      },
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
