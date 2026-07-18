// ──────────────────────────────────────────────
// br1cg — Server entry point
// ──────────────────────────────────────────────

import { serve } from 'bun';
import { handleWS, handleWSMessage, handleWSClose, getRoomsInfo } from './ws-handler';
import { handleCORS, jsonResponse, serveStatic, fallbackIndex, corsHeaders } from './middleware';
import { handleOverlayRoutes, handleTemplateRoutes } from './routes/overlays';

const PORT = parseInt(process.env.PORT || '3001');

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

  async fetch(req, server) {
    const url = new URL(req.url);

    // 1. CORS preflight
    const corsResponse = handleCORS(req);
    if (corsResponse) return corsResponse;

    // 2. WebSocket upgrade
    if (url.pathname === '/ws') {
      const upgraded = server.upgrade(req, { data: { url: req.url } });
      if (!upgraded) return new Response('WebSocket upgrade failed', { status: 400 });
      return undefined;
    }

    // 3. Health check
    if (url.pathname === '/api/health') {
      return jsonResponse({
        status: 'ok',
        rooms: getRoomsInfo(),
        uptime: process.uptime(),
      });
    }

    // 4. API routes
    if (url.pathname.startsWith('/api/')) {
      const overlayResponse = await handleOverlayRoutes(req, url);
      if (overlayResponse) return overlayResponse;

      const templateResponse = await handleTemplateRoutes(req, url);
      if (templateResponse) return templateResponse;

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

    // 6. Dynamic routes: /studio/:id and /editor/:id
    // Redirect to query param format so Astro can serve the static page
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
    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
});

console.log(`⚡ br1cg server running at http://localhost:${PORT}`);
console.log(`  API:      http://localhost:${PORT}/api/overlays`);
console.log(`  WS:       ws://localhost:${PORT}/ws`);
console.log(`  Health:   http://localhost:${PORT}/api/health`);
