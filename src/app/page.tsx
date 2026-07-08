'use client';

import { useEffect, useRef, useState } from 'react';

/* ── CMS defaults ───────────────────────────────────────────── */
const CONTENT_DEFAULTS: Record<string, string> = {
  'site.logoUrl': '/logo.png',
  'site.name': 'lanraeAi',
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
  'win.store.title': 'Product Store',
  'win.store.subtitle': '— AI, built by lanrae',
  'win.fans.title': 'Top 10 Fans',
  'win.fans.subtitle': '— this month',
  'win.members.title': 'Membership',
  'win.members.subtitle': '',
  'win.request.title': 'Request a Project',
  'win.request.subtitle': '— shape the roadmap',
  'win.donate.title': 'Support the work',
  'win.donate.subtitle': '',
  'win.about.title': 'About',
  'win.about.subtitle': '',
  'app.profile.icon': '👤', 'app.profile.label': 'Profile',
  'win.profile.title': 'Member Profile', 'win.profile.subtitle': '',
};

/* ── security toolkit fallback (replaced by DB at runtime) ─── */
const SECURITY_TOOLS_FALLBACK = [
  { id:'1',  name:'Metasploit',      icon:'🛡️', category:'Exploitation',       language:'Ruby',       stars:'34.2k', description:'The world\'s most-used penetration testing framework — 2,300+ exploits across every major platform.',       githubUrl:'https://github.com/rapid7/metasploit-framework',           demoUrl:null,                                              gradient:'linear-gradient(135deg,#7f1d1d,#5a1313)' },
  { id:'2',  name:'Nmap',            icon:'🔍', category:'Reconnaissance',      language:'C / Lua',    stars:'10.1k', description:'The iconic "Network Mapper" — port scanning, OS detection, and scripting engine used by every pentester.', githubUrl:'https://github.com/nmap/nmap',                             demoUrl:'https://nmap.org',                                gradient:'linear-gradient(135deg,#1e3a8a,#1a3270)' },
  { id:'3',  name:'SQLMap',          icon:'💉', category:'Exploitation',       language:'Python',     stars:'32.8k', description:'Automatic SQL injection and database takeover tool. Supports MySQL, Oracle, PostgreSQL, MSSQL, and more.',  githubUrl:'https://github.com/sqlmapproject/sqlmap',                  demoUrl:null,                                              gradient:'linear-gradient(135deg,#7c2d12,#5e2209)' },
  { id:'4',  name:'Burp Suite',      icon:'🕷️', category:'Web Security',       language:'Java',       stars:'4.2k',  description:'Industry-standard web app security platform — intercept proxy, scanner, intruder, and repeater.',          githubUrl:'https://github.com/PortSwigger/burp-extensions-montoya-api', demoUrl:'https://portswigger.net/burp/communitydownload', gradient:'linear-gradient(135deg,#431407,#321005)' },
  { id:'5',  name:'OWASP ZAP',       icon:'🕸️', category:'Web Security',       language:'Java',       stars:'12.5k', description:'Free, open-source web app scanner. Best for beginners and CI/CD pipeline integration.',                    githubUrl:'https://github.com/zaproxy/zaproxy',                      demoUrl:'https://www.zaproxy.org',                         gradient:'linear-gradient(135deg,#0f3460,#0b2a52)' },
  { id:'6',  name:'Aircrack-ng',     icon:'📡', category:'Wireless',            language:'C',          stars:'4.9k',  description:'Complete WiFi security auditing suite — WEP and WPA/WPA2-PSK cracking, packet capture, and injection.',    githubUrl:'https://github.com/aircrack-ng/aircrack-ng',              demoUrl:'https://aircrack-ng.org',                         gradient:'linear-gradient(135deg,#3b0764,#2e0550)' },
  { id:'7',  name:'Hashcat',         icon:'🔐', category:'Password',            language:'C',          stars:'21.7k', description:'World\'s fastest password recovery. 300+ hash types, GPU-accelerated — MD5, SHA, bcrypt, and WPA2.',       githubUrl:'https://github.com/hashcat/hashcat',                       demoUrl:'https://hashcat.net',                             gradient:'linear-gradient(135deg,#292524,#1c1917)' },
  { id:'8',  name:'John the Ripper', icon:'🔓', category:'Password',            language:'C',          stars:'9.8k',  description:'Fast, flexible password cracker that auto-detects hash types. Supports 100+ formats out of the box.',       githubUrl:'https://github.com/openwall/john',                         demoUrl:null,                                              gradient:'linear-gradient(135deg,#422006,#321805)' },
  { id:'9',  name:'THC Hydra',       icon:'🐍', category:'Brute Force',         language:'C',          stars:'10.5k', description:'Fastest network logon cracker — 50+ protocols: FTP, HTTP, HTTPS, SMB, SSH, MySQL, and more.',             githubUrl:'https://github.com/vanhauser-thc/thc-hydra',              demoUrl:null,                                              gradient:'linear-gradient(135deg,#14532d,#0f3d21)' },
  { id:'10', name:'Nikto',           icon:'🎯', category:'Web Security',       language:'Perl',       stars:'8.9k',  description:'Open-source web server scanner — tests for 6,700+ dangerous files, outdated software, and misconfigs.',    githubUrl:'https://github.com/sullo/nikto',                           demoUrl:null,                                              gradient:'linear-gradient(135deg,#7f1d1d,#5a1313)' },
  { id:'11', name:'Gobuster',        icon:'🚀', category:'Reconnaissance',      language:'Go',         stars:'10.2k', description:'Blazing-fast directory, DNS, vhost, and S3 bucket enumeration tool written in Go.',                        githubUrl:'https://github.com/OJ/gobuster',                           demoUrl:null,                                              gradient:'linear-gradient(135deg,#065f46,#044f3a)' },
  { id:'12', name:'Nuclei',          icon:'⚡', category:'Vuln Scanner',        language:'Go',         stars:'21.3k', description:'Template-based vulnerability scanner with 9,000+ community templates covering CVEs, misconfigs, and more.', githubUrl:'https://github.com/projectdiscovery/nuclei',              demoUrl:'https://nuclei.projectdiscovery.io',              gradient:'linear-gradient(135deg,#713f12,#5a320e)' },
  { id:'13', name:'Subfinder',       icon:'🌐', category:'Reconnaissance',      language:'Go',         stars:'10.4k', description:'Passive subdomain discovery using 40+ sources — Shodan, VirusTotal, Censys, SecurityTrails, and more.',    githubUrl:'https://github.com/projectdiscovery/subfinder',           demoUrl:null,                                              gradient:'linear-gradient(135deg,#1e3a8a,#1a3270)' },
  { id:'14', name:'Amass',           icon:'🗺️', category:'Reconnaissance',      language:'Go',         stars:'12.1k', description:'OWASP attack surface mapping — DNS enumeration, scraping, certificate transparency, and graph analysis.',   githubUrl:'https://github.com/owasp-amass/amass',                    demoUrl:null,                                              gradient:'linear-gradient(135deg,#3b0764,#2e0550)' },
  { id:'15', name:'BloodHound',      icon:'🩸', category:'Active Directory',    language:'TypeScript', stars:'10.7k', description:'Reveal hidden AD attack paths using graph theory. Find the shortest route to Domain Admin.',                githubUrl:'https://github.com/BloodHoundAD/BloodHound',              demoUrl:null,                                              gradient:'linear-gradient(135deg,#7f1d1d,#5a1313)' },
  { id:'16', name:'Impacket',        icon:'📦', category:'Exploitation',       language:'Python',     stars:'14.2k', description:'Python library for working with network protocols — DCE/RPC, SMB, LDAP. Essential for Windows pentesting.', githubUrl:'https://github.com/fortra/impacket',                       demoUrl:null,                                              gradient:'linear-gradient(135deg,#1e3a8a,#1a3270)' },
  { id:'17', name:'Responder',       icon:'🎣', category:'Network',             language:'Python',     stars:'5.4k',  description:'LLMNR, NBT-NS, and MDNS poisoner — captures NTLMv2 hashes transparently on local network segments.',       githubUrl:'https://github.com/lgandx/Responder',                      demoUrl:null,                                              gradient:'linear-gradient(135deg,#7c2d12,#5e2209)' },
  { id:'18', name:'Volatility 3',    icon:'🧠', category:'Forensics',           language:'Python',     stars:'2.9k',  description:'Advanced memory forensics framework. Analyse RAM dumps from Windows, Linux, and macOS systems.',             githubUrl:'https://github.com/volatilityfoundation/volatility3',      demoUrl:null,                                              gradient:'linear-gradient(135deg,#3b0764,#2e0550)' },
  { id:'19', name:'Wireshark',       icon:'🦈', category:'Network',             language:'C',          stars:'7.3k',  description:'World\'s leading network protocol analyser — capture, inspect, and dissect traffic in real-time.',           githubUrl:'https://github.com/wireshark/wireshark',                   demoUrl:'https://www.wireshark.org',                       gradient:'linear-gradient(135deg,#1e3a8a,#1a3270)' },
  { id:'20', name:'ffuf',            icon:'💨', category:'Web Security',       language:'Go',         stars:'13.4k', description:'Fuzz Faster U Fool — blindingly fast web fuzzer for directory discovery, parameter fuzzing, and vhosts.',   githubUrl:'https://github.com/ffuf/ffuf',                             demoUrl:null,                                              gradient:'linear-gradient(135deg,#065f46,#044f3a)' },
  { id:'21', name:'PEASS-ng',        icon:'🐦', category:'Priv Escalation',     language:'Shell',      stars:'16.8k', description:'linPEAS & winPEAS — automated scripts to find local privilege escalation vectors on Linux and Windows.',    githubUrl:'https://github.com/carlospolop/PEASS-ng',                  demoUrl:null,                                              gradient:'linear-gradient(135deg,#14532d,#0f3d21)' },
  { id:'22', name:'Sherlock',        icon:'🔎', category:'OSINT',               language:'Python',     stars:'18.9k', description:'Hunt down social media accounts by username across 400+ sites in seconds.',                               githubUrl:'https://github.com/sherlock-project/sherlock',            demoUrl:null,                                              gradient:'linear-gradient(135deg,#292524,#1c1917)' },
  { id:'23', name:'theHarvester',    icon:'🌾', category:'OSINT',               language:'Python',     stars:'11.0k', description:'Gather emails, subdomains, hosts, and names from public sources. The go-to early-recon tool.',             githubUrl:'https://github.com/laramies/theHarvester',                demoUrl:null,                                              gradient:'linear-gradient(135deg,#14532d,#0f3d21)' },
  { id:'24', name:'WPScan',          icon:'🔒', category:'Web Security',       language:'Ruby',       stars:'8.5k',  description:'WordPress vulnerability scanner — 36,000+ known vulnerabilities in WP core, plugins, and themes.',          githubUrl:'https://github.com/wpscanteam/wpscan',                     demoUrl:'https://wpscan.com',                              gradient:'linear-gradient(135deg,#7f1d1d,#5a1313)' },
  { id:'25', name:'Mimikatz',        icon:'🗝️', category:'Credential Access',   language:'C',          stars:'19.2k', description:'Post-exploitation credential dumper — extracts plaintext passwords, hashes, and Kerberos tickets from LSASS.', githubUrl:'https://github.com/gentilkiwi/mimikatz',               demoUrl:null,                                              gradient:'linear-gradient(135deg,#292524,#1c1917)' },
];

/* ── types ─────────────────────────────────────────────────── */
type SecurityTool = {
  id: string; name: string; icon: string; category: string; language: string;
  stars: string; description: string; githubUrl: string; demoUrl: string | null;
  gradient: string;
};

type Product = {
  id: string; name: string; description: string; icon: string | null;
  price: number; isFree: boolean; isNew: boolean;
  requiresMembership: string | null;
  artifactUrl: string | null; githubUrl: string | null; showGithub: boolean; vercelUrl: string | null;
  gradient: string;
};
type Fan = {
  id: string; rank: number; displayName: string; initials: string;
  avatarColor: string; totalSpent: number; membershipTier: string | null;
};
type OSType = 'ios' | 'android' | 'windows' | 'mac';

/* ── detect OS ──────────────────────────────────────────────── */
function detectOS(): OSType {
  if (typeof navigator === 'undefined') return 'mac';
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Windows/.test(ua)) return 'windows';
  return 'mac';
}

/* ── macOS draggable window ─────────────────────────────────── */
function MacWin({ title, subtitle, open, onClose, onMin, style, children, zIndex, onFocus }: {
  title: string; subtitle?: string; open: boolean;
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
    el.style.left = rect.left + 'px'; el.style.top = rect.top + 'px'; el.style.margin = '0';
    drag.current = { sx: e.clientX, sy: e.clientY, ox: rect.left, oy: rect.top };
    (e.target as HTMLElement).setPointerCapture(e.pointerId); onFocus();
  };
  const moveDrag = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const { sx, sy, ox, oy } = drag.current;
    ref.current!.style.left = (ox + e.clientX - sx) + 'px';
    ref.current!.style.top = Math.max(32, oy + e.clientY - sy) + 'px';
  };
  return (
    <section ref={ref} onMouseDown={onFocus} style={{
      position: 'absolute', display: 'flex', flexDirection: 'column',
      background: 'var(--glass)', backdropFilter: 'blur(40px) saturate(180%)',
      border: '1px solid var(--stroke)', borderRadius: 14,
      boxShadow: '0 30px 70px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.14)',
      transition: 'opacity .22s ease, transform .22s cubic-bezier(.2,.9,.3,1.2)',
      opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
      transform: open ? 'none' : 'scale(.94) translateY(8px)',
      zIndex, ...style,
    }}>
      <div style={{ height: 42, display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px',
        borderBottom: '1px solid var(--stroke-2)', cursor: 'grab', flexShrink: 0 }}
        onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={() => { drag.current = null; }}>
        <div className="lights" style={{ display: 'flex', gap: 8 }}>
          <i onClick={onClose} style={{ width: 12, height: 12, borderRadius: '50%', display: 'block', background: '#ff5f57', border: '1px solid rgba(0,0,0,.25)', cursor: 'pointer' }} />
          <i onClick={onMin} style={{ width: 12, height: 12, borderRadius: '50%', display: 'block', background: '#febc2e', border: '1px solid rgba(0,0,0,.25)', cursor: 'pointer' }} />
          <i style={{ width: 12, height: 12, borderRadius: '50%', display: 'block', background: '#28c840', border: '1px solid rgba(0,0,0,.25)' }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#dfe4f6' }}>
          {title}{subtitle && <span style={{ fontWeight: 400, color: '#7d84a6', marginLeft: 6 }}>{subtitle}</span>}
        </span>
      </div>
      <div style={{ padding: 18, overflowY: 'auto', maxHeight: '68vh' }}>{children}</div>
    </section>
  );
}

/* ── Windows 11 draggable window ────────────────────────────── */
function WinWindow({ title, subtitle, open, onClose, onMin, style, children, zIndex, onFocus }: {
  title: string; subtitle?: string; open: boolean;
  onClose: () => void; onMin: () => void;
  style?: React.CSSProperties; children: React.ReactNode;
  zIndex: number; onFocus: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  const startDrag = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.win-ctrl')) return;
    const el = ref.current!;
    const rect = el.getBoundingClientRect();
    el.style.left = rect.left + 'px'; el.style.top = rect.top + 'px'; el.style.margin = '0';
    drag.current = { sx: e.clientX, sy: e.clientY, ox: rect.left, oy: rect.top };
    (e.target as HTMLElement).setPointerCapture(e.pointerId); onFocus();
  };
  const moveDrag = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const { sx, sy, ox, oy } = drag.current;
    ref.current!.style.left = (ox + e.clientX - sx) + 'px';
    ref.current!.style.top = Math.max(44, oy + e.clientY - sy) + 'px';
  };
  return (
    <section ref={ref} onMouseDown={onFocus} style={{
      position: 'absolute', display: 'flex', flexDirection: 'column',
      background: 'rgba(14,19,40,.52)', backdropFilter: 'blur(44px) saturate(180%)',
      border: '1px solid rgba(255,255,255,.13)', borderRadius: 10,
      boxShadow: '0 32px 80px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.12)',
      transition: 'opacity .2s ease, transform .2s cubic-bezier(.2,.9,.3,1.2)',
      opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
      transform: open ? 'none' : 'scale(.96) translateY(6px)',
      zIndex, fontFamily: '"Segoe UI",sans-serif', ...style,
    }}>
      <div style={{ height: 36, display: 'flex', alignItems: 'center', padding: '0 14px',
        borderBottom: '1px solid rgba(255,255,255,.07)', cursor: 'grab', flexShrink: 0,
        justifyContent: 'space-between' }}
        onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={() => { drag.current = null; }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#cdd3ef' }}>
          {title}{subtitle && <span style={{ fontWeight: 400, color: '#7d84a6', marginLeft: 6 }}>{subtitle}</span>}
        </span>
        <div className="win-ctrl" style={{ display: 'flex' }}>
          <button onClick={onMin} style={{ width: 46, height: 36, background: 'none', border: 'none',
            color: '#cdd3ef', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'background .1s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.1)' )}
            onMouseLeave={e => (e.currentTarget.style.background = 'none' )}>─</button>
          <button onClick={onClose} style={{ width: 46, height: 36, background: 'none', border: 'none',
            color: '#cdd3ef', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
            borderRadius: '0 10px 0 0', transition: 'background .1s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#c42b1c' )}
            onMouseLeave={e => (e.currentTarget.style.background = 'none' )}>✕</button>
        </div>
      </div>
      <div style={{ padding: 18, overflowY: 'auto', maxHeight: '68vh' }}>{children}</div>
    </section>
  );
}

/* ── iOS / Android slide-up sheet ───────────────────────────── */
function Sheet({ open, onClose, title, os, children }: {
  open: boolean; onClose: () => void; title: string; os: OSType; children: React.ReactNode;
}) {
  const isAndroid = os === 'android';
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, pointerEvents: open ? 'auto' : 'none' }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(5px)',
        opacity: open ? 1 : 0, transition: 'opacity .3s ease',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '93dvh',
        background: isAndroid ? '#1a1f38' : 'linear-gradient(180deg,#141930,#0d1120)',
        borderRadius: isAndroid ? '28px 28px 0 0' : '22px 22px 0 0',
        border: '1px solid rgba(255,255,255,.1)', borderBottom: 'none',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform .38s cubic-bezier(.25,.9,.3,1.05)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        fontFamily: isAndroid ? '"Google Sans",Roboto,sans-serif' : '-apple-system,sans-serif',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 6px', flexShrink: 0 }}>
          <div style={{ width: isAndroid ? 32 : 38, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.2)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '4px 20px 14px', flexShrink: 0 }}>
          <h2 style={{ fontSize: 22, fontWeight: isAndroid ? 500 : 750, color: '#eef1fb', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: isAndroid ? 8 : '50%',
            background: 'rgba(255,255,255,.12)', border: 'none',
            color: '#a7aecb', fontSize: 15, cursor: 'pointer',
            display: 'grid', placeItems: 'center', fontFamily: 'inherit',
          }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 48px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── checkout ───────────────────────────────────────────────── */
function Checkout({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { setLoading(false); setError(null); }, [product]);
  if (!product) return null;
  const price = product.isFree ? 0 : product.price / 100;

  const handlePay = async () => {
    if (product.isFree) {
      if (product.artifactUrl) window.open(product.artifactUrl, '_blank');
      onClose();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const MEMBERSHIP_TIERS = ['explorer', 'supporter', 'insider'];
      let body: Record<string, unknown>;
      if (product.id === 'donate') {
        body = { type: 'donate', amount: price };
      } else if (MEMBERSHIP_TIERS.includes(product.id.toLowerCase())) {
        body = { type: 'membership', membershipTier: product.id.toLowerCase() };
      } else {
        body = { type: 'product', productId: product.id };
      }
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Something went wrong');
        setLoading(false);
      }
    } catch {
      setError('Failed to start checkout');
      setLoading(false);
    }
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'rgba(3,4,12,.55)', backdropFilter: 'blur(6px)' }}>
      <div style={{ width: 'min(400px,92vw)', background: 'var(--glass)',
        border: '1px solid var(--stroke)', borderRadius: 20,
        boxShadow: '0 40px 90px rgba(0,0,0,.6)', overflow: 'hidden',
        animation: 'rise .3s cubic-bezier(.2,.9,.3,1.15)' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--stroke-2)',
          display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, display: 'grid', placeItems: 'center',
            fontSize: 22, background: product.gradient, border: '1px solid var(--stroke)' }}>{product.icon}</div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{product.name}</h3>
            <p style={{ fontSize: 12, color: '#a7aecb' }}>lanrae.co.uk · secure checkout</p>
          </div>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ color: '#a7aecb', fontSize: 13 }}>Total</span>
            <span style={{ fontSize: 26, fontWeight: 800 }}>£{price.toFixed(2)}</span>
          </div>
          {error && <p style={{ fontSize: 13, color: '#ff6b6b', margin: 0 }}>{error}</p>}
          <button onClick={handlePay} disabled={loading}
            style={{ background: loading ? 'rgba(157,144,255,.5)' : 'linear-gradient(180deg,#9d90ff,#7c6cff)',
              color: '#fff', border: 'none', padding: '14px', borderRadius: 12, fontSize: 14,
              fontWeight: 650, cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%', fontFamily: 'inherit', transition: 'opacity .2s' }}>
            {loading ? 'Redirecting…' : `Pay £${price.toFixed(2)} with Stripe`}
          </button>
        </div>
        <div style={{ padding: '12px', borderTop: '1px solid var(--stroke-2)',
          textAlign: 'center', fontSize: 11, color: '#7d84a6' }}>
          🔒 Secure payment powered by <b style={{ color: '#a99dff' }}>Stripe</b>
        </div>
      </div>
      <style>{`@keyframes rise{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}} @keyframes load{to{width:100%}}`}</style>
    </div>
  );
}

/* ── main ───────────────────────────────────────────────────── */
export default function Desktop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [securityTools, setSecurityTools] = useState<SecurityTool[]>(SECURITY_TOOLS_FALLBACK as SecurityTool[]);
  const [fans, setFans] = useState<Fan[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [zMap, setZMap] = useState<Record<string, number>>({});
  const [zTop, setZTop] = useState(100);
  const [checkout, setCheckout] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [booted, setBooted] = useState(false);
  const [clock, setClock] = useState('');
  const [donateAmt, setDonateAmt] = useState(7);
  const [isMobile, setIsMobile] = useState(false);
  const [os, setOs] = useState<OSType>('mac');
  const [activeTab, setActiveTab] = useState('store'); // android bottom nav
  const [reqForm, setReqForm] = useState({ name: '', email: '', title: '', description: '' });
  const [reqStatus, setReqStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [content, setContent] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<{ id: string; city: string | null; country: string | null; browser: string | null; device: string | null }[]>([]);
  const lastPoll = useRef(new Date().toISOString());
  const [memberUser, setMemberUser] = useState<{ userId: string; email: string; tier?: string; tierName?: string } | null>(null);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberLoginLoading, setMemberLoginLoading] = useState(false);
  const [memberLoginError, setMemberLoginError] = useState<string | null>(null);
  const [memberProfile, setMemberProfile] = useState<Record<string, unknown>>({});
  const [memberProfileEdits, setMemberProfileEdits] = useState<Record<string, string>>({});
  const [memberProfileSaving, setMemberProfileSaving] = useState(false);
  const [memberMessages, setMemberMessages] = useState<{ id: string; content: string; fromAdmin: boolean; createdAt: string }[]>([]);
  const [memberChatInput, setMemberChatInput] = useState('');
  const [memberTab, setMemberTab] = useState<'profile' | 'chat'>('profile');
  const [setPasswordToken, setSetPasswordToken] = useState<string | null>(null);
  const [setPasswordInput, setSetPasswordInput] = useState('');
  const [setPasswordConfirm, setSetPasswordConfirm] = useState('');
  const [setPasswordLoading, setSetPasswordLoading] = useState(false);
  const [setPasswordError, setSetPasswordError] = useState<string | null>(null);
  const [setPasswordDone, setSetPasswordDone] = useState(false);
  const [memberPassword, setMemberPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);

  useEffect(() => {
    const detected = detectOS();
    setOs(detected);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const h = d.getHours() % 12 || 12, m = d.getMinutes(), ap = d.getHours() >= 12 ? 'PM' : 'AM';
      setClock(`${days[d.getDay()]} ${h}:${m < 10 ? '0' : ''}${m} ${ap}`);
    };
    tick(); const t = setInterval(tick, 10000); return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch('/api/content').then(r => r.json()).then(setContent).catch(() => {});
    fetch('/api/analytics/track', { method: 'POST' }).catch(() => {});
    const pollVisitors = async () => {
      try {
        const res = await fetch(`/api/analytics/visitors?since=${lastPoll.current}`);
        const views = await res.json();
        lastPoll.current = new Date().toISOString();
        if (Array.isArray(views) && views.length > 0) {
          const v = views[0];
          const id = v.id;
          setToasts(prev => [...prev.slice(-2), { id, city: v.city, country: v.country, browser: v.browser, device: v.device }]);
          setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 6000);
        }
      } catch {}
    };
    const timer = setInterval(pollVisitors, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/member/auth').then(r => r.ok ? r.json() : null).then(d => {
      if (d?.userId) {
        setMemberUser(d);
        fetch('/api/member/profile').then(r => r.json()).then(p => { setMemberProfile(p); setMemberProfileEdits(p); });
        fetch('/api/member/chat').then(r => r.json()).then(msgs => Array.isArray(msgs) && setMemberMessages(msgs));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('set-password');
    if (token) {
      setSetPasswordToken(token);
      window.history.replaceState({}, '', window.location.pathname);
      openWin('profile');
    }
  }, []);

  useEffect(() => {
    fetch('/api/security-tools').then(r => r.json()).then(d => { if (Array.isArray(d)) setSecurityTools(d); }).catch(() => {});
    Promise.all([fetch('/api/products'), fetch('/api/fans')])
      .then(([p, f]) => Promise.all([p.json(), f.json()]))
      .then(([p, f]) => { setProducts(p); setFans(f); })
      .catch(console.error)
      .finally(() => {
        setTimeout(() => {
          setBooted(true);
          if (window.innerWidth >= 768) {
            openWin('store');
            setTimeout(() => openWin('fans'), 400);
          }
        }, 2200);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const focusWin = (id: string) => { const z = zTop + 1; setZTop(z); setZMap(m => ({ ...m, [id]: z })); };
  const openWin = (id: string) => { focusWin(id); setOpen(m => ({ ...m, [id]: true })); };
  const closeWin = (id: string) => setOpen(m => ({ ...m, [id]: false }));

  const c = (key: string) => content[key] ?? CONTENT_DEFAULTS[key] ?? '';

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setReqStatus('sending');
    try {
      const res = await fetch('/api/project-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqForm),
      });
      if (res.ok) { setReqStatus('sent'); setReqForm({ name: '', email: '', title: '', description: '' }); }
      else setReqStatus('error');
    } catch { setReqStatus('error'); }
  };

  const memberLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemberLoginLoading(true);
    setMemberLoginError(null);
    try {
      const body: Record<string, string> = { email: memberEmail };
      if (needsPassword || memberPassword) body.password = memberPassword;
      const res = await fetch('/api/member/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) {
        setMemberUser(data);
        setNeedsPassword(false);
        setMemberPassword('');
        fetch('/api/member/profile').then(r => r.json()).then(p => { setMemberProfile(p); setMemberProfileEdits(p); });
        fetch('/api/member/chat').then(r => r.json()).then(msgs => Array.isArray(msgs) && setMemberMessages(msgs));
      } else if (data.needsPassword) {
        setNeedsPassword(true);
        setMemberLoginError('This account has a password. Please enter it below.');
      } else {
        setMemberLoginError(data.error || 'Login failed');
      }
    } catch { setMemberLoginError('Something went wrong'); }
    finally { setMemberLoginLoading(false); }
  };

  const saveMemberProfile = async () => {
    setMemberProfileSaving(true);
    await fetch('/api/member/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(memberProfileEdits) });
    setMemberProfile({ ...memberProfileEdits });
    setMemberProfileSaving(false);
  };

  const sendMemberMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberChatInput.trim()) return;
    const content = memberChatInput;
    setMemberChatInput('');
    const res = await fetch('/api/member/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) });
    const msg = await res.json();
    if (msg.id) setMemberMessages(prev => [...prev, msg]);
  };

  const appsMeta = [
    { id: 'store',   icon: c('app.store.icon'),   label: c('app.store.label'),   gradient: 'linear-gradient(160deg,#7c6cff,#3a1d6e)' },
    { id: 'members', icon: c('app.members.icon'), label: c('app.members.label'), gradient: 'linear-gradient(160deg,#1f6feb,#0d3a7a)' },
    { id: 'fans',    icon: c('app.fans.icon'),    label: c('app.fans.label'),    gradient: 'linear-gradient(160deg,#f5c451,#9a6a00)' },
    { id: 'request', icon: c('app.request.icon'), label: c('app.request.label'), gradient: 'linear-gradient(160deg,#ff9d4d,#7a3a00)' },
    { id: 'donate',  icon: c('app.donate.icon'),  label: c('app.donate.label'),  gradient: 'linear-gradient(160deg,#ff6ba8,#7a1d47)' },
    { id: 'about',   icon: c('app.about.icon'),   label: c('app.about.label'),   gradient: 'linear-gradient(160deg,#35d6c7,#0e5a52)' },
    { id: 'profile', icon: c('app.profile.icon'), label: c('app.profile.label'), gradient: 'linear-gradient(160deg,#1a8a6a,#0a3d2a)' },
  ];

  const wins = [
    { id: 'store',   title: c('win.store.title'),   subtitle: c('win.store.subtitle') || undefined },
    { id: 'fans',    title: c('win.fans.title'),    subtitle: c('win.fans.subtitle') || undefined },
    { id: 'members', title: c('win.members.title'), subtitle: c('win.members.subtitle') || undefined },
    { id: 'request', title: c('win.request.title'), subtitle: c('win.request.subtitle') || undefined },
    { id: 'donate',  title: c('win.donate.title'),  subtitle: c('win.donate.subtitle') || undefined },
    { id: 'about',   title: c('win.about.title'),   subtitle: c('win.about.subtitle') || undefined },
    { id: 'profile', title: c('win.profile.title'), subtitle: c('win.profile.subtitle') || undefined },
  ];

  const winStyles: Record<string, React.CSSProperties> = {
    store: { width: 'min(660px,92vw)', top: 76, left: 'calc(50% - 300px)' },
    fans: { width: 'min(440px,92vw)', top: 120, left: 'calc(50% + 80px)' },
    members: { width: 'min(680px,92vw)', top: 100, left: 'calc(50% - 340px)' },
    request: { width: 'min(520px,92vw)', top: 110, left: 'calc(50% - 260px)' },
    donate: { width: 'min(380px,92vw)', top: 130, left: 'calc(50% - 190px)' },
    about: { width: 'min(420px,92vw)', top: 120, left: 'calc(50% - 210px)' },
    profile: { width: 'min(500px,92vw)', top: 90, left: 'calc(50% - 250px)' },
  };

  /* ── shared content ───────────────────────────────────── */
  const renderContent = (id: string) => {
    if (id === 'store') return (
      <>
        <p style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '1.8px', color: '#9d90ff', fontWeight: 700, marginBottom: 8 }}>{c('store.label')}</p>
        <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 3 }}>{c('store.heading')}</h2>
        <p style={{ fontSize: 13, color: '#a7aecb', marginBottom: 16 }}>{c('store.subheading')}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14 }}>
          {products.length === 0 ? (
            <p style={{ color: '#7d84a6', fontSize: 13, gridColumn: '1/-1', padding: '20px 0' }}>
              No products yet — check back soon.
            </p>
          ) : products.map(p => (
            <div key={p.id} style={{ background: 'var(--glass-2)', border: '1px solid var(--stroke-2)',
              borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 86, display: 'grid', placeItems: 'center', fontSize: 30,
                background: p.gradient, position: 'relative' }}>
                {p.isNew && <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 9,
                  fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase',
                  padding: '3px 7px', borderRadius: 20, background: 'rgba(0,0,0,.4)',
                  border: '1px solid rgba(245,196,81,.4)', color: '#ffd36b' }}>New</span>}
                {p.requiresMembership && <span style={{ position: 'absolute', top: 8, right: 8 }}>🔒</span>}
                {p.icon || '📦'}
              </div>
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                <h3 style={{ fontSize: 14, fontWeight: 650 }}>{p.name}</h3>
                <p style={{ fontSize: 11.5, color: '#a7aecb', lineHeight: 1.45, margin: 0,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.description}
                </p>
                <button onClick={() => setPreviewProduct(p)}
                  style={{ alignSelf: 'flex-start', fontSize: 11, color: '#9d90ff', background: 'none',
                    border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', textDecoration: 'underline',
                    textDecorationColor: 'rgba(157,144,255,.4)', textUnderlineOffset: 2 }}>
                  Read more →
                </button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{p.isFree ? 'Free' : `£${(p.price / 100).toFixed(2)}`}</span>
                  <button onClick={() => setCheckout(p)}
                    style={{ background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff',
                      border: 'none', borderRadius: 9, padding: '7px 12px', fontSize: 12,
                      fontWeight: 650, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {p.isFree ? 'Open' : p.requiresMembership ? 'Unlock' : 'Buy'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Security Toolkit ── */}
        <div style={{ marginTop: 32 }}>
          {/* section divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--stroke-2)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 7,
              background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)',
              borderRadius: 20, padding: '5px 14px', fontSize: 10.5, fontWeight: 800,
              color: '#f87171', letterSpacing: '.1em', textTransform: 'uppercase' }}>
              🛡️ Security Toolkit · GitHub
            </div>
            <div style={{ flex: 1, height: 1, background: 'var(--stroke-2)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(168px,1fr))', gap: 12 }}>
            {securityTools.map(tool => (
              <div key={tool.name} style={{ background: 'var(--glass-2)', border: '1px solid var(--stroke-2)',
                borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                transition: 'border-color .2s', cursor: 'default' }}>

                {/* banner */}
                <div style={{ height: 78, background: tool.gradient, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 32, position: 'relative' }}>
                  {tool.icon}
                  <span style={{ position: 'absolute', top: 7, right: 7, fontSize: 9, fontWeight: 700,
                    background: 'rgba(0,0,0,.45)', border: '1px solid rgba(255,255,255,.15)',
                    borderRadius: 20, padding: '2px 7px', color: 'rgba(255,255,255,.85)',
                    letterSpacing: '.04em' }}>⭐ {tool.stars}</span>
                  <span style={{ position: 'absolute', bottom: 7, left: 8, fontSize: 9, fontWeight: 700,
                    background: 'rgba(0,0,0,.4)', border: '1px solid rgba(255,255,255,.1)',
                    borderRadius: 6, padding: '2px 6px', color: 'rgba(255,255,255,.7)' }}>{tool.language}</span>
                </div>

                {/* body */}
                <div style={{ padding: '11px 12px 8px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{tool.name}</div>
                  <span style={{ alignSelf: 'flex-start', fontSize: 9, fontWeight: 700, padding: '2px 7px',
                    borderRadius: 10, background: 'rgba(239,68,68,.1)',
                    border: '1px solid rgba(239,68,68,.22)', color: '#f87171', letterSpacing: '.05em',
                    textTransform: 'uppercase' }}>{tool.category}</span>
                  <p style={{ fontSize: 11, color: '#a7aecb', lineHeight: 1.55, margin: 0,
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden' }}>
                    {tool.description}
                  </p>
                </div>

                {/* actions */}
                <div style={{ padding: '8px 12px 12px', display: 'flex', gap: 6 }}>
                  <a href={tool.githubUrl} target="_blank" rel="noopener noreferrer"
                    style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '7px 4px',
                      background: 'rgba(255,255,255,.06)', border: '1px solid var(--stroke)',
                      borderRadius: 8, fontSize: 11, fontWeight: 650, color: '#dfe3f4',
                      textDecoration: 'none' }}>
                    GitHub →
                  </a>
                  {tool.demoUrl && (
                    <a href={tool.demoUrl} target="_blank" rel="noopener noreferrer"
                      style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '7px 4px',
                        background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', border: 'none',
                        borderRadius: 8, fontSize: 11, fontWeight: 650, color: '#fff',
                        textDecoration: 'none' }}>
                      Demo →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );

    if (id === 'fans') return (
      <>
        <p style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '1.8px', color: '#9d90ff', fontWeight: 700, marginBottom: 8 }}>{c('fans.label')}</p>
        <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 3 }}>{c('fans.heading')}</h2>
        <p style={{ fontSize: 13, color: '#a7aecb', marginBottom: 16 }}>{c('fans.subheading')}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {fans.length === 0 ? (
            <p style={{ color: '#7d84a6', fontSize: 13, padding: '20px 0' }}>No fans yet — be the first to support!</p>
          ) : fans.map(fan => {
            const medal = fan.rank === 1 ? '🥇' : fan.rank === 2 ? '🥈' : fan.rank === 3 ? '🥉' : fan.rank;
            return (
              <div key={fan.id} style={{ display: 'grid', gridTemplateColumns: '44px 1fr auto',
                alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14,
                background: fan.rank <= 3 ? 'linear-gradient(90deg,rgba(124,108,255,.14),transparent)' : 'rgba(255,255,255,.02)',
                border: fan.rank <= 3 ? '1px solid var(--stroke-2)' : '1px solid transparent' }}>
                <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 800 }}>{medal}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center',
                    fontSize: 14, fontWeight: 700, color: '#0a0d1c', background: fan.avatarColor, flexShrink: 0 }}>{fan.initials}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{fan.displayName}</div>
                    <div style={{ fontSize: 11.5, color: '#7d84a6' }}>{fan.membershipTier || 'Explorer'}</div>
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
    );

    if (id === 'members') {
      const tierPerks: Record<string, string[]> = {
        explorer:  ['Browse every launch', 'Free product: PromptDeck', 'Community changelog'],
        supporter: ['Everything in Explorer', 'Early access to launches', 'Name on Supporters wall', 'Vote on the roadmap'],
        insider:   ['Everything in Supporter', 'Entire product library', 'Top 10 Fans eligible', 'Source access + build logs', 'Monthly office hours'],
      };
      const tierColor: Record<string, string> = {
        explorer: '#3ddc97', supporter: '#9d90ff', insider: '#f5c451',
      };
      const tier = memberUser?.tier ?? '';
      const tierName = memberUser?.tierName ?? '';

      if (memberUser) return (
        <>
          {/* member dashboard */}
          <p style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '1.8px', color: '#9d90ff', fontWeight: 700, marginBottom: 8 }}>Your membership</p>

          {/* tier hero */}
          <div style={{ background: 'linear-gradient(135deg,rgba(124,108,255,.18),rgba(124,108,255,.06))',
            border: '1px solid rgba(124,108,255,.35)', borderRadius: 18, padding: '22px 20px', marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.2, color: '#a7aecb', marginBottom: 4 }}>Active plan</div>
                <div style={{ fontSize: 26, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                  🪪 {tierName || 'Member'}
                  <span style={{ fontSize: 12, background: tierColor[tier] ? `${tierColor[tier]}22` : 'rgba(157,144,255,.15)',
                    color: tierColor[tier] || '#9d90ff', border: `1px solid ${tierColor[tier] || '#9d90ff'}55`,
                    borderRadius: 20, padding: '3px 12px', fontWeight: 600 }}>{tier}</span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#7d84a6', textAlign: 'right' }}>
                <div>{memberUser.email}</div>
              </div>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13, color: '#d7dcf1' }}>
              {(tierPerks[tier] || tierPerks['supporter']).map(f => (
                <li key={f} style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: tierColor[tier] || '#9d90ff', fontWeight: 800 }}>✓</span>{f}
                </li>
              ))}
            </ul>
          </div>

          {/* quick actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            <button onClick={() => openWin('profile')}
              style={{ background: 'rgba(53,214,199,.1)', border: '1px solid rgba(53,214,199,.25)',
                color: '#35d6c7', borderRadius: 12, padding: '13px', fontSize: 13, fontWeight: 650,
                cursor: 'pointer', fontFamily: 'inherit' }}>
              👤 My profile
            </button>
            <button onClick={() => openWin('request')}
              style={{ background: 'rgba(255,157,77,.08)', border: '1px solid rgba(255,157,77,.2)',
                color: '#ff9d4d', borderRadius: 12, padding: '13px', fontSize: 13, fontWeight: 650,
                cursor: 'pointer', fontFamily: 'inherit' }}>
              💡 Request build
            </button>
          </div>

          {/* upgrade path — only show if not already Insider */}
          {tier !== 'insider' && (
            <div style={{ background: 'var(--glass-2)', border: '1px solid rgba(245,196,81,.3)',
              borderRadius: 16, padding: '20px 18px', position: 'relative', marginBottom: 18 }}>
              <div style={{ position: 'absolute', top: -11, left: 20,
                background: 'linear-gradient(180deg,#f5c451,#b88a00)', color: '#1a1200', fontSize: 10,
                fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 20 }}>Upgrade</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Insider</h3>
                <div style={{ fontSize: 22, fontWeight: 800 }}>£15<small style={{ fontSize: 13, fontWeight: 500, color: '#a7aecb' }}>/mo</small></div>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#d7dcf1', marginBottom: 14 }}>
                {tierPerks.insider.map(f => <li key={f} style={{ display: 'flex', gap: 8 }}><span style={{ color: '#f5c451', fontWeight: 800 }}>✓</span>{f}</li>)}
              </ul>
              <button onClick={() => setCheckout({ id: 'Insider', name: 'Insider membership', description: '', icon: '🪪', price: 1500, isFree: false, isNew: false, requiresMembership: null, artifactUrl: null, githubUrl: null, vercelUrl: null, gradient: 'linear-gradient(160deg,#7c6cff,#3a1d6e)' })}
                style={{ background: 'linear-gradient(180deg,#f5c451,#b88a00)', color: '#1a1200',
                  border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}>
                Upgrade to Insider · £15/mo
              </button>
            </div>
          )}
        </>
      );

      return (
        <>
          <p style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '1.8px', color: '#9d90ff', fontWeight: 700, marginBottom: 8 }}>{c('members.label')}</p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 3 }}>{c('members.heading')}</h2>
          <p style={{ fontSize: 13, color: '#a7aecb', marginBottom: 16 }}>{c('members.subheading')}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { name: 'Explorer', price: 0, feat: false, features: tierPerks.explorer },
              { name: 'Supporter', price: 5, feat: true, features: tierPerks.supporter },
              { name: 'Insider', price: 15, feat: false, features: tierPerks.insider },
            ].map(t => (
              <div key={t.name} style={{ background: 'var(--glass-2)',
                border: `1px solid ${t.feat ? 'rgba(124,108,255,.55)' : 'var(--stroke-2)'}`,
                borderRadius: 16, padding: '20px 18px', position: 'relative',
                boxShadow: t.feat ? '0 0 0 1px rgba(124,108,255,.25),0 18px 40px rgba(124,108,255,.16)' : undefined }}>
                {t.feat && <div style={{ position: 'absolute', top: -11, left: 20,
                  background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff', fontSize: 10,
                  fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 20 }}>Popular</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{t.name}</h3>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>£{t.price}<small style={{ fontSize: 13, fontWeight: 500, color: '#a7aecb' }}>/mo</small></div>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#d7dcf1', marginBottom: 14 }}>
                  {t.features.map(f => <li key={f} style={{ display: 'flex', gap: 8 }}><span style={{ color: '#3ddc97', fontWeight: 800 }}>✓</span>{f}</li>)}
                </ul>
                <button onClick={() => t.price > 0 ? setCheckout({ id: t.name, name: `${t.name} membership`, description: '', icon: '🪪', price: t.price * 100, isFree: false, isNew: false, requiresMembership: null, artifactUrl: null, githubUrl: null, vercelUrl: null, gradient: 'linear-gradient(160deg,#7c6cff,#3a1d6e)' }) : undefined}
                  style={{ background: t.price === 0 ? 'rgba(255,255,255,.08)' : 'linear-gradient(180deg,#9d90ff,#7c6cff)',
                    color: '#fff', border: t.price === 0 ? '1px solid var(--stroke)' : 'none',
                    borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 650, cursor: 'pointer',
                    width: '100%', fontFamily: 'inherit' }}>
                  {t.price === 0 ? 'Get started free' : `Subscribe · £${t.price}/mo`}
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, padding: '16px 18px', background: 'rgba(255,157,77,.06)',
            border: '1px solid rgba(255,157,77,.2)', borderRadius: 14, display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 650, marginBottom: 3 }}>💡 Got a project idea?</div>
              <div style={{ fontSize: 12, color: '#a7aecb' }}>Tell me what you want built — top requests shape the roadmap.</div>
            </div>
            <button onClick={() => openWin('request')}
              style={{ background: 'linear-gradient(180deg,#ff9d4d,#c96a00)', color: '#fff', border: 'none',
                borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 650,
                cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
              Request →
            </button>
          </div>
        </>
      );
    }

    if (id === 'request') return (
      <>
        <p style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '1.8px', color: '#ff9d4d', fontWeight: 700, marginBottom: 8 }}>{c('request.label')}</p>
        <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 3 }}>{c('request.heading')}</h2>
        <p style={{ fontSize: 13, color: '#a7aecb', marginBottom: 20 }}>{c('request.subheading')}</p>

        {reqStatus === 'sent' ? (
          <div style={{ background: 'rgba(61,220,151,.08)', border: '1px solid rgba(61,220,151,.25)',
            borderRadius: 16, padding: '32px 20px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 40 }}>🎉</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#3ddc97' }}>Request submitted!</p>
            <p style={{ fontSize: 13, color: '#a7aecb', maxWidth: '32ch' }}>I&apos;ll review it and add top requests to the roadmap.</p>
            <button onClick={() => { setReqStatus('idle'); setReqForm({ name: '', email: '', title: '', description: '' }); }}
              style={{ marginTop: 4, fontSize: 13, color: '#9d90ff', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Submit another
            </button>
          </div>
        ) : (
          <form onSubmit={submitRequest} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {(['name', 'email'] as const).map(field => (
                <input key={field} required type={field === 'email' ? 'email' : 'text'}
                  value={reqForm[field]} onChange={e => setReqForm(f => ({ ...f, [field]: e.target.value }))}
                  placeholder={field === 'name' ? 'Your name' : 'Your email'}
                  style={{ background: 'rgba(255,255,255,.05)', border: '1px solid var(--stroke)',
                    borderRadius: 10, padding: '11px 13px', fontSize: 13, color: '#eef1fb',
                    fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
              ))}
            </div>
            <input required value={reqForm.title} onChange={e => setReqForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Project title — e.g. AI invoice scanner"
              style={{ background: 'rgba(255,255,255,.05)', border: '1px solid var(--stroke)',
                borderRadius: 10, padding: '11px 13px', fontSize: 13, color: '#eef1fb',
                fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
            <textarea required rows={4} value={reqForm.description}
              onChange={e => setReqForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What does it do? Why do you need it? Who would use it?"
              style={{ background: 'rgba(255,255,255,.05)', border: '1px solid var(--stroke)',
                borderRadius: 10, padding: '11px 13px', fontSize: 13, color: '#eef1fb',
                fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
                resize: 'vertical', lineHeight: 1.55 }} />
            {reqStatus === 'error' && (
              <p style={{ fontSize: 12, color: '#ff7c78', margin: 0 }}>Something went wrong — try again.</p>
            )}
            <button type="submit" disabled={reqStatus === 'sending'}
              style={{ background: reqStatus === 'sending' ? 'rgba(255,157,77,.4)' : 'linear-gradient(180deg,#ff9d4d,#c96a00)',
                color: '#fff', border: 'none', borderRadius: 12, padding: '13px',
                fontSize: 14, fontWeight: 650, cursor: reqStatus === 'sending' ? 'wait' : 'pointer',
                fontFamily: 'inherit', transition: 'opacity .15s' }}>
              {reqStatus === 'sending' ? 'Sending…' : '🚀 Submit request'}
            </button>
          </form>
        )}
      </>
    );

    if (id === 'donate') return (
      <>
        <p style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '1.8px', color: '#9d90ff', fontWeight: 700, marginBottom: 8 }}>{c('donate.label')}</p>
        <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 3 }}>{c('donate.heading')}</h2>
        <p style={{ fontSize: 13, color: '#a7aecb', marginBottom: 16 }}>{c('donate.subheading')}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
          {[3, 7, 15, 30, 50].map(a => (
            <span key={a} onClick={() => setDonateAmt(a)} style={{
              padding: '11px 18px', borderRadius: 50,
              border: `1px solid ${donateAmt === a ? 'transparent' : 'var(--stroke)'}`,
              background: donateAmt === a ? 'linear-gradient(180deg,#9d90ff,#7c6cff)' : 'rgba(255,255,255,.05)',
              fontWeight: 650, fontSize: 15, cursor: 'pointer', color: donateAmt === a ? '#fff' : '#eef1fb',
            }}>£{a}</span>
          ))}
        </div>
        <button onClick={() => setCheckout({ id: 'donate', name: `£${donateAmt} tip`, description: '', icon: '💛', price: donateAmt * 100, isFree: false, isNew: false, requiresMembership: null, artifactUrl: null, githubUrl: null, vercelUrl: null, gradient: 'linear-gradient(160deg,#f5c451,#9a6a00)' })}
          style={{ background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff',
            border: 'none', borderRadius: 14, padding: '15px', fontSize: 15,
            fontWeight: 650, cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}>
          Donate £{donateAmt}
        </button>
        <div style={{ fontSize: 13, color: '#a7aecb', display: 'flex', gap: 8, alignItems: 'center', marginTop: 14 }}>
          💛 <span>142 supporters have tipped this month</span>
        </div>
      </>
    );

    if (id === 'about') return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 88, height: 88, borderRadius: 24, margin: '6px auto 18px', display: 'grid',
          placeItems: 'center', fontSize: 38, background: 'linear-gradient(160deg,#35d6c7,#9d90ff)',
          color: '#0a0d1c', fontWeight: 800 }}>L</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{c('about.heading')}</h2>
        <p style={{ fontSize: 14, color: '#a7aecb', maxWidth: '36ch', margin: '0 auto 20px', lineHeight: 1.6 }}>
          {c('about.body')}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => { closeWin('about'); openWin('store'); }}
            style={{ background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff',
              border: 'none', borderRadius: 12, padding: '12px 20px', fontSize: 14,
              fontWeight: 650, cursor: 'pointer', fontFamily: 'inherit' }}>Browse products</button>
          <button onClick={() => { closeWin('about'); openWin('members'); }}
            style={{ background: 'rgba(255,255,255,.08)', color: '#e7ebfb',
              border: '1px solid var(--stroke)', borderRadius: 12, padding: '12px 20px',
              fontSize: 14, fontWeight: 650, cursor: 'pointer', fontFamily: 'inherit' }}>Become a member</button>
        </div>
      </div>
    );

    if (id === 'profile') {
      const inputStyle: React.CSSProperties = {
        background: 'rgba(255,255,255,.05)', border: '1px solid var(--stroke)',
        borderRadius: 9, padding: '10px 13px', fontSize: 13, color: '#eef1fb',
        fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
      };
      if (!memberUser && setPasswordToken) return (
        <div>
          <p style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '1.8px', color: '#1a8a6a', fontWeight: 700, marginBottom: 8 }}>Welcome to lanrae</p>
          <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 6 }}>{setPasswordDone ? 'Password set!' : 'Set your password'}</h2>
          {setPasswordDone ? (
            <p style={{ fontSize: 13, color: '#a7aecb' }}>You're all set. You can now log in with your email and password.</p>
          ) : (
            <form onSubmit={async e => {
              e.preventDefault();
              if (setPasswordInput !== setPasswordConfirm) { setSetPasswordError('Passwords do not match'); return; }
              if (setPasswordInput.length < 6) { setSetPasswordError('Password must be at least 6 characters'); return; }
              setSetPasswordLoading(true); setSetPasswordError(null);
              try {
                const res = await fetch('/api/member/set-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: setPasswordToken, password: setPasswordInput }) });
                const data = await res.json();
                if (!res.ok) { setSetPasswordError(data.error || 'Something went wrong'); return; }
                setSetPasswordDone(true);
                setSetPasswordToken(null);
                const authRes = await fetch('/api/member/auth');
                if (authRes.ok) {
                  const auth = await authRes.json();
                  if (auth?.userId) {
                    setMemberUser(auth);
                    fetch('/api/member/profile').then(r => r.json()).then(p => { setMemberProfile(p); setMemberProfileEdits(p); });
                    fetch('/api/member/chat').then(r => r.json()).then(msgs => Array.isArray(msgs) && setMemberMessages(msgs));
                  }
                }
              } catch { setSetPasswordError('Network error — please try again'); }
              finally { setSetPasswordLoading(false); }
            }} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              <input required type="password" placeholder="New password" value={setPasswordInput} onChange={e => setSetPasswordInput(e.target.value)} style={inputStyle} />
              <input required type="password" placeholder="Confirm password" value={setPasswordConfirm} onChange={e => setSetPasswordConfirm(e.target.value)} style={inputStyle} />
              {setPasswordError && <div style={{ background: 'rgba(255,95,87,.08)', border: '1px solid rgba(255,95,87,.25)', borderRadius: 9, padding: '10px 13px', fontSize: 13, color: '#ff7c78' }}>{setPasswordError}</div>}
              <button type="submit" disabled={setPasswordLoading}
                style={{ background: setPasswordLoading ? 'rgba(26,138,106,.5)' : 'linear-gradient(180deg,#1a8a6a,#0a3d2a)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 14, fontWeight: 650, cursor: setPasswordLoading ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
                {setPasswordLoading ? 'Setting password…' : 'Set password & sign in'}
              </button>
            </form>
          )}
        </div>
      );
      if (!memberUser) return (
        <div>
          {setPasswordToken && !setPasswordDone ? (
            <>
              <p style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '1.8px', color: '#1a8a6a', fontWeight: 700, marginBottom: 8 }}>Set Password</p>
              <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 6 }}>Secure your account</h2>
              <p style={{ fontSize: 13, color: '#a7aecb', marginBottom: 20 }}>Create a password to protect your lanraeAi account.</p>
              <form onSubmit={async e => {
                e.preventDefault();
                if (setPasswordInput !== setPasswordConfirm) { setSetPasswordError('Passwords do not match'); return; }
                if (setPasswordInput.length < 6) { setSetPasswordError('Password must be at least 6 characters'); return; }
                setSetPasswordLoading(true);
                setSetPasswordError(null);
                try {
                  const res = await fetch('/api/member/set-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: setPasswordToken, password: setPasswordInput }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setSetPasswordDone(true);
                    setSetPasswordToken(null);
                    // Auto-log in — the API sets the cookie, re-fetch auth
                    const authRes = await fetch('/api/member/auth');
                    const authData = authRes.ok ? await authRes.json() : null;
                    if (authData?.userId) {
                      setMemberUser(authData);
                      fetch('/api/member/profile').then(r => r.json()).then(p => { setMemberProfile(p); setMemberProfileEdits(p); });
                      fetch('/api/member/chat').then(r => r.json()).then(msgs => Array.isArray(msgs) && setMemberMessages(msgs));
                    }
                  } else {
                    setSetPasswordError(data.error || 'Failed to set password');
                  }
                } catch { setSetPasswordError('Something went wrong'); }
                finally { setSetPasswordLoading(false); }
              }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input required type="password" placeholder="New password (min 6 chars)" value={setPasswordInput}
                  onChange={e => setSetPasswordInput(e.target.value)} style={inputStyle} />
                <input required type="password" placeholder="Confirm password" value={setPasswordConfirm}
                  onChange={e => setSetPasswordConfirm(e.target.value)} style={inputStyle} />
                {setPasswordError && (
                  <div style={{ background: 'rgba(255,95,87,.08)', border: '1px solid rgba(255,95,87,.25)', borderRadius: 9, padding: '10px 13px', fontSize: 13, color: '#ff7c78' }}>
                    {setPasswordError}
                  </div>
                )}
                <button type="submit" disabled={setPasswordLoading}
                  style={{ background: setPasswordLoading ? 'rgba(26,138,106,.5)' : 'linear-gradient(180deg,#1a8a6a,#0a3d2a)', color: '#fff',
                    border: 'none', borderRadius: 10, padding: '13px', fontSize: 14, fontWeight: 650,
                    cursor: setPasswordLoading ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
                  {setPasswordLoading ? 'Setting password…' : 'Set password & sign in'}
                </button>
              </form>
            </>
          ) : (
            <>
              <p style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '1.8px', color: '#1a8a6a', fontWeight: 700, marginBottom: 8 }}>Member Area</p>
              <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 6 }}>Access your profile</h2>
              <p style={{ fontSize: 13, color: '#a7aecb', marginBottom: 20 }}>Enter the email address you used when purchasing a Supporter or Insider membership.</p>
              <form onSubmit={memberLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input required type="email" placeholder="your@email.com" value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)} style={inputStyle} />
                {needsPassword && (
                  <input required type="password" placeholder="Password" value={memberPassword}
                    onChange={e => setMemberPassword(e.target.value)} style={inputStyle} autoFocus />
                )}
                {memberLoginError && (
                  <div style={{ background: 'rgba(255,95,87,.08)', border: '1px solid rgba(255,95,87,.25)', borderRadius: 9, padding: '10px 13px', fontSize: 13, color: '#ff7c78' }}>
                    {memberLoginError}
                    {memberLoginError.includes('membership') && (
                      <span> — <button type="button" onClick={() => { closeWin('profile'); openWin('members'); }}
                        style={{ color: '#9d90ff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, textDecoration: 'underline', padding: 0 }}>
                        get membership
                      </button></span>
                    )}
                  </div>
                )}
                <button type="submit" disabled={memberLoginLoading}
                  style={{ background: memberLoginLoading ? 'rgba(26,138,106,.5)' : 'linear-gradient(180deg,#1a8a6a,#0a3d2a)', color: '#fff',
                    border: 'none', borderRadius: 10, padding: '13px', fontSize: 14, fontWeight: 650,
                    cursor: memberLoginLoading ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
                  {memberLoginLoading ? 'Checking…' : needsPassword ? 'Sign in' : 'Access my profile'}
                </button>
              </form>
            </>
          )}
        </div>
      );
      return (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#7d84a6' }}>Signed in as <b style={{ color: '#a7aecb' }}>{memberUser.email}</b></div>
            <button onClick={async () => { await fetch('/api/member/auth', { method: 'DELETE' }); setMemberUser(null); setMemberEmail(''); }}
              style={{ background: 'rgba(255,95,87,.12)', color: '#ff7c78', border: '1px solid rgba(255,95,87,.2)', borderRadius: 7, padding: '5px 11px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
              Sign out
            </button>
          </div>
          <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: 3 }}>
            {(['profile', 'chat'] as const).map(t => (
              <button key={t} onClick={() => setMemberTab(t)}
                style={{ flex: 1, background: memberTab === t ? 'linear-gradient(180deg,#1a8a6a,#0a3d2a)' : 'none',
                  border: 'none', color: memberTab === t ? '#fff' : '#a7aecb', padding: '8px', borderRadius: 8,
                  fontSize: 13, fontWeight: memberTab === t ? 650 : 400, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
                {t === 'profile' ? '👤 Profile' : '💬 Chat'}
              </button>
            ))}
          </div>

          {memberTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'displayName', label: 'Display name', placeholder: 'How you want to be known' },
                { key: 'designation', label: 'Job title / designation', placeholder: 'e.g. Full Stack Engineer' },
                { key: 'cvUrl', label: 'CV / resume URL', placeholder: 'https://...' },
                { key: 'profilePicUrl', label: 'Profile picture URL', placeholder: 'https://...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</label>
                  <input value={(memberProfileEdits[key] as string) || ''} placeholder={placeholder}
                    onChange={e => setMemberProfileEdits(p => ({ ...p, [key]: e.target.value }))} style={inputStyle} />
                </div>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>Bio</label>
                <textarea rows={3} value={(memberProfileEdits.bio as string) || ''} placeholder="A short bio about yourself"
                  onChange={e => setMemberProfileEdits(p => ({ ...p, bio: e.target.value }))}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.55 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, color: '#a7aecb', textTransform: 'uppercase', letterSpacing: '.5px' }}>GitHub repos (one per line)</label>
                <textarea rows={3} value={Array.isArray(memberProfileEdits.repos) ? (memberProfileEdits.repos as string[]).join('\n') : (memberProfileEdits.repos as string) || ''}
                  placeholder="https://github.com/you/repo"
                  onChange={e => setMemberProfileEdits(p => ({ ...p, repos: e.target.value as unknown as string }))}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.55 }} />
              </div>
              <button onClick={saveMemberProfile} disabled={memberProfileSaving}
                style={{ background: memberProfileSaving ? 'rgba(26,138,106,.5)' : 'linear-gradient(180deg,#1a8a6a,#0a3d2a)', color: '#fff',
                  border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 650,
                  cursor: memberProfileSaving ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
                {memberProfileSaving ? 'Saving…' : 'Save profile'}
              </button>
            </div>
          )}

          {memberTab === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid var(--stroke)', borderRadius: 12, padding: 12, minHeight: 200, maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {memberMessages.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#7d84a6', margin: 'auto', textAlign: 'center' }}>No messages yet — say hello!</p>
                ) : memberMessages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.fromAdmin ? 'flex-start' : 'flex-end' }}>
                    <div style={{ maxWidth: '78%', background: msg.fromAdmin ? 'rgba(255,255,255,.08)' : 'linear-gradient(160deg,#1a8a6a,#0a3d2a)',
                      borderRadius: msg.fromAdmin ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                      padding: '9px 13px', fontSize: 13, lineHeight: 1.5 }}>
                      {msg.fromAdmin && <div style={{ fontSize: 10, color: '#1a8a6a', fontWeight: 700, marginBottom: 3 }}>lanrae</div>}
                      {msg.content}
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 3, textAlign: 'right' }}>
                        {new Date(msg.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMemberMessage} style={{ display: 'flex', gap: 8 }}>
                <input value={memberChatInput} onChange={e => setMemberChatInput(e.target.value)}
                  placeholder="Send a message to lanrae…" style={{ ...inputStyle, flex: 1 }} />
                <button type="submit"
                  style={{ background: 'linear-gradient(180deg,#1a8a6a,#0a3d2a)', color: '#fff', border: 'none',
                    borderRadius: 9, padding: '10px 16px', fontSize: 13, fontWeight: 650, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const countryFlag = (code: string | null) => {
    if (!code || code.length !== 2) return '🌍';
    return code.toUpperCase().replace(/./g, ch => String.fromCodePoint(ch.charCodeAt(0) + 127397));
  };

  const visitorToasts = toasts.length > 0 && (
    <div style={{ position: 'fixed', bottom: 88, left: 16, zIndex: 1500,
      display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: 'rgba(14,18,40,.88)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,.12)', borderRadius: 12,
          padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 13, color: '#eef1fb', boxShadow: '0 8px 24px rgba(0,0,0,.5)',
          animation: 'rise .35s cubic-bezier(.2,.9,.3,1.1)',
          fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif',
        }}>
          <span style={{ fontSize: 18 }}>{countryFlag(t.country)}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 12 }}>
              {t.city && t.country ? `${t.city}, ${t.country}` : t.country || 'Unknown location'}
            </div>
            <div style={{ fontSize: 11, color: '#7d84a6', marginTop: 1 }}>
              {[t.browser, t.device].filter(Boolean).join(' · ')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const wallpaper = `
    radial-gradient(ellipse 130% 90% at 20% 35%, #2e1868 0%, transparent 52%),
    radial-gradient(ellipse 110% 80% at 80% 20%, #1a2a6e 0%, transparent 50%),
    radial-gradient(ellipse 100% 70% at 55% 75%, #1f1060 0%, transparent 52%),
    radial-gradient(ellipse 70% 55% at 60% 45%, #1a1550 0%, transparent 48%),
    radial-gradient(ellipse 50% 40% at 30% 70%, #251060 0%, transparent 45%),
    linear-gradient(150deg, #13103e 0%, #0e0e28 45%, #070812 100%)
  `;

  const bootScreen = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3000,
      background: 'radial-gradient(ellipse at 50% 45%, #12103a 0%, #0a0f26 50%, #05060f 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32,
      transition: 'opacity .8s cubic-bezier(.4,0,.2,1)', opacity: booted ? 0 : 1, pointerEvents: booted ? 'none' : 'auto' }}>
      <style>{`
        @keyframes logoIn{0%{opacity:0;transform:scale(.25) rotate(-8deg);filter:blur(18px)}55%{opacity:1;transform:scale(1.12) rotate(1.5deg);filter:blur(0)}75%{transform:scale(.97) rotate(0deg)}88%{transform:scale(1.04)}100%{transform:scale(1) rotate(0deg)}}
        @keyframes logoPulse{0%,100%{box-shadow:0 0 0 0 rgba(157,144,255,0)}50%{box-shadow:0 0 55px 18px rgba(157,144,255,.35),0 0 100px 35px rgba(124,108,255,.18)}}
        @keyframes textIn{0%{opacity:0;transform:translateY(10px) scaleX(.9);letter-spacing:.35em}100%{opacity:1;transform:translateY(0) scaleX(1);letter-spacing:-.01em}}
        @keyframes tagIn{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes spark1{0%,100%{opacity:0;transform:scale(0) rotate(0deg)}30%,70%{opacity:1;transform:scale(1) rotate(180deg)}}
        @keyframes spark2{0%,100%{opacity:0;transform:scale(0) rotate(45deg)}40%,65%{opacity:1;transform:scale(1.2) rotate(225deg)}}
        @keyframes barIn{0%{width:0;opacity:0}5%{opacity:1}100%{width:100%;opacity:1}}
        @keyframes dotPulse{0%,100%{opacity:.3;transform:scale(.7)}50%{opacity:1;transform:scale(1)}}
      `}</style>

      {/* sparkles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {[
          [200, 260, 18, '0s', 1.1], [380, 180, 10, '.4s', .8], [520, 310, 14, '.2s', 1],
          [150, 340, 8, '.6s', .7], [460, 230, 12, '.3s', .9], [330, 150, 7, '.5s', .6],
        ].map(([x, y, size, delay, dur], i) => (
          <div key={i} style={{ position: 'absolute', left: `calc(50% + ${(x as number) - 330}px)`, top: `calc(50% + ${(y as number) - 280}px)`,
            width: size as number, height: size as number, opacity: 0,
            animation: `${i % 2 === 0 ? 'spark1' : 'spark2'} ${dur as number * 1.4 + 1}s ${delay} ease-in-out infinite` }}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
              <path d="M12 2L13.5 9.5L21 12L13.5 14.5L12 22L10.5 14.5L3 12L10.5 9.5L12 2Z" fill="rgba(200,190,255,.7)"/>
            </svg>
          </div>
        ))}
      </div>

      {/* logo */}
      <div style={{ position: 'relative', animation: 'logoIn .9s cubic-bezier(.34,1.56,.64,1) .1s both' }}>
        <div style={{ animation: 'logoPulse 2.2s ease-in-out .8s infinite', borderRadius: 28 }}>
          <img src={c('site.logoUrl')} alt="lanrae"
            style={{ width: 110, height: 110, borderRadius: 28, display: 'block',
              boxShadow: '0 24px 64px rgba(124,108,255,.4), 0 8px 24px rgba(0,0,0,.5)' }} />
        </div>
      </div>

      {/* brand name */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-.01em', lineHeight: 1,
          animation: 'textIn .6s cubic-bezier(.34,1.2,.64,1) .75s both' }}>
          lanrae<span style={{ color: '#9d90ff' }}>Ai</span>
        </div>
        <div style={{ fontSize: 12, color: '#7d84a6', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 500,
          animation: 'tagIn .5s ease .95s both' }}>AI Product Development</div>
      </div>

      {/* progress bar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        animation: 'tagIn .4s ease 1.1s both' }}>
        <div style={{ width: 180, height: 3, borderRadius: 3, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#7c6cff,#9d90ff,#35d6c7)',
            borderRadius: 3, animation: 'barIn 1.8s cubic-bezier(.4,0,.2,1) 1.1s both' }} />
        </div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {[0, .15, .3].map(d => (
            <div key={d} style={{ width: 4, height: 4, borderRadius: '50%', background: '#7c6cff',
              animation: `dotPulse .9s ease ${d}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════
     iOS LAYOUT
  ════════════════════════════════════════════════════════ */
  if (isMobile && os === 'ios') {
    const timeOnly = clock.split(' ').slice(1).join(' ');
    return (
      <>
        {bootScreen}
        <style>{`@keyframes load{to{width:100%}} @keyframes rise{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}`}</style>
        <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: wallpaper,
          fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif' }}>

          {/* iOS status bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 50, zIndex: 200,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 22px 8px' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: -.3 }}>{timeOnly}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="17" height="12" viewBox="0 0 17 12" fill="white"><rect x="0" y="7" width="3" height="5" rx="1" opacity=".5"/><rect x="4.5" y="4.5" width="3" height="7.5" rx="1" opacity=".7"/><rect x="9" y="2" width="3" height="10" rx="1" opacity=".9"/><rect x="13.5" y="0" width="3" height="12" rx="1"/></svg>
              <svg width="16" height="12" viewBox="0 0 16 12" fill="white"><path d="M8 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/><path d="M8 6C5.8 6 3.8 6.9 2.3 8.4l1.4 1.4C4.9 8.7 6.4 8 8 8s3.1.7 4.3 1.8l1.4-1.4C12.2 6.9 10.2 6 8 6z" opacity=".7"/><path d="M8 2.5C4.5 2.5 1.4 3.9 0 6.2l1.5 1.5C2.9 5.5 5.3 4 8 4s5.1 1.5 6.5 3.7L16 6.2C14.6 3.9 11.5 2.5 8 2.5z" opacity=".4"/></svg>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 25, height: 12, borderRadius: 3, border: '1.5px solid rgba(255,255,255,.7)', position: 'relative', display: 'flex', alignItems: 'center', padding: '2px 2.5px' }}>
                  <div style={{ height: '100%', width: '72%', borderRadius: 1.5, background: '#3ddc97' }} />
                  <div style={{ position: 'absolute', right: -4, top: '50%', transform: 'translateY(-50%)', width: 2.5, height: 5, background: 'rgba(255,255,255,.5)', borderRadius: '0 1px 1px 0' }} />
                </div>
              </div>
            </div>
          </div>

          {/* date widget */}
          <div style={{ position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', fontWeight: 500 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <div style={{ fontSize: 68, fontWeight: 200, color: '#fff', lineHeight: 1.1, marginTop: 2 }}>
              {new Date().getDate()}
            </div>
          </div>

          {/* app grid */}
          <div style={{ position: 'absolute', top: 212, left: 0, right: 0, bottom: 110,
            padding: '0 20px', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '22px 8px' }}>
              {appsMeta.map(app => (
                <div key={app.id} onClick={() => openWin(app.id)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                  <div style={{ width: 62, height: 62, borderRadius: 15, background: app.gradient,
                    display: 'grid', placeItems: 'center', fontSize: 28,
                    boxShadow: '0 6px 18px rgba(0,0,0,.45)', border: '1px solid rgba(255,255,255,.12)' }}>{app.icon}</div>
                  <span style={{ fontSize: 11, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,.7)', textAlign: 'center', fontWeight: 500 }}>{app.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* iOS dock */}
          <div style={{ position: 'absolute', bottom: 12, left: 16, right: 16, zIndex: 200 }}>
            <div style={{ background: 'rgba(255,255,255,.14)', backdropFilter: 'blur(30px) saturate(160%)',
              borderRadius: 26, padding: '12px 16px', border: '1px solid rgba(255,255,255,.18)',
              display: 'flex', justifyContent: 'space-around' }}>
              {appsMeta.slice(0, 4).map(app => (
                <div key={app.id} onClick={() => openWin(app.id)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: app.gradient,
                    display: 'grid', placeItems: 'center', fontSize: 26,
                    boxShadow: '0 4px 14px rgba(0,0,0,.4)',
                    border: open[app.id] ? '2px solid rgba(157,144,255,.7)' : '1px solid rgba(255,255,255,.1)' }}>{app.icon}</div>
                  {open[app.id] && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff' }} />}
                </div>
              ))}
            </div>
          </div>

          {wins.map(w => (
            <Sheet key={w.id} open={!!open[w.id]} onClose={() => closeWin(w.id)} title={w.title} os={os}>
              {renderContent(w.id)}
            </Sheet>
          ))}
        </div>
        {visitorToasts}
        {checkout && <Checkout product={checkout} onClose={() => setCheckout(null)} />}
        {previewProduct && (
          <div onClick={() => setPreviewProduct(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(5,6,15,.72)',
              backdropFilter: 'blur(18px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background: 'rgba(22,20,56,.95)', border: '1px solid rgba(255,255,255,.13)',
                borderRadius: 22, width: '100%', maxWidth: 420, overflow: 'hidden',
                boxShadow: '0 32px 80px rgba(0,0,0,.6)', display: 'flex', flexDirection: 'column' }}>
              {/* banner */}
              <div style={{ height: 120, background: previewProduct.gradient, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 48, position: 'relative', flexShrink: 0 }}>
                {previewProduct.icon || '📦'}
                {previewProduct.isNew && (
                  <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 9, fontWeight: 700,
                    letterSpacing: '.6px', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 20,
                    background: 'rgba(0,0,0,.4)', border: '1px solid rgba(245,196,81,.4)', color: '#ffd36b' }}>New</span>
                )}
                {previewProduct.requiresMembership && (
                  <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 16 }}>🔒</span>
                )}
                <button onClick={() => setPreviewProduct(null)}
                  style={{ position: 'absolute', top: 12, right: previewProduct.requiresMembership ? 44 : 12,
                    background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.15)', borderRadius: '50%',
                    width: 28, height: 28, color: '#fff', fontSize: 14, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>✕</button>
              </div>
              {/* body */}
              <div style={{ padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 750, marginBottom: 8 }}>{previewProduct.name}</h2>
                  <p style={{ fontSize: 13.5, color: '#c4c8e0', lineHeight: 1.65, margin: 0 }}>
                    {previewProduct.description}
                  </p>
                </div>
                {(previewProduct.artifactUrl || (previewProduct.githubUrl && previewProduct.showGithub) || previewProduct.vercelUrl) && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {previewProduct.artifactUrl && (
                      <a href={previewProduct.artifactUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, color: '#9d90ff', textDecoration: 'none', padding: '5px 10px',
                          borderRadius: 8, border: '1px solid rgba(124,108,255,.35)', background: 'rgba(124,108,255,.1)' }}>
                        📄 Artifact
                      </a>
                    )}
                    {previewProduct.githubUrl && previewProduct.showGithub && (
                      <a href={previewProduct.githubUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, color: '#9d90ff', textDecoration: 'none', padding: '5px 10px',
                          borderRadius: 8, border: '1px solid rgba(124,108,255,.35)', background: 'rgba(124,108,255,.1)' }}>
                        💻 GitHub
                      </a>
                    )}
                    {previewProduct.vercelUrl && (
                      <a href={previewProduct.vercelUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, color: '#9d90ff', textDecoration: 'none', padding: '5px 10px',
                          borderRadius: 8, border: '1px solid rgba(124,108,255,.35)', background: 'rgba(124,108,255,.1)' }}>
                        ▲ Live
                      </a>
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, borderTop: '1px solid rgba(255,255,255,.07)' }}>
                  <span style={{ fontSize: 22, fontWeight: 800 }}>
                    {previewProduct.isFree ? 'Free' : `£${(previewProduct.price / 100).toFixed(2)}`}
                    {!previewProduct.isFree && <small style={{ fontSize: 12, fontWeight: 400, color: '#7d84a6', marginLeft: 4 }}>one-time</small>}
                  </span>
                  <button onClick={() => { setCheckout(previewProduct); setPreviewProduct(null); }}
                    style={{ background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff',
                      border: 'none', borderRadius: 11, padding: '11px 22px', fontSize: 14,
                      fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {previewProduct.isFree ? 'Open' : previewProduct.requiresMembership ? 'Unlock' : 'Buy now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  /* ════════════════════════════════════════════════════════
     ANDROID LAYOUT — Material You
  ════════════════════════════════════════════════════════ */
  if (isMobile && os === 'android') {
    const androidNav = appsMeta.slice(0, 4);
    return (
      <>
        {bootScreen}
        <style>{`@keyframes load{to{width:100%}} @keyframes rise{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}`}</style>
        <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: wallpaper,
          fontFamily: '"Google Sans",Roboto,"Noto Sans",sans-serif' }}>

          {/* Android status bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 28, zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{clock.split(' ').slice(1).join(' ')}</span>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <svg width="15" height="11" viewBox="0 0 15 11" fill="white"><rect x="0" y="6" width="2.5" height="5" rx=".8"/><rect x="3.5" y="4" width="2.5" height="7" rx=".8" opacity=".8"/><rect x="7" y="2" width="2.5" height="9" rx=".8" opacity=".9"/><rect x="10.5" y="0" width="2.5" height="11" rx=".8"/></svg>
              <svg width="14" height="10" viewBox="0 0 14 10" fill="white"><path d="M7 8a1.2 1.2 0 100 2.4A1.2 1.2 0 007 8z"/><path d="M7 5C5.1 5 3.4 5.8 2.2 7L3.4 8.1C4.2 7.3 5.5 6.8 7 6.8s2.8.5 3.6 1.3L11.8 7C10.6 5.8 8.9 5 7 5z" opacity=".7"/><path d="M7 2C4 2 1.3 3.2 0 5.1l1.3 1.2C2.5 4.5 4.6 3.4 7 3.4s4.5 1.1 5.7 2.9L14 5.1C12.7 3.2 10 2 7 2z" opacity=".4"/></svg>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <div style={{ width: 22, height: 11, borderRadius: 2.5, border: '1.5px solid rgba(255,255,255,.6)', position: 'relative', display: 'flex', alignItems: 'center', padding: '2px 2px' }}>
                  <div style={{ height: '100%', width: '70%', borderRadius: 1, background: '#4caf8a' }} />
                  <div style={{ position: 'absolute', right: -3.5, top: '50%', transform: 'translateY(-50%)', width: 2, height: 4, background: 'rgba(255,255,255,.5)', borderRadius: '0 1px 1px 0' }} />
                </div>
              </div>
            </div>
          </div>

          {/* top greeting bar */}
          <div style={{ position: 'absolute', top: 28, left: 0, right: 0, padding: '16px 20px 0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', fontWeight: 400 }}>Welcome to</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src={c('site.logoUrl')} alt="lanrae" style={{ width: 28, height: 28, borderRadius: 6 }} />
                <span style={{ fontSize: 22, fontWeight: 500, color: '#fff' }}>lanrae<span style={{ color: '#b8b0ff' }}>Ai</span></span>
              </div>
            </div>
            <button onClick={() => openWin('profile')} style={{ width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center',
              fontSize: 20, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)',
              cursor: 'pointer', backdropFilter: 'blur(10px)' }}>👤</button>
          </div>

          {/* scrollable cards — one per section */}
          <div style={{ position: 'absolute', top: 108, left: 0, right: 0, bottom: 72,
            padding: '0 16px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {appsMeta.map(app => (
              <div key={app.id} onClick={() => { setActiveTab(app.id); openWin(app.id); }}
                style={{ background: 'rgba(255,255,255,.06)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,.1)', borderRadius: 20,
                  padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16,
                  cursor: 'pointer', transition: 'background .15s' }}
                onPointerDown={e => (e.currentTarget.style.background = 'rgba(255,255,255,.1)')}
                onPointerUp={e => (e.currentTarget.style.background = 'rgba(255,255,255,.06)')}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: app.gradient,
                  display: 'grid', placeItems: 'center', fontSize: 26, flexShrink: 0,
                  boxShadow: '0 4px 14px rgba(0,0,0,.4)' }}>{app.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>{app.label}</div>
                  <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
                    {app.id === 'store' ? 'AI products by lanrae' :
                     app.id === 'members' ? 'Explorer · Supporter · Insider' :
                     app.id === 'fans' ? 'Top supporters this month' :
                     app.id === 'donate' ? 'Buy me a GPU hour ☕' :
                     app.id === 'profile' ? 'Your member profile & chat' :
                     'AI Product Engineer · lanrae.co.uk'}
                  </div>
                </div>
                <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 20 }}>›</span>
              </div>
            ))}
          </div>

          {/* Material bottom nav */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 72, zIndex: 200,
            background: 'rgba(14,16,36,.9)', backdropFilter: 'blur(30px)',
            borderTop: '1px solid rgba(255,255,255,.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 0 8px' }}>
            {androidNav.map(app => {
              const isActive = activeTab === app.id;
              return (
                <div key={app.id} onClick={() => { setActiveTab(app.id); openWin(app.id); }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    cursor: 'pointer', flex: 1 }}>
                  <div style={{ width: 64, height: 32, borderRadius: 16, display: 'grid', placeItems: 'center',
                    background: isActive ? 'rgba(157,144,255,.25)' : 'transparent',
                    transition: 'background .2s', fontSize: 20 }}>{app.icon}</div>
                  <span style={{ fontSize: 11, color: isActive ? '#b8b0ff' : 'rgba(255,255,255,.4)',
                    fontWeight: isActive ? 600 : 400, transition: 'color .2s' }}>{app.label}</span>
                </div>
              );
            })}
          </div>

          {wins.map(w => (
            <Sheet key={w.id} open={!!open[w.id]} onClose={() => closeWin(w.id)} title={w.title} os={os}>
              {renderContent(w.id)}
            </Sheet>
          ))}
        </div>
        {visitorToasts}
        {checkout && <Checkout product={checkout} onClose={() => setCheckout(null)} />}
        {previewProduct && (
          <div onClick={() => setPreviewProduct(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(5,6,15,.72)',
              backdropFilter: 'blur(18px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background: 'rgba(22,20,56,.95)', border: '1px solid rgba(255,255,255,.13)',
                borderRadius: 22, width: '100%', maxWidth: 420, overflow: 'hidden',
                boxShadow: '0 32px 80px rgba(0,0,0,.6)', display: 'flex', flexDirection: 'column' }}>
              {/* banner */}
              <div style={{ height: 120, background: previewProduct.gradient, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 48, position: 'relative', flexShrink: 0 }}>
                {previewProduct.icon || '📦'}
                {previewProduct.isNew && (
                  <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 9, fontWeight: 700,
                    letterSpacing: '.6px', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 20,
                    background: 'rgba(0,0,0,.4)', border: '1px solid rgba(245,196,81,.4)', color: '#ffd36b' }}>New</span>
                )}
                {previewProduct.requiresMembership && (
                  <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 16 }}>🔒</span>
                )}
                <button onClick={() => setPreviewProduct(null)}
                  style={{ position: 'absolute', top: 12, right: previewProduct.requiresMembership ? 44 : 12,
                    background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.15)', borderRadius: '50%',
                    width: 28, height: 28, color: '#fff', fontSize: 14, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>✕</button>
              </div>
              {/* body */}
              <div style={{ padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 750, marginBottom: 8 }}>{previewProduct.name}</h2>
                  <p style={{ fontSize: 13.5, color: '#c4c8e0', lineHeight: 1.65, margin: 0 }}>
                    {previewProduct.description}
                  </p>
                </div>
                {(previewProduct.artifactUrl || (previewProduct.githubUrl && previewProduct.showGithub) || previewProduct.vercelUrl) && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {previewProduct.artifactUrl && (
                      <a href={previewProduct.artifactUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, color: '#9d90ff', textDecoration: 'none', padding: '5px 10px',
                          borderRadius: 8, border: '1px solid rgba(124,108,255,.35)', background: 'rgba(124,108,255,.1)' }}>
                        📄 Artifact
                      </a>
                    )}
                    {previewProduct.githubUrl && previewProduct.showGithub && (
                      <a href={previewProduct.githubUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, color: '#9d90ff', textDecoration: 'none', padding: '5px 10px',
                          borderRadius: 8, border: '1px solid rgba(124,108,255,.35)', background: 'rgba(124,108,255,.1)' }}>
                        💻 GitHub
                      </a>
                    )}
                    {previewProduct.vercelUrl && (
                      <a href={previewProduct.vercelUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, color: '#9d90ff', textDecoration: 'none', padding: '5px 10px',
                          borderRadius: 8, border: '1px solid rgba(124,108,255,.35)', background: 'rgba(124,108,255,.1)' }}>
                        ▲ Live
                      </a>
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, borderTop: '1px solid rgba(255,255,255,.07)' }}>
                  <span style={{ fontSize: 22, fontWeight: 800 }}>
                    {previewProduct.isFree ? 'Free' : `£${(previewProduct.price / 100).toFixed(2)}`}
                    {!previewProduct.isFree && <small style={{ fontSize: 12, fontWeight: 400, color: '#7d84a6', marginLeft: 4 }}>one-time</small>}
                  </span>
                  <button onClick={() => { setCheckout(previewProduct); setPreviewProduct(null); }}
                    style={{ background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff',
                      border: 'none', borderRadius: 11, padding: '11px 22px', fontSize: 14,
                      fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {previewProduct.isFree ? 'Open' : previewProduct.requiresMembership ? 'Unlock' : 'Buy now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  /* ════════════════════════════════════════════════════════
     WINDOWS 11 DESKTOP LAYOUT — Fluent Design
  ════════════════════════════════════════════════════════ */
  if (os === 'windows' && !isMobile) {
    const winWinStyles: Record<string, React.CSSProperties> = {
      store: { width: 'min(660px,92vw)', top: 56, left: 'calc(50% - 300px)' },
      fans: { width: 'min(440px,92vw)', top: 100, left: 'calc(50% + 80px)' },
      members: { width: 'min(680px,92vw)', top: 80, left: 'calc(50% - 340px)' },
      request: { width: 'min(520px,92vw)', top: 90, left: 'calc(50% - 260px)' },
      donate: { width: 'min(380px,92vw)', top: 110, left: 'calc(50% - 190px)' },
      about: { width: 'min(420px,92vw)', top: 100, left: 'calc(50% - 210px)' },
      profile: { width: 'min(500px,92vw)', top: 70, left: 'calc(50% - 250px)' },
    };

    return (
      <>
        {bootScreen}
        <style>{`@keyframes load{to{width:100%}} @keyframes rise{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}} body{font-family:"Segoe UI",sans-serif!important}`}</style>
        <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: wallpaper,
          fontFamily: '"Segoe UI","Segoe UI Variable",sans-serif' }}>

          {/* Windows top bar (system tray style) */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 40, zIndex: 900,
            display: 'flex', alignItems: 'center', padding: '0 16px',
            background: 'rgba(9,11,24,.65)', backdropFilter: 'blur(28px)',
            borderBottom: '1px solid rgba(255,255,255,.07)', fontSize: 13 }}>
            <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: -.2 }}>
              <img src={c('site.logoUrl')} alt="lanrae" style={{ width: 20, height: 20, borderRadius: 4, marginRight: 6, verticalAlign: 'middle' }} />
              lanrae<span style={{ color: '#9d90ff' }}>Ai</span>
            </span>
            {['store', 'members', 'fans', 'donate', 'about'].map(id => (
              <span key={id} onClick={() => openWin(id)}
                style={{ color: '#cdd3ef', opacity: .8, cursor: 'default', marginLeft: 20,
                  padding: '4px 8px', borderRadius: 5, fontSize: 13,
                  transition: 'background .1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                {id === 'fans' ? 'Top Fans' : id === 'donate' ? 'Support' : id.charAt(0).toUpperCase() + id.slice(1)}
              </span>
            ))}
            <span style={{ marginLeft: 'auto', color: '#cdd3ef', fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>{clock}</span>
          </div>

          {/* desktop icons */}
          {[
            { id: 'store', icon: '🛍️', label: 'Store', top: 60, left: 24 },
            { id: 'fans', icon: '🏆', label: 'Top Fans', top: 160, left: 24 },
            { id: 'about', icon: 'ℹ️', label: 'About', top: 260, left: 24 },
          ].map(({ id, icon, label, top, left }) => (
            <div key={id} onClick={() => openWin(id)}
              style={{ position: 'absolute', top, left, width: 80, textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'default' }}>
              <div style={{ width: 52, height: 52, borderRadius: 8, display: 'grid', placeItems: 'center',
                fontSize: 24, background: 'var(--glass)', backdropFilter: 'blur(20px) saturate(160%)',
                border: '1px solid rgba(255,255,255,.14)', boxShadow: '0 6px 20px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.1)' }}>{icon}</div>
              <span style={{ fontSize: 11.5, color: '#e8ecf7', textShadow: '0 1px 4px rgba(0,0,0,.8)',
                padding: '2px 5px', borderRadius: 4, background: 'rgba(0,0,0,.25)' }}>{label}</span>
            </div>
          ))}

          {/* Windows */}
          {wins.map(({ id, title, subtitle }) => (
            <WinWindow key={id} title={title} subtitle={subtitle}
              open={!!open[id]} onClose={() => closeWin(id)} onMin={() => closeWin(id)}
              style={winWinStyles[id]} zIndex={zMap[id] || 100} onFocus={() => focusWin(id)}>
              {renderContent(id)}
            </WinWindow>
          ))}

          {/* Windows 11 centered taskbar */}
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 800,
            display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
            background: 'rgba(14,18,40,.72)', backdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,.1)', borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,.55)' }}>
            {/* Start button */}
            <div style={{ width: 42, height: 40, display: 'grid', placeItems: 'center', fontSize: 20,
              borderRadius: 8, cursor: 'pointer', transition: 'background .1s',
              marginRight: 6, borderRight: '1px solid rgba(255,255,255,.08)', paddingRight: 10 }}>⊞</div>
            {appsMeta.map(app => (
              <div key={app.id} title={app.label} onClick={() => openWin(app.id)}
                style={{ width: 44, height: 40, borderRadius: 8, display: 'grid', placeItems: 'center',
                  fontSize: 22, cursor: 'pointer', position: 'relative',
                  background: open[app.id] ? 'rgba(157,144,255,.2)' : 'transparent',
                  transition: 'background .1s' }}
                onMouseEnter={e => { if (!open[app.id]) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.1)'; }}
                onMouseLeave={e => { if (!open[app.id]) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                {app.icon}
                {open[app.id] && <div style={{ position: 'absolute', bottom: 2, left: '50%',
                  transform: 'translateX(-50%)', width: 14, height: 2, borderRadius: 1,
                  background: '#9d90ff' }} />}
              </div>
            ))}
          </div>
        </div>

        {visitorToasts}
        {checkout && <Checkout product={checkout} onClose={() => setCheckout(null)} />}
        {previewProduct && (
          <div onClick={() => setPreviewProduct(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(5,6,15,.72)',
              backdropFilter: 'blur(18px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background: 'rgba(22,20,56,.95)', border: '1px solid rgba(255,255,255,.13)',
                borderRadius: 22, width: '100%', maxWidth: 420, overflow: 'hidden',
                boxShadow: '0 32px 80px rgba(0,0,0,.6)', display: 'flex', flexDirection: 'column' }}>
              {/* banner */}
              <div style={{ height: 120, background: previewProduct.gradient, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 48, position: 'relative', flexShrink: 0 }}>
                {previewProduct.icon || '📦'}
                {previewProduct.isNew && (
                  <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 9, fontWeight: 700,
                    letterSpacing: '.6px', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 20,
                    background: 'rgba(0,0,0,.4)', border: '1px solid rgba(245,196,81,.4)', color: '#ffd36b' }}>New</span>
                )}
                {previewProduct.requiresMembership && (
                  <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 16 }}>🔒</span>
                )}
                <button onClick={() => setPreviewProduct(null)}
                  style={{ position: 'absolute', top: 12, right: previewProduct.requiresMembership ? 44 : 12,
                    background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.15)', borderRadius: '50%',
                    width: 28, height: 28, color: '#fff', fontSize: 14, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>✕</button>
              </div>
              {/* body */}
              <div style={{ padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 750, marginBottom: 8 }}>{previewProduct.name}</h2>
                  <p style={{ fontSize: 13.5, color: '#c4c8e0', lineHeight: 1.65, margin: 0 }}>
                    {previewProduct.description}
                  </p>
                </div>
                {(previewProduct.artifactUrl || (previewProduct.githubUrl && previewProduct.showGithub) || previewProduct.vercelUrl) && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {previewProduct.artifactUrl && (
                      <a href={previewProduct.artifactUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, color: '#9d90ff', textDecoration: 'none', padding: '5px 10px',
                          borderRadius: 8, border: '1px solid rgba(124,108,255,.35)', background: 'rgba(124,108,255,.1)' }}>
                        📄 Artifact
                      </a>
                    )}
                    {previewProduct.githubUrl && previewProduct.showGithub && (
                      <a href={previewProduct.githubUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, color: '#9d90ff', textDecoration: 'none', padding: '5px 10px',
                          borderRadius: 8, border: '1px solid rgba(124,108,255,.35)', background: 'rgba(124,108,255,.1)' }}>
                        💻 GitHub
                      </a>
                    )}
                    {previewProduct.vercelUrl && (
                      <a href={previewProduct.vercelUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, color: '#9d90ff', textDecoration: 'none', padding: '5px 10px',
                          borderRadius: 8, border: '1px solid rgba(124,108,255,.35)', background: 'rgba(124,108,255,.1)' }}>
                        ▲ Live
                      </a>
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, borderTop: '1px solid rgba(255,255,255,.07)' }}>
                  <span style={{ fontSize: 22, fontWeight: 800 }}>
                    {previewProduct.isFree ? 'Free' : `£${(previewProduct.price / 100).toFixed(2)}`}
                    {!previewProduct.isFree && <small style={{ fontSize: 12, fontWeight: 400, color: '#7d84a6', marginLeft: 4 }}>one-time</small>}
                  </span>
                  <button onClick={() => { setCheckout(previewProduct); setPreviewProduct(null); }}
                    style={{ background: 'linear-gradient(180deg,#9d90ff,#7c6cff)', color: '#fff',
                      border: 'none', borderRadius: 11, padding: '11px 22px', fontSize: 14,
                      fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {previewProduct.isFree ? 'Open' : previewProduct.requiresMembership ? 'Unlock' : 'Buy now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  /* ════════════════════════════════════════════════════════
     macOS DESKTOP LAYOUT (default)
  ════════════════════════════════════════════════════════ */
  return (
    <>
      {bootScreen}
      <style>{`@keyframes load{to{width:100%}} @keyframes rise{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}`}</style>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: wallpaper }}>

        {/* menu bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 30, zIndex: 900,
          display: 'flex', alignItems: 'center', gap: 20, padding: '0 14px',
          background: 'rgba(9,11,24,.55)', backdropFilter: 'blur(22px) saturate(160%)',
          borderBottom: '1px solid var(--stroke-2)', fontSize: 13 }}>
          <div style={{ fontWeight: 800, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <img src={c('site.logoUrl')} alt="lanrae" style={{ width: 18, height: 18, borderRadius: 4, display: 'block' }} />
            <span>lanrae<span style={{ color: '#9d90ff' }}>Ai</span></span>
          </div>
          {['store', 'members', 'fans', 'donate', 'about'].map(id => (
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
          { id: 'about', icon: 'ℹ️', label: 'About', top: 264, left: 28 },
        ].map(({ id, icon, label, top, left }) => (
          <div key={id} onClick={() => openWin(id)}
            style={{ position: 'absolute', top, left, width: 88, textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'default' }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, display: 'grid', placeItems: 'center',
              fontSize: 26, background: 'var(--glass)', backdropFilter: 'blur(20px) saturate(160%)',
              border: '1px solid var(--stroke)', boxShadow: '0 8px 22px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.1)' }}>{icon}</div>
            <span style={{ fontSize: 11.5, color: '#eaeefb', textShadow: '0 1px 4px rgba(0,0,0,.7)',
              padding: '1px 6px', borderRadius: 5 }}>{label}</span>
          </div>
        ))}

        {/* macOS windows */}
        {wins.map(({ id, title, subtitle }) => (
          <MacWin key={id} title={title} subtitle={subtitle}
            open={!!open[id]} onClose={() => closeWin(id)} onMin={() => closeWin(id)}
            style={winStyles[id]} zIndex={zMap[id] || 100} onFocus={() => focusWin(id)}>
            {renderContent(id)}
          </MacWin>
        ))}

        {/* dock */}
        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 800,
          display: 'flex', alignItems: 'flex-end', gap: 8, padding: '9px 12px',
          background: 'rgba(14,16,36,.48)', backdropFilter: 'blur(32px) saturate(180%)',
          border: '1px solid var(--stroke)', borderRadius: 20,
          boxShadow: '0 18px 44px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.1)' }}>
          {appsMeta.map(({ id, icon, label }) => (
            <div key={id} title={label} onClick={() => openWin(id)}
              style={{ width: 50, height: 50, borderRadius: 13, display: 'grid', placeItems: 'center',
                fontSize: 25, cursor: 'pointer', position: 'relative',
                background: open[id] ? 'rgba(124,108,255,.22)' : 'var(--glass)',
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

      </div>

      {visitorToasts}
      {checkout && <Checkout product={checkout} onClose={() => setCheckout(null)} />}
    </>
  );
}
