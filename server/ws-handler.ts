import type { ServerWebSocket } from 'bun';
import type { WSClientMessage, WSServerMessage } from '../src/lib/types';

const rooms = new Map<string, Set<ServerWebSocket<unknown>>>();
const clientRooms = new Map<ServerWebSocket<unknown>, Set<string>>();
const overlayVisibility = new Map<string, boolean>();

/**
 * Handles a new WebSocket connection.
 * Parses the subscribe query parameter to auto-join a room.
 * Sends a 'connected' message with the client UUID.
 * @param ws - The WebSocket connection instance
 */
export function handleWS(ws: ServerWebSocket<unknown>): void {
  const data = (ws.data as { url?: string }) || {};
  let subscribeTo: string | null = null;

  if (data.url) {
    try {
      const url = new URL(data.url);
      subscribeTo = url.searchParams.get('subscribe');
    } catch {
      // ignore invalid URL
    }
  }

  ws.data = { id: crypto.randomUUID(), subscriptions: new Set<string>() };

  ws.send(JSON.stringify({ type: 'connected', clientId: (ws.data as Record<string, unknown>).id } as WSServerMessage));

  if (subscribeTo) {
    subscribe(ws, subscribeTo);
  }

  ws.subscribe('broadcast');
}

/**
 * Subscribes a WebSocket client to a specific room (overlay ID).
 * Creates the room if it doesn't exist.
 * @param ws - The WebSocket to subscribe
 * @param roomId - The overlay ID to subscribe to
 */
export function subscribe(ws: ServerWebSocket<unknown>, roomId: string): void {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  rooms.get(roomId)!.add(ws);

  if (!clientRooms.has(ws)) {
    clientRooms.set(ws, new Set());
  }
  clientRooms.get(ws)!.add(roomId);
}

/**
 * Unsubscribes a WebSocket client from a room.
 * Cleans up empty rooms automatically.
 * @param ws - The WebSocket to unsubscribe
 * @param roomId - The room to leave
 */
export function unsubscribe(ws: ServerWebSocket<unknown>, roomId: string): void {
  rooms.get(roomId)?.delete(ws);
  clientRooms.get(ws)?.delete(roomId);
  if (rooms.get(roomId)?.size === 0) {
    rooms.delete(roomId);
  }
}

/**
 * Broadcasts a message to all clients in a specific room.
 * Skips clients that are not in OPEN state.
 * @param roomId - The target room (overlay ID)
 * @param message - The server message to broadcast
 */
export function broadcastToRoom(roomId: string, message: WSServerMessage): void {
  const msg = JSON.stringify(message);
  const clients = rooms.get(roomId);
  if (clients) {
    for (const ws of clients) {
      if (ws.readyState === 1) {
        ws.send(msg);
      }
    }
  }
}

/**
 * Processes incoming WebSocket messages from clients.
 * Handles: ping, overlay:show/hide/update, overlay:timer:* events, overlay:save.
 * @param ws - The WebSocket that sent the message
 * @param raw - The raw JSON string message
 */
export function handleWSMessage(ws: ServerWebSocket<unknown>, raw: string): void {
  if (process.env.WS_DEBUG) {
    console.log('[WS] ←', raw);
  }

  let msg: WSClientMessage;
  try {
    msg = JSON.parse(raw);
  } catch {
    ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' } as WSServerMessage));
    return;
  }

  switch (msg.type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' } as WSServerMessage));
      break;

    case 'overlay:show':
    case 'overlay:update':
      broadcastToRoom(msg.overlayId, {
        type: 'command',
        action: msg.type === 'overlay:show' ? 'show' : 'update',
        payload: msg.data || {},
      });
      break;

    case 'overlay:hide':
      broadcastToRoom(msg.overlayId, {
        type: 'command',
        action: 'hide',
        payload: {},
      });
      break;

    case 'overlay:timer:start':
    case 'overlay:timer:pause':
    case 'overlay:timer:reset':
      broadcastToRoom(msg.overlayId, {
        type: 'event',
        event: msg.type.replace('overlay:', ''),
        data: 'data' in msg ? (msg.data as Record<string, unknown>) : {},
      });
      break;

    case 'overlay:save':
      broadcastToRoom(msg.overlayId, {
        type: 'command',
        action: 'update',
        payload: msg.data as unknown as Record<string, unknown>,
      });
      break;
  }
}

/**
 * Handles WebSocket disconnection.
 * Removes the client from all rooms and cleans up empty rooms.
 * @param ws - The disconnected WebSocket
 */
export function handleWSClose(ws: ServerWebSocket<unknown>): void {
  const subs = clientRooms.get(ws);
  if (subs) {
    for (const roomId of subs) {
      rooms.get(roomId)?.delete(ws);
      if (rooms.get(roomId)?.size === 0) {
        rooms.delete(roomId);
      }
    }
    clientRooms.delete(ws);
  }
}

/**
 * Returns a snapshot of all active rooms and their client counts.
 * Used by the /api/health endpoint for monitoring.
 * @returns Record mapping room IDs to their client count
 */
export function getRoomsInfo(): Record<string, number> {
  const info: Record<string, number> = {};
  for (const [roomId, clients] of rooms) {
    info[roomId] = clients.size;
  }
  return info;
}

// --- Stream Deck Integration Helpers ---

/**
 * Sends a command to an overlay via WebSocket.
 * Used by Stream Deck and REST API for remote control.
 * @param overlayId - The target overlay ID
 * @param action - The command action (show, hide, update)
 * @param data - Optional payload data for the command
 * @returns true if the message was sent to at least one client
 */
export function sendOverlayCommand(
  overlayId: string,
  action: 'show' | 'hide' | 'update',
  data?: Record<string, unknown>
): boolean {
  const message: WSServerMessage = {
    type: 'command',
    action,
    payload: data || {},
  };
  broadcastToRoom(overlayId, message);
  overlayVisibility.set(overlayId, action === 'show');
  return rooms.has(overlayId) && rooms.get(overlayId)!.size > 0;
}

/**
 * Toggles an overlay's visibility (show ↔ hide).
 * Tracks visibility state for the toggle logic.
 * @param overlayId - The overlay to toggle
 * @returns The new visibility state after toggling
 */
export function toggleOverlay(overlayId: string): { success: boolean; newState: 'visible' | 'hidden' } {
  const isVisible = overlayVisibility.get(overlayId) ?? false;
  const newAction = isVisible ? 'hide' : 'show';
  sendOverlayCommand(overlayId, newAction);
  return { success: true, newState: newAction === 'show' ? 'visible' : 'hidden' };
}

/**
 * Returns the current visibility status of an overlay.
 * @param overlayId - The overlay to check
 * @returns 'visible', 'hidden', or 'unknown' if never controlled
 */
export function getOverlayStatus(overlayId: string): 'visible' | 'hidden' | 'unknown' {
  if (!overlayVisibility.has(overlayId)) return 'unknown';
  return overlayVisibility.get(overlayId) ? 'visible' : 'hidden';
}
