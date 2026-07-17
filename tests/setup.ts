// ──────────────────────────────────────────────
// br1cg — Test setup for vitest
// ──────────────────────────────────────────────
import { vi } from 'vitest';

// Mock useWebSocket hook from ws-client
// Each test can access the captured onMessage callbacks via the mock
const messageCallbacks = new Map<string, (msg: any) => void>();

vi.mock('../src/lib/ws-client', () => ({
  useWebSocket: vi.fn(({ overlayId, onMessage }: { overlayId?: string; onMessage: (msg: any) => void }) => {
    if (overlayId) {
      messageCallbacks.set(overlayId, onMessage);
    } else {
      // Store with a generic key for components without overlayId
      messageCallbacks.set('__default__', onMessage);
    }
  }),
  getWSBase: vi.fn(() => 'ws://localhost:3001'),
}));

// Helper to send a WS message to a component by overlayId
export function sendWSMessage(overlayId: string | undefined, msg: any) {
  const key = overlayId || '__default__';
  const cb = messageCallbacks.get(key);
  if (cb) cb(msg);
}

// Helper to clear all callbacks between tests
export function clearWSCallbacks() {
  messageCallbacks.clear();
}

// Export the map for direct access if needed
export { messageCallbacks };