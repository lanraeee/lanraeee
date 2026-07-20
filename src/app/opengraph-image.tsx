import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg, #05060f 0%, #080a1a 100%)',
          position: 'relative',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* purple glow */}
        <div style={{
          position: 'absolute', top: -120, left: -100,
          width: 700, height: 700, borderRadius: '50%',
          background: 'rgba(124,108,255,0.22)',
          display: 'flex', filter: 'blur(60px)',
        }} />
        {/* blue glow */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 500, height: 500, borderRadius: '50%',
          background: 'rgba(14,42,77,0.6)',
          display: 'flex', filter: 'blur(50px)',
        }} />

        {/* eyebrow */}
        <div style={{
          fontSize: 15, fontWeight: 700, letterSpacing: 5,
          color: '#9d90ff', textTransform: 'uppercase',
          marginBottom: 28, display: 'flex',
        }}>
          AI PRODUCT STUDIO
        </div>

        {/* wordmark */}
        <div style={{
          fontSize: 110, fontWeight: 800, color: '#eef1fb',
          letterSpacing: -5, lineHeight: 1,
          marginBottom: 30, display: 'flex',
        }}>
          lanrae
        </div>

        {/* tagline */}
        <div style={{
          fontSize: 26, color: '#a7aecb', textAlign: 'center',
          maxWidth: 660, lineHeight: 1.5, fontWeight: 400,
          display: 'flex',
        }}>
          Build AI-powered products. Tutorials, tools & digital goods.
        </div>

        {/* domain badge */}
        <div style={{
          marginTop: 48,
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(124,108,255,0.14)',
          border: '1.5px solid rgba(124,108,255,0.35)',
          borderRadius: 40, padding: '12px 28px',
        }}>
          <div style={{
            width: 9, height: 9, borderRadius: '50%',
            background: '#9d90ff', display: 'flex',
          }} />
          <div style={{ fontSize: 20, color: '#9d90ff', fontWeight: 600, display: 'flex' }}>
            lanrae.co.uk
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
