// ──────────────────────────────────────────────
// br1cg — Overlay REST API routes
// ──────────────────────────────────────────────

import { jsonResponse, errorResponse } from '../middleware';
import { getOverlayStatus, sendOverlayCommand, toggleOverlay } from '../ws-handler';
import { OVERLAY_TYPES } from '../../src/lib/types';

const VALID_TYPES = new Set(OVERLAY_TYPES);

function validateOverlayBody(body: Record<string, unknown>): string | null {
  if (!body.type || typeof body.type !== 'string' || !VALID_TYPES.has(body.type as any)) {
    return `Invalid type. Must be one of: ${OVERLAY_TYPES.join(', ')}`;
  }
  if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
    return 'Name must be a non-empty string';
  }
  if (body.data !== undefined && (typeof body.data !== 'object' || body.data === null || Array.isArray(body.data))) {
    return 'Data must be an object';
  }
  if (body.elements !== undefined && !Array.isArray(body.elements)) {
    return 'Elements must be an array';
  }
  if (body.tags !== undefined && !Array.isArray(body.tags)) {
    return 'Tags must be an array';
  }
  return null;
}

export async function handleOverlayRoutes(
  req: Request,
  url: URL,
): Promise<Response | null> {
  const method = req.method;
  const path = url.pathname;
  const { getAllOverlays, getOverlay, createOverlay, updateOverlay, deleteOverlay } = await import('../db');

  // GET /api/overlays — list all
  if (method === 'GET' && path === '/api/overlays') {
    const overlays = getAllOverlays();
    return jsonResponse(overlays);
  }

  // GET /api/overlays/quick — lightweight list (MUST be before :id routes)
  if (method === 'GET' && path === '/api/overlays/quick') {
    const overlays = getAllOverlays();
    const quickList = overlays.map((o: { id: string; name: string; type: string }) => ({
      id: o.id,
      name: o.name,
      type: o.type,
      status: getOverlayStatus(o.id),
    }));
    return jsonResponse(quickList);
  }

  // POST /api/overlays — create
  if (method === 'POST' && path === '/api/overlays') {
    const { v4: uuid } = await import('uuid');
    const { getDefaultConfig, getDefaultElements } = await import('../../src/lib/defaults');

    try {
      const body = await req.json() as { name: string; type: string; data?: Record<string, unknown>; elements?: unknown[]; tags?: string[] };
      const validationError = validateOverlayBody(body as Record<string, unknown>);
      if (validationError) return errorResponse(validationError, 400);

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
      return jsonResponse(overlay, 201);
    } catch {
      return errorResponse('Invalid JSON');
    }
  }

  // POST /api/overlays/:id/command
  const commandMatch = path.match(/^\/api\/overlays\/([^/]+)\/command$/);
  if (commandMatch && method === 'POST') {
    const id = commandMatch[1];
    const overlay = getOverlay(id);
    if (!overlay) {
      return errorResponse('Overlay not found', 404);
    }
    try {
      const body = await req.json() as { action: 'show' | 'hide' | 'update'; data?: Record<string, unknown> };
      if (!body.action || !['show', 'hide', 'update'].includes(body.action)) {
        return errorResponse('Invalid action. Use: show, hide, update');
      }
      sendOverlayCommand(id, body.action, body.data);
      return jsonResponse({ success: true, overlayId: id, action: body.action });
    } catch {
      return errorResponse('Invalid JSON');
    }
  }

  // POST /api/overlays/:id/toggle
  const toggleMatch = path.match(/^\/api\/overlays\/([^/]+)\/toggle$/);
  if (toggleMatch && method === 'POST') {
    const id = toggleMatch[1];
    const overlay = getOverlay(id);
    if (!overlay) {
      return errorResponse('Overlay not found', 404);
    }
    const result = toggleOverlay(id);
    return jsonResponse(result);
  }

  // GET /api/overlays/:id
  // PUT /api/overlays/:id
  // DELETE /api/overlays/:id
  const singleMatch = path.match(/^\/api\/overlays\/([^/]+)$/);
  if (singleMatch) {
    const id = singleMatch[1];

    if (method === 'GET') {
      const overlay = getOverlay(id);
      if (!overlay) return errorResponse('Not found', 404);
      return jsonResponse(overlay);
    }

    if (method === 'PUT' || method === 'PATCH') {
      try {
        const body = await req.json();
        // Validate fields if present
        if (body.type !== undefined && !VALID_TYPES.has(body.type)) {
          return errorResponse(`Invalid type. Must be one of: ${OVERLAY_TYPES.join(', ')}`, 400);
        }
        if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
          return errorResponse('Name must be a non-empty string', 400);
        }
        if (body.data !== undefined && (typeof body.data !== 'object' || body.data === null || Array.isArray(body.data))) {
          return errorResponse('Data must be an object', 400);
        }
        const updated = updateOverlay(id, body);
        if (!updated) return errorResponse('Not found', 404);
        return jsonResponse(getOverlay(id));
      } catch {
        return errorResponse('Invalid JSON');
      }
    }

    if (method === 'DELETE') {
      const deleted = deleteOverlay(id);
      if (!deleted) return errorResponse('Not found', 404);
      return jsonResponse({ success: true });
    }
  }

  // Not an overlay route — let caller try next handler
  return null;
}

// GET /api/templates — could be extracted to its own file later
export async function handleTemplateRoutes(
  _req: Request,
  url: URL,
): Promise<Response | null> {
  if (url.pathname === '/api/templates' && _req.method === 'GET') {
    const templates = [
      { id: 'tmpl-lower-simple', name: 'Lower Third Simple', type: 'lower-third', category: 'basico', description: 'Name + title at bottom' },
      { id: 'tmpl-timer-default', name: 'Timer por Defecto', type: 'timer', category: 'basico', description: 'Countdown / elapsed time' },
      { id: 'tmpl-score-generic', name: 'Score Bug Genérico', type: 'scorebug', category: 'deportes', description: 'Home vs away scoreboard' },
      { id: 'tmpl-title-center', name: 'Título Centrado', type: 'title-card', category: 'basico', description: 'Fullscreen centered title' },
      { id: 'tmpl-ticker-news', name: 'Ticker Noticias', type: 'ticker', category: 'basico', description: 'Scrolling text crawl' },
      { id: 'tmpl-alert-popup', name: 'Alerta Popup', type: 'alert', category: 'basico', description: 'Notification popup' },
    ];
    return jsonResponse(templates);
  }
  return null;
}
