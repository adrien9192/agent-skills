// Server-only, Node.js runtime required (node:crypto) — never `runtime = 'edge'`,
// never imported client-side.
import { createHash, timingSafeEqual } from 'node:crypto';

/** Checks the admin Bearer token against AUDIT_ADMIN_TOKEN, in constant time.
 * We compare SHA-256 digests (fixed 32-byte length) so that neither the result
 * NOR the expected token's length leaks. With the env var unset, everything is
 * rejected (fail-closed). */
export function isAdmin(request: Request): boolean {
  const expected = process.env.AUDIT_ADMIN_TOKEN?.trim();
  if (!expected) return false;
  const auth = request.headers.get('authorization') || '';
  const provided = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!provided) return false;
  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}
