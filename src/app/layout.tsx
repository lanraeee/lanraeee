import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "lanrae.co.uk — AI Products Studio",
  description: "A macOS-style desktop where you browse, buy, and support AI-powered products built by lanrae.",
  openGraph: {
    title: "lanrae.co.uk — AI Products Studio",
    description: "Browse and buy AI-powered products.",
    url: "https://lanrae.co.uk",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
