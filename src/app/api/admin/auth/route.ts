import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  // Admin login alert (non-blocking).
  await sendEmail('admin_login_alert', process.env.ADMIN_EMAIL || '', {
    time: new Date().toLocaleString('en-GB'),
    ip: request.headers.get('x-forwarded-for') || 'unknown',
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_token', process.env.ADMIN_PASSWORD, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_token', '', { maxAge: 0, path: '/' });
  return res;
}
