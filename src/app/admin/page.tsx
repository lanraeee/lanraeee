'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Product = {
  id: string; name: string; description: string; icon: string | null;
  price: number; isFree: boolean; isNew: boolean; requiresMembership: string | null;
  artifactUrl: string | null; githubUrl: string | null; vercelUrl: string | null;
  gradient: string; order: number;
};

type Membership = {
  id: string; tier: string; name: string; price: number; description: string; features: string[];
};

const GRADIENTS = [
  'linear-gradient(160deg,#7c6cff,#3a1d6e)',
  'linear-gradient(160deg,#1f6feb,#0d3a7a)',
  'linear-gradient(160deg,#35d6c7,#0e5a52)',
  'linear-gradient(160deg,#e0895a,#7a2f1c)',
  'linear-gradient(160deg,#ff6ba8,#7a1d47)',
  'linear-gradient(160deg,#9d90ff,#2b1a5e)',
  'linear-gradient(160deg,#f5c451,#9a6a00)',
];

function ProductForm({ product, onSave, onCancel }: {
  product?: Product | null; onSave: (data: Partial<Product>) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    icon: product?.icon || '🎨',
    price: product?.isFree ? '0' : product ? (product.price / 100).toFixed(2) : '',
    isFree: product?.isFree || false,
    isNew: product?.isNew || false,
    requiresMembership: product?.requiresMembership || '',
    artifactUrl: product?.artifactUrl || '',
    githubUrl: product?.githubUrl || '',
    vercelUrl: product?.vercelUrl || '',
    gradient: product?.gradient || GRADIENTS[0],
  });

  const s: React.CSSProperties = {
    background: 'rgba(255,255,255,.04)', border: '1px solid var(--stroke)',
    borderRadius: 9, padding: '10px 12px', fontSize: 13, color: '#eef1fb',
    fontFamily: 'inherit', width: '100%',
  };

  return (
    <div style={{ background: 'var(--glass)', border: '1px solid var(--stroke)', borderRadius: 14,
      padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700 }}>{product ? 'Edit' : 'New'} Product</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>Name *</label>
          <input style={s} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="PromptDeck" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>Icon emoji</label>
          <input style={{ ...s, fontSize: 22 }} value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>Description *</label>
        <textarea style={{ ...s, resize: 'vertical', minHeight: 80 }} value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What does this product do?" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>Price (£)</label>
          <input style={s} type="number" min="0" step="0.01" value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="19.99" disabled={form.isFree} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'flex-end' }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', paddingBottom: 10 }}>
            <input type="checkbox" checked={form.isFree} onChange={e => setForm(f => ({ ...f, isFree: e.target.checked, price: e.target.checked ? '0' : f.price }))} />
            <span style={{ fontSize: 13 }}>Free</span>
          </label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', paddingBottom: 10 }}>
            <input type="checkbox" checked={form.isNew} onChange={e => setForm(f => ({ ...f, isNew: e.target.checked }))} />
            <span style={{ fontSize: 13 }}>Mark as New</span>
          </label>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>Requires Membership</label>
          <select style={{ ...s, cursor: 'pointer' }} value={form.requiresMembership}
            onChange={e => setForm(f => ({ ...f, requiresMembership: e.target.value }))}>
            <option value="">— None —</option>
            <option value="supporter">Supporter</option>
            <option value="insider">Insider</option>
          </select>
        </div>
      </div>

      {/* link inputs */}
      {[
        { key: 'artifactUrl', label: 'Artifact URL (Claude)', placeholder: 'https://claude.ai/code/artifact/...' },
        { key: 'githubUrl', label: 'GitHub Repository', placeholder: 'https://github.com/...' },
        { key: 'vercelUrl', label: 'Live Vercel URL', placeholder: 'https://yourapp.vercel.app' },
      ].map(({ key, label, placeholder }) => (
        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</label>
          <input style={s} type="url" value={(form as any)[key]}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} />
        </div>
      ))}

      {/* gradient picker */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>Card Gradient</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {GRADIENTS.map(g => (
            <div key={g} onClick={() => setForm(f => ({ ...f, gradient: g }))}
              style={{ width: 44, height: 44, borderRadius: 10, background: g, cursor: 'pointer',
                border: form.gradient === g ? '2px solid #9d90ff' : '2px solid transparent',
                boxShadow: form.gradient === g ? '0 0 0 2px rgba(124,108,255,.4)' : undefined }} />
          ))}
        </div>
      </div>

      {/* preview */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, display: 'grid', placeItems: 'center',
          fontSize: 28, background: form.gradient, border: '1px solid var(--stroke)', flexShrink: 0 }}>
          {form.icon}
        </div>
        <div>
          <div style={{ fontWeight: 650, fontSize: 14 }}>{form.name || 'Product name'}</div>
          <div style={{ fontSize: 11.5, color: '#a7aecb' }}>{form.isFree ? 'Free' : form.price ? `£${parseFloat(form.price || '0').toFixed(2)}` : 'Price'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => onSave({ ...form, price: parseFloat(form.price) || 0 })}
          style={{ flex: 1, background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff',
            border: 'none', borderRadius: 9, padding: '11px', fontSize: 13, fontWeight: 650, cursor: 'pointer' }}>
          {product ? 'Save changes' : 'Create product'}
        </button>
        <button onClick={onCancel}
          style={{ flex: 1, background: 'rgba(255,255,255,.06)', color: '#a7aecb',
            border: '1px solid var(--stroke)', borderRadius: 9, padding: '11px', fontSize: 13, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState<'products' | 'memberships' | 'fans'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [fans, setFans] = useState<any[]>([]);
  const [editProduct, setEditProduct] = useState<Product | null | 'new'>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [p, m, f] = await Promise.all([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/memberships').then(r => r.json()),
        fetch('/api/fans').then(r => r.json()),
      ]);
      setProducts(Array.isArray(p) ? p : []);
      setMemberships(Array.isArray(m) ? m : []);
      setFans(Array.isArray(f) ? f : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const saveProduct = async (data: any) => {
    const isNew = editProduct === 'new';
    const url = isNew ? '/api/products' : `/api/products/${(editProduct as Product).id}`;
    const method = isNew ? 'POST' : 'PUT';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    setEditProduct(null);
    fetchAll();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const navItem = (id: typeof tab, label: string) => (
    <button key={id} onClick={() => setTab(id)}
      style={{ background: tab === id ? 'linear-gradient(180deg,#9d90ff,#7c6cff)' : 'none',
        border: 'none', color: tab === id ? '#fff' : '#a7aecb', fontSize: 14, padding: '10px 12px',
        borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
        transition: 'all .15s ease' }}>
      {label}
    </button>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh',
      background: 'linear-gradient(160deg,#0a0f26,#05060f)', color: '#eef1fb', fontFamily: 'inherit' }}>

      {/* sidebar */}
      <div style={{ borderRight: '1px solid var(--stroke)', padding: '24px 18px',
        display: 'flex', flexDirection: 'column', gap: 32, background: 'var(--glass)',
        backdropFilter: 'blur(20px)' }}>
        <h1 style={{ fontSize: 18, fontWeight: 800 }}>lanrae<span style={{ color: '#9d90ff' }}>OS</span> Admin</h1>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {navItem('products', '📦 Products')}
          {navItem('memberships', '🪪 Memberships')}
          {navItem('fans', '🏆 Top Fans')}
        </nav>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ padding: '12px', background: 'rgba(53,214,199,.08)', border: '1px solid rgba(53,214,199,.2)',
            borderRadius: 10, fontSize: 12, color: '#35d6c7' }}>
            <b>Tip:</b> Changes go live instantly. Wire up Stripe keys in .env to accept real payments.
          </div>
          <Link href="/" style={{ color: '#9d90ff', textDecoration: 'none', fontSize: 13 }}>← Back to desktop</Link>
        </div>
      </div>

      {/* content */}
      <div style={{ padding: '32px 40px', overflow: 'auto' }}>
        {tab === 'products' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <h2 style={{ fontSize: 26, fontWeight: 700 }}>Products</h2>
              <button onClick={() => setEditProduct('new')}
                style={{ background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff', border: 'none',
                  padding: '10px 18px', borderRadius: 9, fontSize: 13, fontWeight: 650, cursor: 'pointer' }}>
                + New Product
              </button>
            </div>

            {editProduct && (
              <div style={{ marginBottom: 24 }}>
                <ProductForm product={editProduct === 'new' ? null : editProduct}
                  onSave={saveProduct} onCancel={() => setEditProduct(null)} />
              </div>
            )}

            {loading ? (
              <p style={{ color: '#7d84a6' }}>Loading…</p>
            ) : products.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed var(--stroke)',
                borderRadius: 12, color: '#7d84a6' }}>
                <p style={{ fontSize: 14, marginBottom: 12 }}>No products yet.</p>
                <button onClick={() => setEditProduct('new')}
                  style={{ background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff', border: 'none',
                    padding: '10px 18px', borderRadius: 9, fontSize: 13, fontWeight: 650, cursor: 'pointer' }}>
                  + Create your first product
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {products.map(p => (
                  <div key={p.id} style={{ background: 'var(--glass)', border: '1px solid var(--stroke)',
                    borderRadius: 12, padding: '14px 16px', display: 'grid',
                    gridTemplateColumns: '52px 1fr auto auto auto auto auto', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 10, display: 'grid', placeItems: 'center',
                      fontSize: 24, background: p.gradient, border: '1px solid var(--stroke-2)' }}>{p.icon}</div>
                    <div>
                      <div style={{ fontWeight: 650 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: '#7d84a6', marginTop: 2 }}>{p.description}</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {p.isFree ? 'Free' : `£${(p.price / 100).toFixed(2)}`}
                    </span>
                    {p.artifactUrl && <a href={p.artifactUrl} target="_blank" rel="noopener noreferrer" title="Artifact" style={{ fontSize: 16, opacity: .8 }}>📄</a>}
                    {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" title="GitHub" style={{ fontSize: 16, opacity: .8 }}>💻</a>}
                    {p.vercelUrl && <a href={p.vercelUrl} target="_blank" rel="noopener noreferrer" title="Live" style={{ fontSize: 16, opacity: .8 }}>▲</a>}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setEditProduct(p)}
                        style={{ background: 'rgba(124,108,255,.2)', color: '#9d90ff', border: 'none',
                          borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 650, cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => deleteProduct(p.id)}
                        style={{ background: 'rgba(255,95,87,.15)', color: '#ff7c78', border: 'none',
                          borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 650, cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'memberships' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <h2 style={{ fontSize: 26, fontWeight: 700 }}>Membership Tiers</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
              {memberships.map(m => (
                <div key={m.id} style={{ background: 'var(--glass)', border: '1px solid var(--stroke)',
                  borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700 }}>{m.name}</h3>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#9d90ff' }}>
                      {m.price === 0 ? 'Free' : `£${(m.price / 100).toFixed(2)}/mo`}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#a7aecb' }}>{m.description}</p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {m.features.map(f => (
                      <li key={f} style={{ fontSize: 13, display: 'flex', gap: 8, color: '#d7dcf1' }}>
                        <span style={{ color: '#3ddc97', fontWeight: 800 }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 20, fontSize: 12, color: '#7d84a6' }}>
              Membership editing via Stripe dashboard. Pricing is managed in the Stripe billing portal.
            </p>
          </>
        )}

        {tab === 'fans' && (
          <>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 28 }}>Top Supporters</h2>
            {fans.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed var(--stroke)',
                borderRadius: 12, color: '#7d84a6', fontSize: 14 }}>
                No supporters yet — leaderboard will appear here once users purchase memberships.
              </div>
            ) : fans.map(f => (
              <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '40px 44px 1fr auto',
                alignItems: 'center', gap: 14, padding: '12px 16px', marginBottom: 8,
                background: 'var(--glass)', border: '1px solid var(--stroke)', borderRadius: 10 }}>
                <span style={{ fontSize: 18, fontWeight: 800, textAlign: 'center' }}>
                  {f.rank === 1 ? '🥇' : f.rank === 2 ? '🥈' : f.rank === 3 ? '🥉' : `#${f.rank}`}
                </span>
                <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'grid',
                  placeItems: 'center', fontWeight: 700, color: '#0a0d1c', background: f.avatarColor }}>
                  {f.initials}
                </div>
                <div>
                  <div style={{ fontWeight: 650 }}>{f.displayName}</div>
                  <div style={{ fontSize: 11, color: '#7d84a6' }}>{f.user?.email}</div>
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
                  £{(f.totalSpent / 100).toFixed(2)}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
