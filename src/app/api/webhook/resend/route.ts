import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createHmac } from 'crypto';
import { prisma } from '@/lib/prisma';

// Resend webhook event types we care about
type ResendEvent = {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    bounced_at?: string;
    complained_at?: string;
  };
};

function verifySignature(body: string, headers: Headers): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return true; // skip verification if not configured

  // Resend uses svix-style signing: svix-id, svix-timestamp, svix-signature
  const svixId = headers.get('svix-id');
  const svixTimestamp = headers.get('svix-timestamp');
  const svixSig = headers.get('svix-signature');
  if (!svixId || !svixTimestamp || !svixSig) return false;

  const signedContent = `${svixId}.${svixTimestamp}.${body}`;
  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const computed = createHmac('sha256', secretBytes).update(signedContent).digest('base64');
  const expectedSig = `v1,${computed}`;

  return svixSig.split(' ').some(s => s === expectedSig);
}

const EVENT_LABELS: Record<string, string> = {
  'email.bounced': '⛔ Email bounced',
  'email.complained': '🚩 Spam complaint',
  'email.delivery_delayed': '⏳ Delivery delayed',
  'email.sent': '✉️ Email sent',
  'email.delivered': '✅ Email delivered',
};

export async function POST(request: NextRequest) {
  const body = await request.text();

  if (!verifySignature(body, request.headers)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { type, data } = event;
  const recipient = data.to?.[0] ?? 'unknown';
  const label = EVENT_LABELS[type] ?? type;

  console.log(`[resend-webhook] ${label} — to: ${recipient} subject: "${data.subject}"`);

  // For actionable failures, notify admin via a SiteContent log entry
  // (avoids circular dependency of emailing about an email failure)
  if (type === 'email.bounced' || type === 'email.complained') {
    try {
      await prisma.siteContent.upsert({
        where: { key: `email.alert.${data.email_id}` },
        update: { value: `${label} — ${recipient} — "${data.subject}" — ${event.created_at}` },
        create: {
          key: `email.alert.${data.email_id}`,
          value: `${label} — ${recipient} — "${data.subject}" — ${event.created_at}`,
        },
      });
    } catch (err) {
      console.error('[resend-webhook] failed to log alert:', err);
    }
  }

  return NextResponse.json({ ok: true });
}
