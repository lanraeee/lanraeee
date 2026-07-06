import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    if (!token || !password || String(password).length < 6) {
      return NextResponse.json({ error: 'Token and a password (min 6 chars) are required' }, { status: 400 });
    }

    const record = await prisma.passwordResetToken.findFirst({
      where: { token, used: false, expiresAt: { gt: new Date() } },
    });
    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 401 });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    await prisma.user.update({ where: { id: record.userId }, data: { passwordHash } });
    await prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } });

    const res = NextResponse.json({ ok: true });
    res.cookies.set('member_token', record.userId, {
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
