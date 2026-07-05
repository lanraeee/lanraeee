import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const { name, email, title, description } = await request.json();
  if (!name?.trim() || !email?.trim() || !title?.trim() || !description?.trim()) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }
  const entry = await prisma.projectRequest.create({
    data: { name: name.trim(), email: email.trim(), title: title.trim(), description: description.trim() },
  });
  return NextResponse.json(entry, { status: 201 });
}

export async function GET() {
  const requests = await prisma.projectRequest.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(requests);
}
