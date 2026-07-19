// ──────────────────────────────────────────────
// Tests for WebSocket handler (ws-handler.ts)
// ──────────────────────────────────────────────
// Ejecutar: bun test tests/server/ws-handler.test.ts

import { describe, it, expect, beforeEach } from 'bun:test';
import {
  handleWS,
  subscribe,
  unsubscribe,
  broadcastToRoom,
  handleWSMessage,
  handleWSClose,
  getRoomsInfo,
  sendOverlayCommand,
  toggleOverlay,
  getOverlayStatus,
} from '../../server/ws-handler';

function createMockWS(url?: string) {
  const messages: string[] = [];
  return {
    messages,
    data: url ? ({ url } as any) : ({} as any),
    readyState: 1,
    send: (msg: string) => {
      messages.push(msg);
    },
    subscribe: (_topic: string) => {},
  } as any;
}

describe('WS Handler — handleWS', () => {
  it('sends connected message with clientId', () => {
    const ws = createMockWS();
    handleWS(ws);
    expect(ws.messages.length).toBe(1);
    const msg = JSON.parse(ws.messages[0]);
    expect(msg.type).toBe('connected');
    expect(typeof msg.clientId).toBe('string');
    expect(msg.clientId.length).toBeGreaterThan(0);
  });

  it('auto-subscribes to room when subscribe param is present', () => {
    const ws = createMockWS('ws://localhost:3001/ws?subscribe=timer-1');
    handleWS(ws);
    const info = getRoomsInfo();
    expect(info['timer-1']).toBe(1);
  });

  it('does not subscribe when no subscribe param', () => {
    const ws = createMockWS('ws://localhost:3001/ws');
    handleWS(ws);
    const info = getRoomsInfo();
    expect(info['no-subscribe-room']).toBeUndefined();
  });
});

describe('WS Handler — subscribe / unsubscribe', () => {
  it('subscribe adds client to room', () => {
    const ws = createMockWS();
    subscribe(ws, 'room-a');
    const info = getRoomsInfo();
    expect(info['room-a']).toBe(1);
  });

  it('subscribe multiple clients to same room', () => {
    const ws1 = createMockWS();
    const ws2 = createMockWS();
    subscribe(ws1, 'room-b');
    subscribe(ws2, 'room-b');
    expect(getRoomsInfo()['room-b']).toBe(2);
  });

  it('unsubscribe removes client from room', () => {
    const ws = createMockWS();
    subscribe(ws, 'room-c');
    expect(getRoomsInfo()['room-c']).toBe(1);
    unsubscribe(ws, 'room-c');
    expect(getRoomsInfo()['room-c']).toBeUndefined();
  });

  it('unsubscribe cleans up empty rooms', () => {
    const ws = createMockWS();
    subscribe(ws, 'room-d');
    unsubscribe(ws, 'room-d');
    expect(getRoomsInfo()['room-d']).toBeUndefined();
  });

  it('unsubscribe is safe for non-existent room', () => {
    const ws = createMockWS();
    unsubscribe(ws, 'non-existent');
    expect(getRoomsInfo()['non-existent']).toBeUndefined();
  });
});

describe('WS Handler — broadcastToRoom', () => {
  it('sends message to all clients in room', () => {
    const ws1 = createMockWS();
    const ws2 = createMockWS();
    subscribe(ws1, 'broadcast-test');
    subscribe(ws2, 'broadcast-test');
    broadcastToRoom('broadcast-test', { type: 'pong' });
    expect(ws1.messages.length).toBe(1);
    expect(ws2.messages.length).toBe(1);
    expect(JSON.parse(ws1.messages[0]).type).toBe('pong');
  });

  it('does not send to clients in other rooms', () => {
    const ws1 = createMockWS();
    const ws2 = createMockWS();
    subscribe(ws1, 'room-x');
    subscribe(ws2, 'room-y');
    broadcastToRoom('room-x', { type: 'pong' });
    expect(ws1.messages.length).toBe(1);
    expect(ws2.messages.length).toBe(0);
  });

  it('does not throw for empty room', () => {
    broadcastToRoom('empty-room', { type: 'pong' });
  });
});

describe('WS Handler — handleWSMessage', () => {
  it('responds to ping with pong', () => {
    const ws = createMockWS();
    handleWSMessage(ws, JSON.stringify({ type: 'ping' }));
    expect(ws.messages.length).toBe(1);
    expect(JSON.parse(ws.messages[0]).type).toBe('pong');
  });

  it('sends error for invalid JSON', () => {
    const ws = createMockWS();
    handleWSMessage(ws, 'not-json');
    expect(ws.messages.length).toBe(1);
    expect(JSON.parse(ws.messages[0]).type).toBe('error');
  });

  it('broadcasts overlay:show to room', () => {
    const listener = createMockWS();
    subscribe(listener, 'show-test');
    const sender = createMockWS();
    handleWSMessage(sender, JSON.stringify({ type: 'overlay:show', overlayId: 'show-test', data: { title: 'Hi' } }));
    expect(listener.messages.length).toBe(1);
    const msg = JSON.parse(listener.messages[0]);
    expect(msg.type).toBe('command');
    expect(msg.action).toBe('show');
    expect(msg.payload.title).toBe('Hi');
  });

  it('broadcasts overlay:hide to room', () => {
    const listener = createMockWS();
    subscribe(listener, 'hide-test');
    handleWSMessage(createMockWS(), JSON.stringify({ type: 'overlay:hide', overlayId: 'hide-test' }));
    expect(listener.messages.length).toBe(1);
    expect(JSON.parse(listener.messages[0]).action).toBe('hide');
  });

  it('broadcasts overlay:update to room', () => {
    const listener = createMockWS();
    subscribe(listener, 'update-test');
    handleWSMessage(
      createMockWS(),
      JSON.stringify({ type: 'overlay:update', overlayId: 'update-test', data: { count: 5 } }),
    );
    expect(listener.messages.length).toBe(1);
    const msg = JSON.parse(listener.messages[0]);
    expect(msg.action).toBe('update');
    expect(msg.payload.count).toBe(5);
  });

  it('broadcasts timer events', () => {
    const listener = createMockWS();
    subscribe(listener, 'timer-test');
    handleWSMessage(createMockWS(), JSON.stringify({ type: 'overlay:timer:start', overlayId: 'timer-test' }));
    expect(listener.messages.length).toBe(1);
    const msg = JSON.parse(listener.messages[0]);
    expect(msg.type).toBe('event');
    expect(msg.event).toBe('timer:start');
  });

  it('broadcasts overlay:save as update command', () => {
    const listener = createMockWS();
    subscribe(listener, 'save-test');
    handleWSMessage(
      createMockWS(),
      JSON.stringify({ type: 'overlay:save', overlayId: 'save-test', data: { full: true } }),
    );
    expect(listener.messages.length).toBe(1);
    const msg = JSON.parse(listener.messages[0]);
    expect(msg.type).toBe('command');
    expect(msg.action).toBe('update');
    expect(msg.payload.full).toBe(true);
  });
});

describe('WS Handler — handleWSClose', () => {
  it('removes client from rooms on disconnect', () => {
    const ws = createMockWS();
    subscribe(ws, 'close-test');
    expect(getRoomsInfo()['close-test']).toBe(1);
    handleWSClose(ws);
    expect(getRoomsInfo()['close-test']).toBeUndefined();
  });

  it('safe to close client not in any room', () => {
    const ws = createMockWS();
    handleWSClose(ws);
  });
});

describe('WS Handler — sendOverlayCommand', () => {
  it('sends command to room clients', () => {
    const listener = createMockWS();
    subscribe(listener, 'cmd-test');
    const sent = sendOverlayCommand('cmd-test', 'show', { title: 'X' });
    expect(sent).toBeTrue();
    expect(listener.messages.length).toBe(1);
    const msg = JSON.parse(listener.messages[0]);
    expect(msg.type).toBe('command');
    expect(msg.action).toBe('show');
  });

  it('returns false when room is empty', () => {
    const sent = sendOverlayCommand('empty-cmd', 'hide');
    expect(sent).toBeFalse();
  });
});

describe('WS Handler — toggleOverlay', () => {
  it('toggles from hidden to visible', () => {
    const listener = createMockWS();
    subscribe(listener, 'toggle-1');
    const result = toggleOverlay('toggle-1');
    expect(result.success).toBeTrue();
    expect(result.newState).toBe('visible');
  });

  it('toggles from visible to hidden', () => {
    const result = toggleOverlay('toggle-1');
    expect(result.success).toBeTrue();
    expect(result.newState).toBe('hidden');
  });
});

describe('WS Handler — getOverlayStatus', () => {
  it('returns unknown for never-controlled overlay', () => {
    expect(getOverlayStatus('never-seen')).toBe('unknown');
  });

  it('returns visible after show', () => {
    sendOverlayCommand('status-test', 'show');
    expect(getOverlayStatus('status-test')).toBe('visible');
  });

  it('returns hidden after hide', () => {
    sendOverlayCommand('status-test', 'hide');
    expect(getOverlayStatus('status-test')).toBe('hidden');
  });
});

describe('WS Handler — getRoomsInfo', () => {
  it('returns room counts', () => {
    const ws1 = createMockWS();
    const ws2 = createMockWS();
    subscribe(ws1, 'info-a');
    subscribe(ws2, 'info-a');
    subscribe(ws1, 'info-b');
    const info = getRoomsInfo();
    expect(info['info-a']).toBe(2);
    expect(info['info-b']).toBe(1);
  });
});
