// REFERENCE IMPLEMENTATION — brand strings are {{PLACEHOLDERS}}: email
// subjects, legal footer and sender fallback must be filled per site. The file
// already imports `site` from '@/lib/site': prefer deriving brand and legal name
// from there (site.name / site.legalName) over hardcoded literals.
// Sends the double opt-in confirmation email via Brevo. Reuses the same config
// as the contact form: API key first, SMTP fallback.

import nodemailer from 'nodemailer';
import { site } from '@/lib/site';

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

interface ConfirmEmail {
  email: string;
  targetUrl: string;
  link: string;
  locale: 'fr' | 'en';
}

function content({ targetUrl, link, locale }: ConfirmEmail): { subject: string; html: string; text: string } {
  if (locale === 'en') {
    const subject = 'Confirm your email to open your {{COMPANY}} audit';
    const text = `Confirm your email to open your free audit of ${targetUrl}:\n${link}\n\n{{COMPANY}}`;
    const html = wrap(
      'Your audit is ready',
      `<p>You requested a free audit of <strong>${escapeHtml(targetUrl)}</strong>. Confirm your email to open your report.</p>`,
      'Open my report',
      link,
      'If you did not request this, you can ignore this email.',
    );
    return { subject, html, text };
  }
  const subject = 'Confirmez votre email pour ouvrir votre audit {{COMPANY}}';
  const text = `Confirmez votre email pour ouvrir votre audit gratuit de ${targetUrl} :\n${link}\n\n{{COMPANY}}`;
  const html = wrap(
    'Votre audit est prêt',
    `<p>Vous avez demandé un audit gratuit de <strong>${escapeHtml(targetUrl)}</strong>. Confirmez votre email pour ouvrir votre rapport.</p>`,
    'Ouvrir mon rapport',
    link,
    'Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.',
  );
  return { subject, html, text };
}

function wrap(title: string, intro: string, cta: string, link: string, footer: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f7f4ee;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px">
      <div style="font-size:20px;font-weight:800;letter-spacing:-.02em;color:#221E33">{{COMPANY}}</div>
      <div style="margin-top:24px;background:#fff;border:1px solid #e6d9c9;border-radius:20px;padding:28px">
        <h1 style="margin:0 0 12px;font-size:22px;color:#221E33">${title}</h1>
        ${intro}
        <p style="margin:24px 0">
          <a href="${link}" style="display:inline-block;background:#5B46C9;color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:999px">${cta}</a>
        </p>
        <p style="font-size:13px;color:#64748b;margin:0">${footer}</p>
      </div>
      <p style="font-size:12px;color:#94a3b8;margin-top:18px">{{LEGAL_NAME}}, {{CITY}}. ${escapeHtml(site.email)}</p>
    </div>
  </body></html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function readyContent(link: string, locale: 'fr' | 'en'): { subject: string; html: string; text: string } {
  if (locale === 'en') {
    return {
      subject: 'Your enriched {{COMPANY}} audit is ready',
      text: `Your audit has been reviewed and enriched. Open it here:\n${link}\n\n{{COMPANY}}`,
      html: wrap(
        'Your enriched audit is ready',
        '<p>We took a closer look at your site and enriched your report. Open it to see the detail.</p>',
        'Open my report',
        link,
        'You can reply to this email to talk with us.',
      ),
    };
  }
  return {
    subject: 'Votre audit {{COMPANY}} enrichi est prêt',
    text: `Votre audit a été revu et enrichi. Ouvrez-le ici :\n${link}\n\n{{COMPANY}}`,
    html: wrap(
      'Votre audit enrichi est prêt',
      '<p>Nous avons regardé votre site de plus près et enrichi votre rapport. Ouvrez-le pour voir le détail.</p>',
      'Ouvrir mon rapport',
      link,
      'Vous pouvez répondre à cet email pour échanger avec nous.',
    ),
  };
}

async function dispatch(email: string, subject: string, html: string, text: string): Promise<boolean> {
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() || site.email;
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || '{{COMPANY}}';

  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (apiKey) {
    const res = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: { accept: 'application/json', 'api-key': apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({ sender: { name: senderName, email: senderEmail }, to: [{ email }], subject, htmlContent: html, textContent: text }),
    });
    if (res.ok) return true;
    console.error('[audit] brevo api failed', res.status, await res.text().catch(() => ''));
  }
  const user = process.env.BREVO_SMTP_LOGIN?.trim();
  const pass = process.env.BREVO_SMTP_KEY?.trim();
  if (user && pass) {
    const transporter = nodemailer.createTransport({
      host: (process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com').trim(),
      port: Number((process.env.BREVO_SMTP_PORT || '587').trim()),
      secure: false,
      auth: { user, pass },
    });
    await transporter.sendMail({ from: `"${senderName}" <${senderEmail}>`, to: email, subject, html, text });
    return true;
  }
  return false;
}

/** "Enriched report ready" email (sent after the admin runs AI generation). */
export async function sendAuditReady(input: { email: string; link: string; locale: 'fr' | 'en' }): Promise<boolean> {
  const { subject, html, text } = readyContent(input.link, input.locale);
  return dispatch(input.email, subject, html, text);
}

/** Sends the confirmation email. Returns false when no transport is configured. */
export async function sendAuditConfirmation(input: ConfirmEmail): Promise<boolean> {
  const { subject, html, text } = content(input);
  return dispatch(input.email, subject, html, text);
}
