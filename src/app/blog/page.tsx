'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  tags: string[];
  publishedAt: string | null;
  readTime: number | null;
  icon: string | null;
  gradient: string;
};

const CATEGORIES = ['all', 'tutorial', 'devlog', 'guide', 'video'];

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter(p => {
    const matchCat = filter === 'all' || p.category === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.tags.some(t => t.includes(q)) || p.excerpt?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: `radial-gradient(120% 90% at 12% -8%, #1a1060 0%, transparent 48%),
      radial-gradient(120% 100% at 92% 4%, #0e2a4d 0%, transparent 52%),
      linear-gradient(160deg, #05060f, #080a1a)`, color: '#eef1fb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>

      {/* nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--stroke-2)',
        background: 'rgba(5,6,15,.7)', backdropFilter: 'blur(20px)', padding: '0 24px',
        display: 'flex', alignItems: 'center', height: 56, gap: 20 }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: 17, textDecoration: 'none', color: '#eef1fb' }}>
          ◐ lanrae
        </Link>
        <span style={{ color: 'var(--stroke)', fontSize: 18 }}>/</span>
        <span style={{ fontWeight: 600, fontSize: 15, color: '#9d90ff' }}>blog</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: 13, color: '#a7aecb', textDecoration: 'none' }}>Home</Link>
          <Link href="/admin" style={{ fontSize: 13, color: '#7d84a6', textDecoration: 'none' }}>Admin</Link>
        </div>
      </nav>

      {/* hero */}
      <div style={{ padding: '64px 24px 40px', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '2px',
          color: '#9d90ff', fontWeight: 700, marginBottom: 12 }}>Tutorials & Posts</div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.15, marginBottom: 14 }}>
          Build things.<br />
          <span style={{ background: 'linear-gradient(90deg,#9d90ff,#35d6c7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Share what you learn.
          </span>
        </h1>
        <p style={{ fontSize: 16, color: '#a7aecb', maxWidth: '52ch', lineHeight: 1.6 }}>
          Tutorials, devlogs, and guides from building real things — networking, AI, dev tools, and more.
        </p>
      </div>

      {/* filters */}
      <div style={{ padding: '0 24px 32px', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              style={{ padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', border: 'none', transition: 'all .15s ease',
                background: filter === cat ? 'linear-gradient(180deg,#9d90ff,#7c6cff)' : 'rgba(255,255,255,.07)',
                color: filter === cat ? '#fff' : '#a7aecb' }}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
          <input
            placeholder="Search posts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginLeft: 'auto', background: 'rgba(255,255,255,.06)', border: '1px solid var(--stroke)',
              borderRadius: 20, padding: '7px 16px', fontSize: 13, color: '#eef1fb',
              fontFamily: 'inherit', outline: 'none', width: 200 }}
          />
        </div>
      </div>

      {/* posts grid */}
      <div style={{ padding: '0 24px 80px', maxWidth: 860, margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: 220, borderRadius: 16, background: 'rgba(255,255,255,.04)',
                border: '1px solid var(--stroke-2)', animation: 'pulse 1.5s ease infinite' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#7d84a6' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 15 }}>{search || filter !== 'all' ? 'No posts match your search.' : 'No posts published yet — check back soon.'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {filtered.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <article style={{ background: 'var(--glass)', border: '1px solid var(--stroke-2)',
                  borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                  transition: 'transform .18s ease, border-color .18s ease, box-shadow .18s ease', cursor: 'pointer' }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(-4px)';
                    el.style.borderColor = 'rgba(124,108,255,.45)';
                    el.style.boxShadow = '0 16px 40px rgba(124,108,255,.15)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = '';
                    el.style.borderColor = '';
                    el.style.boxShadow = '';
                  }}>

                  {/* card header */}
                  <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 40, background: post.gradient, position: 'relative' }}>
                    {post.icon || '📝'}
                    <span style={{ position: 'absolute', top: 10, left: 10, fontSize: 10,
                      fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase',
                      padding: '3px 8px', borderRadius: 20, background: 'rgba(0,0,0,.4)',
                      border: '1px solid rgba(255,255,255,.15)', color: '#dfe4f6' }}>
                      {post.category}
                    </span>
                  </div>

                  {/* card body */}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.35, margin: 0 }}>{post.title}</h2>
                    {post.excerpt && (
                      <p style={{ fontSize: 12.5, color: '#a7aecb', lineHeight: 1.5, margin: 0,
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.excerpt}
                      </p>
                    )}
                    {post.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 4 }}>
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 10,
                            background: 'rgba(124,108,255,.12)', border: '1px solid rgba(124,108,255,.2)',
                            color: '#9d90ff', fontWeight: 600 }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4,
                      fontSize: 11.5, color: '#7d84a6' }}>
                      {post.publishedAt && <span>{fmt(post.publishedAt)}</span>}
                      {post.readTime && <><span>·</span><span>{post.readTime} min read</span></>}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: .5 } 50% { opacity: 1 } }
        :root {
          --glass: rgba(18, 16, 48, 0.52);
          --glass-2: rgba(20, 18, 52, 0.62);
          --stroke: rgba(255, 255, 255, 0.14);
          --stroke-2: rgba(255, 255, 255, 0.08);
        }
      `}</style>
    </div>
  );
}
