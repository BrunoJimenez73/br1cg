import { serve } from 'bun';
import { handleWS, handleWSMessage, handleWSClose, getRoomsInfo, sendOverlayCommand, toggleOverlay, getOverlayStatus } from './ws-handler';

const PORT = parseInt(process.env.PORT || '3001');
const STATIC_DIR = './dist';

function serveStatic(url: URL): Response | null {
  let filePath = url.pathname === '/' ? '/index.html' : url.pathname;

  const distPath = `${STATIC_DIR}${filePath}`;
  const file = Bun.file(distPath);

  if (file.size > 0) {
    const ext = filePath.split('.').pop() || '';
    const mime: Record<string, string> = {
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'mjs': 'application/javascript',
      'json': 'application/json',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'webp': 'image/webp',
      'ico': 'image/x-icon',
      'woff': 'font/woff',
      'woff2': 'font/woff2',
      'ttf': 'font/ttf',
    };

    return new Response(file, {
      headers: { 'Content-Type': mime[ext] || 'application/octet-stream' },
    });
  }

  return null;
}

const server = serve({
  port: PORT,

  websocket: {
    open(ws) {
      handleWS(ws);
    },
    message(ws, message) {
      handleWSMessage(ws, typeof message === 'string' ? message : message.toString());
    },
    close(ws) {
      handleWSClose(ws);
    },
  },

  fetch(req, server) {
    const url = new URL(req.url);

    // CORS headers for development
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // WebSocket upgrade
    if (url.pathname === '/ws') {
      const upgraded = server.upgrade(req, { data: { url: req.url } });
      if (!upgraded) {
        return new Response('WebSocket upgrade failed', { status: 400 });
      }
      return undefined;
    }

    // Health check
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        rooms: getRoomsInfo(),
        uptime: process.uptime(),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // API routes
    if (url.pathname.startsWith('/api/')) {
      // The overlay API routes are handled via a simple router
      return handleAPI(req, url, corsHeaders);
    }

    // Static files
    if (url.pathname.startsWith('/overlay/') || url.pathname.startsWith('/control') || url.pathname.startsWith('/editor') || url.pathname === '/') {
      const staticResponse = serveStatic(url);
      if (staticResponse) {
        return staticResponse;
      }
    }

    // Fallback: serve index.html for client-side routing
    const indexFile = Bun.file(`${STATIC_DIR}/index.html`);
    if (indexFile.size > 0) {
      return new Response(indexFile, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
});

// Simple API router
async function handleAPI(req: Request, url: URL, corsHeaders: Record<string, string>): Promise<Response> {
  const method = req.method;
  const path = url.pathname;

  // GET /api/overlays
  if (method === 'GET' && path === '/api/overlays') {
    const { getAllOverlays } = await import('./db');
    const overlays = getAllOverlays();
    return new Response(JSON.stringify(overlays), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // POST /api/overlays
  if (method === 'POST' && path === '/api/overlays') {
    const { createOverlay } = await import('./db');
    const { v4: uuid } = await import('uuid');
    const { getDefaultConfig, getDefaultElements } = await import('../src/lib/defaults');

    try {
      const body = await req.json() as { name: string; type: string; data?: Record<string, unknown>; elements?: any[]; tags?: string[] };
      const now = new Date().toISOString();
      const overlay = {
        id: uuid(),
        name: body.name || 'Sin nombre',
        type: body.type,
        data: body.data || getDefaultConfig(body.type as any),
        elements: body.elements || getDefaultElements(body.type as any),
        tags: body.tags || [],
        favorite: false,
        createdAt: now,
        updatedAt: now,
      };
      createOverlay(overlay);
      return new Response(JSON.stringify(overlay), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: corsHeaders });
    }
  }

  // GET /api/overlays/quick — Stream Deck friendly list (MUST be before :id routes)
  if (method === 'GET' && path === '/api/overlays/quick') {
    const { getAllOverlays } = await import('./db');
    const overlays = getAllOverlays();
    const quickList = overlays.map((o: { id: string; name: string; type: string }) => ({
      id: o.id,
      name: o.name,
      type: o.type,
      status: getOverlayStatus(o.id),
    }));
    return new Response(JSON.stringify(quickList), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // GET /api/overlays/:id
  const singleMatch = path.match(/^\/api\/overlays\/([^/]+)$/);
  if (singleMatch) {
    const id = singleMatch[1];
    const { getOverlay, updateOverlay, deleteOverlay } = await import('./db');

    if (method === 'GET') {
      const overlay = getOverlay(id);
      if (!overlay) {
        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders });
      }
      return new Response(JSON.stringify(overlay), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'PUT' || method === 'PATCH') {
      try {
        const body = await req.json();
        const updated = updateOverlay(id, body);
        if (!updated) {
          return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders });
        }
        return new Response(JSON.stringify(getOverlay(id)), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: corsHeaders });
      }
    }

    if (method === 'DELETE') {
      const deleted = deleteOverlay(id);
      if (!deleted) {
        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders });
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // POST /api/overlays/:id/command — Stream Deck command endpoint
  const commandMatch = path.match(/^\/api\/overlays\/([^/]+)\/command$/);
  if (commandMatch && method === 'POST') {
    const id = commandMatch[1];
    const { getOverlay } = await import('./db');
    const overlay = getOverlay(id);
    if (!overlay) {
      return new Response(JSON.stringify({ error: 'Overlay not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    try {
      const body = await req.json() as { action: 'show' | 'hide' | 'update'; data?: Record<string, unknown> };
      if (!body.action || !['show', 'hide', 'update'].includes(body.action)) {
        return new Response(JSON.stringify({ error: 'Invalid action. Use: show, hide, update' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      sendOverlayCommand(id, body.action, body.data);
      return new Response(JSON.stringify({ success: true, overlayId: id, action: body.action }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // POST /api/overlays/:id/toggle — Stream Deck toggle endpoint
  const toggleMatch = path.match(/^\/api\/overlays\/([^/]+)\/toggle$/);
  if (toggleMatch && method === 'POST') {
    const id = toggleMatch[1];
    const { getOverlay } = await import('./db');
    const overlay = getOverlay(id);
    if (!overlay) {
      return new Response(JSON.stringify({ error: 'Overlay not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const result = toggleOverlay(id);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // GET /api/templates
  if (method === 'GET' && path === '/api/templates') {
    const templates = [
      { id: 'tmpl-lower-simple', name: 'Lower Third Simple', type: 'lower-third', category: 'basico' },
      { id: 'tmpl-timer-default', name: 'Timer por Defecto', type: 'timer', category: 'basico' },
      { id: 'tmpl-score-generic', name: 'Score Bug Genérico', type: 'scorebug', category: 'deportes' },
      { id: 'tmpl-title-center', name: 'Título Centrado', type: 'title-card', category: 'basico' },
      { id: 'tmpl-ticker-news', name: 'Ticker Noticias', type: 'ticker', category: 'basico' },
      { id: 'tmpl-alert-popup', name: 'Alerta Popup', type: 'alert', category: 'basico' },
    ];
    return new Response(JSON.stringify(templates), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders });
}

console.log(`⚡ br1cg server running at http://localhost:${PORT}`);
console.log(`  API:      http://localhost:${PORT}/api/overlays`);
console.log(`  WS:       ws://localhost:${PORT}/ws`);
console.log(`  Health:   http://localhost:${PORT}/api/health`);
