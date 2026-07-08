import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

/**
 * Environment variables required for email delivery (set these in Vercel / .env):
 *   SMTP_USER    — hello@lanrae.co.uk
 *   SMTP_PASS    — livemail password
 *   FROM_EMAIL   — display name + address e.g. `lanrae <hello@lanrae.co.uk>`
 *   ADMIN_EMAIL  — address that receives admin alert emails (or set in admin UI)
 *
 * SMTP host: smtp.livemail.co.uk  port: 587  STARTTLS
 */

function createTransport() {
  return nodemailer.createTransport({
    host: 'smtp.livemail.co.uk',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

type Vars = Record<string, string | number | undefined | null>;

/** Replace every {{key}} occurrence in `str` with the matching value from `vars`. */
function interpolate(str: string, vars: Vars): string {
  return str.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    const v = vars[key];
    return v === undefined || v === null ? '' : String(v);
  });
}

/** Returns the admin notification address: DB setting first, env var fallback. */
export async function getAdminEmail(): Promise<string> {
  try {
    const row = await prisma.siteContent.findUnique({ where: { key: 'email.admin' } });
    if (row?.value) return row.value;
  } catch {}
  return process.env.ADMIN_EMAIL || process.env.SMTP_USER || '';
}

/**
 * Look up a template by name, interpolate the vars and send it via nodemailer.
 * Silently returns if the template is missing/disabled or if sending fails —
 * email must never break the calling request.
 */
export async function sendEmail(templateName: string, to: string, vars: Vars = {}): Promise<void> {
  try {
    if (!to) return;
    const template = await prisma.emailTemplate.findUnique({ where: { name: templateName } });
    if (!template || template.enabled === false) return;

    const subject = interpolate(template.subject, vars);
    const html = interpolate(template.html, vars);

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn(`[email] SMTP_USER / SMTP_PASS not set — skipping "${templateName}" to ${to}`);
      return;
    }

    // FROM_EMAIL may be plain address OR full RFC "Name <addr>" — use as-is.
    // Fall back to SMTP_USER so the envelope always has a valid sender.
    const from = process.env.FROM_EMAIL || process.env.SMTP_USER || 'hello@lanrae.co.uk';

    const transporter = createTransport();
    await transporter.sendMail({ from, to, subject, html });
  } catch (err) {
    console.error(`[email] failed to send "${templateName}" to ${to}:`, err);
  }
}

/* ---------- Default template markup ---------- */

const BG = '#0a0f26';
const ACCENT = '#9d90ff';

/** Dark-themed shell used by member-facing emails. */
function shell(inner: string): string {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:40px 24px;color:#ffffff;">
      <div style="font-size:22px;font-weight:800;letter-spacing:-0.5px;margin-bottom:28px;">
        lanrae<span style="color:${ACCENT};">OS</span>
      </div>
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px;">
        ${inner}
      </div>
      <div style="margin-top:28px;font-size:12px;color:#7d84a6;text-align:center;">
        lanrae.co.uk · AI Product Development
      </div>
    </div>
  </body>
</html>`;
}

function button(label: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:${ACCENT};color:#0a0f26;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;font-size:14px;">${label}</a>`;
}

/** Simple (non-shell) markup used by admin alert emails. */
function simple(inner: string): string {
  return `<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111;font-size:15px;line-height:1.6;padding:20px;">
  ${inner}
</body></html>`;
}

const DEFAULT_TEMPLATES: { name: string; subject: string; html: string }[] = [
  {
    name: 'member_welcome',
    subject: 'Welcome to lanraeAi 👋',
    html: shell(`
      <h1 style="font-size:20px;margin:0 0 14px;">Welcome {{displayName}}! 🎉</h1>
      <p style="font-size:15px;line-height:1.6;color:#d7dcf1;margin:0 0 22px;">Your membership is active. Set a password to secure your account and jump straight in.</p>
      <p style="margin:0 0 22px;">${button('Set your password →', '{{setPasswordUrl}}')}</p>
      <p style="font-size:13px;color:#a7aecb;margin:0;">Glad to have you on board.</p>
    `),
  },
  {
    name: 'member_login_alert',
    subject: 'New sign-in to your lanraeAi account',
    html: shell(`
      <h1 style="font-size:20px;margin:0 0 14px;">Hi {{displayName}},</h1>
      <p style="font-size:15px;line-height:1.6;color:#d7dcf1;margin:0 0 18px;">We noticed a new sign-in to your account.</p>
      <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px 16px;font-size:14px;color:#d7dcf1;margin:0 0 18px;">
        <div><strong style="color:#a7aecb;">Time:</strong> {{time}}</div>
        <div><strong style="color:#a7aecb;">Device:</strong> {{device}}</div>
      </div>
      <p style="font-size:13px;color:#a7aecb;margin:0;">If this wasn't you, reply to this email immediately.</p>
    `),
  },
  {
    name: 'member_chat_reply',
    subject: 'Lanrae replied to your message',
    html: shell(`
      <h1 style="font-size:20px;margin:0 0 14px;">{{displayName}}, you have a new reply from Lanrae:</h1>
      <blockquote style="border-left:3px solid ${ACCENT};margin:0 0 22px;padding:10px 16px;background:rgba(157,144,255,0.06);border-radius:0 10px 10px 0;font-size:15px;color:#d7dcf1;">{{replyContent}}</blockquote>
      <p style="margin:0;">${button('View conversation →', '{{profileUrl}}')}</p>
    `),
  },
  {
    name: 'member_payment_receipt',
    subject: 'Payment confirmed — {{productName}}',
    html: shell(`
      <div style="font-size:40px;text-align:center;margin:0 0 10px;">✓</div>
      <h1 style="font-size:20px;text-align:center;margin:0 0 14px;">Payment confirmed</h1>
      <p style="font-size:15px;line-height:1.6;color:#d7dcf1;text-align:center;margin:0 0 22px;">You paid <strong>£{{amount}}</strong> for <strong>{{productName}}</strong>.</p>
      <p style="text-align:center;margin:0 0 22px;">${button('Access your product →', '{{deliveryUrl}}')}</p>
      <p style="font-size:13px;color:#a7aecb;text-align:center;margin:0;">Thank you for your support.</p>
    `),
  },
  {
    name: 'member_set_password',
    subject: 'Set your lanraeAi password',
    html: shell(`
      <h1 style="font-size:20px;margin:0 0 14px;">Hi {{displayName}},</h1>
      <p style="font-size:15px;line-height:1.6;color:#d7dcf1;margin:0 0 22px;">Use the link below to set your password.</p>
      <p style="margin:0 0 22px;">${button('Set password →', '{{setPasswordUrl}}')}</p>
      <p style="font-size:13px;color:#a7aecb;margin:0;">This link expires in 24 hours.</p>
    `),
  },
  {
    name: 'admin_new_member',
    subject: '🎉 New member: {{email}}',
    html: simple(`<p><strong>{{email}}</strong> just subscribed to <strong>{{tier}}</strong> membership. Amount: £{{amount}}</p>`),
  },
  {
    name: 'admin_new_chat',
    subject: '💬 New message from {{email}}',
    html: simple(`<p><strong>{{email}}</strong> sent: {{messagePreview}}</p><p><a href="https://lanrae.co.uk/admin">Open admin panel →</a></p>`),
  },
  {
    name: 'admin_new_request',
    subject: '💡 New project request from {{name}}',
    html: simple(`
      <p><strong>{{name}}</strong> ({{email}}) submitted a new project request.</p>
      <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px 16px;font-size:14px;color:#d7dcf1;margin:14px 0;">
        <div style="margin-bottom:8px;"><strong style="color:#a7aecb;">Title:</strong> {{title}}</div>
        <div><strong style="color:#a7aecb;">Details:</strong> {{description}}</div>
      </div>
      <p><a href="https://lanrae.co.uk/admin" style="color:${ACCENT};">View in admin panel →</a></p>
    `),
  },
  {
    name: 'request_confirmation',
    subject: '✅ We received your request — {{title}}',
    html: shell(`
      <h1 style="font-size:20px;margin:0 0 14px;">Got it, {{name}}! 🚀</h1>
      <p style="font-size:15px;line-height:1.6;color:#d7dcf1;margin:0 0 18px;">Your project request has been received. Here's what you submitted:</p>
      <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px 16px;font-size:14px;color:#d7dcf1;margin:0 0 22px;">
        <div style="margin-bottom:8px;"><strong style="color:#a7aecb;">Title:</strong> {{title}}</div>
        <div><strong style="color:#a7aecb;">Details:</strong> {{description}}</div>
      </div>
      <p style="font-size:14px;color:#a7aecb;margin:0 0 22px;">I review every request personally. Top-voted ideas shape what gets built next — watch this space.</p>
      <p style="font-size:13px;color:#7d84a6;margin:0;">— Lanrae</p>
    `),
  },
  {
    name: 'request_status_update',
    subject: '📬 Update on your request — {{title}}',
    html: shell(`
      <h1 style="font-size:20px;margin:0 0 14px;">Hi {{name}},</h1>
      <p style="font-size:15px;line-height:1.6;color:#d7dcf1;margin:0 0 18px;">There's a new update on your project request:</p>
      <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px 16px;font-size:14px;color:#d7dcf1;margin:0 0 22px;">
        <div style="margin-bottom:8px;"><strong style="color:#a7aecb;">Request:</strong> {{title}}</div>
        <div><strong style="color:#a7aecb;">Status:</strong> <span style="color:${ACCENT};font-weight:700;">{{statusLabel}}</span></div>
      </div>
      <p style="font-size:13px;color:#7d84a6;margin:0;">— Lanrae</p>
    `),
  },
  {
    name: 'admin_new_payment',
    subject: '💰 New payment: £{{amount}} from {{email}}',
    html: simple(`<p><strong>{{email}}</strong> paid £{{amount}} for {{productName}}</p>`),
  },
  {
    name: 'admin_login_alert',
    subject: '🔐 Admin login detected',
    html: simple(`<p>Admin login at {{time}} from {{ip}}.</p>`),
  },
];

/**
 * Upsert all default templates. Existing templates (by name) are left untouched
 * so admin edits are never overwritten; only missing ones are created.
 */
export async function seedTemplates(): Promise<void> {
  try {
    for (const t of DEFAULT_TEMPLATES) {
      await prisma.emailTemplate.upsert({
        where: { name: t.name },
        update: {},
        create: { name: t.name, subject: t.subject, html: t.html, enabled: true },
      });
    }
  } catch (err) {
    console.error('[email] seedTemplates failed:', err);
  }
}

/** The variable names each template expects — used by the admin editor helper text. */
export const TEMPLATE_VARS: Record<string, string[]> = {
  member_welcome: ['displayName', 'setPasswordUrl'],
  member_login_alert: ['displayName', 'time', 'device'],
  member_chat_reply: ['displayName', 'replyContent', 'profileUrl'],
  member_payment_receipt: ['amount', 'productName', 'deliveryUrl'],
  member_set_password: ['displayName', 'setPasswordUrl'],
  admin_new_member: ['email', 'tier', 'amount'],
  admin_new_chat: ['email', 'messagePreview'],
  admin_new_request: ['name', 'email', 'title', 'description'],
  request_confirmation: ['name', 'title', 'description'],
  request_status_update: ['name', 'title', 'statusLabel'],
  admin_new_payment: ['email', 'amount', 'productName'],
  admin_login_alert: ['time', 'ip'],
};
