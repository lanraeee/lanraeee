import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const WEB_SEARCH_TOOL: Anthropic.Tool = {
  name: 'web_search',
  description: 'Search the internet for current information, news, prices, documentation, or any real-time data. Use this whenever the user asks about something that may have changed recently or that requires up-to-date facts.',
  input_schema: {
    type: 'object' as const,
    properties: {
      query: { type: 'string', description: 'The search query' },
    },
    required: ['query'],
  },
};

async function webSearch(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return 'Web search is unavailable (TAVILY_API_KEY not configured).';
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, query, search_depth: 'basic', max_results: 5, include_answer: true }),
    });
    if (!res.ok) return `Search failed with status ${res.status}.`;
    const data = await res.json();
    const parts: string[] = [];
    if (data.answer) parts.push(`Answer: ${data.answer}`);
    if (data.results?.length) {
      parts.push('\nSources:');
      (data.results as any[]).slice(0, 5).forEach((r, i) => {
        parts.push(`${i + 1}. ${r.title}\n   ${r.url}\n   ${(r.content ?? '').slice(0, 300)}`);
      });
    }
    return parts.join('\n') || 'No results found.';
  } catch (err) {
    return `Search error: ${err instanceof Error ? err.message : 'unknown'}`;
  }
}

async function getSiteContext(): Promise<string> {
  try {
    const [products, memberships, content] = await Promise.all([
      prisma.product.findMany({ orderBy: { order: 'asc' }, select: { name: true, description: true, price: true, isFree: true, isNew: true, requiresMembership: true, vercelUrl: true, githubUrl: true } }),
      prisma.membership.findMany({ orderBy: { order: 'asc' }, select: { name: true, tier: true, price: true, description: true, features: true } }),
      prisma.siteContent.findMany({ select: { key: true, value: true } }),
    ]);

    const contentMap = Object.fromEntries(content.map(c => [c.key, c.value]));

    const productLines = products.map(p =>
      `- ${p.name}: ${p.description} | ${p.isFree ? 'Free' : `£${(p.price / 100).toFixed(2)}`}${p.requiresMembership ? ` (requires ${p.requiresMembership} membership)` : ''}${p.vercelUrl ? ` | Live: ${p.vercelUrl}` : ''}${p.isNew ? ' [NEW]' : ''}`
    ).join('\n');

    const membershipLines = memberships.map(m =>
      `- ${m.name} (${m.tier}): ${m.price === 0 ? 'Free' : `£${(m.price / 100).toFixed(2)}/mo`} — ${m.description} | Features: ${m.features.join(', ')}`
    ).join('\n');

    const siteLines = [
      contentMap['site.name'] && `Brand: ${contentMap['site.name']}`,
      contentMap['about.heading'] && `About: ${contentMap['about.heading']}`,
      contentMap['about.body'] && `Bio: ${contentMap['about.body']}`,
      contentMap['store.heading'] && `Store heading: ${contentMap['store.heading']}`,
      contentMap['store.subheading'] && `Store subheading: ${contentMap['store.subheading']}`,
      contentMap['members.heading'] && `Members heading: ${contentMap['members.heading']}`,
      contentMap['members.subheading'] && `Members subheading: ${contentMap['members.subheading']}`,
    ].filter(Boolean).join('\n');

    return `
## Lanrae.co.uk — Live Site Data

### Site Info
${siteLines}

### Products (${products.length} total)
${productLines || 'No products yet.'}

### Membership Tiers
${membershipLines || 'No memberships configured.'}
`.trim();
  } catch {
    return '';
  }
}

const BASE_CHAT_SYSTEM = `You are TroveAgent, an expert AI assistant built into the Lanrae.co.uk platform. You have live internet access via web_search and full knowledge of the site's current data (products, memberships, pricing) shown below — use it to answer any questions about the platform.

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

Keep responses concise and practical. Use markdown code blocks for code. Be direct and specific.`;

const BASE_TERMINAL_SYSTEM = `You are TroveAgent in terminal mode — a Claude Code-style coding assistant with live internet access and full knowledge of the Lanrae.co.uk site data shown below. Use web_search proactively to fetch docs, check package versions, find examples, or look up APIs.

Rules:
- Respond concisely, like a terminal tool would
- Always wrap code in markdown code fences with the language (e.g. \`\`\`tsx)
- For scaffolding requests, output ready-to-use file contents
- For debug requests, explain the issue then show the fix
- Search for latest package versions or docs when relevant
- Prefer TypeScript, React, Next.js App Router patterns
- No fluff — just signal`;

export async function POST(req: NextRequest) {
  try {
    const { message, mode } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const siteContext = await getSiteContext();
    const base = mode === 'terminal' ? BASE_TERMINAL_SYSTEM : BASE_CHAT_SYSTEM;
    const system = siteContext ? `${base}\n\n${siteContext}` : base;

    const messages: Anthropic.MessageParam[] = [{ role: 'user', content: message }];

    for (let i = 0; i < 5; i++) {
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system,
        tools: [WEB_SEARCH_TOOL],
        messages,
      });

      if (response.stop_reason === 'tool_use') {
        const toolUse = response.content.find(b => b.type === 'tool_use') as Anthropic.ToolUseBlock;
        const searchResult = await webSearch((toolUse.input as { query: string }).query);
        messages.push({ role: 'assistant', content: response.content });
        messages.push({ role: 'user', content: [{ type: 'tool_result', tool_use_id: toolUse.id, content: searchResult }] });
        continue;
      }

      const textBlock = response.content.find(b => b.type === 'text') as Anthropic.TextBlock | undefined;
      return NextResponse.json({ reply: textBlock?.text ?? 'No response.' });
    }

    return NextResponse.json({ reply: 'Reached search limit — please try a more specific question.' });
  } catch (err) {
    console.error('[troveagent]', err);
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
  }
}
