// ──────────────────────────────────────────────
// br1cg — Server entry point
// ──────────────────────────────────────────────

import { serve } from 'bun';
import { handleWS, handleWSMessage, handleWSClose, getRoomsInfo, sendOverlayCommand, toggleOverlay } from './ws-handler';
import { handleCORS, jsonResponse, serveStatic, fallbackIndex, corsHeaders, securityHeaders, checkBodySize, logRequest } from './middleware';
import { Router } from './router';
import { closeDb } from './db';
import { handleOverlayRoutes, handleTemplateRoutes } from './routes/overlays';

const PORT = parseInt(process.env.PORT || '3001');

// ─── Router ───
const router = new Router();

// Health
router.get('/api/health', (_req, _url) => {
  return jsonResponse({
    status: 'ok',
    rooms: getRoomsInfo(),
    uptime: process.uptime(),
  });
});

// API routes — prefix matching, no dynamic imports
router.add('*', '/api/overlays*', async (req, url) => {
  // Delegate to overlay routes, but only if it's actually an overlay path
  if (url.pathname.startsWith('/api/overlays')) {
    const result = await handleOverlayRoutes(req, url);
    if (result) return result;
  }
  return null;
});

router.add('*', '/api/templates*', async (req, url) => {
  if (url.pathname.startsWith('/api/templates')) {
    const result = await handleTemplateRoutes(req, url);
    if (result) return result;
  }
  return null;
});

// ─── Server ───
const server = serve({
  port: PORT,

  websocket: {
    open(ws) { handleWS(ws); },
    message(ws, message) { handleWSMessage(ws, typeof message === 'string' ? message : message.toString()); },
    close(ws) { handleWSClose(ws); },
  },

  async fetch(req, server) {
    const url = new URL(req.url);
    const t0 = performance.now();

    // 1. CORS preflight
    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    // 2. Body size limit for mutating requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const bodyErr = checkBodySize(req);
      if (bodyErr) return bodyErr;
    }

    // 3. WebSocket upgrade
    if (url.pathname === '/ws') {
      const upgraded = server.upgrade(req, { data: { url: req.url } });
      if (!upgraded) return new Response('WebSocket upgrade failed', { status: 400 });
      return undefined;
    }

    // 4. API routes via router (health + overlays + templates)
    if (url.pathname.startsWith('/api/')) {
      const apiResponse = await router.run(req, url);
      if (apiResponse) return apiResponse;
      return jsonResponse({ error: 'Not found' }, 404);
    }

    // 5. Static files (overlay, control, _assets, home)
    const isStaticPath =
      url.pathname.startsWith('/overlay/') ||
      url.pathname.startsWith('/control') ||
      url.pathname.startsWith('/editor') ||
      url.pathname.startsWith('/studio') ||
      url.pathname.startsWith('/_assets/') ||
      url.pathname === '/';

    if (isStaticPath) {
      const staticResponse = await serveStatic(url);
      if (staticResponse) return staticResponse;
    }

    // 6. Dynamic routes: /studio/:id and /editor/:id → redirect to query param
    if (url.pathname.startsWith('/studio/') && url.pathname !== '/studio/') {
      const id = url.pathname.split('/')[2];
      return new Response(null, {
        status: 302,
        headers: { Location: `/studio?id=${id}`, ...corsHeaders },
      });
    }
    if (url.pathname.startsWith('/editor/') && url.pathname !== '/editor/') {
      const id = url.pathname.split('/')[2];
      return new Response(null, {
        status: 302,
        headers: { Location: `/editor?id=${id}`, ...corsHeaders },
      });
    }

    // 7. Fallback: index.html for client-side routing
    const indexResponse = await fallbackIndex();
    if (indexResponse) return indexResponse;

    // 8. 404
    logRequest(req, url);
    return new Response('Not Found', { status: 404, headers: { ...corsHeaders, ...securityHeaders } });
  },
});

// Graceful shutdown
process.on('SIGTERM', () => { closeDb(); process.exit(0); });
process.on('SIGINT', () => { closeDb(); process.exit(0); });

console.log(`⚡ br1cg server running at http://localhost:${PORT}`);
console.log(`  API:      http://localhost:${PORT}/api/overlays`);
console.log(`  WS:       ws://localhost:${PORT}/ws`);
console.log(`  Health:   http://localhost:${PORT}/api/health`);