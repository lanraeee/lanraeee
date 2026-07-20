'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  tags: string[];
  publishedAt: string | null;
  readTime: number | null;
  icon: string | null;
  gradient: string;
};

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${slug}`)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
      .then(setPost)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: `radial-gradient(120% 90% at 12% -8%, #1a1060 0%, transparent 48%),
      radial-gradient(120% 100% at 92% 4%, #0e2a4d 0%, transparent 52%),
      linear-gradient(160deg, #05060f, #080a1a)`, color: '#eef1fb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>

      {/* nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,.08)',
        background: 'rgba(5,6,15,.7)', backdropFilter: 'blur(20px)', padding: '0 24px',
        display: 'flex', alignItems: 'center', height: 56, gap: 16 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image src="/logo.png" alt="lanrae" width={28} height={28} style={{ borderRadius: 6 }} />
          <span style={{ fontWeight: 800, fontSize: 17, color: '#eef1fb' }}>lanrae</span>
        </Link>
        <span style={{ color: 'rgba(255,255,255,.2)', fontSize: 18 }}>/</span>
        <Link href="/blog" style={{ fontSize: 14, color: '#9d90ff', textDecoration: 'none', fontWeight: 600 }}>blog</Link>
        {post && <>
          <span style={{ color: 'rgba(255,255,255,.2)', fontSize: 18 }}>/</span>
          <span style={{ fontSize: 13, color: '#7d84a6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{post.title}</span>
        </>}
      </nav>

      {loading && (
        <div style={{ maxWidth: 740, margin: '80px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[80, 40, 100, 60, 100].map((w, i) => (
            <div key={i} style={{ height: 18, width: `${w}%`, borderRadius: 6,
              background: 'rgba(255,255,255,.06)', animation: 'pulse 1.5s ease infinite' }} />
          ))}
        </div>
      )}

      {notFound && (
        <div style={{ textAlign: 'center', padding: '120px 24px', color: '#7d84a6' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>404</div>
          <p style={{ fontSize: 16, marginBottom: 24 }}>Post not found.</p>
          <Link href="/blog" style={{ color: '#9d90ff', textDecoration: 'none', fontWeight: 600 }}>← Back to blog</Link>
        </div>
      )}

      {post && (
        <>
          {/* hero */}
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 64, background: post.gradient, position: 'relative' }}>
            {post.icon || '📝'}
            <div style={{ position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, transparent 40%, rgba(5,6,15,.9) 100%)' }} />
          </div>

          {/* article */}
          <article style={{ maxWidth: 740, margin: '0 auto', padding: '0 24px 100px' }}>

            {/* meta */}
            <div style={{ padding: '32px 0 24px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
                  padding: '3px 10px', borderRadius: 20, background: 'rgba(124,108,255,.15)',
                  border: '1px solid rgba(124,108,255,.3)', color: '#9d90ff' }}>
                  {post.category}
                </span>
                {post.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20,
                    background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                    color: '#7d84a6', fontWeight: 600 }}>
                    #{tag}
                  </span>
                ))}
              </div>
              <h1 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, lineHeight: 1.2,
                marginBottom: 12, letterSpacing: '-.3px' }}>
                {post.title}
              </h1>
              {post.excerpt && (
                <p style={{ fontSize: 16, color: '#a7aecb', lineHeight: 1.6, marginBottom: 16 }}>{post.excerpt}</p>
              )}
              <div style={{ display: 'flex', gap: 14, fontSize: 13, color: '#7d84a6' }}>
                {post.publishedAt && <span>{fmt(post.publishedAt)}</span>}
                {post.readTime && <span>· {post.readTime} min read</span>}
                <Link href="/blog" style={{ marginLeft: 'auto', color: '#9d90ff', textDecoration: 'none', fontSize: 13 }}>
                  ← All posts
                </Link>
              </div>
            </div>

            {/* markdown content */}
            <div className="prose-lanrae" style={{ paddingTop: 36 }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 40, marginBottom: 16, color: '#eef1fb' }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 36, marginBottom: 12, color: '#eef1fb', borderBottom: '1px solid rgba(255,255,255,.08)', paddingBottom: 8 }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 28, marginBottom: 10, color: '#dfe4f6' }}>{children}</h3>,
                  p: ({ children }) => <p style={{ fontSize: 15, lineHeight: 1.75, color: '#c8ceea', marginBottom: 16 }}>{children}</p>,
                  code: ({ children, className }) => {
                    const isBlock = !!className;
                    return isBlock
                      ? <code style={{ display: 'block', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '16px 18px', fontSize: 13, fontFamily: '"SF Mono", "Fira Code", monospace', color: '#a5f3d0', lineHeight: 1.65, overflowX: 'auto', whiteSpace: 'pre' }}>{children}</code>
                      : <code style={{ background: 'rgba(124,108,255,.15)', border: '1px solid rgba(124,108,255,.25)', borderRadius: 5, padding: '2px 7px', fontSize: 13, fontFamily: '"SF Mono", "Fira Code", monospace', color: '#b8b0ff' }}>{children}</code>;
                  },
                  pre: ({ children }) => <pre style={{ margin: '20px 0', borderRadius: 10, overflow: 'hidden' }}>{children}</pre>,
                  ul: ({ children }) => <ul style={{ paddingLeft: 20, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ paddingLeft: 20, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</ol>,
                  li: ({ children }) => <li style={{ fontSize: 15, lineHeight: 1.6, color: '#c8ceea' }}>{children}</li>,
                  blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid #7c6cff', paddingLeft: 16, margin: '20px 0', color: '#a7aecb', fontStyle: 'italic' }}>{children}</blockquote>,
                  table: ({ children }) => <div style={{ overflowX: 'auto', marginBottom: 20 }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>{children}</table></div>,
                  th: ({ children }) => <th style={{ padding: '10px 14px', background: 'rgba(124,108,255,.12)', border: '1px solid rgba(255,255,255,.1)', textAlign: 'left', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.5px', color: '#9d90ff' }}>{children}</th>,
                  td: ({ children }) => <td style={{ padding: '10px 14px', border: '1px solid rgba(255,255,255,.07)', color: '#c8ceea', fontSize: 14 }}>{children}</td>,
                  a: ({ children, href }) => <a href={href} style={{ color: '#9d90ff', textDecoration: 'underline', textUnderlineOffset: 3 }}>{children}</a>,
                  strong: ({ children }) => <strong style={{ fontWeight: 700, color: '#eef1fb' }}>{children}</strong>,
                  hr: () => <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,.1)', margin: '36px 0' }} />,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* footer nav */}
            <div style={{ marginTop: 60, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href="/blog" style={{ color: '#9d90ff', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                ← Back to blog
              </Link>
              <Link href="/" style={{ color: '#7d84a6', textDecoration: 'none', fontSize: 13 }}>
                lanrae.co.uk
              </Link>
            </div>
          </article>
        </>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: .4 } 50% { opacity: .8 } }
        :root {
          --glass: rgba(18, 16, 48, 0.52);
          --stroke: rgba(255, 255, 255, 0.14);
          --stroke-2: rgba(255, 255, 255, 0.08);
        }
      `}</style>
    </div>
  );
}
