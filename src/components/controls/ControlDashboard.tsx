import { useState, useEffect, useCallback } from 'react';
import type { WSClientMessage, WSServerMessage, OverlayConfig } from '../../lib/types';
import { OVERLAY_TYPE_LABELS } from '../../lib/types';
import * as api from '../../lib/api-client';
import { useWebSocket } from '../../lib/ws-client';
import { TimerControls } from './TimerControls';
import { LowerThirdControls } from './LowerThirdControls';
import { ScorebugControls } from './ScorebugControls';
import { TickerControls } from './TickerControls';
import { SocialLooperControls } from './SocialLooperControls';
import { GenericControls } from './GenericControls';

export default function ControlDashboard() {
  const [connected, setConnected] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [overlays, setOverlays] = useState<OverlayConfig[]>([]);
  const [loading, setLoading] = useState(true);

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

  function addLog(msg: string) {
    setLogs(prev => [...prev.slice(-50), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }

  const { send: wsSend } = useWebSocket({
    onMessage: useCallback((msg: WSServerMessage) => {
      if (msg.type === 'connected') {
        setClientId(msg.clientId);
        addLog(`Connected (${msg.clientId.slice(0, 8)})`);
        setConnected(true);
      }
    }, []),
  });

  const send = useCallback((msg: WSClientMessage) => {
    const ok = wsSend(msg);
    if (ok) {
      addLog(`→ ${msg.type} ${'overlayId' in msg ? msg.overlayId : ''}`);
    } else {
      addLog('⚠ Not connected');
    }
  }, [wsSend]);

  async function handleDelete(overlay: OverlayConfig) {
    if (!window.confirm(`Delete "${overlay.name}"? This cannot be undone.`)) return;
    try {
      await api.deleteOverlay(overlay.id);
      setOverlays(prev => prev.filter(o => o.id !== overlay.id));
      addLog(`Deleted ${overlay.name}`);
    } catch {
      addLog('⚠ Delete failed');
    }
  }

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
      case 'ticker':
        return <TickerControls overlay={overlay} send={send} />;
      case 'social-looper':
        return <SocialLooperControls overlay={overlay} send={send} />;
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
          {connected ? `Connected${clientId ? ` (${clientId.slice(0, 8)})` : ''}` : 'Disconnected — reconnecting...'}
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
                <span className="text-xs font-medium px-2 py-1 bg-indigo-900/50 text-indigo-300 rounded">
                  {OVERLAY_TYPE_LABELS[overlay.type] || overlay.type}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={getOverlayUrl(overlay)}
                    target="_blank"
                    className="text-xs text-gray-500 hover:text-indigo-400"
                    title="Open overlay URL"
                  >
                    🔗
                  </a>
                  <a
                    href={`/editor?id=${overlay.id}`}
                    target="_blank"
                    className="text-xs text-gray-500 hover:text-yellow-400"
                    title="Edit overlay"
                  >
                    ✏️
                  </a>
                </div>
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
                    onClick={async () => {
                      try {
                        await api.toggleOverlay(overlay.id);
                        addLog(`→ toggle ${overlay.id}`);
                      } catch {
                        addLog('⚠ Toggle failed');
                      }
                    }}
                    className="flex-1 text-center text-xs px-2 py-1 bg-purple-800 hover:bg-purple-700 rounded transition-colors"
                  >
                    ↻ Toggle
                  </button>
                </div>
                <div className="flex gap-2">
                  <code className="flex-1 text-xs bg-gray-950 px-2 py-1 rounded truncate">
                    {getOverlayUrl(overlay)}
                  </code>
                  <button
                    onClick={() => handleDelete(overlay)}
                    className="text-xs px-2 py-1 bg-red-900/50 hover:bg-red-800/50 text-red-400 rounded transition-colors"
                    title="Delete overlay"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity log */}
      <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-300">Activity Log</h2>
        <div className="h-48 overflow-y-auto space-y-1 text-xs font-mono">
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
