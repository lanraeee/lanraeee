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
  const title = m['seo.title'] || 'Lanrae.co.uk — AI Product Development';
  const description = m['seo.description'] || 'Browse, buy, and support AI-powered products built by lanrae. Tutorials, tools, and digital goods.';
  const keywords = m['seo.keywords'] || 'AI products, AI tools, lanrae, AI studio, artificial intelligence, tutorials';
  return {
    metadataBase: new URL('https://lanrae.co.uk'),
    title: { default: title, template: '%s | lanrae' },
    description,
    keywords,
    authors: [{ name: 'lanrae', url: 'https://lanrae.co.uk' }],
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.png', type: 'image/png', sizes: '1024x1024' },
      ],
      apple: [{ url: '/icon.png', sizes: '1024x1024', type: 'image/png' }],
      shortcut: '/favicon.ico',
    },
    openGraph: {
      title,
      description,
      url: 'https://lanrae.co.uk',
      siteName: 'lanrae',
      locale: 'en_GB',
      type: 'website',
      // opengraph-image.tsx auto-provides the 1200×630 image
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      // Twitter also picks up opengraph-image.tsx automatically
    },
    alternates: {
      canonical: 'https://lanrae.co.uk',
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
