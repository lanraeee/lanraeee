import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CHAT_SYSTEM = `You are TroveAgent, an expert AI assistant built into the Lanrae.co.uk platform. You specialise in:

DESIGN SKILLS:
- UI/UX design: layout principles, visual hierarchy, spacing systems, responsive design
- Branding: logo concepts, brand identity, tone of voice, colour psychology
- Typography: font pairing, type scales, readability, web-safe fonts
- Colour systems: palettes, accessibility contrast, dark/light mode, gradients
- Figma & design tools: component structure, auto-layout, design tokens
- Product design: user flows, wireframing, prototyping, design critiques

DEVELOPMENT SKILLS:
- Frontend: React, Next.js, TypeScript, Tailwind, CSS-in-JS
- AI integration: Claude API, prompt engineering, agentic workflows
- Full-stack: APIs, databases, Prisma, Vercel deployments

Keep responses concise and practical. Use markdown code blocks (\`\`\`) for code snippets. Be direct and specific.`;

const TERMINAL_SYSTEM = `You are TroveAgent in terminal mode — a Claude Code-style coding assistant. You help users write, scaffold, debug, and explain code.

Rules:
- Respond concisely, like a terminal tool would
- Always wrap code in markdown code fences with the language (e.g. \`\`\`tsx)
- For scaffolding requests, output ready-to-use file contents
- For debug requests, explain the issue then show the fix
- For concept questions, give a short explanation then a code example
- Prefer TypeScript, React, Next.js App Router patterns
- No fluff — just signal`;

export async function POST(req: NextRequest) {
  try {
    const { message, mode } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const system = mode === 'terminal' ? TERMINAL_SYSTEM : CHAT_SYSTEM;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: message }],
    });

    const reply = response.content[0].type === 'text' ? response.content[0].text : '';
    return NextResponse.json({ reply });
  } catch (err) {
    console.error('[troveagent]', err);
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
  }
}
