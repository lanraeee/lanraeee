'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setError('Incorrect password.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: 'linear-gradient(160deg,#0a0f26,#05060f)',
      fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif',
    }}>
      <div style={{
        width: 360, padding: '40px 36px',
        background: 'rgba(255,255,255,.04)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,.08)', borderRadius: 20,
        display: 'flex', flexDirection: 'column', gap: 24,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔐</div>
          <h1 style={{ color: '#eef1fb', fontSize: 20, fontWeight: 800, margin: 0 }}>
            lanrae<span style={{ color: '#9d90ff' }}>OS</span> Admin
          </h1>
          <p style={{ color: '#7d84a6', fontSize: 13, marginTop: 6 }}>Enter your admin password to continue</p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            required
            style={{
              background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 10, padding: '12px 14px', fontSize: 15, color: '#eef1fb',
              fontFamily: 'inherit', outline: 'none', width: '100%',
              boxSizing: 'border-box',
            }}
          />
          {error && (
            <p style={{ color: '#ff7c78', fontSize: 13, margin: 0 }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? 'rgba(124,108,255,.4)' : 'linear-gradient(180deg,#9d90ff,#7c6cff)',
              color: '#fff', border: 'none', borderRadius: 10, padding: '13px',
              fontSize: 15, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
              fontFamily: 'inherit', transition: 'opacity .15s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
