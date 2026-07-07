import type { Metadata } from "next";
import "./globals.css";
import { prisma } from "@/lib/prisma";

async function getSeoMeta() {
  try {
    const rows = await prisma.siteContent.findMany({
      where: { key: { in: ['seo.title', 'seo.description', 'seo.ogImage', 'seo.keywords'] } },
    });
    const m: Record<string, string> = {};
    rows.forEach(r => { m[r.key] = r.value; });
    return m;
  } catch { return {}; }
}

export async function generateMetadata(): Promise<Metadata> {
  const m = await getSeoMeta();
  const title = m['seo.title'] || 'lanraeAi — AI Product Development';
  const description = m['seo.description'] || 'Browse, buy, and support AI-powered products built by lanrae. An adaptive AI desktop experience.';
  const ogImage = m['seo.ogImage'] || 'https://lanrae.co.uk/logo.png';
  const keywords = m['seo.keywords'] || 'AI products, AI tools, lanrae, AI studio, artificial intelligence';
  return {
    title,
    description,
    keywords,
    icons: {
      icon: '/logo.png',
      apple: '/logo.png',
    },
    openGraph: {
      title,
      description,
      url: 'https://lanrae.co.uk',
      siteName: 'lanraeAi',
      images: [{ url: ogImage }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
