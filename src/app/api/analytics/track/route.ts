import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return 'Edge';
  if (/OPR\/|Opera/.test(ua)) return 'Opera';
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Safari\//.test(ua)) return 'Safari';
  return 'Other';
}

function parseDevice(ua: string): string {
  if (/iPad/.test(ua)) return 'Tablet';
  if (/iPhone|Android.*Mobile|Mobile/.test(ua)) return 'Mobile';
  return 'Desktop';
}

export async function POST(request: NextRequest) {
  const ua = request.headers.get('user-agent') || '';
  const country = request.headers.get('x-vercel-ip-country') || null;
  const rawCity = request.headers.get('x-vercel-ip-city') || null;
  const city = rawCity ? decodeURIComponent(rawCity) : null;

  await prisma.pageView.create({
    data: {
      path: '/',
      country,
      city,
      browser: parseBrowser(ua),
      device: parseDevice(ua),
    },
  });

  return NextResponse.json({ ok: true });
}
