import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

// Whitelist — only forward requests to known radio hosts
const ALLOWED = new Set([
  'media-ice.musicradio.com',
  'beatfm.out.airtime.pro',
  'stream-relay-geo.ntslive.co.uk',
  'ice1.somafm.com',
  'kexp-mp3-128.streamguys1.com',
  'stream.radioparadise.com',
  'stream0.wfmu.org',
  'sohoradio.ice.infomaniak.ch',
]);

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url');
  if (!raw) return new Response('Missing url', { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return new Response('Invalid URL', { status: 400 });
  }

  if (!ALLOWED.has(parsed.hostname)) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const upstream = await fetch(raw, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Referer': 'https://www.globalplayer.com/',
        'Origin': 'https://www.globalplayer.com',
        'Accept': '*/*',
      },
    });

    if (!upstream.ok || !upstream.body) {
      return new Response(`Upstream error: ${upstream.status}`, { status: upstream.status });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') ?? 'audio/mpeg',
        'Cache-Control': 'no-store',
        'X-Accel-Buffering': 'no',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new Response('Proxy error', { status: 502 });
  }
}
