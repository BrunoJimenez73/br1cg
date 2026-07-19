// ──────────────────────────────────────────────
// br1cg — Studio Page: Control + Preview
// ──────────────────────────────────────────────
// Split-pane layout: left = live preview, right = controls

import { useState, useEffect, useRef } from 'react';
import type { OverlayConfig } from '../../lib/types';
import { OVERLAY_TYPE_LABELS } from '../../lib/types';
import { getWSBase } from '../../lib/ws-client';
import * as api from '../../lib/api-client';
import PreviewPane from './PreviewPane';
import ControlPane from './ControlPane';
import ActivityLog from './ActivityLog';

interface StudioPageProps {
  overlayId?: string;
}

export default function StudioPage({ overlayId: propId }: StudioPageProps) {
  // Read overlayId from props, query params, or URL path
  const [overlayId] = useState(() => {
    if (propId) return propId;
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('id');
    if (fromQuery) return fromQuery;
    // Fallback: extract from path like /studio/xxx
    const parts = window.location.pathname.split('/');
    const last = parts[parts.length - 1];
    return last && last !== 'studio' ? last : '';
  });
  const [overlay, setOverlay] = useState<OverlayConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch overlay config
  useEffect(() => {
    if (!overlayId) {
      setError('No overlay ID provided');
      setLoading(false);
      return;
    }

    api.getOverlay(overlayId)
      .then(data => {
        setOverlay(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load overlay');
        setLoading(false);
      });
  }, [overlayId]);

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`${getWSBase()}/ws?subscribe=${overlayId}`);

    ws.onopen = () => {
      setConnected(true);
      addLog('Connected to server');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'connected') {
          addLog(`Client: ${msg.clientId?.slice(0, 8)}`);
        }
      } catch {}
    };

    ws.onclose = () => {
      setConnected(false);
      addLog('Disconnected');
    };

    ws.onerror = () => {
      addLog('Connection error');
    };

    wsRef.current = ws;

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [overlayId]);

  function addLog(message: string) {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${message}`, ...prev].slice(0, 50));
  }

  function sendCommand(action: string, data?: Record<string, unknown>) {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const msg = {
      type: `overlay:${action}` as const,
      overlayId,
      data: data || {},
    };
    wsRef.current.send(JSON.stringify(msg));
    addLog(`→ ${action}`);
  }

  async function handleConfigChange(field: string, value: unknown) {
    if (!overlay) return;

    const updated = {
      ...overlay,
      data: { ...overlay.data, [field]: value },
    };

    setOverlay(updated);

    // Send via WS for live preview update
    sendCommand('save', updated);

    // Also persist to API
    try {
      await api.updateOverlay(overlayId, { data: updated.data });
    } catch (err) {
      addLog(`Save error: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="text-gray-400 animate-pulse">Loading overlay...</div>
      </div>
    );
  }

  if (error || !overlay) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-2">⚠️ Error</div>
          <div className="text-gray-400">{error || 'Overlay not found'}</div>
          <a href="/" className="mt-4 inline-block px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">
            ← Back to Library
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      {/* Header */}
      <header className="h-12 border-b border-gray-800 flex items-center px-4 gap-4 shrink-0">
        <a href="/" className="text-gray-400 hover:text-white text-sm">
          ← Library
        </a>
        <div className="h-4 w-px bg-gray-700" />
        <h1 className="font-semibold truncate">{overlay.name}</h1>
        <span className="text-xs px-2 py-0.5 bg-gray-800 rounded text-gray-400">
          {OVERLAY_TYPE_LABELS[overlay.type] || overlay.type}
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500">{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <a
          href={`/editor?id=${overlayId}`}
          className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded transition-colors"
        >
          Open Editor
        </a>
      </header>

      {/* Main content: Split pane */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Preview */}
        <div className="flex-1 p-4 min-w-0">
          <PreviewPane overlay={overlay} connected={connected} />
        </div>

        {/* Right: Controls */}
        <div className="w-80 border-l border-gray-800 flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto p-4">
            <ControlPane
              overlay={overlay}
              onShow={() => sendCommand('show')}
              onHide={() => sendCommand('hide')}
              onConfigChange={handleConfigChange}
              addLog={addLog}
            />
          </div>
          <div className="h-40 border-t border-gray-800">
            <ActivityLog logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}
