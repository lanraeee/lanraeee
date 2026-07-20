import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: [{ order: 'asc' }, { publishedAt: 'desc' }],
      select: {
        id: true, title: true, slug: true, excerpt: true,
        category: true, tags: true, publishedAt: true,
        readTime: true, icon: true, gradient: true,
      },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const post = await prisma.post.create({
      data: {
        title: body.title,
        slug,
        excerpt: body.excerpt || null,
        content: body.content,
        category: body.category || 'tutorial',
        tags: body.tags || [],
        published: body.published || false,
        publishedAt: body.published ? new Date() : null,
        readTime: body.readTime || null,
        icon: body.icon || '📝',
        gradient: body.gradient || 'linear-gradient(160deg,#7c6cff,#3a1d6e)',
        order: body.order || 0,
      },
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
