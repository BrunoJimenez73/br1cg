// ──────────────────────────────────────────────
// br1cg — Server middleware & helpers
// ──────────────────────────────────────────────

export const STATIC_DIR = './dist';

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/** Handle CORS preflight — returns Response if OPTIONS, null otherwise */
export function handleCORS(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

/** Create a JSON response with CORS headers */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Create an error JSON response */
export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

/** Serve static files from dist/ directory */
export async function serveStatic(url: URL): Promise<Response | null> {
  let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  filePath = filePath.split('?')[0];

  const distPath = `${STATIC_DIR}${filePath}`;

  const mime: Record<string, string> = {
    html: 'text/html', css: 'text/css', js: 'application/javascript',
    mjs: 'application/javascript', json: 'application/json',
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp',
    ico: 'image/x-icon', woff: 'font/woff', woff2: 'font/woff2',
    ttf: 'font/ttf',
  };

  try {
    const file = Bun.file(distPath);
    if (await file.exists()) {
      const ext = filePath.split('.').pop() || '';
      return new Response(file, {
        headers: { 'Content-Type': mime[ext] || 'application/octet-stream' },
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
