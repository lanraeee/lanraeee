'use client';

import { useEffect, useRef, useState } from 'react';

/* ── types ────────────────────────────────── */
type Product = {
  id: string; name: string; description: string; icon: string | null;
  price: number; isFree: boolean; isNew: boolean;
  requiresMembership: string | null;
  artifactUrl: string | null; githubUrl: string | null; vercelUrl: string | null;
  gradient: string;
};
type Fan = {
  id: string; rank: number; displayName: string; initials: string;
  avatarColor: string; totalSpent: number; membershipTier: string | null;
};

/* ── draggable window ─────────────────────── */
function Win({ id, title, subtitle, open, onClose, onMin, style, children, zIndex, onFocus }: {
  id: string; title: string; subtitle?: string; open: boolean;
  onClose: () => void; onMin: () => void;
  style?: React.CSSProperties; children: React.ReactNode;
  zIndex: number; onFocus: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  const startDrag = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.lights')) return;
    const el = ref.current!;
    const rect = el.getBoundingClientRect();
    el.style.left = rect.left + 'px';
    el.style.top = rect.top + 'px';
    el.style.margin = '0';
    drag.current = { sx: e.clientX, sy: e.clientY, ox: rect.left, oy: rect.top };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    onFocus();
  };
  const moveDrag = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const { sx, sy, ox, oy } = drag.current;
    ref.current!.style.left = (ox + e.clientX - sx) + 'px';
    ref.current!.style.top = Math.max(30, oy + e.clientY - sy) + 'px';
  };
  const endDrag = () => { drag.current = null; };

  return (
    <section
      ref={ref}
      onMouseDown={onFocus}
      style={{
        position: 'absolute', display: 'flex', flexDirection: 'column',
        background: 'var(--glass)', backdropFilter: 'blur(30px) saturate(150%)',
        border: '1px solid var(--stroke)', borderRadius: 14,
        boxShadow: '0 30px 70px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.06)',
        transition: 'opacity .22s ease, transform .22s cubic-bezier(.2,.9,.3,1.2)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transform: open ? 'none' : 'scale(.94) translateY(8px)',
        zIndex, ...style,
      }}
    >
      {/* title bar */}
      <div
        style={{ height: 42, display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px',
          borderBottom: '1px solid var(--stroke-2)', cursor: 'grab', flexShrink: 0 }}
        onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag}
      >
        <div className="lights" style={{ display: 'flex', gap: 8 }}>
          <i onClick={onClose} style={{ width: 12, height: 12, borderRadius: '50%', display: 'block',
            background: '#ff5f57', border: '1px solid rgba(0,0,0,.25)', cursor: 'pointer' }} />
          <i onClick={onMin} style={{ width: 12, height: 12, borderRadius: '50%', display: 'block',
            background: '#febc2e', border: '1px solid rgba(0,0,0,.25)', cursor: 'pointer' }} />
          <i style={{ width: 12, height: 12, borderRadius: '50%', display: 'block',
            background: '#28c840', border: '1px solid rgba(0,0,0,.25)' }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#dfe4f6' }}>
          {title} {subtitle && <span style={{ fontWeight: 400, color: '#7d84a6', marginLeft: 6 }}>{subtitle}</span>}
        </span>
      </div>
      {/* body */}
      <div style={{ padding: 18, overflowY: 'auto', maxHeight: '68vh' }}>
        {children}
      </div>
    </section>
  );
}

/* ── checkout overlay ─────────────────────── */
function Checkout({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const [paid, setPaid] = useState(false);
  useEffect(() => { setPaid(false); }, [product]);

  if (!product) return null;
  const price = product.isFree ? 0 : product.price / 100;

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'rgba(3,4,12,.55)', backdropFilter: 'blur(6px)' }}>
      <div style={{ width: 'min(400px,92vw)', background: 'var(--glass)',
        border: '1px solid var(--stroke)', borderRadius: 16,
        boxShadow: '0 40px 90px rgba(0,0,0,.6)', overflow: 'hidden',
        animation: 'rise .3s cubic-bezier(.2,.9,.3,1.15)' }}>
        {paid ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', display: 'flex',
            flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'grid',
              placeItems: 'center', fontSize: 30,
              background: 'radial-gradient(circle at 40% 35%, #4ff2b0, #16a06a)',
              boxShadow: '0 10px 30px rgba(61,220,151,.4)' }}>✓</div>
            <h3 style={{ fontSize: 17, fontWeight: 750 }}>Payment complete 🎉</h3>
            <p style={{ fontSize: 13, color: '#a7aecb', maxWidth: '34ch' }}>
              Your purchase is unlocking now. Thank you for the support.
            </p>
            <button onClick={onClose} style={{ background: 'linear-gradient(180deg,#9d90ff,#7c6cff)',
              color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 9,
              fontSize: 13, fontWeight: 650, cursor: 'pointer' }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--stroke-2)',
              display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, display: 'grid',
                placeItems: 'center', fontSize: 22,
                background: product.gradient, border: '1px solid var(--stroke)' }}>
                {product.icon}
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>{product.name}</h3>
                <p style={{ fontSize: 12, color: '#a7aecb' }}>lanrae.co.uk · secure checkout</p>
              </div>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Email', 'you@email.com'],
                ['Card', '4242 4242 4242 4242'],
                ['Expiry / CVC', '04 / 27   123'],
              ].map(([label, val]) => (
                <div key={label} style={{ background: 'rgba(255,255,255,.05)',
                  border: '1px solid var(--stroke)', borderRadius: 9, padding: '11px 13px',
                  fontSize: 13, color: '#a7aecb', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{label}</span><span style={{ fontFamily: 'monospace', color: '#7d84a6' }}>{val}▏</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
                <span style={{ color: '#a7aecb', fontSize: 13 }}>Total</span>
                <span style={{ fontSize: 22, fontWeight: 800 }}>£{price.toFixed(2)}</span>
              </div>
              <button onClick={() => setPaid(true)}
                style={{ background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff',
                  border: 'none', padding: '12px', borderRadius: 9, fontSize: 13,
                  fontWeight: 650, cursor: 'pointer', width: '100%' }}>
                Pay £{price.toFixed(2)}
              </button>
            </div>
            <div style={{ padding: '12px', borderTop: '1px solid var(--stroke-2)',
              textAlign: 'center', fontSize: 11, color: '#7d84a6' }}>
              🔒 Powered by <b style={{ color: '#a99dff' }}>stripe</b> · demo — no real charge
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes rise{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

/* ── main page ────────────────────────────── */
export default function Desktop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [fans, setFans] = useState<Fan[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [zMap, setZMap] = useState<Record<string, number>>({});
  const [zTop, setZTop] = useState(100);
  const [checkout, setCheckout] = useState<Product | null>(null);
  const [booted, setBooted] = useState(false);
  const [clock, setClock] = useState('');
  const [donateAmt, setDonateAmt] = useState(7);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const h = d.getHours() % 12 || 12, m = d.getMinutes();
      const ap = d.getHours() >= 12 ? 'PM' : 'AM';
      setClock(`${days[d.getDay()]} ${h}:${m < 10 ? '0' : ''}${m} ${ap}`);
    };
    tick(); const t = setInterval(tick, 10000); return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Promise.all([fetch('/api/products'), fetch('/api/fans')])
      .then(([p, f]) => Promise.all([p.json(), f.json()]))
      .then(([p, f]) => { setProducts(p); setFans(f); })
      .catch(console.error)
      .finally(() => {
        setTimeout(() => {
          setBooted(true);
          openWin('store');
          setTimeout(() => openWin('fans'), 400);
        }, 2200);
      });
  }, []);

  const focusWin = (id: string) => {
    const z = zTop + 1;
    setZTop(z);
    setZMap(m => ({ ...m, [id]: z }));
  };
  const openWin = (id: string) => { focusWin(id); setOpen(m => ({ ...m, [id]: true })); };
  const closeWin = (id: string) => setOpen(m => ({ ...m, [id]: false }));

  const wins = [
    { id: 'store', title: 'Product Store', subtitle: '— AI, built by lanrae' },
    { id: 'fans', title: 'Top 10 Fans', subtitle: '— this month' },
    { id: 'members', title: 'Membership' },
    { id: 'donate', title: 'Support the work' },
    { id: 'about', title: 'About This Studio' },
  ];

  const dockApps = [
    { id: 'store', icon: '🛍️', label: 'Product Store' },
    { id: 'members', icon: '🪪', label: 'Membership' },
    { id: 'fans', icon: '🏆', label: 'Top 10 Fans' },
    { id: 'donate', icon: '💛', label: 'Support' },
    { id: 'about', icon: '◐', label: 'About' },
  ];

  const winStyles: Record<string, React.CSSProperties> = {
    store: { width: 'min(660px,92vw)', top: 76, left: 'calc(50% - 300px)' },
    fans: { width: 'min(440px,92vw)', top: 120, left: 'calc(50% + 80px)' },
    members: { width: 'min(680px,92vw)', top: 100, left: 'calc(50% - 340px)' },
    donate: { width: 'min(380px,92vw)', top: 130, left: 'calc(50% - 190px)' },
    about: { width: 'min(420px,92vw)', top: 120, left: 'calc(50% - 210px)' },
  };

  return (
    <>
      {/* ── boot screen ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 3000,
        background: 'linear-gradient(160deg,#0a0f26,#05060f)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26,
        transition: 'opacity .7s ease', opacity: booted ? 0 : 1, pointerEvents: booted ? 'none' : 'auto' }}>
        <div style={{ fontSize: 30, fontWeight: 800 }}>◐ lanrae<span style={{ color: '#9d90ff' }}>OS</span></div>
        <div style={{ width: 200, height: 5, borderRadius: 5, background: 'rgba(255,255,255,.12)', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#9d90ff,#35d6c7)',
            animation: 'load 2.1s ease forwards' }} />
        </div>
        <div style={{ fontSize: 12, color: '#7d84a6' }}>Starting up…</div>
        <style>{`@keyframes load{to{width:100%}} @keyframes blink{50%{opacity:0}}`}</style>
      </div>

      {/* ── desktop ── */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden',
        background: `radial-gradient(120% 90% at 12% -8%,#3a1d6e 0%,transparent 48%),
          radial-gradient(120% 100% at 92% 4%,#0e2a4d 0%,transparent 52%),
          radial-gradient(140% 120% at 50% 120%,#1b1150 0%,transparent 60%),
          linear-gradient(160deg,#0a0f26,#05060f)` }}>

        {/* menu bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 30, zIndex: 900,
          display: 'flex', alignItems: 'center', gap: 20, padding: '0 14px',
          background: 'rgba(9,11,24,.55)', backdropFilter: 'blur(22px) saturate(160%)',
          borderBottom: '1px solid var(--stroke-2)', fontSize: 13 }}>
          <span style={{ fontWeight: 800 }}>◐ lanrae<span style={{ color: '#9d90ff' }}>OS</span></span>
          {['store','members','fans','donate','about'].map(id => (
            <span key={id} onClick={() => openWin(id)}
              style={{ color: '#dfe3f4', opacity: .86, cursor: 'default', textTransform: 'capitalize' }}>
              {id === 'fans' ? 'Top Fans' : id === 'donate' ? 'Support' : id.charAt(0).toUpperCase() + id.slice(1)}
            </span>
          ))}
          <span style={{ marginLeft: 'auto', color: '#dfe3f4', fontVariantNumeric: 'tabular-nums' }}>{clock}</span>
        </div>

        {/* desktop icons */}
        {[
          { id: 'store', icon: '🛍️', label: 'Store', top: 52, left: 28 },
          { id: 'fans', icon: '🏆', label: 'Top Fans', top: 158, left: 28 },
          { id: 'about', icon: '◐', label: 'About', top: 264, left: 28 },
        ].map(({ id, icon, label, top, left }) => (
          <div key={id} onClick={() => openWin(id)}
            style={{ position: 'absolute', top, left, width: 88, textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'default' }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, display: 'grid', placeItems: 'center',
              fontSize: 26, background: 'linear-gradient(160deg,rgba(255,255,255,.12),rgba(255,255,255,.03))',
              border: '1px solid var(--stroke)', boxShadow: '0 8px 22px rgba(0,0,0,.35)' }}>{icon}</div>
            <span style={{ fontSize: 11.5, color: '#eaeefb', textShadow: '0 1px 4px rgba(0,0,0,.7)',
              padding: '1px 6px', borderRadius: 5 }}>{label}</span>
          </div>
        ))}

        {/* windows */}
        {wins.map(({ id, title, subtitle }) => (
          <Win key={id} id={id} title={title} subtitle={subtitle}
            open={!!open[id]} onClose={() => closeWin(id)} onMin={() => closeWin(id)}
            style={winStyles[id]} zIndex={zMap[id] || 100} onFocus={() => focusWin(id)}>

            {id === 'store' && (
              <>
                <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '1.8px',
                  color: '#9d90ff', fontWeight: 700, marginBottom: 8 }}>Featured · Built with AI</div>
                <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 3 }}>Ship-ready AI products</h2>
                <p style={{ fontSize: 13, color: '#a7aecb', marginBottom: 16 }}>
                  Own them outright, or unlock the full shelf with an Insider membership.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
                  {products.length === 0 ? (
                    <p style={{ color: '#7d84a6', fontSize: 13, gridColumn: '1/-1', padding: '20px 0' }}>
                      No products yet — add some in the <a href="/admin" style={{ color: '#9d90ff' }}>admin panel</a>.
                    </p>
                  ) : products.map(p => (
                    <div key={p.id} style={{ background: 'var(--glass-2)', border: '1px solid var(--stroke-2)',
                      borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                      transition: 'transform .18s ease, border-color .18s ease' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,108,255,.5)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.borderColor = ''; }}>
                      <div style={{ height: 90, display: 'grid', placeItems: 'center', fontSize: 32,
                        background: p.gradient, position: 'relative' }}>
                        {p.isNew && <span style={{ position: 'absolute', top: 9, left: 9, fontSize: 9.5,
                          fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase',
                          padding: '3px 7px', borderRadius: 20, background: 'rgba(0,0,0,.4)',
                          border: '1px solid rgba(245,196,81,.4)', color: '#ffd36b' }}>New</span>}
                        {p.requiresMembership && <span style={{ position: 'absolute', top: 9, right: 9 }}>🔒</span>}
                        {p.icon || '📦'}
                      </div>
                      <div style={{ padding: '12px 13px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <h3 style={{ fontSize: 14.5, fontWeight: 650 }}>{p.name}</h3>
                        <p style={{ fontSize: 11.5, color: '#a7aecb', lineHeight: 1.45, minHeight: 33 }}>{p.description}</p>
                        {/* links row */}
                        {(p.artifactUrl || p.githubUrl || p.vercelUrl) && (
                          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                            {p.artifactUrl && <a href={p.artifactUrl} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 11, color: '#9d90ff', textDecoration: 'none',
                                padding: '3px 7px', borderRadius: 6, border: '1px solid rgba(124,108,255,.3)',
                                background: 'rgba(124,108,255,.1)' }}>📄 Artifact</a>}
                            {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 11, color: '#9d90ff', textDecoration: 'none',
                                padding: '3px 7px', borderRadius: 6, border: '1px solid rgba(124,108,255,.3)',
                                background: 'rgba(124,108,255,.1)' }}>💻 GitHub</a>}
                            {p.vercelUrl && <a href={p.vercelUrl} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 11, color: '#9d90ff', textDecoration: 'none',
                                padding: '3px 7px', borderRadius: 6, border: '1px solid rgba(124,108,255,.3)',
                                background: 'rgba(124,108,255,.1)' }}>▲ Live</a>}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 14, fontWeight: 700 }}>
                            {p.isFree ? 'Free' : `£${(p.price / 100).toFixed(2)}`}
                          </span>
                          <button onClick={() => setCheckout(p)}
                            style={{ background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff',
                              border: 'none', borderRadius: 9, padding: '7px 12px', fontSize: 12,
                              fontWeight: 650, cursor: 'pointer' }}>
                            {p.isFree ? 'Open' : p.requiresMembership ? 'Unlock' : 'Buy'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {id === 'fans' && (
              <>
                <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '1.8px',
                  color: '#9d90ff', fontWeight: 700, marginBottom: 8 }}>Hall of fame</div>
                <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 3 }}>The people funding the future</h2>
                <p style={{ fontSize: 13, color: '#a7aecb', marginBottom: 16 }}>Ranked by total support. Resets monthly.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {fans.length === 0 ? (
                    <p style={{ color: '#7d84a6', fontSize: 13, padding: '20px 0' }}>No fans yet — be the first to support!</p>
                  ) : fans.map(fan => {
                    const medal = fan.rank === 1 ? '🥇' : fan.rank === 2 ? '🥈' : fan.rank === 3 ? '🥉' : fan.rank;
                    return (
                      <div key={fan.id} style={{ display: 'grid', gridTemplateColumns: '44px 1fr auto',
                        alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10,
                        background: fan.rank <= 3 ? 'linear-gradient(90deg,rgba(124,108,255,.14),transparent)' : undefined,
                        border: fan.rank <= 3 ? '1px solid var(--stroke-2)' : '1px solid transparent' }}>
                        <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 800 }}>{medal}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', display: 'grid',
                            placeItems: 'center', fontSize: 13, fontWeight: 700, color: '#0a0d1c',
                            background: fan.avatarColor, flexShrink: 0 }}>{fan.initials}</div>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{fan.displayName}</div>
                            <div style={{ fontSize: 11, color: '#7d84a6' }}>{fan.membershipTier || 'Explorer'}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <b style={{ fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>£{(fan.totalSpent / 100).toFixed(0)}</b>
                          <span style={{ display: 'block', fontSize: 10.5, color: '#7d84a6' }}>lifetime</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {id === 'members' && (
              <>
                <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '1.8px',
                  color: '#9d90ff', fontWeight: 700, marginBottom: 8 }}>Join the studio</div>
                <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 3 }}>Back the build. Get the perks.</h2>
                <p style={{ fontSize: 13, color: '#a7aecb', marginBottom: 16 }}>
                  Members fund what gets built next and top supporters get their name on the wall.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                  {[
                    { name: 'Explorer', price: 0, feat: false, features: ['Browse every launch','Free product: PromptDeck','Community changelog'] },
                    { name: 'Supporter', price: 5, feat: true, features: ['Everything in Explorer','Early access to launches','Name on Supporters wall','Vote on the roadmap'] },
                    { name: 'Insider', price: 15, feat: false, features: ['Everything in Supporter','Entire product library','Top 10 Fans eligible','Source access + build logs','Monthly office hours'] },
                  ].map(t => (
                    <div key={t.name} style={{ background: 'var(--glass-2)', border: `1px solid ${t.feat ? 'rgba(124,108,255,.55)' : 'var(--stroke-2)'}`,
                      borderRadius: 14, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 12,
                      position: 'relative', boxShadow: t.feat ? '0 0 0 1px rgba(124,108,255,.25), 0 18px 40px rgba(124,108,255,.16)' : undefined }}>
                      {t.feat && <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                        background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff', fontSize: 10,
                        fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 20 }}>Popular</div>}
                      <h3 style={{ fontSize: 15, fontWeight: 700 }}>{t.name}</h3>
                      <div style={{ fontSize: 30, fontWeight: 800 }}>£{t.price}<small style={{ fontSize: 13, fontWeight: 500, color: '#a7aecb' }}>/mo</small></div>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: '#d7dcf1' }}>
                        {t.features.map(f => <li key={f} style={{ display: 'flex', gap: 8 }}><span style={{ color: '#3ddc97', fontWeight: 800 }}>✓</span>{f}</li>)}
                      </ul>
                      <button onClick={() => t.price > 0 ? setCheckout({ id: t.name, name: `${t.name} membership`, description: '', icon: '🪪', price: t.price * 100, isFree: false, isNew: false, requiresMembership: null, artifactUrl: null, githubUrl: null, vercelUrl: null, gradient: 'linear-gradient(160deg,#7c6cff,#3a1d6e)' }) : undefined}
                        style={{ background: t.price === 0 ? 'rgba(255,255,255,.08)' : 'linear-gradient(180deg,#9d90ff,#7c6cff)',
                          color: '#fff', border: t.price === 0 ? '1px solid var(--stroke)' : 'none',
                          borderRadius: 9, padding: '11px', fontSize: 12.5, fontWeight: 650, cursor: 'pointer', width: '100%' }}>
                        {t.price === 0 ? 'Current plan' : `Subscribe · £${t.price}/mo`}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {id === 'donate' && (
              <>
                <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '1.8px',
                  color: '#9d90ff', fontWeight: 700, marginBottom: 8 }}>One-off tip</div>
                <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 3 }}>Buy me a GPU hour ☕</h2>
                <p style={{ fontSize: 13, color: '#a7aecb', marginBottom: 16 }}>Every tip goes straight into building the next product.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 14 }}>
                  {[3, 7, 15, 30, 50].map(a => (
                    <span key={a} onClick={() => setDonateAmt(a)}
                      style={{ padding: '9px 15px', borderRadius: 20,
                        border: `1px solid ${donateAmt === a ? 'transparent' : 'var(--stroke)'}`,
                        background: donateAmt === a ? 'linear-gradient(180deg,#9d90ff,#7c6cff)' : 'rgba(255,255,255,.05)',
                        fontWeight: 650, fontSize: 13, cursor: 'pointer',
                        color: donateAmt === a ? '#fff' : '#eef1fb' }}>£{a}</span>
                  ))}
                </div>
                <button onClick={() => setCheckout({ id: 'donate', name: `£${donateAmt} tip`, description: '', icon: '💛', price: donateAmt * 100, isFree: false, isNew: false, requiresMembership: null, artifactUrl: null, githubUrl: null, vercelUrl: null, gradient: 'linear-gradient(160deg,#f5c451,#9a6a00)' })}
                  style={{ background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff',
                    border: 'none', borderRadius: 9, padding: '12px', fontSize: 13,
                    fontWeight: 650, cursor: 'pointer', width: '100%' }}>
                  Donate £{donateAmt}
                </button>
                <div style={{ fontSize: 12.5, color: '#a7aecb', display: 'flex', gap: 7, alignItems: 'center', marginTop: 10 }}>
                  💛 <span>142 supporters have tipped this month</span>
                </div>
              </>
            )}

            {id === 'about' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 84, height: 84, borderRadius: 22, margin: '6px auto 14px', display: 'grid',
                  placeItems: 'center', fontSize: 36, background: 'linear-gradient(160deg,#35d6c7,#9d90ff)',
                  color: '#0a0d1c', fontWeight: 800 }}>L</div>
                <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 8 }}>lanrae · AI Product Engineer</h2>
                <p style={{ fontSize: 13, color: '#a7aecb', maxWidth: '36ch', margin: '0 auto 16px' }}>
                  I design, build, and ship AI-powered products end to end — then launch them here,
                  on a desktop you can actually drive. lanrae.co.uk is the studio, the storefront,
                  and the changelog, all in one.
                </p>
                <div style={{ display: 'flex', gap: 9, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => { closeWin('about'); openWin('store'); }}
                    style={{ background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff',
                      border: 'none', borderRadius: 9, padding: '10px 16px', fontSize: 12.5,
                      fontWeight: 650, cursor: 'pointer' }}>Browse products</button>
                  <button onClick={() => { closeWin('about'); openWin('members'); }}
                    style={{ background: 'rgba(255,255,255,.08)', color: '#e7ebfb',
                      border: '1px solid var(--stroke)', borderRadius: 9, padding: '10px 16px',
                      fontSize: 12.5, fontWeight: 650, cursor: 'pointer' }}>Become a member</button>
                </div>
              </div>
            )}
          </Win>
        ))}

        {/* dock */}
        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 800,
          display: 'flex', alignItems: 'flex-end', gap: 8, padding: '9px 12px',
          background: 'rgba(18,20,40,.5)', backdropFilter: 'blur(26px) saturate(160%)',
          border: '1px solid var(--stroke)', borderRadius: 20, boxShadow: '0 18px 44px rgba(0,0,0,.5)' }}>
          {dockApps.map(({ id, icon, label }) => (
            <div key={id} title={label} onClick={() => openWin(id)}
              style={{ width: 50, height: 50, borderRadius: 13, display: 'grid', placeItems: 'center',
                fontSize: 25, cursor: 'pointer', position: 'relative',
                background: 'linear-gradient(160deg,rgba(255,255,255,.14),rgba(255,255,255,.02))',
                border: `1px solid ${open[id] ? 'rgba(124,108,255,.5)' : 'var(--stroke)'}`,
                transition: 'transform .16s cubic-bezier(.2,.9,.3,1.3)', transformOrigin: 'bottom center' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.32) translateY(-8px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
              {icon}
              {open[id] && <div style={{ position: 'absolute', bottom: -6, left: '50%',
                transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#eef1fb' }} />}
            </div>
          ))}
        </div>

        {/* admin shortcut */}
        <a href="/admin" style={{ position: 'absolute', bottom: 78, right: 20, fontSize: 11,
          color: '#7d84a6', textDecoration: 'none', padding: '5px 10px',
          background: 'rgba(0,0,0,.3)', borderRadius: 8, border: '1px solid var(--stroke-2)' }}>
          ⚙️ Admin
        </a>
      </div>

      {checkout && <Checkout product={checkout} onClose={() => setCheckout(null)} />}
    </>
  );
}
