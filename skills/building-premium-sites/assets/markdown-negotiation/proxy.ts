import { NextResponse, type NextRequest } from 'next/server';

// Content pages that have a markdown representation (see lib/markdown.ts).
// EN data-driven pages (/en/*) are markdownable; EN editorial pages are not.
function isDataDriven(p: string): boolean {
  if (p === '/') return true;
  if (p.startsWith('/sites-corporate') || p.startsWith('/e-commerce') || p.startsWith('/automatisation-ia')) return true;
  if (p === '/glossaire' || p.startsWith('/glossaire/')) return true;
  return p === '/blog' || p.startsWith('/blog/');
}

function isMarkdownablePath(p: string): boolean {
  if (p === '/en') return true;
  if (p.startsWith('/en/')) return isDataDriven(p.slice(3) || '/');
  if (isDataDriven(p)) return true;
  return ['/a-propos', '/approche', '/contact', '/realisations', '/mentions-legales'].includes(p);
}

export default function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const isVercel = host.endsWith('.vercel.app');
  const { pathname } = request.nextUrl;
  const accept = request.headers.get('accept') ?? '';
  const markdownable = isMarkdownablePath(pathname);

  // Markdown for Agents: when an agent asks for text/markdown, serve the markdown
  // rendering of the same URL. Browsers send text/html and keep getting HTML.
  if ((request.method === 'GET' || request.method === 'HEAD') && accept.includes('text/markdown') && markdownable) {
    const url = request.nextUrl.clone();
    url.pathname = '/api/markdown';
    url.searchParams.set('path', pathname);
    // Pass the original path via a header: on a rewrite the destination handler
    // sees the original request URL, so the query string alone is not reliable.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-md-path', pathname);
    const rewrite = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    rewrite.headers.set('Vary', 'Accept');
    if (isVercel) rewrite.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return rewrite;
  }

  // Keep the public production domain indexable, but stop search engines from
  // indexing the *.vercel.app deployment URLs (duplicate content against the canonical domain).
  const response = NextResponse.next();
  if (markdownable) response.headers.set('Vary', 'Accept');
  if (isVercel) response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

export const config = {
  // Run on all routes except Next internals and static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
