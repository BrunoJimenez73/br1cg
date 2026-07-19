// ──────────────────────────────────────────────
// br1cg — Server middleware & helpers
// ──────────────────────────────────────────────

export const STATIC_DIR = './dist';
const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1 MB

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

const MIME: Record<string, string> = {
  html: 'text/html', css: 'text/css', js: 'application/javascript',
  mjs: 'application/javascript', json: 'application/json',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp',
  ico: 'image/x-icon', woff: 'font/woff', woff2: 'font/woff2',
  ttf: 'font/ttf',
};

/** Handle CORS preflight — returns Response if OPTIONS, null otherwise */
export function handleCORS(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

/** Create a JSON response with CORS + security headers */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
  });
}

/** Create an error JSON response */
export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

/** Enforce body size limit. Returns error Response if too large, null if ok. */
export function checkBodySize(req: Request): Response | null {
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return errorResponse('Request body too large (max 1 MB)', 413);
  }
  return null;
}

/** Log incoming requests in development */
export function logRequest(req: Request, url: URL): void {
  if (process.env.NODE_ENV === 'production') return;
  const start = performance.now();
  const method = req.method.padEnd(7);
  console.log(`→ ${method} ${url.pathname}${url.search || ''}`);
  return;
}

/** Mark end of request for timing */
export function logRequestEnd(_req: Request, url: URL, startMs: number): void {
  if (process.env.NODE_ENV === 'production') return;
  const ms = (performance.now() - startMs).toFixed(1);
  console.log(`← ${url.pathname} (${ms}ms)`);
}

/** Serve static files from dist/ directory */
export async function serveStatic(url: URL): Promise<Response | null> {
  let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  filePath = filePath.split('?')[0];

  const distPath = `${STATIC_DIR}${filePath}`;

  try {
    const file = Bun.file(distPath);
    if (await file.exists()) {
      const ext = filePath.split('.').pop() || '';
      return new Response(file, {
        headers: { 'Content-Type': MIME[ext] || 'application/octet-stream' },
      });
    }
  } catch {
    // ignore
  }

  if (!filePath.includes('.')) {
    try {
      const indexPath = `${distPath}/index.html`;
      const indexFile = Bun.file(indexPath);
      if (await indexFile.exists()) {
        return new Response(indexFile, {
          headers: { 'Content-Type': 'text/html' },
        });
      }
    } catch {
      // ignore
    }
  }

  return null;
}

/** Fallback: serve /index.html for client-side routing */
export async function fallbackIndex(): Promise<Response | null> {
  try {
    const indexFile = Bun.file(`${STATIC_DIR}/index.html`);
    if (indexFile.size > 0) {
      return new Response(indexFile, {
        headers: { 'Content-Type': 'text/html' },
      });
    }
  } catch {
    // ignore
  }
  return null;
}
