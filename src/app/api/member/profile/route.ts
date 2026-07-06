import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

async function getMemberUserId(request: NextRequest): Promise<string | null> {
  const userId = request.cookies.get('member_token')?.value;
  if (!userId) return null;
  const membership = await prisma.transaction.findFirst({
    where: { userId, type: 'membership', status: 'completed' },
  });
  return membership ? userId : null;
}

export async function GET(request: NextRequest) {
  const userId = await getMemberUserId(request);
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const profile = await prisma.memberProfile.findUnique({ where: { userId } });
  return NextResponse.json(profile ?? {});
}

export async function PUT(request: NextRequest) {
  const userId = await getMemberUserId(request);
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { displayName, bio, designation, cvUrl, profilePicUrl, repos } = await request.json();

  const repoList: string[] = Array.isArray(repos)
    ? repos
    : typeof repos === 'string'
    ? repos.split('\n').map((r: string) => r.trim()).filter(Boolean)
    : [];

  const profile = await prisma.memberProfile.upsert({
    where: { userId },
    create: { userId, displayName, bio, designation, cvUrl, profilePicUrl, repos: repoList },
    update: { displayName, bio, designation, cvUrl, profilePicUrl, repos: repoList },
  });

  return NextResponse.json(profile);
}
