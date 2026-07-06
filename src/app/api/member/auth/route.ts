import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'No active membership found for this email' }, { status: 401 });
    }

    const membership = await prisma.transaction.findFirst({
      where: { userId: user.id, type: 'membership', status: 'completed' },
    });
    if (!membership) {
      return NextResponse.json({ error: 'No active membership found for this email' }, { status: 401 });
    }

    // If the member has set a password, require and verify it.
    // Legacy members without a passwordHash keep email-only access until they set one.
    if (user.passwordHash) {
      if (!password) {
        return NextResponse.json({ error: 'Password required', needsPassword: true }, { status: 401 });
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
      }
    }

    // Login alert email (non-blocking).
    await sendEmail('member_login_alert', user.email, {
      displayName: user.email.split('@')[0],
      time: new Date().toLocaleString('en-GB'),
      device: request.headers.get('user-agent')?.split('(')[1]?.split(')')[0] || 'Unknown',
    });

    const res = NextResponse.json({ userId: user.id, email: user.email });
    res.cookies.set('member_token', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const userId = request.cookies.get('member_token')?.value;
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const membership = await prisma.transaction.findFirst({
    where: { userId: user.id, type: 'membership', status: 'completed' },
  });
  if (!membership) return NextResponse.json({ error: 'No active membership' }, { status: 401 });

  return NextResponse.json({ userId: user.id, email: user.email });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('member_token', '', { maxAge: 0, path: '/' });
  return res;
}
