import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isAdmin(request: NextRequest): boolean {
  return (
    !!process.env.ADMIN_PASSWORD &&
    request.cookies.get('admin_token')?.value === process.env.ADMIN_PASSWORD
  );
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { text } = await request.json();
  if (!text?.trim()) return NextResponse.json({ error: 'text required' }, { status: 400 });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    return NextResponse.json({ error: 'ElevenLabs not configured — set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID' }, { status: 503 });
  }

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text: text.trim(),
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[tts] ElevenLabs error:', err);
    return NextResponse.json({ error: `ElevenLabs error: ${res.status}` }, { status: 502 });
  }

  const audioBuffer = await res.arrayBuffer();
  const audioBase64 = Buffer.from(audioBuffer).toString('base64');
  return NextResponse.json({ audioBase64 });
}
