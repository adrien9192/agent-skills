// Audit lead persistence in Supabase over PostgREST (no SDK added).
// The SECRET KEY is read server-side only (never bundled client-side).
// Double opt-in: we create a "pending" lead carrying a token, and the report is
// only delivered once the email is confirmed.

import { randomUUID } from 'node:crypto';
import type { AuditReport } from './scoring';

export interface AuditPayload {
  report: AuditReport;
  narrative: { intro: string; conclusion: string };
}

export interface PendingLeadInput {
  email: string;
  url: string;
  locale: 'fr' | 'en';
  payload: AuditPayload;
}

function config(): { base: string; key: string } | null {
  const base = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SECRET_KEY?.trim();
  return base && key ? { base, key } : null;
}

function headers(key: string): Record<string, string> {
  return { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' };
}

/** Creates an unconfirmed lead + returns the confirmation token (null when unconfigured or on failure). */
export async function createPendingLead(input: PendingLeadInput): Promise<string | null> {
  const cfg = config();
  if (!cfg) return null;
  const token = randomUUID();
  try {
    const res = await fetch(`${cfg.base}/rest/v1/audit_leads`, {
      method: 'POST',
      headers: { ...headers(cfg.key), prefer: 'return=minimal' },
      body: JSON.stringify({
        email: input.email,
        url: input.payload.report.signals.finalUrl,
        locale: input.locale,
        platform: input.payload.report.signals.platform,
        global_score: input.payload.report.globalScore,
        report: input.payload,
        confirm_token: token,
        confirmed: false,
      }),
    });
    if (!res.ok) {
      console.error('[audit] supabase insert failed', res.status, await res.text().catch(() => ''));
      return null;
    }
    return token;
  } catch (e) {
    console.error('[audit] supabase insert error', e);
    return null;
  }
}

/** Marks a lead confirmed. Returns the locale when a lead matched, null otherwise.
 * Idempotent: an already-confirmed token also returns its locale (link clicked twice). */
export async function confirmLead(token: string): Promise<'fr' | 'en' | null> {
  const cfg = config();
  if (!cfg || !token) return null;
  try {
    const url = `${cfg.base}/rest/v1/audit_leads?confirm_token=eq.${encodeURIComponent(token)}&confirmed=eq.false`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { ...headers(cfg.key), prefer: 'return=representation' },
      body: JSON.stringify({ confirmed: true, confirmed_at: new Date().toISOString() }),
    });
    if (res.ok) {
      const rows = (await res.json().catch(() => [])) as Array<{ locale?: string }>;
      if (Array.isArray(rows) && rows.length > 0) return rows[0].locale === 'en' ? 'en' : 'fr';
    }
    // Already confirmed (link clicked twice): re-read to confirm it exists and get the locale.
    const existing = await getConfirmedPayload(token);
    return existing ? existing.locale : null;
  } catch (e) {
    console.error('[audit] supabase confirm error', e);
    return null;
  }
}

export interface AdminLead {
  id: string;
  email: string;
  url: string;
  platform: string | null;
  global_score: number | null;
  created_at: string;
  confirmed: boolean;
  generate_requested: boolean;
  ia_generated: boolean;
}

/** Lists the most recent leads for the admin (site owner). */
export async function listAdminLeads(): Promise<AdminLead[]> {
  const cfg = config();
  if (!cfg) return [];
  try {
    const url = `${cfg.base}/rest/v1/audit_leads?select=id,email,url,platform,global_score,created_at,confirmed,generate_requested,ia_generated&order=created_at.desc&limit=100`;
    const res = await fetch(url, { headers: headers(cfg.key) });
    if (!res.ok) return [];
    return (await res.json().catch(() => [])) as AdminLead[];
  } catch (e) {
    console.error('[audit] supabase list error', e);
    return [];
  }
}

/** Flags a lead "to generate" (admin button click). The local worker picks it up. */
export async function queueGeneration(id: string): Promise<boolean> {
  const cfg = config();
  if (!cfg || !id) return false;
  try {
    const url = `${cfg.base}/rest/v1/audit_leads?id=eq.${encodeURIComponent(id)}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { ...headers(cfg.key), prefer: 'return=minimal' },
      body: JSON.stringify({ generate_requested: true, ia_generated: false }),
    });
    return res.ok;
  } catch (e) {
    console.error('[audit] supabase queue error', e);
    return false;
  }
}

/** Fetches the confirmed report attached to a token (null when missing or unconfirmed). */
export async function getConfirmedPayload(token: string): Promise<{ payload: AuditPayload; locale: 'fr' | 'en' } | null> {
  const cfg = config();
  if (!cfg || !token) return null;
  try {
    const url = `${cfg.base}/rest/v1/audit_leads?confirm_token=eq.${encodeURIComponent(token)}&confirmed=eq.true&select=report,locale`;
    const res = await fetch(url, { headers: headers(cfg.key) });
    if (!res.ok) return null;
    const rows = (await res.json().catch(() => [])) as Array<{ report: AuditPayload; locale: 'fr' | 'en' }>;
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return { payload: rows[0].report, locale: rows[0].locale === 'en' ? 'en' : 'fr' };
  } catch (e) {
    console.error('[audit] supabase read error', e);
    return null;
  }
}
