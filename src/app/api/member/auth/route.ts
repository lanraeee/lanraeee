import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
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
