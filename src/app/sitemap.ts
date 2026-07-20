import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: { slug: string; updatedAt: Date }[] = [];
  try {
    posts = await prisma.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    });
  } catch { /* non-fatal — sitemap still serves static routes */ }

  return [
    { url: 'https://lanrae.co.uk',      lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: 'https://lanrae.co.uk/blog', lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    ...posts.map(p => ({
      url: `https://lanrae.co.uk/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
