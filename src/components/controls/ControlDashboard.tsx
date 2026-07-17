import { useState, useEffect, useRef, useCallback } from 'react';
import type { WSClientMessage, WSServerMessage, OverlayConfig } from '../../lib/types';
import { OVERLAY_TYPE_LABELS } from '../../lib/types';
import * as api from '../../lib/api-client';
import { TimerControls } from './TimerControls';
import { LowerThirdControls } from './LowerThirdControls';
import { ScorebugControls } from './ScorebugControls';
import { GenericControls } from './GenericControls';

export default function ControlDashboard() {
  const [connected, setConnected] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [overlays, setOverlays] = useState<OverlayConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch overlays from API via api-client
  useEffect(() => {
    fetchOverlays();
  }, []);

  async function fetchOverlays() {
    try {
      const data = await api.getOverlays();
      setOverlays(data);
    } catch (err) {
      console.error('Failed to fetch overlays:', err);
    } finally {
      setLoading(false);
    }
  }

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.port === '4321' ? 'localhost:3001' : window.location.host;
    const ws = new WebSocket(`${protocol}//${host}/ws`);

    ws.onopen = () => {
      setConnected(true);
      addLog('Connected to server');
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSServerMessage = JSON.parse(event.data);
        if (msg.type === 'connected') {
          setClientId(msg.clientId);
          addLog(`Client ID: ${msg.clientId}`);
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      setConnected(false);
      addLog('Disconnected');
    };

    wsRef.current = ws;
    return () => ws.close();
  }, []);

  function addLog(msg: string) {
    setLogs(prev => [...prev.slice(-50), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }

  const send = useCallback((msg: WSClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
      addLog(`→ ${msg.type} ${'overlayId' in msg ? msg.overlayId : ''}`);
    } else {
      addLog('⚠ Not connected');
    }
  }, []);

  function getOverlayUrl(overlay: OverlayConfig): string {
    return `/overlay/${overlay.type}?id=${overlay.id}`;
  }

  function getControlsForType(overlay: OverlayConfig) {
    switch (overlay.type) {
      case 'timer':
        return <TimerControls overlay={overlay} send={send} />;
      case 'lower-third':
        return <LowerThirdControls overlay={overlay} send={send} />;
      case 'scorebug':
        return <ScorebugControls overlay={overlay} send={send} />;
      default:
        return <GenericControls overlay={overlay} send={send} />;
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Connection status */}
      <div className="lg:col-span-3">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
          connected ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
        }`}>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
          {connected ? `Connected${clientId ? ` (${clientId.slice(0, 8)})` : ''}` : 'Disconnected'}
        </div>
      </div>

      {/* Quick Test Section */}
      <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3 text-yellow-300">⚡ Quick Test</h2>
        <p className="text-xs text-gray-500 mb-3">
          Para probar: abre el overlay en otra pestaña y usa estos botones.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-800 rounded p-3">
            <p className="text-xs text-gray-400 mb-2">Timer (timer-1)</p>
            <div className="space-y-1">
              <button onClick={() => send({ type: 'overlay:show', overlayId: 'timer-1' })} className="w-full text-xs px-2 py-1 bg-green-700 hover:bg-green-600 rounded">Show</button>
              <button onClick={() => send({ type: 'overlay:hide', overlayId: 'timer-1' })} className="w-full text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded">Hide</button>
              <button onClick={() => send({ type: 'overlay:timer:start', overlayId: 'timer-1' })} className="w-full text-xs px-2 py-1 bg-indigo-700 hover:bg-indigo-600 rounded">Start</button>
              <button onClick={() => send({ type: 'overlay:timer:pause', overlayId: 'timer-1' })} className="w-full text-xs px-2 py-1 bg-yellow-700 hover:bg-yellow-600 rounded">Pause</button>
              <button onClick={() => send({ type: 'overlay:timer:reset', overlayId: 'timer-1', data: { minutes: 5, seconds: 0 } })} className="w-full text-xs px-2 py-1 bg-purple-700 hover:bg-purple-600 rounded">Reset 5:00</button>
            </div>
          </div>
          <div className="bg-gray-800 rounded p-3">
            <p className="text-xs text-gray-400 mb-2">Lower Third (lower-1)</p>
            <div className="space-y-1">
              <button onClick={() => send({ type: 'overlay:show', overlayId: 'lower-1', data: { title: 'Juan Pérez', subtitle: 'Ingeniero' } })} className="w-full text-xs px-2 py-1 bg-green-700 hover:bg-green-600 rounded">Show</button>
              <button onClick={() => send({ type: 'overlay:hide', overlayId: 'lower-1' })} className="w-full text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded">Hide</button>
              <button onClick={() => send({ type: 'overlay:show', overlayId: 'lower-1', data: { title: 'María García', subtitle: 'Diseñadora UX' } })} className="w-full text-xs px-2 py-1 bg-blue-700 hover:bg-blue-600 rounded">Show: María</button>
            </div>
          </div>
          <div className="bg-gray-800 rounded p-3">
            <p className="text-xs text-gray-400 mb-2">Quick Links</p>
            <div className="space-y-1">
              <a href="/overlay/timer?id=timer-1" target="_blank" className="block text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-center">Open Timer</a>
              <a href="/overlay/lower-third?id=lower-1" target="_blank" className="block text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-center">Open Lower Third</a>
            </div>
          </div>
        </div>
      </div>

      {/* Saved overlays */}
      {loading ? (
        <div className="lg:col-span-3 text-center py-8 text-gray-400">
          Loading overlays...
        </div>
      ) : overlays.length === 0 ? (
        <div className="lg:col-span-3 text-center py-8 text-gray-500">
          <p className="text-lg">No overlays created</p>
          <p className="text-sm mt-2">
            <a href="/editor?id=new" className="text-indigo-400 hover:underline">Create your first overlay</a>
          </p>
        </div>
      ) : (
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {overlays.map(overlay => (
            <div
              key={overlay.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-medium px-2 py-1 bg-indigo-900/50 text-indigo-300 rounded">
                    {OVERLAY_TYPE_LABELS[overlay.type] || overlay.type}
                  </span>
                </div>
                <a
                  href={getOverlayUrl(overlay)}
                  target="_blank"
                  className="text-xs text-gray-500 hover:text-indigo-400"
                  title="Open overlay URL"
                >
                  🔗
                </a>
              </div>
              <h3 className="font-semibold text-white mb-1 truncate">{overlay.name}</h3>
              <p className="text-xs text-gray-500 mb-3 font-mono truncate">{overlay.id.slice(0, 8)}...</p>
              {getControlsForType(overlay)}
              <div className="mt-3 pt-3 border-t border-gray-800 space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => send({ type: 'overlay:show', overlayId: overlay.id })}
                    className="flex-1 text-center text-xs px-2 py-1 bg-green-800 hover:bg-green-700 rounded transition-colors"
                  >
                    ▶ Show
                  </button>
                  <button
                    onClick={() => send({ type: 'overlay:hide', overlayId: overlay.id })}
                    className="flex-1 text-center text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                  >
                    ■ Hide
                  </button>
                  <button
                    onClick={() => send({ type: 'overlay:show', overlayId: overlay.id })}
                    className="flex-1 text-center text-xs px-2 py-1 bg-purple-800 hover:bg-purple-700 rounded transition-colors"
                  >
                    ↻ Toggle
                  </button>
                </div>
                <p className="text-xs text-gray-600 mb-1">OBS URL:</p>
                <code className="text-xs bg-gray-950 px-2 py-1 rounded block truncate">
                  {getOverlayUrl(overlay)}
                </code>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WebSocket log */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-300">Activity Log</h2>
        <div className="h-64 overflow-y-auto space-y-1 text-xs font-mono">
          {logs.length === 0 ? (
            <p className="text-gray-600">No activity yet</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="text-gray-400">{log}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
