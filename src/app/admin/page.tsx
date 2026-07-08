'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { VoicePlayer } from '@/components/VoicePlayer';

type Product = {
  id: string; name: string; description: string; icon: string | null;
  price: number; isFree: boolean; isNew: boolean; requiresMembership: string | null;
  artifactUrl: string | null; githubUrl: string | null; showGithub: boolean; vercelUrl: string | null;
  gradient: string; order: number;
};

type Membership = {
  id: string; tier: string; name: string; price: number; description: string; features: string[];
};

type ProjectRequest = {
  id: string; name: string; email: string; title: string; description: string;
  status: string; createdAt: string;
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
    showGithub: product?.showGithub ?? (product?.isFree || false),
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
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', paddingBottom: 6 }}>
            <input type="checkbox" checked={form.isFree} onChange={e => setForm(f => ({ ...f, isFree: e.target.checked, price: e.target.checked ? '0' : f.price, showGithub: e.target.checked ? true : f.showGithub }))} />
            <span style={{ fontSize: 13 }}>Free</span>
          </label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', paddingBottom: 6 }}>
            <input type="checkbox" checked={form.isNew} onChange={e => setForm(f => ({ ...f, isNew: e.target.checked }))} />
            <span style={{ fontSize: 13 }}>Mark as New</span>
          </label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', paddingBottom: 6 }}>
            <input type="checkbox" checked={form.showGithub} onChange={e => setForm(f => ({ ...f, showGithub: e.target.checked }))} />
            <span style={{ fontSize: 13 }}>Show GitHub link publicly</span>
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

const CONTENT_KEYS = [
  { section: 'Window Titles', fields: [
    { key: 'win.store.title',   label: 'Store — title' },
    { key: 'win.store.subtitle', label: 'Store — subtitle' },
    { key: 'win.fans.title',    label: 'Fans — title' },
    { key: 'win.fans.subtitle', label: 'Fans — subtitle' },
    { key: 'win.members.title', label: 'Members — title' },
    { key: 'win.members.subtitle', label: 'Members — subtitle' },
    { key: 'win.request.title', label: 'Request — title' },
    { key: 'win.request.subtitle', label: 'Request — subtitle' },
    { key: 'win.donate.title',  label: 'Support — title' },
    { key: 'win.donate.subtitle', label: 'Support — subtitle' },
    { key: 'win.about.title',   label: 'About — title' },
    { key: 'win.about.subtitle', label: 'About — subtitle' },
  ]},
  { section: 'Apps', fields: [
    { key: 'app.store.icon', label: 'Store icon', type: 'emoji' },   { key: 'app.store.label', label: 'Store label' },
    { key: 'app.members.icon', label: 'Members icon', type: 'emoji' }, { key: 'app.members.label', label: 'Members label' },
    { key: 'app.fans.icon', label: 'Fans icon', type: 'emoji' },     { key: 'app.fans.label', label: 'Fans label' },
    { key: 'app.request.icon', label: 'Request icon', type: 'emoji' }, { key: 'app.request.label', label: 'Request label' },
    { key: 'app.donate.icon', label: 'Support icon', type: 'emoji' }, { key: 'app.donate.label', label: 'Support label' },
    { key: 'app.about.icon', label: 'About icon', type: 'emoji' },   { key: 'app.about.label', label: 'About label' },
  ]},
  { section: 'Store', fields: [
    { key: 'store.label', label: 'Section tag' },
    { key: 'store.heading', label: 'Heading' },
    { key: 'store.subheading', label: 'Subheading', type: 'textarea' },
  ]},
  { section: 'Top Fans', fields: [
    { key: 'fans.label', label: 'Section tag' },
    { key: 'fans.heading', label: 'Heading' },
    { key: 'fans.subheading', label: 'Subheading' },
  ]},
  { section: 'Members', fields: [
    { key: 'members.label', label: 'Section tag' },
    { key: 'members.heading', label: 'Heading' },
    { key: 'members.subheading', label: 'Subheading', type: 'textarea' },
  ]},
  { section: 'Request', fields: [
    { key: 'request.label', label: 'Section tag' },
    { key: 'request.heading', label: 'Heading' },
    { key: 'request.subheading', label: 'Subheading', type: 'textarea' },
  ]},
  { section: 'Support', fields: [
    { key: 'donate.label', label: 'Section tag' },
    { key: 'donate.heading', label: 'Heading' },
    { key: 'donate.subheading', label: 'Subheading' },
  ]},
  { section: 'About', fields: [
    { key: 'about.heading', label: 'Heading' },
    { key: 'about.body', label: 'Body text', type: 'textarea' },
  ]},
];

const CONTENT_DEFAULTS: Record<string, string> = {
  'app.store.icon': '🛍️',   'app.store.label': 'Store',
  'app.members.icon': '🪪', 'app.members.label': 'Members',
  'app.fans.icon': '🏆',    'app.fans.label': 'Fans',
  'app.request.icon': '💡', 'app.request.label': 'Request',
  'app.donate.icon': '💛',  'app.donate.label': 'Support',
  'app.about.icon': 'ℹ️',   'app.about.label': 'About',
  'store.label': 'Featured · Built with AI',
  'store.heading': 'Ship-ready AI products',
  'store.subheading': 'Own them outright, or unlock the full shelf with an Insider membership.',
  'fans.label': 'Hall of fame',
  'fans.heading': 'The people funding the future',
  'fans.subheading': 'Ranked by total support. Resets monthly.',
  'members.label': 'Join the studio',
  'members.heading': 'Back the build. Get the perks.',
  'members.subheading': 'Members fund what gets built next and top supporters get their name on the wall.',
  'request.label': 'Build with me',
  'request.heading': 'Request a project',
  'request.subheading': 'Got an idea? Tell me what you want built — top-voted requests shape the roadmap.',
  'donate.label': 'One-off tip',
  'donate.heading': 'Buy me a GPU hour ☕',
  'donate.subheading': 'Every tip goes straight into building the next product.',
  'about.heading': 'lanrae · AI Product Engineer',
  'about.body': 'I design, build, and ship AI-powered products end to end — then launch them here, on a desktop you can actually drive. lanrae.co.uk is the studio, the storefront, and the changelog, all in one.',
  'win.store.title': 'Product Store',    'win.store.subtitle': '— AI, built by lanrae',
  'win.fans.title': 'Top 10 Fans',       'win.fans.subtitle': '— this month',
  'win.members.title': 'Membership',     'win.members.subtitle': '',
  'win.request.title': 'Request a Project', 'win.request.subtitle': '— shape the roadmap',
  'win.donate.title': 'Support the work','win.donate.subtitle': '',
  'win.about.title': 'About',            'win.about.subtitle': '',
};

export default function AdminPage() {
  const [tab, setTab] = useState<'products' | 'memberships' | 'fans' | 'requests' | 'content' | 'analytics' | 'messages' | 'email' | 'security'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [fans, setFans] = useState<any[]>([]);
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});
  const [contentEdits, setContentEdits] = useState<Record<string, string>>({});
  const [contentSaving, setContentSaving] = useState(false);
  const [contentSaved, setContentSaved] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null | 'new'>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<{ id: string; userId: string; userEmail: string; content: string; fromAdmin: boolean; createdAt: string }[]>([]);
  const [chatReply, setChatReply] = useState<Record<string, string>>({});
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [voiceLoading, setVoiceLoading] = useState<Record<string, boolean>>({});
  const [voicePreview, setVoicePreview] = useState<Record<string, string>>({});
  const [newMsgModal, setNewMsgModal] = useState(false);
  const [newMsgEmail, setNewMsgEmail] = useState('');
  const [newMsgContent, setNewMsgContent] = useState('');
  const [newMsgError, setNewMsgError] = useState('');
  const [newMsgLoading, setNewMsgLoading] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState<{ id: string; name: string; subject: string; html: string; enabled: boolean }[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [templateEdits, setTemplateEdits] = useState<{ subject: string; html: string; enabled: boolean }>({ subject: '', html: '', enabled: true });
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [grantEmail, setGrantEmail] = useState('');
  const [grantTier, setGrantTier] = useState('supporter');
  const [grantStatus, setGrantStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [adminEmailSetting, setAdminEmailSetting] = useState('');
  const [adminEmailSaving, setAdminEmailSaving] = useState(false);
  const [adminEmailSaved, setAdminEmailSaved] = useState(false);

  type SecurityTool = {
    id: string; name: string; icon: string; category: string; language: string;
    stars: string; description: string; githubUrl: string; demoUrl: string | null;
    gradient: string; order: number; enabled: boolean;
  };
  const [securityTools, setSecurityTools] = useState<SecurityTool[]>([]);
  const [editingTool, setEditingTool] = useState<SecurityTool | 'new' | null>(null);
  const [toolSaving, setToolSaving] = useState(false);
  const [seedingTools, setSeedingTools] = useState(false);
  const blankTool = (): Omit<SecurityTool, 'id'> => ({
    name: '', icon: '🛡️', category: '', language: '', stars: '',
    description: '', githubUrl: '', demoUrl: null, gradient: 'linear-gradient(135deg,#1e3a8a,#1a3270)',
    order: securityTools.length, enabled: true,
  });
  const [toolForm, setToolForm] = useState<Omit<SecurityTool, 'id'>>(blankTool());

  const [seedingFans, setSeedingFans] = useState(false);
  const [showAddFan, setShowAddFan] = useState(false);
  const [fanForm, setFanForm] = useState({ email: '', displayName: '', initials: '', avatarColor: '#9d90ff', membershipTier: 'insider', totalSpent: '' });
  const [fanFormSaving, setFanFormSaving] = useState(false);

  const fetchAll = async () => {
    try {
      const [p, m, f, r] = await Promise.all([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/memberships').then(r => r.json()),
        fetch('/api/fans').then(r => r.json()),
        fetch('/api/project-requests').then(r => r.json()),
      ]);
      setProducts(Array.isArray(p) ? p : []);
      setMemberships(Array.isArray(m) ? m : []);
      setFans(Array.isArray(f) ? f : []);
      setRequests(Array.isArray(r) ? r : []);
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

  const updateRequestStatus = async (id: string, status: string) => {
    await fetch(`/api/project-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchAll();
  };

  const deleteRequest = async (id: string) => {
    if (!confirm('Delete this request?')) return;
    await fetch(`/api/project-requests/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const fetchContent = async () => {
    const data = await fetch('/api/content').then(r => r.json()).catch(() => ({}));
    setSiteContent(data);
    setContentEdits({});
  };

  const saveContent = async () => {
    setContentSaving(true);
    await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contentEdits),
    });
    await fetchContent();
    setContentSaving(false);
    setContentSaved(true);
    setTimeout(() => setContentSaved(false), 2500);
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    const data = await fetch('/api/analytics').then(r => r.json()).catch(() => null);
    setAnalytics(data);
    setAnalyticsLoading(false);
  };

  const fetchMessages = async () => {
    const data = await fetch('/api/member/chat/admin').then(r => r.json()).catch(() => []);
    setMessages(Array.isArray(data) ? data : []);
  };

  const fetchEmailTemplates = async () => {
    const data = await fetch('/api/admin/email-templates').then(r => r.json()).catch(() => []);
    setEmailTemplates(Array.isArray(data) ? data : []);
    const setting = await fetch('/api/content').then(r => r.json()).catch(() => ({}));
    setAdminEmailSetting(setting['email.admin'] || '');
  };

  const saveAdminEmail = async () => {
    setAdminEmailSaving(true);
    await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 'email.admin': adminEmailSetting }),
    });
    setAdminEmailSaving(false);
    setAdminEmailSaved(true);
    setTimeout(() => setAdminEmailSaved(false), 2000);
  };

  const saveEmailTemplate = async () => {
    if (!editingTemplate) return;
    setTemplateSaving(true);
    await fetch('/api/admin/email-templates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingTemplate, ...templateEdits }),
    });
    await fetchEmailTemplates();
    setTemplateSaving(false);
    setTemplateSaved(true);
    setTimeout(() => setTemplateSaved(false), 2000);
  };

  const sendTestEmail = async () => {
    if (!editingTemplate) return;
    setTestSending(true);
    await fetch('/api/admin/email-templates/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingTemplate }),
    });
    setTestSending(false);
  };

  const grantMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    setGrantStatus('sending');
    try {
      const res = await fetch('/api/admin/grant-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: grantEmail, tier: grantTier }),
      });
      if (res.ok) { setGrantStatus('done'); setGrantEmail(''); }
      else setGrantStatus('error');
    } catch { setGrantStatus('error'); }
    setTimeout(() => setGrantStatus('idle'), 3000);
  };

  useEffect(() => {
    if (tab === 'content') fetchContent();
    if (tab === 'analytics') fetchAnalytics();
    if (tab === 'email') fetchEmailTemplates();
    if (tab === 'security') fetchSecurityTools();
    if (tab === 'messages') {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const seedFans = async () => {
    setSeedingFans(true);
    await fetch('/api/fans/seed', { method: 'POST' });
    await fetchAll();
    setSeedingFans(false);
  };

  const deleteFan = async (id: string) => {
    if (!confirm('Remove this fan from the leaderboard?')) return;
    await fetch('/api/fans', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    await fetchAll();
  };

  const reorderFan = async (id: string, direction: 'up' | 'down') => {
    await fetch('/api/fans', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, direction }) });
    await fetchAll();
  };

  const saveFan = async () => {
    if (!fanForm.email || !fanForm.displayName) return;
    setFanFormSaving(true);
    await fetch('/api/fans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...fanForm, totalSpent: parseFloat(fanForm.totalSpent) || 0 }),
    });
    setFanForm({ email: '', displayName: '', initials: '', avatarColor: '#9d90ff', membershipTier: 'insider', totalSpent: '' });
    setShowAddFan(false);
    setFanFormSaving(false);
    await fetchAll();
  };

  const fetchSecurityTools = async () => {
    const data = await fetch('/api/security-tools').then(r => r.json()).catch(() => []);
    setSecurityTools(Array.isArray(data) ? data : []);
  };

  const saveTool = async () => {
    setToolSaving(true);
    if (editingTool === 'new') {
      await fetch('/api/security-tools', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolForm),
      });
    } else if (editingTool) {
      await fetch(`/api/security-tools/${editingTool.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolForm),
      });
    }
    setEditingTool(null);
    await fetchSecurityTools();
    setToolSaving(false);
  };

  const deleteTool = async (id: string) => {
    if (!confirm('Delete this security tool?')) return;
    await fetch(`/api/security-tools/${id}`, { method: 'DELETE' });
    fetchSecurityTools();
  };

  const seedTools = async () => {
    setSeedingTools(true);
    await fetch('/api/security-tools/seed', { method: 'POST' });
    await fetchSecurityTools();
    setSeedingTools(false);
  };

  const navItem = (id: typeof tab, label: string, badge?: number) => (
    <button key={id} onClick={() => setTab(id)}
      style={{ background: tab === id ? 'linear-gradient(180deg,#9d90ff,#7c6cff)' : 'none',
        border: 'none', color: tab === id ? '#fff' : '#a7aecb', fontSize: 14, padding: '10px 12px',
        borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
        transition: 'all .15s ease', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <span>{label}</span>
      {!!badge && <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800,
        borderRadius: 20, padding: '1px 7px', lineHeight: '16px', minWidth: 18, textAlign: 'center' }}>
        {badge > 99 ? '99+' : badge}
      </span>}
    </button>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh',
      background: 'linear-gradient(160deg,#0a0f26,#05060f)', color: '#eef1fb', fontFamily: 'inherit' }}>

      {/* sidebar */}
      <div style={{ borderRight: '1px solid var(--stroke)', padding: '24px 18px',
        display: 'flex', flexDirection: 'column', gap: 32, background: 'var(--glass)',
        backdropFilter: 'blur(20px)' }}>
        <h1 style={{ fontSize: 18, fontWeight: 800 }}>lanrae<span style={{ color: '#9d90ff' }}>Ai</span> Admin</h1>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {navItem('products', '📦 Products')}
          {navItem('memberships', '🪪 Memberships')}
          {navItem('fans', '🏆 Top Fans')}
          {navItem('requests', '💡 Requests', requests.filter(r => r.status === 'pending').length || undefined)}
          {navItem('content', '✏️ Content')}
          {navItem('analytics', '📊 Analytics')}
          {navItem('messages', '💬 Messages')}
          {navItem('email', '📧 Email')}
          {navItem('security', '🛡️ Security Tools')}
        </nav>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ padding: '12px', background: 'rgba(53,214,199,.08)', border: '1px solid rgba(53,214,199,.2)',
            borderRadius: 10, fontSize: 12, color: '#35d6c7' }}>
            <b>Tip:</b> Changes go live instantly. Wire up Stripe keys in .env to accept real payments.
          </div>
          <Link href="/" style={{ color: '#9d90ff', textDecoration: 'none', fontSize: 13 }}>← Back to desktop</Link>
          <button
            onClick={async () => {
              await fetch('/api/admin/auth', { method: 'DELETE' });
              window.location.href = '/admin/login';
            }}
            style={{ background: 'rgba(255,95,87,.12)', color: '#ff7c78', border: '1px solid rgba(255,95,87,.2)',
              borderRadius: 8, padding: '8px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            Sign out
          </button>
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

            {/* Grant membership */}
            <div style={{ background: 'rgba(157,144,255,.08)', border: '1px solid rgba(157,144,255,.3)', borderRadius: 14, padding: 20, marginBottom: 28 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: '#9d90ff' }}>🎁 Grant Membership</h3>
              <form onSubmit={grantMembership} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, color: '#a7aecb', fontWeight: 600 }}>Email address</label>
                  <input value={grantEmail} onChange={e => setGrantEmail(e.target.value)} placeholder="member@email.com" required type="email"
                    style={{ background: 'rgba(255,255,255,.05)', border: '1px solid var(--stroke)', borderRadius: 9, padding: '10px 13px', fontSize: 13, color: '#eef1fb', fontFamily: 'inherit', outline: 'none' }} />
                </div>
                <div style={{ flex: '0 1 160px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, color: '#a7aecb', fontWeight: 600 }}>Tier</label>
                  <select value={grantTier} onChange={e => setGrantTier(e.target.value)}
                    style={{ background: 'rgba(255,255,255,.05)', border: '1px solid var(--stroke)', borderRadius: 9, padding: '10px 13px', fontSize: 13, color: '#eef1fb', fontFamily: 'inherit', outline: 'none' }}>
                    <option value="explorer">Explorer (Free)</option>
                    <option value="supporter">Supporter</option>
                    <option value="insider">Insider</option>
                  </select>
                </div>
                <button type="submit" disabled={grantStatus === 'sending'}
                  style={{ background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 20px', fontSize: 13, fontWeight: 650, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                  {grantStatus === 'sending' ? 'Granting…' : grantStatus === 'done' ? '✓ Granted!' : grantStatus === 'error' ? 'Error' : 'Grant & Send Welcome Email'}
                </button>
              </form>
              <p style={{ fontSize: 12, color: '#7d84a6', marginTop: 10 }}>Creates the member account, records the transaction, and emails a welcome + set-password link.</p>
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

        {tab === 'fans' && (() => {
          const ff: React.CSSProperties = { background: 'rgba(255,255,255,.04)', border: '1px solid var(--stroke)', borderRadius: 9, padding: '10px 12px', fontSize: 13, color: '#eef1fb', fontFamily: 'inherit', width: '100%' };
          const COLORS = ['#9d90ff','#7c6cff','#f5c451','#35d6c7','#3ddc97','#ff6ba8','#e0895a','#ff5757','#52b7ff','#1f6feb'];
          return (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ fontSize: 26, fontWeight: 700 }}>Top Supporters</h2>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={seedFans} disabled={seedingFans}
                    style={{ background: 'rgba(53,214,199,.15)', color: '#35d6c7', border: '1px solid rgba(53,214,199,.3)', padding: '10px 16px', borderRadius: 9, fontSize: 13, fontWeight: 650, cursor: 'pointer' }}>
                    {seedingFans ? 'Seeding…' : '🌱 Seed'}
                  </button>
                  <button onClick={() => setShowAddFan(v => !v)}
                    style={{ background: 'rgba(157,144,255,.15)', color: '#9d90ff', border: '1px solid rgba(157,144,255,.3)', padding: '10px 16px', borderRadius: 9, fontSize: 13, fontWeight: 650, cursor: 'pointer' }}>
                    {showAddFan ? 'Cancel' : '+ Add Fan'}
                  </button>
                </div>
              </div>

              {showAddFan && (
                <div style={{ background: 'var(--glass)', border: '1px solid var(--stroke)', borderRadius: 14, padding: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Add / Update Fan</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>Email *</label>
                      <input style={ff} value={fanForm.email} onChange={e => setFanForm(f => ({ ...f, email: e.target.value }))} placeholder="fan@example.com" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>Display Name *</label>
                      <input style={ff} value={fanForm.displayName} onChange={e => setFanForm(f => ({ ...f, displayName: e.target.value, initials: e.target.value.split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase() }))} placeholder="Jane Doe" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>Initials</label>
                      <input style={ff} value={fanForm.initials} onChange={e => setFanForm(f => ({ ...f, initials: e.target.value.slice(0,2).toUpperCase() }))} placeholder="JD" maxLength={2} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>Tier</label>
                      <select style={ff} value={fanForm.membershipTier} onChange={e => setFanForm(f => ({ ...f, membershipTier: e.target.value }))}>
                        <option value="insider">Insider</option>
                        <option value="supporter">Supporter</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>Total Spent (£)</label>
                      <input style={ff} type="number" value={fanForm.totalSpent} onChange={e => setFanForm(f => ({ ...f, totalSpent: e.target.value }))} placeholder="100.00" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>Avatar Colour</label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {COLORS.map(c => (
                          <button key={c} onClick={() => setFanForm(f => ({ ...f, avatarColor: c }))}
                            style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: fanForm.avatarColor === c ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer', flexShrink: 0 }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={saveFan} disabled={fanFormSaving || !fanForm.email || !fanForm.displayName}
                    style={{ alignSelf: 'flex-start', background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: fanFormSaving ? .6 : 1 }}>
                    {fanFormSaving ? 'Saving…' : 'Save Fan'}
                  </button>
                </div>
              )}

              {fans.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed var(--stroke)', borderRadius: 12, color: '#7d84a6', fontSize: 14 }}>
                  No supporters yet. Add one manually or click Seed.
                </div>
              ) : fans.map((f, idx) => (
                <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '40px 44px 1fr auto auto auto',
                  alignItems: 'center', gap: 14, padding: '12px 16px', marginBottom: 8,
                  background: 'var(--glass)', border: '1px solid var(--stroke)', borderRadius: 10 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, textAlign: 'center' }}>
                    {f.rank === 1 ? '🥇' : f.rank === 2 ? '🥈' : f.rank === 3 ? '🥉' : `#${f.rank}`}
                  </span>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 700, color: '#0a0d1c', background: f.avatarColor }}>
                    {f.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 650 }}>{f.displayName}
                      <span style={{ marginLeft: 8, fontSize: 11, color: '#9d90ff', background: 'rgba(157,144,255,.12)', borderRadius: 5, padding: '2px 7px', fontWeight: 500 }}>{f.membershipTier}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#7d84a6' }}>{f.user?.email}</div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>£{(f.totalSpent / 100).toFixed(2)}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <button onClick={() => reorderFan(f.id, 'up')} disabled={idx === 0}
                      style={{ background: 'rgba(255,255,255,.06)', border: '1px solid var(--stroke)', borderRadius: 5, width: 26, height: 22, fontSize: 10, cursor: idx === 0 ? 'default' : 'pointer', color: '#a7aecb', opacity: idx === 0 ? .3 : 1 }}>▲</button>
                    <button onClick={() => reorderFan(f.id, 'down')} disabled={idx === fans.length - 1}
                      style={{ background: 'rgba(255,255,255,.06)', border: '1px solid var(--stroke)', borderRadius: 5, width: 26, height: 22, fontSize: 10, cursor: idx === fans.length - 1 ? 'default' : 'pointer', color: '#a7aecb', opacity: idx === fans.length - 1 ? .3 : 1 }}>▼</button>
                  </div>
                  <button onClick={() => deleteFan(f.id)}
                    style={{ background: 'rgba(255,95,87,.15)', color: '#ff7c78', border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 650, cursor: 'pointer' }}>
                    Remove
                  </button>
                </div>
              ))}
            </>
          );
        })()}

        {tab === 'requests' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <h2 style={{ fontSize: 26, fontWeight: 700 }}>Project Requests</h2>
              <span style={{ fontSize: 13, color: '#7d84a6' }}>{requests.length} total</span>
            </div>
            {loading ? (
              <p style={{ color: '#7d84a6' }}>Loading…</p>
            ) : requests.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed var(--stroke)',
                borderRadius: 12, color: '#7d84a6', fontSize: 14 }}>
                No requests yet — they'll appear here once members submit ideas.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {requests.map(r => {
                  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
                    pending:    { bg: 'rgba(245,196,81,.1)',  text: '#f5c451', border: 'rgba(245,196,81,.3)' },
                    'in-review':{ bg: 'rgba(124,108,255,.1)', text: '#9d90ff', border: 'rgba(124,108,255,.3)' },
                    building:   { bg: 'rgba(53,214,199,.1)',  text: '#35d6c7', border: 'rgba(53,214,199,.3)' },
                    done:       { bg: 'rgba(61,220,151,.1)',  text: '#3ddc97', border: 'rgba(61,220,151,.3)' },
                    declined:   { bg: 'rgba(255,95,87,.1)',   text: '#ff7c78', border: 'rgba(255,95,87,.3)' },
                  };
                  const sc = statusColors[r.status] ?? statusColors['pending'];
                  return (
                    <div key={r.id} style={{ background: 'var(--glass)', border: '1px solid var(--stroke)',
                      borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <span style={{ fontSize: 15, fontWeight: 700 }}>💡 {r.title}</span>
                            <span style={{ fontSize: 11, fontWeight: 650, padding: '3px 9px', borderRadius: 20,
                              background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                              textTransform: 'capitalize' }}>{r.status}</span>
                          </div>
                          <p style={{ fontSize: 13, color: '#a7aecb', lineHeight: 1.5, margin: 0 }}>{r.description}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        borderTop: '1px solid var(--stroke-2)', paddingTop: 10 }}>
                        <div style={{ fontSize: 12, color: '#7d84a6' }}>
                          <b style={{ color: '#a7aecb' }}>{r.name}</b> · {r.email} ·{' '}
                          {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <select value={r.status}
                            onChange={e => updateRequestStatus(r.id, e.target.value)}
                            style={{ background: 'rgba(255,255,255,.06)', border: '1px solid var(--stroke)',
                              borderRadius: 7, padding: '5px 8px', fontSize: 12, color: '#eef1fb',
                              cursor: 'pointer', fontFamily: 'inherit' }}>
                            <option value="pending">Pending</option>
                            <option value="in-review">In Review</option>
                            <option value="building">Building</option>
                            <option value="done">Done</option>
                            <option value="declined">Declined</option>
                          </select>
                          <button onClick={() => deleteRequest(r.id)}
                            style={{ background: 'rgba(255,95,87,.15)', color: '#ff7c78', border: 'none',
                              borderRadius: 7, padding: '5px 11px', fontSize: 12, fontWeight: 650, cursor: 'pointer' }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === 'content' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <h2 style={{ fontSize: 26, fontWeight: 700 }}>Content</h2>
              <button onClick={saveContent} disabled={contentSaving || Object.keys(contentEdits).length === 0}
                style={{ background: contentSaved ? 'linear-gradient(180deg,#3ddc97,#16a06a)' : 'linear-gradient(180deg,#9d90ff,#7c6cff)',
                  color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 9,
                  fontSize: 13, fontWeight: 650, cursor: 'pointer',
                  opacity: Object.keys(contentEdits).length === 0 ? .4 : 1 }}>
                {contentSaved ? '✓ Saved' : contentSaving ? 'Saving…' : `Save ${Object.keys(contentEdits).length > 0 ? `(${Object.keys(contentEdits).length} edits)` : 'changes'}`}
              </button>
            </div>
            {/* Site Settings */}
            {(() => {
              const fieldStyle: React.CSSProperties = {
                background: 'rgba(255,255,255,.04)', border: '1px solid var(--stroke)',
                borderRadius: 8, padding: '9px 11px', fontSize: 13, color: '#eef1fb',
                fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', outline: 'none',
              };
              const siteFields = [
                { key: 'site.name', label: 'Brand name', placeholder: 'lanraeAi' },
                { key: 'site.logoUrl', label: 'Logo URL (leave blank to use default)', placeholder: 'https://...' },
                { key: 'site.fromName', label: 'Email from name', placeholder: 'lanraeAi' },
                { key: 'seo.title', label: 'SEO page title', placeholder: 'lanraeAi — AI Product Development' },
                { key: 'seo.description', label: 'SEO meta description', placeholder: 'Browse and buy AI-powered products built by lanrae.' },
                { key: 'seo.keywords', label: 'SEO keywords (comma-separated)', placeholder: 'AI, products, studio, lanrae' },
                { key: 'seo.ogImage', label: 'OG / social share image URL', placeholder: 'https://lanrae.co.uk/logo.png' },
              ];
              return (
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#9d90ff', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--stroke-2)' }}>Site Settings & SEO</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
                    {siteFields.map(f => {
                      const current = contentEdits[f.key] ?? siteContent[f.key] ?? '';
                      const isDirty = f.key in contentEdits;
                      return (
                        <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          <label style={{ fontSize: 11, color: isDirty ? '#9d90ff' : '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px', display: 'flex', gap: 6, alignItems: 'center' }}>
                            {f.label}
                            {isDirty && <span style={{ fontSize: 10, background: 'rgba(124,108,255,.2)', color: '#9d90ff', padding: '1px 6px', borderRadius: 4 }}>edited</span>}
                          </label>
                          <input value={current} placeholder={f.placeholder}
                            onChange={e => setContentEdits(prev => ({ ...prev, [f.key]: e.target.value }))}
                            style={fieldStyle} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {CONTENT_KEYS.map(group => {
              const fieldStyle: React.CSSProperties = {
                background: 'rgba(255,255,255,.04)', border: '1px solid var(--stroke)',
                borderRadius: 8, padding: '9px 11px', fontSize: 13, color: '#eef1fb',
                fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', outline: 'none',
              };
              return (
                <div key={group.section} style={{ marginBottom: 28 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px',
                    color: '#9d90ff', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--stroke-2)' }}>{group.section}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
                    {group.fields.map((field: any) => {
                      const current = contentEdits[field.key] ?? siteContent[field.key] ?? CONTENT_DEFAULTS[field.key] ?? '';
                      const isDirty = field.key in contentEdits;
                      return (
                        <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          <label style={{ fontSize: 11, color: isDirty ? '#9d90ff' : '#a7aecb',
                            textTransform: 'uppercase', letterSpacing: '.5px', display: 'flex', gap: 6, alignItems: 'center' }}>
                            {field.label}
                            {isDirty && <span style={{ fontSize: 10, background: 'rgba(124,108,255,.2)', color: '#9d90ff',
                              padding: '1px 6px', borderRadius: 4 }}>edited</span>}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea rows={2} value={current}
                              onChange={e => setContentEdits(prev => ({ ...prev, [field.key]: e.target.value }))}
                              style={{ ...fieldStyle, resize: 'vertical' as const }} />
                          ) : (
                            <input value={current}
                              onChange={e => setContentEdits(prev => ({ ...prev, [field.key]: e.target.value }))}
                              style={{ ...fieldStyle, fontSize: field.type === 'emoji' ? 20 : 13 }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {tab === 'analytics' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <h2 style={{ fontSize: 26, fontWeight: 700 }}>Analytics</h2>
              <button onClick={fetchAnalytics}
                style={{ background: 'rgba(255,255,255,.08)', color: '#cdd3ef', border: '1px solid var(--stroke)',
                  padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                ↻ Refresh
              </button>
            </div>
            {analyticsLoading ? (
              <p style={{ color: '#7d84a6' }}>Loading…</p>
            ) : !analytics ? (
              <p style={{ color: '#7d84a6' }}>No data yet — visitors appear here once DATABASE_URL is configured.</p>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 16, marginBottom: 32 }}>
                  {[
                    { label: 'Total views', value: analytics.total, color: '#9d90ff' },
                    { label: 'Today', value: analytics.today, color: '#3ddc97' },
                    { label: 'This week', value: analytics.thisWeek, color: '#35d6c7' },
                    { label: 'Live (5 min)', value: analytics.newAlerts, color: analytics.newAlerts > 0 ? '#f5c451' : '#7d84a6', alert: analytics.newAlerts > 0 },
                  ].map((s: any) => (
                    <div key={s.label} style={{ background: 'var(--glass)', border: `1px solid ${s.alert ? 'rgba(245,196,81,.35)' : 'var(--stroke)'}`,
                      borderRadius: 14, padding: '20px 18px',
                      boxShadow: s.alert ? '0 0 0 1px rgba(245,196,81,.15),0 8px 24px rgba(245,196,81,.08)' : undefined }}>
                      <div style={{ fontSize: 32, fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums' }}>
                        {s.alert && '🔔 '}{s.value}
                      </div>
                      <div style={{ fontSize: 12, color: '#7d84a6', marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {analytics.topCountries?.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px',
                      color: '#a7aecb', marginBottom: 12 }}>Top Countries</h3>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {analytics.topCountries.map((ct: any) => {
                        const flag = ct.country?.length === 2
                          ? ct.country.toUpperCase().replace(/./g, (ch: string) => String.fromCodePoint(ch.charCodeAt(0) + 127397))
                          : '🌍';
                        return (
                          <div key={ct.country} style={{ background: 'var(--glass-2)', border: '1px solid var(--stroke-2)',
                            borderRadius: 10, padding: '8px 14px', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 18 }}>{flag}</span>
                            <span style={{ fontWeight: 600 }}>{ct.country}</span>
                            <span style={{ color: '#7d84a6' }}>{ct.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px',
                  color: '#a7aecb', marginBottom: 12 }}>Recent Visitors</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(analytics.recent ?? []).slice(0, 50).map((v: any) => {
                    const flag = v.country?.length === 2
                      ? v.country.toUpperCase().replace(/./g, (ch: string) => String.fromCodePoint(ch.charCodeAt(0) + 127397))
                      : '🌍';
                    const age = Math.floor((Date.now() - new Date(v.createdAt).getTime()) / 60000);
                    return (
                      <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '26px 1fr auto auto',
                        alignItems: 'center', gap: 12, padding: '10px 14px',
                        background: age < 5 ? 'rgba(245,196,81,.05)' : 'var(--glass)',
                        border: `1px solid ${age < 5 ? 'rgba(245,196,81,.2)' : 'var(--stroke)'}`,
                        borderRadius: 10, fontSize: 13 }}>
                        <span style={{ fontSize: 18 }}>{flag}</span>
                        <div>
                          <span style={{ fontWeight: 600 }}>{v.city ? `${v.city}, ` : ''}{v.country || 'Unknown'}</span>
                          <span style={{ color: '#7d84a6', marginLeft: 8 }}>{v.browser} · {v.device}</span>
                        </div>
                        {age < 5 && <span style={{ fontSize: 10, background: 'rgba(245,196,81,.2)', color: '#f5c451',
                          padding: '2px 7px', borderRadius: 20, fontWeight: 650, whiteSpace: 'nowrap' }}>LIVE</span>}
                        <span style={{ color: '#7d84a6', fontSize: 12, whiteSpace: 'nowrap' }}>
                          {age < 1 ? 'just now' : age < 60 ? `${age}m ago` : `${Math.floor(age / 60)}h ago`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {tab === 'email' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 26, fontWeight: 700 }}>Email</h2>
              <button onClick={fetchEmailTemplates}
                style={{ background: 'rgba(255,255,255,.08)', color: '#cdd3ef', border: '1px solid var(--stroke)', padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                ↻ Refresh
              </button>
            </div>

            {/* Notification address */}
            <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--stroke)', borderRadius: 14, padding: 20, marginBottom: 28 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#a7aecb' }}>📬 Send notifications to</h3>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input type="email" value={adminEmailSetting} onChange={e => { setAdminEmailSetting(e.target.value); setAdminEmailSaved(false); }}
                  placeholder="your@email.com"
                  style={{ flex: 1, background: 'rgba(255,255,255,.05)', border: '1px solid var(--stroke)', borderRadius: 9, padding: '10px 13px', fontSize: 13, color: '#eef1fb', fontFamily: 'inherit', outline: 'none' }} />
                <button onClick={saveAdminEmail} disabled={adminEmailSaving}
                  style={{ background: adminEmailSaved ? 'rgba(53,214,199,.2)' : 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: adminEmailSaved ? '#35d6c7' : '#fff', border: adminEmailSaved ? '1px solid rgba(53,214,199,.4)' : 'none', borderRadius: 9, padding: '10px 20px', fontSize: 13, fontWeight: 650, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                  {adminEmailSaving ? 'Saving…' : adminEmailSaved ? '✓ Saved' : 'Save'}
                </button>
              </div>
              <p style={{ fontSize: 12, color: '#7d84a6', marginTop: 8 }}>All admin alerts (new members, payments, chat messages, project requests) will be sent here.</p>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Templates</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, minHeight: 500 }}>
              {/* Template list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {emailTemplates.map(t => (
                  <button key={t.id} onClick={() => { setEditingTemplate(t.name); setTemplateEdits({ subject: t.subject, html: t.html, enabled: t.enabled }); setTemplateSaved(false); }}
                    style={{ background: editingTemplate === t.name ? 'rgba(157,144,255,.15)' : 'var(--glass)', border: `1px solid ${editingTemplate === t.name ? 'rgba(157,144,255,.5)' : 'var(--stroke)'}`, borderRadius: 10, padding: '10px 12px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: editingTemplate === t.name ? 700 : 500, color: editingTemplate === t.name ? '#9d90ff' : '#cdd3ef', lineHeight: 1.3 }}>{t.name.replace(/_/g, ' ')}</span>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 20, background: t.enabled ? 'rgba(53,214,199,.15)' : 'rgba(255,255,255,.06)', color: t.enabled ? '#35d6c7' : '#7d84a6', fontWeight: 650, whiteSpace: 'nowrap' }}>
                      {t.enabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                ))}
                {emailTemplates.length === 0 && (
                  <div style={{ padding: '20px 12px', color: '#7d84a6', fontSize: 13, textAlign: 'center', border: '1px dashed var(--stroke)', borderRadius: 10 }}>No templates yet</div>
                )}
              </div>

              {/* Editor panel */}
              {editingTemplate && templateEdits ? (
                <div style={{ background: 'var(--glass)', border: '1px solid var(--stroke)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#9d90ff' }}>{editingTemplate.replace(/_/g, ' ')}</h3>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                      <span style={{ color: '#a7aecb' }}>Enabled</span>
                      <div onClick={() => setTemplateEdits((e: any) => ({ ...e, enabled: !e.enabled }))}
                        style={{ width: 36, height: 20, borderRadius: 10, background: templateEdits.enabled ? '#7c6cff' : 'rgba(255,255,255,.1)', position: 'relative', cursor: 'pointer', transition: 'background .2s' }}>
                        <div style={{ position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: '#fff', top: 3, left: templateEdits.enabled ? 18 : 3, transition: 'left .2s' }} />
                      </div>
                    </label>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, color: '#a7aecb', fontWeight: 600 }}>Subject</label>
                    <input value={templateEdits.subject} onChange={e => setTemplateEdits((d: any) => ({ ...d, subject: e.target.value }))}
                      style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--stroke)', borderRadius: 9, padding: '10px 13px', fontSize: 13, color: '#eef1fb', fontFamily: 'inherit', outline: 'none' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label style={{ fontSize: 12, color: '#a7aecb', fontWeight: 600 }}>HTML Body</label>
                      <span style={{ fontSize: 11, color: '#7d84a6' }}>Use {'{{variableName}}'} for dynamic values</span>
                    </div>
                    <textarea value={templateEdits.html} onChange={e => setTemplateEdits((d: any) => ({ ...d, html: e.target.value }))}
                      spellCheck={false}
                      style={{ flex: 1, minHeight: 320, background: '#080c1e', border: '1px solid var(--stroke)', borderRadius: 9, padding: '12px 14px', fontSize: 12, color: '#cdd3ef', fontFamily: '"Fira Code", "Cascadia Code", "SF Mono", monospace', outline: 'none', resize: 'vertical', lineHeight: 1.6 }} />
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button onClick={saveEmailTemplate} disabled={templateSaving}
                      style={{ background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 22px', fontSize: 13, fontWeight: 650, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {templateSaving ? 'Saving…' : templateSaved ? '✓ Saved' : 'Save Template'}
                    </button>
                    <button onClick={() => sendTestEmail()} disabled={testSending}
                      style={{ background: 'rgba(255,255,255,.07)', color: '#cdd3ef', border: '1px solid var(--stroke)', borderRadius: 9, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {testSending ? 'Sending…' : '📨 Send Test to Admin'}
                    </button>
                    <span style={{ fontSize: 12, color: '#7d84a6' }}>Test uses [test value] for all variables</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--stroke)', borderRadius: 14, color: '#7d84a6', fontSize: 14 }}>
                  Select a template to edit
                </div>
              )}
            </div>

            {/* Variable reference */}
            <div style={{ marginTop: 24, background: 'var(--glass)', border: '1px solid var(--stroke)', borderRadius: 12, padding: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#a7aecb', marginBottom: 10 }}>Available Variables</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[['{{displayName}}','Member name'],['{{email}}','Member email'],['{{setPasswordUrl}}','Password setup link'],['{{membershipTier}}','Tier name'],['{{loginTime}}','Login timestamp'],['{{loginDevice}}','Device/browser'],['{{requestTitle}}','Project request title'],['{{requestDetails}}','Request body'],['{{chatMessage}}','Chat message content'],['{{adminReply}}','Admin reply'],['{{productName}}','Product name'],['{{amount}}','Payment amount']].map(([v, d]) => (
                  <div key={v} style={{ background: 'rgba(157,144,255,.08)', border: '1px solid rgba(157,144,255,.2)', borderRadius: 8, padding: '5px 10px', fontSize: 12 }}>
                    <code style={{ color: '#9d90ff' }}>{v}</code>
                    <span style={{ color: '#7d84a6', marginLeft: 6 }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'messages' && (() => {
          const threads: Record<string, { userEmail: string; msgs: typeof messages }> = {};
          messages.forEach(m => {
            if (!threads[m.userId]) threads[m.userId] = { userEmail: m.userEmail, msgs: [] };
            threads[m.userId].msgs.push(m);
          });
          const threadList = Object.entries(threads).sort((a, b) => {
            const la = [...a[1].msgs].sort((x, y) => y.createdAt.localeCompare(x.createdAt))[0]?.createdAt ?? '';
            const lb = [...b[1].msgs].sort((x, y) => y.createdAt.localeCompare(x.createdAt))[0]?.createdAt ?? '';
            return lb.localeCompare(la);
          });
          const active = activeThread && threads[activeThread] ? activeThread : (threadList[0]?.[0] ?? null);
          const activeData = active ? threads[active] : null;

          const sendReply = async (userId: string, contentOverride?: string) => {
            const content = contentOverride ?? chatReply[userId]?.trim();
            if (!content) return;
            if (!contentOverride) setChatReply(r => ({ ...r, [userId]: '' }));
            setVoicePreview(v => ({ ...v, [userId]: '' }));
            await fetch('/api/member/chat/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, content }) });
            fetchMessages();
          };

          const generateVoice = async (userId: string) => {
            const text = chatReply[userId]?.trim();
            if (!text) return;
            setVoiceLoading(l => ({ ...l, [userId]: true }));
            try {
              const res = await fetch('/api/admin/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
              const data = await res.json();
              if (data.audioBase64) {
                setVoicePreview(v => ({ ...v, [userId]: data.audioBase64 }));
              } else {
                alert(data.error || 'TTS failed');
              }
            } catch {
              alert('TTS request failed');
            }
            setVoiceLoading(l => ({ ...l, [userId]: false }));
          };

          const sendVoiceReply = async (userId: string) => {
            const b64 = voicePreview[userId];
            const text = chatReply[userId]?.trim() || '';
            if (!b64) return;
            const content = `__VOICE_AUDIO__${b64}__END_AUDIO__${text}`;
            setChatReply(r => ({ ...r, [userId]: '' }));
            await sendReply(userId, content);
          };

          const submitNewMsg = async () => {
            if (!newMsgContent.trim() || !newMsgEmail.trim()) return;
            setNewMsgLoading(true);
            setNewMsgError('');
            const res = await fetch('/api/member/chat/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: newMsgEmail.trim(), content: newMsgContent.trim() }) });
            const data = await res.json();
            if (!res.ok) {
              setNewMsgError(data.error || 'Failed to send');
            } else {
              setNewMsgModal(false);
              setNewMsgEmail('');
              setNewMsgContent('');
              fetchMessages();
              setActiveThread(data.userId);
            }
            setNewMsgLoading(false);
          };

          const parseVoice = (content: string) => {
            if (!content.startsWith('__VOICE_AUDIO__')) return null;
            const endIdx = content.indexOf('__END_AUDIO__');
            return endIdx !== -1 ? content.slice('__VOICE_AUDIO__'.length, endIdx) : content.slice('__VOICE_AUDIO__'.length);
          };

          const renderContent = (content: string) => {
            const b64 = parseVoice(content);
            if (b64) return <VoicePlayer src={`data:audio/mpeg;base64,${b64}`} fromAdmin />;
            return <>{content}</>;
          };

          return (
            <>
              {/* New Message Modal */}
              {newMsgModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ background: '#0e1228', border: '1px solid var(--stroke)', borderRadius: 16, padding: 28, width: 420, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#eef1fb' }}>New Message</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>Member Email</label>
                      <input value={newMsgEmail} onChange={e => setNewMsgEmail(e.target.value)} placeholder="member@example.com"
                        style={{ background: 'rgba(255,255,255,.05)', border: '1px solid var(--stroke)', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#eef1fb', fontFamily: 'inherit', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>Message</label>
                      <textarea value={newMsgContent} onChange={e => setNewMsgContent(e.target.value)} placeholder="Type your message…" rows={4}
                        style={{ background: 'rgba(255,255,255,.05)', border: '1px solid var(--stroke)', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#eef1fb', fontFamily: 'inherit', outline: 'none', resize: 'vertical' }} />
                    </div>
                    {newMsgError && <div style={{ fontSize: 12, color: '#ff6b6b' }}>{newMsgError}</div>}
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button onClick={() => { setNewMsgModal(false); setNewMsgError(''); }} style={{ background: 'none', border: '1px solid var(--stroke)', borderRadius: 9, padding: '9px 18px', fontSize: 13, color: '#a7aecb', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                      <button onClick={submitNewMsg} disabled={newMsgLoading || !newMsgEmail.trim() || !newMsgContent.trim()}
                        style={{ background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 650, cursor: 'pointer', fontFamily: 'inherit', opacity: newMsgLoading ? .6 : 1 }}>
                        {newMsgLoading ? 'Sending…' : 'Send'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: 0, overflow: 'hidden' }}>
                {/* Sidebar */}
                <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid var(--stroke)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--stroke)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#cdd3ef' }}>Conversations</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button onClick={() => { setNewMsgModal(true); setNewMsgError(''); }} title="New message"
                        style={{ background: 'rgba(157,144,255,.15)', border: '1px solid rgba(157,144,255,.3)', borderRadius: 7, color: '#9d90ff', fontSize: 16, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
                      <button onClick={fetchMessages} style={{ background: 'none', border: 'none', color: '#7d84a6', fontSize: 16, cursor: 'pointer', lineHeight: 1 }}>↻</button>
                    </div>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {threadList.length === 0 ? (
                      <div style={{ padding: '32px 16px', textAlign: 'center', color: '#7d84a6', fontSize: 13 }}>No messages yet</div>
                    ) : threadList.map(([userId, thread]) => {
                      const sorted = [...thread.msgs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
                      const last = sorted[0];
                      const unread = sorted.filter(m => !m.fromAdmin).length > 0;
                      const isActive = userId === active;
                      const lastPreview = last ? (last.content.startsWith('__VOICE_AUDIO__') ? '🎙️ Voice message' : (last.fromAdmin ? 'You: ' : '') + last.content) : '';
                      return (
                        <button key={userId} onClick={() => setActiveThread(userId)}
                          style={{ width: '100%', textAlign: 'left', background: isActive ? 'rgba(157,144,255,.1)' : 'none', border: 'none', borderBottom: '1px solid var(--stroke)', borderLeft: isActive ? '3px solid #9d90ff' : '3px solid transparent', padding: '14px 16px', cursor: 'pointer', fontFamily: 'inherit', display: 'block' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 650, color: isActive ? '#9d90ff' : '#cdd3ef', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                              {thread.userEmail.split('@')[0]}
                            </span>
                            <span style={{ fontSize: 11, color: '#7d84a6', whiteSpace: 'nowrap', marginLeft: 8 }}>
                              {last ? new Date(last.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 12, color: '#7d84a6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                              {lastPreview}
                            </span>
                            {unread && !isActive && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#9d90ff', flexShrink: 0 }} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Thread panel */}
                {activeData && active ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Thread header */}
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--stroke)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(160deg,#9d90ff,#7c6cff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {activeData.userEmail[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#eef1fb' }}>{activeData.userEmail.split('@')[0]}</div>
                        <div style={{ fontSize: 12, color: '#7d84a6' }}>{activeData.userEmail}</div>
                      </div>
                      <div style={{ marginLeft: 'auto', fontSize: 12, color: '#7d84a6' }}>{activeData.msgs.length} message{activeData.msgs.length !== 1 ? 's' : ''}</div>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[...activeData.msgs].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map(msg => (
                        <div key={msg.id} style={{ display: 'flex', justifyContent: msg.fromAdmin ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                          {!msg.fromAdmin && (
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(157,144,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#9d90ff', flexShrink: 0 }}>
                              {activeData.userEmail[0].toUpperCase()}
                            </div>
                          )}
                          <div style={{ maxWidth: '65%' }}>
                            <div style={{ background: msg.fromAdmin ? 'linear-gradient(160deg,#9d90ff,#7c6cff)' : 'rgba(255,255,255,.07)', borderRadius: msg.fromAdmin ? '16px 4px 16px 16px' : '4px 16px 16px 16px', padding: '10px 14px', fontSize: 13, lineHeight: 1.55 }}>
                              {renderContent(msg.content)}
                            </div>
                            <div style={{ fontSize: 11, color: '#7d84a6', marginTop: 4, textAlign: msg.fromAdmin ? 'right' : 'left' }}>
                              {new Date(msg.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          {msg.fromAdmin && (
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(160deg,#9d90ff,#7c6cff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>L</div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Reply box */}
                    <div style={{ padding: '14px 20px', borderTop: '1px solid var(--stroke)', flexShrink: 0 }}>
                      {/* Voice preview bar */}
                      {voicePreview[active] && (
                        <div style={{ background: 'rgba(157,144,255,.08)', border: '1px solid rgba(157,144,255,.25)', borderRadius: 12, padding: '10px 14px', marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ fontSize: 11, color: '#9d90ff', fontWeight: 700 }}>🎙️ Voice Preview — send this?</div>
                          <VoicePlayer src={`data:audio/mpeg;base64,${voicePreview[active]}`} fromAdmin />
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => sendVoiceReply(active)}
                              style={{ flex: 1, background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff', border: 'none', borderRadius: 9, padding: '8px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                              Send Voice Reply
                            </button>
                            <button onClick={() => setVoicePreview(v => ({ ...v, [active]: '' }))}
                              style={{ background: 'rgba(255,255,255,.06)', border: '1px solid var(--stroke)', borderRadius: 9, padding: '8px 14px', fontSize: 12, color: '#a7aecb', cursor: 'pointer', fontFamily: 'inherit' }}>
                              Discard
                            </button>
                          </div>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <input value={chatReply[active] || ''} onChange={e => setChatReply(r => ({ ...r, [active]: e.target.value }))}
                          placeholder={`Reply to ${activeData.userEmail.split('@')[0]}…`}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(active); } }}
                          style={{ flex: 1, background: 'rgba(255,255,255,.05)', border: '1px solid var(--stroke)', borderRadius: 22, padding: '10px 18px', fontSize: 13, color: '#eef1fb', fontFamily: 'inherit', outline: 'none' }} />
                        {/* Voice button */}
                        <button onClick={() => generateVoice(active)} disabled={voiceLoading[active] || !chatReply[active]?.trim()}
                          title="Generate voice reply"
                          style={{ background: 'rgba(157,144,255,.15)', border: '1px solid rgba(157,144,255,.3)', borderRadius: '50%', width: 38, height: 38, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: voiceLoading[active] ? .5 : 1 }}>
                          {voiceLoading[active] ? '⏳' : '🎙️'}
                        </button>
                        {/* Send button */}
                        <button onClick={() => sendReply(active)}
                          style={{ background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff', border: 'none', borderRadius: '50%', width: 38, height: 38, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          ➤
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7d84a6', fontSize: 14 }}>
                    Select a conversation
                  </div>
                )}
              </div>
            </>
          );
        })()}

        {tab === 'security' && (() => {
          const si: React.CSSProperties = {
            background: 'rgba(255,255,255,.04)', border: '1px solid var(--stroke)',
            borderRadius: 9, padding: '10px 12px', fontSize: 13, color: '#eef1fb',
            fontFamily: 'inherit', width: '100%',
          };
          return (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ fontSize: 26, fontWeight: 700 }}>Security Tools</h2>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={seedTools} disabled={seedingTools}
                    style={{ background: 'rgba(53,214,199,.15)', color: '#35d6c7', border: '1px solid rgba(53,214,199,.3)',
                      padding: '10px 16px', borderRadius: 9, fontSize: 13, fontWeight: 650, cursor: 'pointer' }}>
                    {seedingTools ? 'Seeding…' : '🌱 Seed 25 tools'}
                  </button>
                  <button onClick={() => { setToolForm(blankTool()); setEditingTool('new'); }}
                    style={{ background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff', border: 'none',
                      padding: '10px 18px', borderRadius: 9, fontSize: 13, fontWeight: 650, cursor: 'pointer' }}>
                    + Add Tool
                  </button>
                </div>
              </div>

              {editingTool && (
                <div style={{ background: 'var(--glass)', border: '1px solid var(--stroke)', borderRadius: 14, padding: 24, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{editingTool === 'new' ? 'New Tool' : 'Edit Tool'}</h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[
                      { key: 'name', label: 'Name *', placeholder: 'Nmap' },
                      { key: 'icon', label: 'Icon emoji', placeholder: '🔍' },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</label>
                        <input style={si} value={(toolForm as any)[key]} placeholder={placeholder}
                          onChange={e => setToolForm(f => ({ ...f, [key]: e.target.value }))} />
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>Description *</label>
                    <textarea style={{ ...si, resize: 'vertical', minHeight: 72 }} value={toolForm.description}
                      placeholder="What does this tool do?" onChange={e => setToolForm(f => ({ ...f, description: e.target.value }))} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    {[
                      { key: 'category', label: 'Category', placeholder: 'Reconnaissance' },
                      { key: 'language', label: 'Language', placeholder: 'Go' },
                      { key: 'stars', label: 'Stars', placeholder: '10.2k' },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</label>
                        <input style={si} value={(toolForm as any)[key]} placeholder={placeholder}
                          onChange={e => setToolForm(f => ({ ...f, [key]: e.target.value }))} />
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>GitHub URL *</label>
                    <input style={si} type="url" value={toolForm.githubUrl} placeholder="https://github.com/..."
                      onChange={e => setToolForm(f => ({ ...f, githubUrl: e.target.value }))} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>Demo / Docs URL</label>
                    <input style={si} type="url" value={toolForm.demoUrl || ''} placeholder="https://..."
                      onChange={e => setToolForm(f => ({ ...f, demoUrl: e.target.value || null }))} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>Gradient CSS</label>
                    <input style={si} value={toolForm.gradient} placeholder="linear-gradient(135deg,#1e3a8a,#1a3270)"
                      onChange={e => setToolForm(f => ({ ...f, gradient: e.target.value }))} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, display: 'grid', placeItems: 'center',
                      fontSize: 26, background: toolForm.gradient, border: '1px solid var(--stroke)' }}>
                      {toolForm.icon}
                    </div>
                    <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 13 }}>
                      <input type="checkbox" checked={toolForm.enabled}
                        onChange={e => setToolForm(f => ({ ...f, enabled: e.target.checked }))} />
                      Visible on site
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={saveTool} disabled={toolSaving}
                      style={{ flex: 1, background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff',
                        border: 'none', borderRadius: 9, padding: '11px', fontSize: 13, fontWeight: 650, cursor: 'pointer' }}>
                      {toolSaving ? 'Saving…' : editingTool === 'new' ? 'Create tool' : 'Save changes'}
                    </button>
                    <button onClick={() => setEditingTool(null)}
                      style={{ flex: 1, background: 'rgba(255,255,255,.06)', color: '#a7aecb',
                        border: '1px solid var(--stroke)', borderRadius: 9, padding: '11px', fontSize: 13, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {securityTools.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed var(--stroke)',
                  borderRadius: 12, color: '#7d84a6' }}>
                  <p style={{ fontSize: 14, marginBottom: 12 }}>No security tools yet. Click "Seed 25 tools" to populate the database.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {securityTools.map(t => (
                    <div key={t.id} style={{ background: 'var(--glass)', border: '1px solid var(--stroke)',
                      borderRadius: 12, padding: '12px 16px', display: 'grid',
                      gridTemplateColumns: '44px 1fr auto auto', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, display: 'grid', placeItems: 'center',
                        fontSize: 20, background: t.gradient, border: '1px solid var(--stroke-2)', flexShrink: 0 }}>{t.icon}</div>
                      <div>
                        <div style={{ fontWeight: 650, display: 'flex', gap: 8, alignItems: 'center' }}>
                          {t.name}
                          <span style={{ fontSize: 10, color: '#a7aecb', background: 'rgba(255,255,255,.06)',
                            borderRadius: 5, padding: '2px 7px', fontWeight: 500 }}>{t.category}</span>
                          {!t.enabled && <span style={{ fontSize: 10, color: '#ff7c78', background: 'rgba(255,95,87,.1)',
                            borderRadius: 5, padding: '2px 7px' }}>hidden</span>}
                        </div>
                        <div style={{ fontSize: 12, color: '#7d84a6', marginTop: 2 }}>{t.language} · ⭐ {t.stars}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {t.githubUrl && <a href={t.githubUrl} target="_blank" rel="noopener noreferrer" title="GitHub"
                          style={{ fontSize: 14, opacity: .7, textDecoration: 'none' }}>💻</a>}
                        {t.demoUrl && <a href={t.demoUrl} target="_blank" rel="noopener noreferrer" title="Demo"
                          style={{ fontSize: 14, opacity: .7, textDecoration: 'none' }}>🔗</a>}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { setToolForm({ name: t.name, icon: t.icon, category: t.category, language: t.language, stars: t.stars, description: t.description, githubUrl: t.githubUrl, demoUrl: t.demoUrl, gradient: t.gradient, order: t.order, enabled: t.enabled }); setEditingTool(t); }}
                          style={{ background: 'rgba(124,108,255,.2)', color: '#9d90ff', border: 'none',
                            borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 650, cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => deleteTool(t.id)}
                          style={{ background: 'rgba(255,95,87,.15)', color: '#ff7c78', border: 'none',
                            borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 650, cursor: 'pointer' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}
