import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const TAILSCALE_CONTENT = `# SSH Into Your Windows PC From Your iPhone — Over Tailscale

## Overview

How to remotely SSH into a Windows PC from an iPhone using Tailscale as the secure network tunnel and Termius as the SSH client — with key-based authentication (no passwords).

**Why this matters:**
- Access your Windows terminal from anywhere your iPhone can connect to the internet
- No port forwarding, no exposed public IP, no VPN setup headaches
- Tailscale encrypts all traffic end-to-end using WireGuard
- Key-based auth is more secure than passwords

**Time to complete:** ~10 minutes

---

## Architecture

\`\`\`
iPhone (Termius SSH Client)
        |
        | Tailscale WireGuard Tunnel
        |
Windows PC (OpenSSH Server)
        |
        | Tailnet: your-tailnet.ts.net
        | PC IP: 100.x.x.x (Tailscale IP)
\`\`\`

---

## Prerequisites

Before starting, confirm you have:

- Tailscale installed on Windows PC — client running, logged in
- Tailscale installed on iPhone — same account, connected
- Both devices on the same tailnet — visible in \`tailscale status\`
- Termius app on iPhone — free tier works
- Windows admin access — needed to start services
- OpenSSH Server feature — pre-installed on Windows 10 v1809+ and Windows 11

---

## Step 1 — Verify Tailscale is Running

Open PowerShell and run:

\`\`\`powershell
tailscale status
\`\`\`

You should see your PC and iPhone listed. Note your **PC's Tailscale IP** (100.x.x.x).

---

## Step 2 — Enable and Start OpenSSH Server

Run in **elevated (Administrator) PowerShell**:

\`\`\`powershell
Set-Service -Name sshd -StartupType Automatic
Start-Service sshd
\`\`\`

Verify:

\`\`\`powershell
Get-Service sshd
\`\`\`

Expected: \`Status: Running\`, \`StartType: Automatic\`

---

## Step 3 — Generate SSH Key in Termius (iPhone)

1. Open **Termius** on your iPhone
2. Tap the menu → **Keychain**
3. Tap **+** → **Generate Key**
4. Choose **Ed25519**
5. Give it a name (e.g. "Windows PC key")
6. Tap **Generate**
7. Tap the key → **Export Public Key** → **Copy to clipboard**

---

## Step 4 — Add the Public Key to Windows

Because your account is in the **Administrators** group, the key must go into:

\`\`\`
C:\\ProgramData\\ssh\\administrators_authorized_keys
\`\`\`

Run in **elevated PowerShell**:

\`\`\`powershell
$key = "ssh-ed25519 AAAA...YOUR KEY HERE..."
$keyFile = "C:\\ProgramData\\ssh\\administrators_authorized_keys"

Set-Content -Path $keyFile -Value $key -Force
takeown /f $keyFile
icacls $keyFile /reset
icacls $keyFile /inheritance:r /grant "SYSTEM:(F)" /grant "Administrators:(F)"
\`\`\`

> **Why the permission step?** OpenSSH on Windows refuses to use an authorized_keys file if it has overly permissive ACLs.

Verify:

\`\`\`powershell
Get-Content "C:\\ProgramData\\ssh\\administrators_authorized_keys"
\`\`\`

---

## Step 5 — Connect From Termius

1. Open Termius → **Hosts** → tap **+**
2. Set:
   - **Hostname:** Your PC's Tailscale IP (e.g. \`100.x.x.x\`)
   - **Port:** \`22\`
   - **Username:** Your Windows username
   - **Key:** Select the key you generated in Step 3
3. Tap **Save** → tap to connect

You should see a Windows PowerShell prompt. You're in.

---

## Connecting From Anywhere in the World

Tailscale uses **NAT traversal** — it punches through firewalls and routers without any port forwarding. This means it works on mobile data, hotel WiFi, or in any country.

### What Must Be True

| Requirement | How to Ensure It |
|---|---|
| PC is not sleeping | Disable sleep on AC power |
| Tailscale starts with Windows | \`StartType: Automatic\` — set in Step 2 |
| OpenSSH starts with Windows | \`StartType: Automatic\` — set in Step 2 |
| iPhone Tailscale is active | Open app, confirm green/connected before SSH |

### Disable Sleep (Critical)

\`\`\`powershell
# Run in elevated PowerShell
powercfg /change standby-timeout-ac 0
\`\`\`

Or: **Settings → System → Power & Sleep → Sleep → Never (when plugged in)**

### iOS Gotcha

iOS suspends background apps. Always open the Tailscale app first and confirm it shows **Connected**, then switch to Termius.

---

## Troubleshooting

**"Connection timed out"**
- iPhone Tailscale app not connected — open app, ensure toggle is on
- PC Tailscale not running — run \`tailscale status\`

**"Authentication failed (password)"**
- Use key-based auth for Administrator accounts on Windows

**"Authentication failed" with key**
- Key is in the wrong file — admin users need \`C:\\ProgramData\\ssh\\administrators_authorized_keys\`
- File permissions are wrong — re-run the icacls commands from Step 4

**"Was working, now can't connect remotely"**
- PC has gone to sleep — disable sleep: \`powercfg /change standby-timeout-ac 0\`
- iPhone Tailscale was suspended by iOS — open Tailscale app, wait for "Connected", retry
`;

export async function POST() {
  try {
    const existing = await prisma.post.findUnique({ where: { slug: 'ssh-windows-from-iphone-tailscale' } });
    if (existing) return NextResponse.json({ ok: true, message: 'Already seeded', id: existing.id });

    const post = await prisma.post.create({
      data: {
        title: 'SSH Into Your Windows PC From Your iPhone — Over Tailscale',
        slug: 'ssh-windows-from-iphone-tailscale',
        excerpt: 'Set up secure, passwordless SSH access from your iPhone to your Windows PC using Tailscale and OpenSSH — works from anywhere in the world with no port forwarding.',
        content: TAILSCALE_CONTENT,
        category: 'tutorial',
        tags: ['tailscale', 'ssh', 'windows', 'iphone', 'networking', 'terminal'],
        published: true,
        publishedAt: new Date('2026-07-20'),
        readTime: 10,
        icon: '🔐',
        gradient: 'linear-gradient(160deg,#1f6feb,#0d3a7a)',
        order: 0,
      },
    });
    return NextResponse.json({ ok: true, id: post.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
