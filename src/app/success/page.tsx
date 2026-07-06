import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id || !process.env.STRIPE_SECRET_KEY) {
    return <SuccessLayout><p style={{ color: '#a7aecb' }}>No session found.</p><HomeLink /></SuccessLayout>;
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items'],
    });
  } catch {
    return <SuccessLayout><p style={{ color: '#a7aecb' }}>Could not retrieve session.</p><HomeLink /></SuccessLayout>;
  }

  const productName = session.line_items?.data[0]?.description || 'your purchase';
  const email = session.customer_details?.email || '';
  const meta = session.metadata || {};

  let artifactUrl: string | null = null;
  let githubUrl: string | null = null;
  let vercelUrl: string | null = null;

  if (meta.productId) {
    try {
      const product = await prisma.product.findUnique({ where: { id: meta.productId } });
      artifactUrl = product?.artifactUrl || null;
      githubUrl = product?.githubUrl || null;
      vercelUrl = product?.vercelUrl || null;
    } catch {}
  }

  const hasLinks = artifactUrl || githubUrl || vercelUrl;

  return (
    <SuccessLayout>
      <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'grid', placeItems: 'center',
        fontSize: 28, background: 'radial-gradient(circle at 40% 35%,#4ff2b0,#16a06a)',
        boxShadow: '0 10px 30px rgba(61,220,151,.4)', margin: '0 auto 4px' }}>✓</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Payment complete 🎉</h1>
      <p style={{ color: '#a7aecb', fontSize: 14, margin: 0 }}>
        Thanks{email ? `, ${email.split('@')[0]}` : ''}! You bought <strong style={{ color: '#fff' }}>{productName}</strong>.
      </p>

      {hasLinks && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#9d90ff', fontWeight: 700, margin: 0 }}>Access your product</p>
          {artifactUrl && (
            <a href={artifactUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', padding: '13px 18px', borderRadius: 12,
                background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff',
                textDecoration: 'none', fontWeight: 650, fontSize: 14, textAlign: 'center' }}>
              ⬇ Download
            </a>
          )}
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', padding: '13px 18px', borderRadius: 12,
                background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)',
                color: '#dfe3f4', textDecoration: 'none', fontWeight: 650, fontSize: 14, textAlign: 'center' }}>
              GitHub Repo →
            </a>
          )}
          {vercelUrl && (
            <a href={vercelUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', padding: '13px 18px', borderRadius: 12,
                background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)',
                color: '#dfe3f4', textDecoration: 'none', fontWeight: 650, fontSize: 14, textAlign: 'center' }}>
              Live Demo →
            </a>
          )}
        </div>
      )}

      {!hasLinks && meta.type === 'membership' && (
        <p style={{ color: '#a7aecb', fontSize: 13, margin: 0 }}>
          Your membership is now active. Welcome to the studio.
        </p>
      )}

      <HomeLink />
    </SuccessLayout>
  );
}

function SuccessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(160deg,#0a0f26,#05060f)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', color: '#fff',
    }}>
      <div style={{
        width: 'min(420px,92vw)', background: 'rgba(255,255,255,.04)',
        border: '1px solid rgba(255,255,255,.1)', borderRadius: 24,
        padding: '36px 28px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 16, textAlign: 'center',
        boxShadow: '0 40px 90px rgba(0,0,0,.6)',
      }}>
        {children}
      </div>
    </div>
  );
}

function HomeLink() {
  return (
    <Link href="/" style={{
      color: '#9d90ff', fontSize: 14, textDecoration: 'none', fontWeight: 600, marginTop: 4,
    }}>
      ← Back to lanraeAi
    </Link>
  );
}
