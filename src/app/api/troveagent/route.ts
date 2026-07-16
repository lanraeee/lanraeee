import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

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

const CHAT_SYSTEM = `You are TroveAgent, an expert AI assistant built into the Lanrae.co.uk platform. You have live internet access via web_search — use it proactively whenever the user asks about current events, prices, docs, news, or anything time-sensitive.

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

Keep responses concise and practical. Use markdown code blocks (\`\`\`) for code. Be direct and specific.`;

const TERMINAL_SYSTEM = `You are TroveAgent in terminal mode — a Claude Code-style coding assistant with live internet access. Use web_search proactively to fetch docs, check package versions, find examples, or look up APIs.

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

    const system = mode === 'terminal' ? TERMINAL_SYSTEM : CHAT_SYSTEM;
    const messages: Anthropic.MessageParam[] = [{ role: 'user', content: message }];

    // Agentic loop — Claude may call web_search one or more times before responding
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
        messages.push({
          role: 'user',
          content: [{ type: 'tool_result', tool_use_id: toolUse.id, content: searchResult }],
        });
        continue;
      }

      // Final text response
      const textBlock = response.content.find(b => b.type === 'text') as Anthropic.TextBlock | undefined;
      return NextResponse.json({ reply: textBlock?.text ?? 'No response.' });
    }

    return NextResponse.json({ reply: 'Reached search limit — please try a more specific question.' });
  } catch (err) {
    console.error('[troveagent]', err);
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
  }
}
