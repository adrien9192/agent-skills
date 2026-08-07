// Hardened fetch for user-submitted URLs.
// SSRF: we resolve DNS and reject any private/loopback/link-local IP BEFORE
// requesting, otherwise a public hostname can point at 127.0.0.1 or
// 169.254.169.254 (cloud metadata). Timeout + bounded response size.
// Server-only, Node.js runtime required (node:dns) — never `runtime = 'edge'`,
// never imported client-side.

import { lookup } from 'node:dns/promises';

const FETCH_TIMEOUT_MS = 8000;
const MAX_BYTES = 2_500_000; // 2.5 MB: crawling a head/HTML page needs no more
// Bot User-Agent: MUST identify the brand doing the crawling, with a valid
// contact URL (attribution when abuse is reported). Set the client project's env
// vars — the fallback is deliberately anonymous.
const USER_AGENT =
  process.env.AUDIT_BOT_UA ??
  `${process.env.NEXT_PUBLIC_SITE_NAME ?? 'Site'}AuditBot/1.0 (+${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/audit-gratuit)`;

export interface FetchResult {
  ok: boolean;
  status: number;
  finalUrl: string;
  headers: Headers;
  body: string;
  error?: string;
}

function isPrivateIp(ip: string): boolean {
  const addr = ip.toLowerCase().trim();
  // IPv6: loopback, unspecified, link-local, unique-local, 6to4, NAT64.
  if (addr === '::1' || addr === '::') return true;
  if (addr.startsWith('fe80:') || addr.startsWith('fc') || addr.startsWith('fd')) return true;
  if (addr.startsWith('2002:')) return true; // 6to4 (can encapsulate a private address)
  if (addr.startsWith('64:ff9b')) return true; // NAT64
  // IPv4-mapped IPv6 -> extract the v4 part (dotted form).
  const mapped = addr.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  const v4 = mapped ? mapped[1] : addr;
  const parts = v4.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return false; // not a recognised IPv4 (global IPv6 already filtered above)
  }
  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    a >= 224 || // multicast + reserved (224.0.0.0+)
    (a === 169 && b === 254) || // link-local + cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) || // benchmarking 198.18.0.0/15
    (a === 100 && b >= 64 && b <= 127) // CGNAT
  );
}

/** Validates the scheme + blocks private hosts. Returns the normalised URL, or null. */
export async function assertPublicUrl(raw: string): Promise<URL | null> {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;

  const host = parsed.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) {
    return null;
  }

  // Resolves every address and rejects if a single one is private.
  try {
    const addrs = await lookup(host, { all: true });
    if (addrs.length === 0) return null;
    if (addrs.some((a) => isPrivateIp(a.address))) return null;
  } catch {
    return null;
  }
  return parsed;
}

const MAX_REDIRECTS = 5;
const REDIRECT_STATUS = new Set([301, 302, 303, 307, 308]);

/** Hardened GET. Assumes assertPublicUrl already validated the primary host's URL. */
export async function safeFetch(url: string): Promise<FetchResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    // SSRF: we follow redirects MANUALLY and re-validate every target through
    // assertPublicUrl. Otherwise a public host can return a 302 to 169.254.169.254
    // (cloud metadata) or 127.0.0.1, bypassing the initial check.
    let current = url;
    let res: Response;
    for (let hop = 0; ; hop++) {
      res = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: { 'user-agent': USER_AGENT, accept: 'text/html,*/*' },
      });
      if (!REDIRECT_STATUS.has(res.status)) break;
      const location = res.headers.get('location');
      if (!location) break; // no target -> handle the response as-is
      if (hop >= MAX_REDIRECTS) {
        return { ok: false, status: 0, finalUrl: current, headers: new Headers(), body: '', error: 'too many redirects' };
      }
      const next = new URL(location, current).toString();
      const validated = await assertPublicUrl(next);
      if (!validated) {
        return { ok: false, status: 0, finalUrl: current, headers: new Headers(), body: '', error: 'redirect blocked (private or invalid target)' };
      }
      current = validated.toString();
      await res.body?.cancel().catch(() => {});
    }

    // Bounded read: we cut off past MAX_BYTES.
    const reader = res.body?.getReader();
    let body = '';
    if (reader) {
      const decoder = new TextDecoder();
      let total = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        body += decoder.decode(value, { stream: true });
        if (total > MAX_BYTES) {
          await reader.cancel();
          break;
        }
      }
    }
    return {
      ok: res.ok,
      status: res.status,
      finalUrl: res.url || current,
      headers: res.headers,
      body,
    };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      finalUrl: url,
      headers: new Headers(),
      body: '',
      error: e instanceof Error ? e.message : 'fetch failed',
    };
  } finally {
    clearTimeout(timer);
  }
}
