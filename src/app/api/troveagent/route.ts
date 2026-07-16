import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: 'You are TroveAgent, a helpful and concise AI assistant built into the Lanrae.co.uk platform. You help users with questions, tasks, ideas, and general assistance. Keep responses friendly, clear, and concise.',
      messages: [{ role: 'user', content: message }],
    });

    const reply = response.content[0].type === 'text' ? response.content[0].text : '';
    return NextResponse.json({ reply });
  } catch (err) {
    console.error('[troveagent]', err);
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
  }
}
